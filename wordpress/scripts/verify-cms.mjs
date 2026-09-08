// Real management UI tests; deliberately local-only and restore original display.
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9404';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await context.addInitScript(() => { sessionStorage.setItem('tbt-intro-seen', '1'); localStorage.setItem('tbt.analytics-consent.v1', 'denied'); });
const page = await context.newPage();
const visitor = await context.newPage();
const results = [];
const pass = (text) => { results.push(text); console.log(`PASS ${text}`); };
const go = (path) => page.goto(`${base}${path}`, { waitUntil: 'load', timeout: 60000 });
const publish = async () => {
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), page.locator('#publish').click()]);
  await page.locator('#tbt-content-fields').waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForLoadState('load');
};
const view = async (path) => { await visitor.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 }); };
const trash = async () => { await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), page.locator('#delete-action a').click()]); };
try {
  await go('/wp-admin/tools.php?page=tbt-content-setup');
  assert.match(await page.locator('.wrap').innerText(), /CMS display: Enabled/);
  if (!process.env.TBT_CMS_NAV_SEO_ONLY) {
  // Remove only this script's known local QA fixtures left by an interrupted run.
  for (const type of ['tbt_service', 'tbt_testimonial', 'tbt_smile']) {
    await go(`/wp-admin/edit.php?post_type=${type}&s=Barrana+CMS+Test`);
    const fixtures = await page.locator('#the-list .row-title').evaluateAll((nodes) => nodes.filter((node) => node.textContent.startsWith('Barrana CMS Test')).map((node) => node.href));
    for (const url of fixtures) { await page.goto(url); await trash(); }
  }
  await go('/wp-admin/edit.php?post_type=tbt_service');
  assert.equal(await page.locator('#the-list tr').count(), 5);
  const originalServiceUrl = await page.getByRole('link', { name: 'Smile Makeovers', exact: true }).getAttribute('href');
  await page.goto(originalServiceUrl);
  const originalDescription = await page.locator('#tbt-field-description').inputValue();
  await page.locator('#tbt-field-description').fill(`${originalDescription} CMS verified.`);
  await publish(); await view('/services/');
  assert((await visitor.locator('main').innerText()).includes('CMS verified.'));
  await page.locator('#tbt-field-description').fill(originalDescription); await publish();
  pass('Service description saves through WordPress and original copy is restored');

  await go('/wp-admin/post-new.php?post_type=tbt_service');
  await page.locator('#title').fill('Barrana CMS Test Service');
  await page.locator('#tbt-field-description').fill('Test service description.');
  await page.locator('#tbt-field-features').fill('First highlight\nSecond highlight\nThird highlight\nFourth highlight');
  await page.locator('#tbt-field-home_featured').check();
  await page.locator('#tbt-field-home_order').fill('0');
  await page.locator('#menu_order').fill('0');
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.locator('#save-post').click()]);
  await view('/services/'); assert(!(await visitor.locator('main').innerText()).includes('Barrana CMS Test Service'));
  await publish(); await view('/services/');
  assert.equal(await visitor.locator('.elementor-widget-tbt-services-2 h2').first().textContent(), 'Barrana CMS Test Service');
  assert((await visitor.locator('main').textContent()).includes('Fourth highlight'));
  await view('/'); assert.equal(await visitor.locator('#work h3').first().textContent(), 'Barrana CMS Test Service');
  await trash(); await view('/services/'); assert(!(await visitor.locator('main').innerText()).includes('Barrana CMS Test Service'));
  pass('Add, draft, publish, order and trash a service; home selection and unlimited highlights work');

  await go('/wp-admin/post-new.php?post_type=tbt_testimonial');
  await page.locator('#title').fill('Barrana CMS Test Patient'); await publish();
  assert.match(await page.locator('body').innerText(), /Saved as a draft/);
  await page.locator('#tbt-field-quote').fill('“A test quote with apostrophes: patient’s choice.”');
  await page.locator('#tbt-field-treatment').fill('QA only'); await publish(); await view('/');
  assert((await visitor.locator('main').innerText()).includes('Barrana CMS Test Patient'));
  await trash(); pass('Testimonial validation, publication and removal work');

  await go('/wp-admin/post-new.php?post_type=tbt_smile');
  await page.locator('#title').fill('Barrana CMS Test Transformation'); await publish();
  assert.match(await page.locator('body').innerText(), /Saved as a draft/);
  await page.locator('#tbt-field-caption').fill('CMS upload verification');
  await page.locator('#tbt-field-alt').fill('Test public studio picture');
  await page.locator('#tbt-field-image').locator('..').getByRole('button', { name: 'Choose picture', exact: true }).click();
  await page.locator('.media-modal').getByText('Upload files', { exact: true }).click();
  await page.locator('input[type="file"]').last().setInputFiles('wp-content/themes/teeth-by-trev/assets/media/stock/process.jpg');
  await page.locator('.media-modal button.media-button-select').click();
  await publish(); await view('/gallery/');
  const newCard = visitor.locator('.tbt-gallery-case').filter({ hasText: 'Barrana CMS Test Transformation' });
  assert.equal(await newCard.count(), 1); assert.match(await newCard.locator('img').getAttribute('src'), /\/uploads\//);
  await page.locator('#tbt-field-placement').selectOption('comparison'); await publish();
  assert.match(await page.locator('body').innerText(), /Saved as a draft/);
  // Use the already uploaded attachment for a before image through the same chooser.
  await page.locator('#tbt-field-before_image').locator('..').getByRole('button', { name: 'Choose picture', exact: true }).click();
  await page.locator('.media-modal').getByText('Media Library', { exact: true }).click();
  await page.locator('.attachments .attachment').first().click();
  await page.locator('.media-modal button.media-button-select').click(); await publish();
  await view('/gallery/'); assert.equal(await visitor.locator('[data-tbt-before-after]').count(), 2);
  const slider = visitor.locator('[data-tbt-before-after]').last().getByRole('slider');
  await slider.focus(); await visitor.keyboard.press('ArrowRight'); assert.equal(await slider.getAttribute('aria-valuenow'), '54');
  await trash(); pass('Media Library upload, gallery card, required before picture and multiple accessible comparisons work');
  }

  await go('/wp-admin/nav-menus.php?action=locations');
  const menuId = await page.locator('select[name="menu-locations[primary]"]').inputValue();
  await go(`/wp-admin/nav-menus.php?action=edit&menu=${menuId}`);
  await page.locator('#menu-to-edit .item-edit').first().click();
  const label = page.locator('#menu-to-edit .edit-menu-item-title').first();
  const oldLabel = await label.inputValue(); await label.fill('Home CMS Test');
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.getByRole('button', { name: 'Save Menu', exact: true }).click()]);
  await view('/'); assert.equal(await visitor.locator('#tbt-overlay-menu a').first().innerText(), '01\nHome CMS Test');
  await page.locator('#menu-to-edit .item-edit').first().click();
  await page.locator('#menu-to-edit .edit-menu-item-title').first().fill(oldLabel);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.getByRole('button', { name: 'Save Menu', exact: true }).click()]);
  pass('Native WordPress menu editing saves and original label is restored');

  await go('/wp-admin/edit.php?post_type=page&page=tbt-page-seo');
  await page.locator('.wrap').getByRole('link', { name: 'About', exact: true }).click();
  await page.waitForLoadState('load');
  const seoFields = ['seo_title', 'seo_description', 'social_title', 'social_description'];
  const values = ['CMS Search "Title"', 'CMS search description & more.', 'CMS Sharing Title', 'CMS sharing description.'];
  for (let i = 0; i < seoFields.length; i++) await page.locator(`#tbt-field-${seoFields[i]}`).fill(values[i]);
  await page.locator('#tbt-field-social_image').locator('..').getByRole('button', { name: 'Choose picture', exact: true }).click();
  await page.locator('.media-modal').getByText('Media Library', { exact: true }).click(); await page.locator('.attachments .attachment').first().click();
  await page.locator('.media-modal button.media-button-select').click();
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.getByRole('button', { name: 'Save Search & Sharing', exact: true }).click()]);
  await view('/about/'); assert.equal(await visitor.title(), values[0]);
  assert.equal(await visitor.locator('meta[name=description]').count(), 1);
  assert.equal(await visitor.locator('meta[name=description]').getAttribute('content'), values[1]);
  assert.equal(await visitor.locator('meta[property="og:title"]').getAttribute('content'), values[2]);
  assert.equal(await visitor.locator('meta[name="twitter:description"]').getAttribute('content'), values[3]);
  assert.match(await visitor.locator('meta[property="og:image"]').getAttribute('content'), /\/uploads\//);
  assert.equal(await visitor.locator('h1').innerText(), 'Meet Dr. Trev.');
  assert.match(await visitor.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  for (const field of seoFields) await page.locator(`#tbt-field-${field}`).fill('');
  await page.getByRole('button', { name: 'Clear picture', exact: true }).click();
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.getByRole('button', { name: 'Save Search & Sharing', exact: true }).click()]);
  await view('/about/'); assert.equal(await visitor.title(), 'About Dr. Trev — Teeth by Trev');
  pass('Independent search/social metadata and Media Library image save; noindex and visible content preserved; defaults restored');

  await go('/wp-admin/tools.php?page=tbt-content-setup');
  await page.getByRole('button', { name: 'Enable CMS display — preserve all edits', exact: true }).click();
  assert.match(await page.locator('.wrap').innerText(), /Existing content preserved/);
  await page.getByRole('button', { name: 'Use original Elementor content', exact: true }).click();
  await view('/services/'); assert.equal(await visitor.locator('.elementor-widget-tbt-services-2 h2').count(), 5);
  await page.getByRole('button', { name: 'Enable CMS display — preserve all edits', exact: true }).click();
  await view('/gallery/'); assert.equal(await visitor.locator('.tbt-gallery-case').count(), 6);
  pass('Repeated migration and fallback/resume preserve records and original display');
  await mkdir('artifacts/cms', { recursive: true });
  await page.screenshot({ path: 'artifacts/cms/setup.png' });
} finally {
  await mkdir('artifacts/cms', { recursive: true });
  await writeFile('artifacts/cms/ui-results.json', JSON.stringify({ base, results }, null, 2));
  await browser.close();
}
