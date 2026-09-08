import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9404'; // Local-only: never edits hosted content.
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const visitor = await browser.newPage({viewport:{width:1440,height:950}});
  const go = path => page.goto(`${base}${path}`,{waitUntil:'load',timeout:60000});
  const publish = async()=>{
    await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:60000}),page.locator('#publish').click()]);
    await page.locator('#tbt-content-fields').waitFor({state:'visible'}); await page.waitForLoadState('load');
  };
  const openPopup = async(area,city)=>{
    const button=visitor.locator(area).getByRole('button',{name:city,exact:true}); await button.click();
    return visitor.locator(`#${await button.getAttribute('aria-controls')}`);
  };
  await go('/wp-admin/edit.php?post_type=tbt_location&s=Barrana+Location+QA');
  for(const url of await page.locator('#the-list .row-title').evaluateAll(nodes=>nodes.filter(node=>node.textContent.startsWith('Barrana Location QA')).map(node=>node.href))) {
    await page.goto(url,{waitUntil:'load'}); await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.locator('#delete-action a').click()]);
  }
  await go('/wp-admin/edit.php?post_type=tbt_location');
  assert.equal(await page.locator('#the-list tr').count(),9);
  assert.equal(await page.locator('#the-list .row-title').first().textContent(),'Beverly Hills');
  assert.equal(await page.locator('#the-list a').filter({hasText:'View'}).count(),0);

  const atlanta = await page.getByRole('link',{name:'Atlanta',exact:true}).getAttribute('href');
  await page.goto(atlanta,{waitUntil:'load'});
  const practice=page.locator('#tbt-field-practice'); const original=await practice.inputValue();
  assert(await page.locator('[data-tbt-field="address"]').isVisible());
  assert(await page.locator('[data-tbt-field="sms_number"]').isHidden());
  await practice.fill('Barrana Local Location QA'); await publish();
  await visitor.goto(base,{waitUntil:'networkidle'});
  for(const area of ['#contact','footer']) {
    const panel=await openPopup(area,'Atlanta'); assert.match(await panel.innerText(),/Barrana Local Location QA/); await visitor.keyboard.press('Escape');
  }
  await practice.fill(original); await publish();

  await go('/wp-admin/post-new.php?post_type=tbt_location');
  await page.locator('#title').fill('Barrana Location QA'); await page.locator('#tbt-field-city').fill('Barrana QA City');
  await page.locator('#menu_order').fill('0'); await page.locator('#tbt-field-mode').selectOption('appointment'); await publish();
  assert.match(await page.locator('body').innerText(),/Saved as a draft/);
  assert(await page.locator('[data-tbt-field="address"]').isHidden());
  assert(await page.locator('[data-tbt-field="sms_number"]').isVisible());
  await page.locator('#tbt-field-appointment_intro').fill('Appointments only.');
  await page.locator('#tbt-field-sms_label').fill('Text 555-0100');
  await page.locator('#tbt-field-sms_number').fill('++1 (555) 555-0100');
  await page.locator('#tbt-field-appointment_outro').fill('to schedule.'); await publish();
  assert.equal(await page.locator('#tbt-field-sms_number').inputValue(),'+15555550100');
  await visitor.goto(base,{waitUntil:'networkidle'});
  assert.equal(await visitor.locator('footer .tbt-city-button').first().textContent(),'Barrana QA City');
  for(const area of ['#contact','footer']) {
    const panel=await openPopup(area,'Barrana QA City');
    assert.match(await panel.innerText(),/Appointments only\. Text 555-0100 to schedule\./);
    assert.equal(await panel.getByRole('link',{name:'Text 555-0100'}).getAttribute('href'),'sms:+15555550100');
    await visitor.keyboard.press('Escape');
  }
  await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.locator('#delete-action a').click()]);
  await visitor.reload({waitUntil:'networkidle'});
  assert.equal(await visitor.getByRole('button',{name:'Barrana QA City',exact:true}).count(),0);
  assert.equal(await visitor.locator('footer .tbt-city-button').count(),8);
  await visitor.locator('footer').getByRole('button',{name:'Atlanta',exact:true}).click();
  assert.match(await visitor.locator('footer').innerText(),/Dentistry in Motion Suites/);
  assert(!/Barrana Local Location QA/.test(await visitor.locator('body').innerText()));
  console.log('PASS Locations admin add, draft validation, publish, order, edit, shared rendering and trash; original content restored');
} finally {await browser.close();}
