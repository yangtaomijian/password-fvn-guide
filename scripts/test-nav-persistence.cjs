'use strict';
// Native sidebar groups: persistence without taking ownership of Bootstrap.
const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
async function snapshot(p,name) {
  if(!process.env.PW_NAV_SCREENSHOTS) return;
  fs.mkdirSync(process.env.PW_NAV_SCREENSHOTS,{recursive:true});
  await p.screenshot({path:path.join(process.env.PW_NAV_SCREENSHOTS,name)});
}
const prefix = 'pw';
const route = 'collectibles/gallery.html';
const GROUP_COUNT = 4; // Home and single-page Easter Eggs are direct destinations.
const ready = 'pw-custom-layout-ready';
const base = process.env.GUIDE_BASE_URL;
assert(base, 'Set GUIDE_BASE_URL to the completed bilingual local preview');
const key = `${prefix}-navigation-groups-v1`;
const sections = '#quarto-sidebar .sidebar-section[id]';
const headers = '#quarto-sidebar .sidebar-item-section > .sidebar-item-container > .sidebar-item-text';
const arrows = '#quarto-sidebar .sidebar-item-section > .sidebar-item-container > .sidebar-item-toggle';
async function settled(p) {
  await p.locator(`body.${ready}`).waitFor();
  await p.waitForFunction(() => !document.querySelector('#quarto-sidebar .collapsing'));
}
async function open(p) {
  await p.evaluate(() => scrollTo({top:0, behavior:'instant'}));
  await p.waitForTimeout(250);
  await p.locator('#quarto-header .quarto-btn-toggle').click();
  await p.waitForFunction(() => document.querySelector('#quarto-sidebar').classList.contains('show'));
  await settled(p);
}
async function close(p) {
  await p.waitForFunction(() => document.querySelector('#quarto-sidebar-glass').classList.contains('show') && !document.querySelector('#quarto-sidebar-glass').classList.contains('collapsing'));
  const box = await p.locator('#quarto-sidebar-glass').boundingBox();
  const sidebar = await p.locator('#quarto-sidebar').boundingBox();
  // Click the exposed backdrop, away from WebKit's transient edge scrollbar.
  const x = (sidebar.x + sidebar.width + box.x + box.width) / 2 - box.x;
  await p.locator('#quarto-sidebar-glass').click({position:{x, y:box.height/2}});
  await p.waitForFunction(() => !document.querySelector('#quarto-sidebar').classList.contains('show') && !document.querySelector('#quarto-sidebar').classList.contains('collapsing'));
}
async function check(p, expected, where) {
  await settled(p);
  const states = await p.locator(sections).evaluateAll(es => es.map(group => {
    const open = group.classList.contains('show');
    const toggles = [...document.querySelectorAll(`#quarto-sidebar [data-bs-target="#${group.id}"]`)];
    return {open, consistent:toggles.length===2 && toggles.every(t => t.getAttribute('aria-expanded')===String(open) && t.classList.contains('collapsed')===!open)};
  }));
  assert.deepEqual(states.map(s => s.open), expected, where);
  assert(states.every(s => s.consistent), `${where}: title/chevron aria mismatch`);
}
async function toggle(p, index, arrow=false) {
  await p.locator(arrow ? arrows : headers).nth(index).click();
  await settled(p);
}
async function directCategoryStyle(p) {
  const styles=await p.evaluate(()=>{
    const direct=document.querySelector('#quarto-sidebar .pw-nav-direct-section > .sidebar-item-container > .sidebar-link');
    const group=document.querySelector('#quarto-sidebar .sidebar-item-section > .sidebar-item-container > .sidebar-link');
    const keys=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft'];
    const read=e=>Object.fromEntries(keys.map(key=>[key,getComputedStyle(e)[key]]));
    return {direct:read(direct),group:read(group),label:read(direct.querySelector('.menu-text')),groupLabel:read(group.querySelector('.menu-text'))};
  });
  assert.deepEqual(styles.direct,styles.group,'Direct primary category matches group typography and padding');
  for(const key of ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing']) assert.equal(styles.label[key],styles.groupLabel[key],`Primary category label ${key}`);
}
async function run(name, type, options) {
  const browser = await type.launch({headless:true, ...options});
  let checks = 0;
  try {
    for (const width of [390, 820]) for (const locale of ['', 'en/']) {
      console.log(`${prefix} ${name}: width=${width} locale=${locale || 'zh'}`);
      const p = await browser.newPage({viewport:{width,height:874}});
      await p.goto(`${base}/${locale}${route}`);
      await settled(p);
      const count = await p.locator(sections).count();
      assert.equal(count, GROUP_COUNT, 'Home and Easter Eggs are direct links; four multi-page groups remain');
      const eggs = p.locator('#quarto-sidebar .sidebar-menu-container > ul > li').filter({has:p.locator('a[href$="extras/easter-eggs.html"]')});
      assert.equal(await eggs.count(),1,'One direct Easter Eggs destination');
      assert.equal(await eggs.locator('[data-bs-toggle="collapse"], .sidebar-section').count(),0,'Single-page Extras has no nested disclosure');
      assert.equal((await eggs.locator('.menu-text').textContent()).trim(), locale ? 'Easter Eggs' : '彩蛋','Direct link uses the approved concise navigation label');
      const expected = Array(count).fill(false); expected[1]=true;
      await open(p); await directCategoryStyle(p); await check(p, expected, 'Native first-visit active group'); checks++;
      if(name==='Edge'&&width===390) await snapshot(p,`mobile-${locale?'en':'zh'}-inactive.png`);
      await toggle(p,0); expected[0]=true;
      await check(p,expected,'Title opens group'); checks++;
      await toggle(p,1,true); expected[1]=false;
      await check(p,expected,'Chevron closes independent group'); checks++;
      const prefs = await p.evaluate(key => localStorage.getItem(key), key);
      assert(prefs, 'Explicit user choices saved');
      await close(p); await open(p); await check(p,expected,'Close/reopen'); checks++;
      const destination = p.locator(sections).nth(0).locator('a[href]').first();
      await Promise.all([p.waitForURL(await destination.evaluate(a=>a.href)), destination.click()]);
      await settled(p); await open(p); await check(p,expected,'Actual cross-page link'); checks++;
      await p.reload(); await settled(p); await open(p); await check(p,expected,'Reload overrides active-section default'); checks++;
      await close(p);
      await p.evaluate(() => scrollTo({top:0,behavior:'instant'})); await p.waitForTimeout(250);
      await open(p);
      const language = p.locator(`.${prefix}-language-switch`);
      await Promise.all([p.waitForURL(await language.evaluate(a=>a.href)), language.click()]);
      await settled(p); await open(p); await check(p,expected,'Actual bilingual switch'); checks++;
      await toggle(p,1); expected[1]=true; await check(p,expected,'Additional independent group'); checks++;
      const home = p.locator('#quarto-sidebar .sidebar-menu-container > ul > li').first();
      assert.equal(await home.locator('a[href]').count(),1,'One Home destination');
      assert.equal(await home.locator('[data-bs-toggle="collapse"], .sidebar-section').count(),0,'Home has no nested level or disclosure');
      const homeLink=home.locator('a[href]');
      const homeURL=await homeLink.evaluate(a=>a.href);
      await homeLink.focus();await Promise.all([p.waitForURL(homeURL),p.keyboard.press('Enter')]);
      await settled(p);await open(p);await check(p,expected,'Direct Home navigation preserves group choices');
      assert.equal(await p.locator('#quarto-sidebar .sidebar-menu-container > ul > li').first().locator('a.active[href]').count(),1,'Home destination highlighted');checks++;
      await close(p);
      await p.evaluate(() => scrollTo({top:0,behavior:'instant'})); await p.waitForTimeout(250);
      await p.locator('#quarto-header .quarto-btn-toggle').focus(); await p.keyboard.press('Enter');
      await p.waitForFunction(() => document.querySelector('#quarto-sidebar').classList.contains('show'));
      await check(p,expected,'Keyboard reopens drawer with remembered groups'); checks++;
      await close(p);
      await p.goBack(); await settled(p); await open(p);
      await check(p,expected,'History back reads latest group preferences'); checks++;
      await close(p); await p.goForward(); await settled(p); await open(p);
      await check(p,expected,'History forward reads latest group preferences'); checks++;
      await close(p);
      const remembered = await p.evaluate(key=>localStorage.getItem(key),key);
      await p.setViewportSize({width:1100,height:900});
      await p.waitForFunction(()=>document.querySelector('#quarto-sidebar').inert);
      const desktopEggs=p.locator('#navbarCollapse .navbar-nav > .nav-item > a[href$="extras/easter-eggs.html"]');
      assert.equal(await desktopEggs.count(),1,'Desktop Easter Eggs is a direct link');
      assert.equal(await desktopEggs.getAttribute('data-bs-toggle'),null,'Direct Easter Eggs has no dropdown');
      for(const desktopWidth of [992,1100,1280,1440]) {
        await p.setViewportSize({width:desktopWidth,height:900});
        await p.waitForFunction(()=>[...document.querySelectorAll('#navbarCollapse .navbar-nav > .nav-item > .nav-link,.quarto-navbar-tools')].every(e=>e.getBoundingClientRect().right<=innerWidth+1));
        const within=await p.locator('#navbarCollapse .navbar-nav > .nav-item > .nav-link,.quarto-navbar-tools').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().left>=-1&&e.getBoundingClientRect().right<=innerWidth+1));
        assert(within,'Every desktop navigation destination and utility is in the viewport');
      }
      await p.locator('#navbarCollapse .dropdown-toggle').first().click();
      assert.equal(await p.locator('#navbarCollapse .dropdown-toggle').first().getAttribute('aria-expanded'),'true');
      await p.locator('main h1').click();
      assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),remembered,'Desktop dropdown must not overwrite mobile choices'); checks++;
      const eggsTarget=await desktopEggs.evaluate(a=>a.href);
      await Promise.all([p.waitForURL(eggsTarget),desktopEggs.click()]);await settled(p);
      assert.equal(await p.locator('#navbarCollapse a[href$="extras/easter-eggs.html"].active[aria-current="page"]').count(),1,'Direct desktop Easter Eggs highlights its current page');
      assert.equal(await p.locator('#quarto-sidebar a[href$="extras/easter-eggs.html"].active').count(),1,'Direct sidebar Easter Eggs highlights its current page');checks++;
      assert.equal((await p.locator('main h1.title').textContent()).trim(),new URL(p.url()).pathname.startsWith('/en/') ? 'Easter Eggs and Hidden Inputs' : '彩蛋与隐藏输入','Short navigation label preserves the full page title');
      await p.setViewportSize({width:1099,height:900});
      await p.waitForFunction(()=>!document.querySelector('#quarto-sidebar').inert);
      // Programmatic events are unrelated to an explicit group click.
      await p.locator(sections).nth(0).evaluate(group=>group.dispatchEvent(new Event('hide.bs.collapse',{bubbles:true})));
      assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),remembered); checks++;
      await p.setViewportSize({width:320,height:874});
      await open(p); await directCategoryStyle(p); await check(p,expected,'Breakpoint round trip'); checks++;
      if(name==='Edge'&&width===390) await snapshot(p,`mobile-${new URL(p.url()).pathname.startsWith('/en/')?'en':'zh'}-active.png`);
      await p.close();
    }
    for (const mode of ['corrupt','blocked']) {
      const p = await browser.newPage({viewport:{width:320,height:874}});
      await p.addInitScript(({mode,key})=>{
        if(mode==='corrupt') localStorage.setItem(key,'{invalid-json');
        else for(const method of ['getItem','setItem']) {
          const original=Storage.prototype[method];
          Storage.prototype[method]=function(k,...args){if(k===key)throw new Error('Unavailable optional preference storage');return original.call(this,k,...args);};
        }
      },{mode,key});
      await p.goto(`${base}/${route}`); await settled(p); await open(p);
      assert.equal(await p.locator(sections).count(),GROUP_COUNT,'Fallback keeps the same four navigation groups');
      const expected=Array(GROUP_COUNT).fill(false);expected[1]=true;
      await check(p,expected,`${mode}: default`);checks++;
      await toggle(p,0);expected[0]=true;
      await close(p);await open(p);await check(p,expected,`${mode}: in-page retention`);checks++;
      await toggle(p,0,true);expected[0]=false;
      await close(p);await open(p);await check(p,expected,`${mode}: explicit collapse`);checks++;
      await p.close();
    }
    console.log(`${prefix} ${name}: PASS ${checks} navigation checks`);
  } finally {await browser.close();}
}
(async()=>{
  await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
  await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE ? {executablePath:process.env.WEBKIT_EXECUTABLE} : {});
})().catch(error=>{console.error(error);process.exitCode=1;});
