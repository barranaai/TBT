import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9404'; // Local-only: never edits hosted content.
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const visitor = await browser.newPage();
  await page.goto(`${base}/wp-admin/tools.php?page=tbt-page-editor`,{waitUntil:'load'});
  const url = await page.locator('.wrap').getByRole('link',{name:'Site Footer',exact:true}).getAttribute('href');
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.elementor?.elements?.length>0,null,{timeout:90000});
  await page.locator('#elementor-loading').waitFor({state:'hidden',timeout:90000});
  await page.frameLocator('#elementor-preview-iframe').locator('#main-content footer img').click();
  const section = page.getByRole('button',{name:'City pop-ups (shared with pre-footer)',exact:true});
  await section.waitFor();
  if (!(await page.locator('.elementor-control-location_items .elementor-repeater-row-tools').first().isVisible())) await section.click();
  await page.locator('.elementor-control-location_items .elementor-repeater-row-tools').first().click();
  const venue = page.locator('input[data-setting="venue"]').first();
  const original = await venue.inputValue(); assert.equal(original,'Bedford Dental Group');
  const save = async()=>{
    const done=page.waitForResponse(r=>r.url().includes('admin-ajax.php')&&(r.request().postData()||'').includes('save_builder'),{timeout:60000});
    await page.getByRole('button',{name:'Publish',exact:true}).click(); assert.equal((await done).status(),200);
  };
  await venue.fill('Barrana Local Location QA'); await venue.blur(); await save();
  await visitor.goto(base,{waitUntil:'networkidle'});
  for(const area of ['#contact','footer']) {
    await visitor.locator(area).getByRole('button',{name:'Beverly Hills',exact:true}).click();
    assert.match(await visitor.locator(area).innerText(),/Barrana Local Location QA/);
    await visitor.keyboard.press('Escape');
  }
  await venue.fill(original); await venue.blur(); await save();
  await visitor.reload({waitUntil:'networkidle'});
  await visitor.locator('footer').getByRole('button',{name:'Beverly Hills',exact:true}).click();
  assert.match(await visitor.locator('footer').innerText(),/Bedford Dental Group/);
  assert(!/Barrana Local Location QA/.test(await visitor.locator('body').innerText()));
  console.log('PASS Elementor city fields save to both sections; original location restored');
} finally {await browser.close();}
