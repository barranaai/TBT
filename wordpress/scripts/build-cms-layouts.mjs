// Extract reviewed layout fragments only. This never reads or overwrites client data.
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
const source = JSON.parse(await readFile('wp-content/themes/teeth-by-trev/inc/editor-layouts.json', 'utf8'));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage();
  const result = await page.evaluate((source) => {
    const result = {};
    const key = (n) => `content_${String(n).padStart(3, '0')}`;
    const build = (name, selector, fields) => {
      const doc = new DOMParser().parseFromString(source.sections[name].html, 'text/html');
      const nodes = [...doc.querySelectorAll(selector)];
      const templates = nodes.map((node, i) => {
        let html = node.outerHTML;
        for (const [field, n] of Object.entries(fields(i))) html = html.replaceAll(`{{${key(n)}}}`, `{{${field}}}`);
        if (/\{\{content_/.test(html)) throw Error(`${name}: unmapped field in row ${i}`);
        return html;
      });
      const managed = [...new Set(nodes.flatMap((node) => [...node.outerHTML.matchAll(/\{\{(content_\d+)\}\}/g)].map((m) => m[1])))];
      nodes[0].before(doc.createTextNode('{{cms_items}}'));
      nodes.forEach((node) => node.remove());
      result[name] = { html: doc.body.innerHTML, templates, managed };
    };
    build('services-2', 'section > div > div', (i) => ({ image: 1+i*2, alt: 2+i*2, number: 11+i*9, title: 12+i*9, description: 13+i*9, mark1: 14+i*9, feature1: 15+i*9, mark2: 16+i*9, feature2: 17+i*9, mark3: 18+i*9, feature3: 19+i*9 }));
    build('home-5', 'article', (i) => ({ image: 1+i*2, alt: 2+i*2, number: 12+i*4, eyebrow: 13+i*4, title: 14+i*4, description: 15+i*4 }));
    build('home-9', 'figure', (i) => ({ quote: 1+i*3, title: 2+i*3, treatment: 3+i*3 }));
    build('gallery-2', 'section > div > div.reveal.mt-16', () => ({ image: 1, alt: 2, before_image: 3, before_alt: 4, after_label: 7, before_label: 8, caption: 9 }));
    for (const name of ['site-header', 'site-footer']) {
      const doc = new DOMParser().parseFromString(source.sections[name].html, 'text/html');
      const managed = [];
      const replace = (node, placeholder, contentsOnly = false) => {
        managed.push(...[...(contentsOnly ? node.innerHTML : node.outerHTML).matchAll(/\{\{(content_\d+)\}\}/g)].map((m) => m[1]));
        if (contentsOnly) node.textContent = `{{${placeholder}}}`;
        else node.replaceWith(doc.createTextNode(`{{${placeholder}}}`));
      };
      if (name === 'site-header') replace(doc.querySelector('#tbt-overlay-menu ul'), 'primary_menu');
      else {
        replace(doc.querySelector('nav[aria-label="Footer navigation"]'), 'footer_menu', true);
        replace(doc.querySelector('footer > div > div:last-child'), 'legal_menu', true);
      }
      result[name] = { html: doc.body.innerHTML, managed: [...new Set(managed)] };
    }
    return result;
  }, source);
  await writeFile('wp-content/themes/teeth-by-trev/inc/cms-layouts.json', `${JSON.stringify(result, null, 2)}\n`);
  console.log('Built seven CMS layout adapters');
} finally { await browser.close(); }
