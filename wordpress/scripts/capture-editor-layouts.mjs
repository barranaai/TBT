/** One-time conversion of the approved PHP view into typed Elementor content controls.
 * Run only against an isolated, unconverted local WordPress instance. Never imports
 * visitor submissions or page-builder database state. Review generated layouts in Git.
 */
import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:9400';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
const layouts = { version: 1, pages: {}, sections: {} };
try {
  for (const slug of ['home', 'about', 'services', 'gallery', 'financing', 'contact', 'consultation', 'reserve', 'privacy', 'terms']) {
    const response = await page.request.get(`${base}/${slug === 'home' ? '' : slug + '/'}${slug === 'reserve' ? '?type=video' : ''}`);
    if (!response.ok()) throw new Error(`Cannot capture ${slug}: ${response.status()}`);
    const html = await response.text();
    const captured = await page.evaluate(({ html, slug, base }) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const main = doc.querySelector('main#main-content');
      if (!main || main.querySelector('.elementor')) throw new Error('Expected original PHP page');
      const theme = `${base}/wp-content/themes/teeth-by-trev`;
      const portable = (value) => value.replaceAll(theme, '{{theme}}').replaceAll(base, '{{site}}');
      const sections = {};
      const capture = (element, key, fallbackTitle) => {
        const controls = {};
        const title = (element.querySelector('h1,h2')?.textContent || fallbackTitle).trim().slice(0, 70);
        let serial = 0;
        const control = (type, value, label) => {
          const name = `content_${String(++serial).padStart(3, '0')}`;
          controls[name] = { type, default: portable(value), label: label.slice(0, 90) };
          return `{{${name}}}`;
        };
        element.querySelectorAll('[data-tbt-inquiry], [data-tbt-square]').forEach((form) => {
          form.replaceWith(doc.createTextNode(form.matches('[data-tbt-inquiry]') ? '{{inquiry_form}}' : '{{deposit_form}}'));
        });
        // Repeatable gallery cards are real Elementor repeater controls.
        if (slug === 'reserve') {
          const eyebrow = [...element.querySelectorAll('p')].find((p) => p.textContent.startsWith('Reserve ·'));
          if (eyebrow) eyebrow.textContent = '{{consultation_label}}';
        }
        const cards = [...element.querySelectorAll('.tbt-gallery-case')];
        let gallery = null;
        if (cards.length) {
          gallery = cards.map((card) => ({ image: { url: portable(card.querySelector('img').getAttribute('src')), id: 0 }, alt: card.querySelector('img').alt, title: card.querySelector('figcaption span').textContent, caption: card.querySelector('figcaption span:last-child').textContent }));
          cards[0].replaceWith(doc.createTextNode('{{gallery_items}}'));
          cards.slice(1).forEach((card) => card.remove());
        }
        for (const node of [element, ...element.querySelectorAll('*')]) {
          if (node.closest('svg')) continue;
          for (const attr of ['src', 'poster', 'href', 'alt', 'data-tbt-count']) {
            if (!node.hasAttribute(attr)) continue;
            const value = node.getAttribute(attr);
            if (attr === 'alt' && !value) continue;
            const type = attr === 'href' ? 'url' : ['src', 'poster'].includes(attr) ? (node.tagName === 'SOURCE' ? 'video' : 'media') : attr === 'data-tbt-count' ? 'number' : 'text';
            const label = attr === 'alt' ? 'Image description' : attr === 'poster' ? 'Video poster' : attr === 'src' ? (node.tagName === 'SOURCE' ? 'Background video' : `Image: ${node.getAttribute('alt') || title}`) : attr === 'href' ? `Link: ${node.textContent.trim() || node.getAttribute('aria-label') || 'destination'}` : 'Statistic value';
            node.setAttribute(attr, control(type, value, label));
          }
        }
        const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const texts = [];
        while (walker.nextNode()) texts.push(walker.currentNode);
        for (const node of texts) {
          const value = node.textContent;
          if (!value.trim() || value.includes('{{') || node.parentElement.closest('svg,script,style,[data-tbt-count]')) continue;
          if (/^[✦→←✓]+$/.test(value.trim())) continue;
          const tag = node.parentElement.closest('h1,h2,h3,p,a,li,address,blockquote')?.tagName.toLowerCase() || 'text';
          const kind = value.length > 110 ? 'textarea' : 'text';
          node.textContent = value.match(/^\s*/)[0] + control(kind, value.trim(), `${tag}: ${value.trim()}`) + value.match(/\s*$/)[0];
        }
        // Dynamic counters remain bound to their editable numeric control.
        element.querySelectorAll('[data-tbt-count]').forEach((node) => { node.textContent = node.getAttribute('data-tbt-count'); });
        sections[key] = { title, html: portable(element.outerHTML), controls, ...(gallery ? { gallery } : {}) };
        return key;
      };
      const keys = [...main.children].map((section, i) => capture(section, `${slug}-${i + 1}`, `${slug} section ${i + 1}`));
      if (slug === 'home') {
        capture(doc.querySelector('header[data-tbt-nav]'), 'site-header', 'Site header');
        capture(doc.querySelector('footer'), 'site-footer', 'Site footer');
      }
      return { page: { title: doc.title, mainClass: main.className, sections: keys, minimal: ['privacy', 'terms'].includes(slug), reserve: slug === 'reserve', consultation: slug === 'consultation' }, sections };
    }, { html, slug, base });
    layouts.pages[slug] = captured.page;
    Object.assign(layouts.sections, captured.sections);
  }
  const output = new URL('../wp-content/themes/teeth-by-trev/inc/editor-layouts.json', import.meta.url);
  await writeFile(output, JSON.stringify(layouts, null, 2) + '\n');
  console.log(`Captured ${Object.keys(layouts.pages).length} pages and ${Object.keys(layouts.sections).length} editable sections.`);
} finally { await browser.close(); }
