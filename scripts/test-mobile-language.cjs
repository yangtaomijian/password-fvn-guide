'use strict';
const assert = require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const prefix='pw',route='collectibles/gallery.html',hash='memories',ready='pw-custom-layout-ready';
const base=process.env.GUIDE_BASE_URL;assert(base,'Set GUIDE_BASE_URL to local bilingual preview');
async function fragmentLanding(p,hash) {
 // A preserved fragment has a two-stage landing around header settlement.
 // Verify its real destination before issuing a competing scroll-to-top action.
 await p.waitForFunction(hash=>{
  const target=document.getElementById(hash),h=document.querySelector('#quarto-header');
  return target && scrollY>0 && h.classList.contains('headroom--not-top') &&
   !h.getAnimations().some(a=>a.playState==='running') &&
   Math.abs(target.getBoundingClientRect().top-Math.max(0,h.getBoundingClientRect().bottom)-10)<=1;
 },hash);
}
async function revealHeader(p) {
 await p.evaluate(() => scrollTo({top:0,behavior:'instant'}));
 await p.waitForFunction(() => {
  const h=document.querySelector('#quarto-header');
  return scrollY<=1 && h.classList.contains('headroom--top') &&
   !h.classList.contains('headroom--unpinned') && h.getBoundingClientRect().top>=-1 &&
   !h.getAnimations().some(a=>a.playState==='running');
 });
}
async function open(p){
 await revealHeader(p);
 // Breakpoint closes remove .show before Bootstrap finishes .collapsing;
 // a toggle click during that transition is intentionally ignored by Bootstrap.
 await p.waitForFunction(()=>!document.querySelector('.quarto-sidebar-collapse-item.collapsing'));
 assert.equal(await p.locator('#quarto-sidebar').evaluate(e=>e.classList.contains('show')),false,'Opener starts from a fully closed navigation');
 await p.locator('#quarto-header .quarto-btn-toggle').click();
 await p.waitForFunction(()=>document.querySelector('#quarto-sidebar').classList.contains('show')&&!document.querySelector('.quarto-sidebar-collapse-item.collapsing'));
}
async function close(p){
 await p.waitForFunction(()=>document.querySelector('#quarto-sidebar-glass').classList.contains('show')&&!document.querySelector('#quarto-sidebar-glass').classList.contains('collapsing'));
 const glass=await p.locator('#quarto-sidebar-glass').boundingBox(),nav=await p.locator('#quarto-sidebar').boundingBox();
 await p.mouse.click((nav.x+nav.width+glass.x+glass.width)/2,glass.y+glass.height/2);
 await p.waitForFunction(()=>!document.querySelector('#quarto-sidebar').classList.contains('show')&&!document.querySelector('#quarto-sidebar').classList.contains('collapsing'));
}
async function run(name,type,options){
 const b=await type.launch({headless:true,...options});let checks=0;
 try{for(const locale of ['', 'en/'])for(const colorScheme of ['light','dark']){
  const p=await b.newPage({viewport:{width:390,height:874},colorScheme});
  await p.goto(`${base}/${locale}${route}?preview=language#${hash}`);await p.locator(`body.${ready}`).waitFor();await fragmentLanding(p,hash);
  const identity=await p.locator(`.${prefix}-language-switch`).evaluate(link=>{link.dataset.identityProbe='original';return link.href;});
  for(const width of [320,360,390,768,991,992,1100,1440]){
   await p.setViewportSize({width,height:874});
   await p.waitForFunction(({prefix,narrow})=>!!document.querySelector(`.${prefix}-nav-language .${prefix}-language-switch`)===narrow,{prefix,narrow:width<992});
   const s=await p.evaluate(prefix=>{
    const link=document.querySelector(`.${prefix}-language-switch`),title=document.querySelector(`.${prefix}-masthead-name`),tools=document.querySelector('.quarto-navbar-tools');
    const controls=[...tools.querySelectorAll(`.quarto-color-scheme-toggle,.${prefix}-theme-auto,.${prefix}-search-launcher`)];
    return{count:document.querySelectorAll(`.${prefix}-language-switch`).length,identity:link.dataset.identityProbe,href:link.href,
     titleRight:title.getBoundingClientRect().right,toolsLeft:tools.getBoundingClientRect().left,titleWidth:title.clientWidth,textWidth:title.scrollWidth,
     widths:controls.map(c=>c.getBoundingClientRect().width),heights:controls.map(c=>c.getBoundingClientRect().height),
     overflow:document.documentElement.scrollWidth>innerWidth+1};
   },prefix);
   assert.equal(s.count,1,'Single language entry');assert.equal(s.identity,'original','Same DOM link after reparenting');assert.equal(s.href,identity,'Responsive moves keep URL');assert.equal(s.overflow,false,'No page horizontal overflow');
   if(width<992){
    assert(s.titleRight<=s.toolsLeft+1,'Brand and controls must not overlap');assert(s.textWidth<=s.titleWidth+1,'Full game name fits narrow header');
    assert(s.widths.every(w=>w>=44)&&s.heights.every(h=>h>=44),'44px utility targets');assert.equal(s.widths.length,3,'Exactly three header controls');
   }
   checks++;
  }
  await p.setViewportSize({width:390,height:874});await open(p);
  for(const header of await p.locator('#quarto-sidebar .sidebar-item-section > .sidebar-item-container > .sidebar-item-text').all()){
   if(await header.getAttribute('aria-expanded')==='false')await header.click();
   await p.waitForFunction(()=>!document.querySelector('#quarto-sidebar .collapsing'));
  }
  const footer=p.locator(`.${prefix}-nav-language`),link=p.locator(`.${prefix}-language-switch`);
  await link.scrollIntoViewIfNeeded();
  const geometry=await footer.evaluate(f=>({bottom:f.getBoundingClientRect().bottom,viewport:innerHeight,scrollHeight:f.previousElementSibling.scrollHeight,clientHeight:f.previousElementSibling.clientHeight}));
  assert(Math.abs(geometry.bottom-geometry.viewport)<=2,'Language footer visible at drawer bottom');checks++;
  await p.screenshot({path:`/tmp/${prefix}-mobile-language-${locale?'en':'zh'}-${colorScheme}.png`});
  await link.focus();await p.setViewportSize({width:992,height:874});
  await p.waitForFunction(prefix=>document.activeElement.classList.contains(`${prefix}-language-switch`),prefix);checks++;
  // Return through the ordinary native backdrop before checking desktop-to-mobile focus.
  await p.waitForFunction(()=>!document.querySelector("#quarto-sidebar").classList.contains("show") && !document.querySelector("#quarto-sidebar-glass").classList.contains("show"));
  await link.focus();await p.setViewportSize({width:390,height:874});
  await p.waitForFunction(()=>document.activeElement.classList.contains('quarto-btn-toggle'));checks++;
  await open(p);await link.focus();const target=await link.evaluate(a=>a.href);
  await Promise.all([p.waitForURL(target),p.keyboard.press('Enter')]);await p.locator(`body.${ready}`).waitFor();
  assert.equal(new URL(p.url()).hash,`#${hash}`);assert.equal(new URL(p.url()).search,'?preview=language');assert.equal(new URL(p.url()).pathname.includes('/en/'),!locale);await fragmentLanding(p,hash);checks++;
  await open(p);assert.equal(await p.locator(`.${prefix}-nav-language .${prefix}-language-switch`).count(),1);await close(p);
  await p.locator(`.${prefix}-search-launcher`).click();await p.locator('.aa-DetachedContainer').waitFor();await p.keyboard.press('Escape');await p.locator('.aa-DetachedContainer').waitFor({state:'hidden'});checks++;
  // Search restores launcher focus asynchronously; then reveal the auto-hiding header.
  await p.waitForFunction(prefix=>document.activeElement.classList.contains(`${prefix}-search-launcher`),prefix);
  await revealHeader(p);
  const darkBefore=await p.locator('body').evaluate(b=>b.classList.contains('quarto-dark'));
  await p.locator('.quarto-color-scheme-toggle').click();
  await p.waitForFunction(before=>document.body.classList.contains('quarto-dark')!==before,darkBefore);
  assert.equal(await p.locator(`.${prefix}-nav-language .${prefix}-language-switch`).count(),1);checks++;
  await p.close();
 }
 console.log(`${prefix} ${name}: PASS ${checks} language/header checks`);
 }finally{await b.close();}
}
(async()=>{await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});await run('WebKit',webkit,{executablePath:process.env.WEBKIT_EXECUTABLE});})().catch(e=>{console.error(e);process.exitCode=1;});
