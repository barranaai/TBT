import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9404'; // Never manipulate hosted menus in this test.
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); const visitor = await context.newPage();
  page.on('dialog', async dialog => { console.log('Native menu dialog:', dialog.type(), dialog.message()); await dialog.accept(); });
  page.setDefaultTimeout(30000);
  await page.goto(`${base}/wp-admin/nav-menus.php?action=locations`, { waitUntil: 'load' });
  const id = await page.locator('select[name="menu-locations[primary]"]').inputValue();
  await page.goto(`${base}/wp-admin/nav-menus.php?action=edit&menu=${id}`, { waitUntil: 'load' });
  console.log('Menu before adding', await page.locator('#menu-to-edit > li.menu-item').count());
  const save = async () => {
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }), page.getByRole('button', { name: 'Save Menu', exact: true }).click()]); await page.locator('#menu-to-edit').waitFor();
  };
  const fixtureItem = () => page.locator('#menu-to-edit > li.menu-item').filter({ has: page.locator('.menu-item-title', { hasText: 'Barrana CMS Native Link' }) });
  const oldFixture = fixtureItem();
  if (await oldFixture.count()) {
    if (!(await oldFixture.locator('.item-delete').isVisible())) await oldFixture.locator('.item-edit').click();
    await oldFixture.locator('.item-delete').click(); await save();
  }
  if (!(await page.locator('#custom-menu-item-url').isVisible())) await page.locator('#add-custom-links .accordion-section-title').click();
  await page.locator('#custom-menu-item-url').fill(`${base}/about/#cms-menu-test`);
  await page.locator('#custom-menu-item-name').fill('Barrana CMS Native Link');
  await page.locator('#submit-customlinkdiv').click();
  await page.waitForFunction(() => document.querySelectorAll('#menu-to-edit > li.menu-item').length === 7, null, { timeout: 30000 });
  await save();
  await visitor.goto(`${base}/`, { waitUntil: 'load' });
  const link = visitor.locator('#tbt-overlay-menu a').filter({ hasText: 'Barrana CMS Native Link' });
  assert.equal(await link.count(), 1); assert.equal(await link.getAttribute('href'), `${base}/about/#cms-menu-test`);
  console.log('PASS add a native custom menu link and retain its fragment');
  const reorderItem = fixtureItem();
  await reorderItem.locator('.item-edit').click();
  await reorderItem.locator('.edit-menu-item-order').selectOption('1');
  await save();
  await visitor.reload({ waitUntil: 'load' });
  assert.match(await visitor.locator('#tbt-overlay-menu a').first().textContent(), /Barrana CMS Native Link/);
  console.log('PASS native menu order control changes the visitor menu');
  const item = fixtureItem();
  if (!(await item.locator('.item-delete').isVisible())) await item.locator('.item-edit').click();
  await item.locator('.item-delete').click(); await save();
  await visitor.reload({ waitUntil: 'load' });
  assert.equal(await visitor.locator('#tbt-overlay-menu ul > li').count(), 6);
  assert.equal(await visitor.locator('#tbt-overlay-menu a').filter({ hasText: 'Barrana CMS Native Link' }).count(), 0);
  console.log('PASS remove native menu link and restore original menu');
} finally { await browser.close(); }
