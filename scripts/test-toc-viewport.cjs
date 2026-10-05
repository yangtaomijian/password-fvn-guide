'use strict';
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const base=process.env.GUIDE_BASE_URL;assert(base,'Set GUIDE_BASE_URL to completed bilingual preview');
async function frames(p){await p.evaluate(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.allSettled(document.querySelector('#quarto-header').getAnimations().map(a=>a.finished));});}
async function geometry(p){return p.locator('#pw-page-toc-panel').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.querySelector('#quarto-header').getBoundingClientRect();return {x:r.x,width:r.width,top:r.top,bottom:r.bottom,position:getComputedStyle(e).position,headerBottom:Math.max(0,h.bottom),y:scrollY,viewport:innerHeight,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight};});}
async function run(name,type,options){const b=await type.launch({headless:true,...options});let checks=0;try{
 for(const locale of ['', 'en/'])for(const colorScheme of ['light','dark']){
  const p=await b.newPage({viewport:{width:1440,height:740},colorScheme});
  await p.goto(`${base}/${locale}collectibles/compendium.html`);await p.locator('body.pw-custom-layout-ready').waitFor();
  for(const width of [1440,1100,1099,992,991,820,768]){
   await p.setViewportSize({width,height:740});await frames(p);
   for(const y of [0,999999]){
    await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await frames(p);
    const s=await geometry(p);assert.equal(s.position,'fixed',`${name}/${width}: viewport ownership`);
    assert(s.top>=s.headerBottom-1&&s.top<=s.headerBottom+7,`${name}/${width}: measured header offset ${JSON.stringify(s)}`);
    assert(Math.abs(s.bottom-s.viewport)<=1,`${name}/${width}: bottom remains viewport-bound`);
    const main=await p.locator('main.content').boundingBox();
    if(width<1100)assert(s.x>=main.x+main.width-1,`${name}/${width}: TOC stays in its own right grid track`);
    else assert.equal(s.x,0,'Wide desktop TOC remains on left');
    checks++;
   }
   const summary=p.locator('main.content details > summary').last();
   await summary.scrollIntoViewIfNeeded();await frames(p);const before=await geometry(p);
   await summary.click();await frames(p);const after=await geometry(p);
   assert(Math.abs(after.x-before.x)<=1&&Math.abs(after.width-before.width)<=1,'Disclosure cannot shift TOC grid track');
   assert(Math.abs(after.bottom-after.viewport)<=1,'Disclosure cannot push TOC off viewport');checks++;
  }
  await p.setViewportSize({width:1440,height:390});await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await frames(p);
  const panel=p.locator('#pw-page-toc-panel');const s=await geometry(p);assert(s.scrollHeight>s.clientHeight,'Long TOC must have independent scroll range');
  const y=s.y;await panel.evaluate(e=>e.scrollTop=e.scrollHeight);assert.equal(await p.evaluate(()=>scrollY),y,'TOC scrolling does not scroll document');checks++;
  const link=panel.locator('#TOC a[data-scroll-target]').first();await link.click();const hash=await link.getAttribute('data-scroll-target');
  assert.equal(decodeURIComponent(new URL(p.url()).hash),decodeURIComponent(hash));
  await p.waitForFunction(hash=>[...document.querySelectorAll('#TOC a.active')].some(a=>a.getAttribute('data-scroll-target')===hash),hash);checks++;
  await p.close();
 }
 console.log(`${name}: PASS ${checks} TOC checks; both locales/themes; footer/details, 768/991/992/1099/1100 boundaries, independent scroll, native active heading`);
}finally{await b.close();}}
(async()=>{await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{});})().catch(e=>{console.error(e);process.exitCode=1;});
