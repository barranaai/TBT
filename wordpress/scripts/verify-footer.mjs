import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.TBT_BASE_URL || 'http://127.0.0.1:9404';
const cities = ['Beverly Hills','New York','Atlanta','Houston','Miami','Washington D.C.','Tampa','Memphis'];
const routes = ['/','/about/','/services/','/gallery/','/financing/','/contact/','/consultation/','/reserve/?type=video'];
const browser = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true });
const normalize = text => text.replace(/\s+/g,' ').trim();
const report = { base, live:'https://teethbytrev.com/', popups:{}, checks:[] };
await mkdir('artifacts/footer', { recursive:true });
try {
  const live = await browser.newPage({ viewport:{width:1440,height:950}, reducedMotion:'reduce' });
  await live.goto(report.live, {waitUntil:'networkidle'});
  for (const city of cities) {
    const button = live.locator('footer').getByRole('button',{name:city,exact:true});
    await button.click();
    const popup = button.locator('..').locator('div').first();
    report.popups[city] = { text:normalize(await popup.innerText()), links:await popup.locator('a').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,href:n.getAttribute('href')}))) };
    await button.click();
  }
  const liveContacts = await live.locator('footer address a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  for (const viewport of [{name:'mobile',width:375,height:844},{name:'tablet',width:768,height:1024},{name:'desktop',width:1440,height:950}]) {
    const page = await browser.newPage({viewport, reducedMotion:'reduce'});
    page.setDefaultNavigationTimeout(60000);
    await page.addInitScript(()=>{sessionStorage.setItem('tbt-intro-seen','1');localStorage.setItem('tbt.analytics-consent.v1','denied');});
    await page.goto(base,{waitUntil:'networkidle'});
    for (const area of ['#contact','footer']) {
      const section = page.locator(area);
      assert.equal(await section.locator('address').filter({hasText:'436 N Bedford'}).count(),0);
      assert.deepEqual(await section.locator('.tbt-city-button').allTextContents(),cities);
      await section.screenshot({path:`artifacts/footer/${viewport.name}-${area==='#contact'?'prefooter':'footer'}.png`});
      for (const city of cities) {
        const button = section.getByRole('button',{name:city,exact:true});
        await button.click();
        const panel = page.locator(`#${await button.getAttribute('aria-controls')}`);
        assert.equal(normalize(await panel.innerText()),report.popups[city].text,`${area} ${city}: live popup text`);
        assert.deepEqual(await panel.locator('a').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,href:n.getAttribute('href')}))),report.popups[city].links);
        const box = await panel.boundingBox();
        assert(box.x>=0 && box.x+box.width<=viewport.width+1 && box.y>=0 && box.y+box.height<=viewport.height+1,`${viewport.name} ${area} ${city}: popup within viewport ${JSON.stringify(box)}`);
        assert.equal(await page.locator('.tbt-city-button[aria-expanded="true"]').count(),1);
        if(city==='New York') await page.screenshot({path:`artifacts/footer/${viewport.name}-${area==='#contact'?'prefooter':'footer'}-new-york.png`});
        await page.keyboard.press('Escape');
        assert(await panel.isHidden()); assert(await button.evaluate(n=>n===document.activeElement));
      }
      const first = section.getByRole('button',{name:cities[0],exact:true});
      await first.focus(); await page.keyboard.press('Enter');
      assert.equal(await first.getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Tab');
      assert(await page.locator('.tbt-city-popup:not([hidden]) a').first().evaluate(n=>n===document.activeElement));
      await page.keyboard.press('Escape');
      await first.click(); await page.locator('h1').click();
      assert.equal(await first.getAttribute('aria-expanded'),'false');
      report.checks.push(`${viewport.name} ${area}: eight live-matched popups, viewport bounds, links, keyboard and outside dismissal`);
    }
    for(const route of routes) {
      await page.goto(new URL(route,base).href,{waitUntil:'networkidle'});
      assert.deepEqual(await page.locator('footer .tbt-city-button').allTextContents(),cities,`${viewport.name} ${route}: city buttons`);
      assert.deepEqual(await page.locator('footer address a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),liveContacts);
      assert(!/436 N Bedford|professional corporation/.test(await page.locator('footer').innerText()));
      assert.equal(await page.locator('footer nav a').count(),6);
    }
    console.log(`PASS ${viewport.name}: footer on eight routes and both popup sets`);
    await page.close();
  }
  await writeFile('artifacts/footer/report.json',JSON.stringify(report,null,2));
  console.log('PASS footer/pre-footer live content and interaction parity');
} finally { await browser.close(); }
