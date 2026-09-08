import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9404'; // Local-only save/reload test.
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${base}/wp-admin/tools.php?page=tbt-page-editor`, { waitUntil: 'load' });
  const url = await page.locator('.wrap').getByRole('link', { name: 'Gallery', exact: true }).getAttribute('href');
  const open = async () => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.elementor?.elements?.length > 0, { timeout: 90000 });
    await page.locator('#elementor-loading').waitFor({ state: 'hidden', timeout: 90000 });
  };
  const saved = () => page.evaluate(() => {
    const settings = elementor.elements.find((model) => model.get('widgetType') === 'tbt-gallery-3').get('settings');
    const items = settings.get('gallery_items');
    return { heading: settings.get('content_002'), items: items?.toJSON ? items.toJSON() : items };
  });
  const save = async () => {
    const done = page.waitForResponse((r) => r.url().includes('admin-ajax.php') && (r.request().postData() || '').includes('save_builder'), { timeout: 60000 });
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    assert.equal((await done).status(), 200);
  };
  await open(); const original = await saved(); assert.equal(original.items.length, 6);
  await page.frameLocator('#elementor-preview-iframe').locator('.elementor-widget-tbt-gallery-3 h2').click();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  const input = page.locator('input[data-setting="content_002"]');
  await input.fill('CMS compatibility verification'); await input.blur(); await save();
  await open(); const after = await saved();
  assert.deepEqual(after.items, original.items); assert.equal(after.heading, 'CMS compatibility verification');
  await page.evaluate((heading) => {
    const model = elementor.elements.find((model) => model.get('widgetType') === 'tbt-gallery-3');
    return $e.run('document/elements/settings', { container: elementor.getContainer(model.id), settings: { content_002: heading } });
  }, original.heading);
  await save(); await open(); assert.deepEqual(await saved(), original);
  console.log('PASS Elementor heading save/reload retains the archived gallery settings; original heading restored');
} finally { await browser.close(); }
