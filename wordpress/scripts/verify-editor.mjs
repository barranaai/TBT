import { chromium } from 'playwright-core';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9402'; // Editing tests are deliberately local-only.
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
await context.addInitScript(() => { sessionStorage.setItem('tbt-intro-seen', '1'); localStorage.setItem('tbt.analytics-consent.v1', 'denied'); });
const page = await context.newPage();
const errors = [];
const layouts = JSON.parse(await readFile('wp-content/themes/teeth-by-trev/inc/editor-layouts.json', 'utf8'));
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('artifacts/editor', { recursive: true });
try {
  await page.goto(`${base}/wp-admin/tools.php?page=tbt-page-editor`, { waitUntil: 'domcontentloaded' });
  console.log('Admin initial URL', page.url());
  if (await page.locator('#user_login').count()) {
    await page.locator('#user_login').fill('admin');
    await page.locator('#user_pass').fill('password');
    await page.locator('#wp-submit').click();
    await page.waitForURL(/wp-admin/);
  }
  await page.goto(`${base}/wp-admin/tools.php?page=tbt-page-editor`, { waitUntil: 'domcontentloaded' });
  const links = await page.locator('.wrap a[href*="action=elementor"]').evaluateAll((nodes) => nodes.map((node) => ({ title: node.textContent, url: node.href })));
  console.log(`PASS ${links.length} editing links`);
  assert.equal(links.length, 12, 'All ten pages plus header/footer must have editor links');
  await page.goto(links.find((link) => link.title === 'About').url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#elementor-preview-iframe', { timeout: 90000 });
  await page.waitForFunction(() => window.elementor?.elements?.length > 0, { timeout: 90000 });
  await page.locator('#elementor-loading').waitFor({ state: 'hidden', timeout: 90000 });
  const frame = page.frameLocator('#elementor-preview-iframe');
  await frame.locator('.elementor-widget-tbt-about-1 h1').click();
  const titleKey = Object.entries(layouts.sections['about-1'].controls).find(([, control]) => control.default === 'Meet Dr. Trev.')[0];
  const input = page.locator(`.elementor-control-${titleKey} input[data-setting="${titleKey}"]`);
  await input.waitFor({ state: 'visible' });
  await input.fill('Meet Dr. Trev — CMS verification');
  await input.blur();
  await page.screenshot({ path: 'artifacts/editor/editor-text-edit.png' });
  const save = async () => {
    const response = page.waitForResponse((response) => response.url().includes('admin-ajax.php') && (response.request().postData() || '').includes('save_builder'), { timeout: 60000 });
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const result = await response;
    assert.equal(result.status(), 200);
    console.log('Save response', (await result.text()).slice(0, 180));
  };
  await save();
  const visitor = await context.newPage();
  await visitor.goto(`${base}/about/`, { waitUntil: 'domcontentloaded' });
  await visitor.waitForFunction(() => document.querySelector('h1')?.textContent === 'Meet Dr. Trev — CMS verification');
  console.log('PASS text edited through Elementor and persisted to visitor page');
  await input.fill('Meet Dr. Trev.');
  await input.blur();
  await save();
  await visitor.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await visitor.locator('h1').textContent(), 'Meet Dr. Trev.');
  console.log('PASS original copy restored through Elementor');
  // Exercise WordPress's actual Media Library chooser rather than injecting an image URL.
  const imageKey = Object.entries(layouts.sections['about-1'].controls).find(([, control]) => control.type === 'media')[0];
  await page.getByText('Pictures and video', { exact: true }).click();
  await page.locator(`.elementor-control-${imageKey} .elementor-control-media-area`).click();
  await page.getByRole('tab', { name: 'Upload files', exact: true }).click();
  await page.locator('input[type="file"]').last().setInputFiles('wp-content/themes/teeth-by-trev/assets/media/stock/process.jpg');
  const insert = page.locator('.media-modal button.media-button-select');
  await insert.waitFor({ state: 'visible' });
  await page.waitForFunction(() => { const button = document.querySelector('.media-modal button.media-button-select'); return button && !button.disabled; });
  await insert.click();
  await save();
  await visitor.reload({ waitUntil: 'domcontentloaded' });
  assert.match(await visitor.locator('main section img').first().getAttribute('src'), /\/uploads\//);
  console.log('PASS image uploaded and selected through Media Library; saved image appears on visitor page');
  // Restore the original bundled image using Elementor's document command API.
  await page.evaluate(({ imageKey, url }) => {
    const model = elementor.elements.find((item) => item.get('widgetType') === 'tbt-about-1');
    return $e.run('document/elements/settings', { container: elementor.getContainer(model.id), settings: { [imageKey]: { id: 0, url } } });
  }, { imageKey, url: layouts.sections['about-1'].controls[imageKey].default.replace('{{theme}}', `${base}/wp-content/themes/teeth-by-trev`) });
  await save();
  await visitor.reload({ waitUntil: 'domcontentloaded' });
  assert.match(await visitor.locator('main section img').first().getAttribute('src'), /\/themes\/teeth-by-trev\//);
  console.log('PASS original image restored');
  await page.goto(links.find((link) => link.title === 'Gallery').url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.elementor?.elements?.length > 0);
  await page.locator('#elementor-loading').waitFor({ state: 'hidden', timeout: 90000 });
  const originalGallery = await page.evaluate(() => elementor.elements.find((item) => item.get('widgetType') === 'tbt-gallery-3').get('settings').get('gallery_items').toJSON());
  await page.frameLocator('#elementor-preview-iframe').locator('.elementor-widget-tbt-gallery-3 h2').click();
  await page.getByText('Gallery cards', { exact: true }).click();
  await page.locator('.elementor-control-gallery_items .elementor-repeater-tool-duplicate').first().click();
  await save();
  await visitor.goto(`${base}/gallery/`, { waitUntil: 'domcontentloaded' });
  assert.equal(await visitor.locator('.tbt-gallery-case').count(), originalGallery.length + 1);
  console.log('PASS client can duplicate a gallery card and publish the new gallery');
  await page.evaluate((items) => {
    const model = elementor.elements.find((item) => item.get('widgetType') === 'tbt-gallery-3');
    return $e.run('document/elements/settings', { container: elementor.getContainer(model.id), settings: { gallery_items: items } });
  }, originalGallery);
  await save();
  await visitor.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await visitor.locator('.tbt-gallery-case').count(), originalGallery.length);
  console.log('PASS original gallery restored');
  await page.goto(`${base}/wp-admin/tools.php?page=tbt-page-editor`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Prepare editable pages' }).click();
  assert((await page.locator('body').innerText()).includes('Already editable; preserved'));
  console.log('PASS repeat setup preserves existing client edits');
  await page.screenshot({ path: 'artifacts/editor/editor-initial.png' });
  await writeFile('artifacts/editor/editor-dom.txt', await page.locator('body').innerText());
  console.log('Editor loaded', await page.title(), errors);
} finally { await browser.close(); }
