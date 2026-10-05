// Representative reading/interaction checks complement the full table inventory.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, webkit} = require('playwright');
const base = process.env.GUIDE_BASE_URL;
assert(base, 'Set GUIDE_BASE_URL');
const output = process.env.PW_READABILITY_REPORT;
const widths = [320,375,390,430];
const cases = [
  ['path-record','guide/path-system.html',0],
  ['path-comparison','guide/path-system.html',3],
  ['condition-result','mechanics/affection-differences.html',1],
  ['compact-threshold','mechanics/affection.html',0],
  ['point-ledger','mechanics/affection.html',3],
  ['gallery-matrix','collectibles/gallery.html',0],
  ['vault-record','extras/easter-eggs.html',0],
  ['archive-record','versions/legacy-routes.html',1],
];
const selectedCases=process.env.PW_READABILITY_KINDS ? cases.filter(([kind])=>process.env.PW_READABILITY_KINDS.split(',').includes(kind)) : cases;
const report=[];
async function settled(p) {await p.evaluate(()=>pwAdaptiveTables.whenSettled());}
async function run(name,type,options) {
 const browser=await type.launch({headless:true,...options});
 try {
  for(const locale of ['', 'en/']) for(const width of widths) for(const [kind,route,index] of selectedCases) {
   const p=await browser.newPage({viewport:{width,height:740}});
   await p.goto(`${base}/${locale}${route}`); await p.locator('body.pw-custom-layout-ready').waitFor();
   const table=p.locator('main.content table').nth(index);
   await table.evaluate(t=>{
    const pane=t.closest('.tab-pane');
    if(pane) document.querySelectorAll('[data-bs-toggle="tab"]').forEach(a=>{if(a.getAttribute('data-bs-target')===`#${pane.id}`||a.getAttribute('href')===`#${pane.id}`) bootstrap.Tab.getOrCreateInstance(a).show();});
   });
   await p.waitForFunction(()=>!document.querySelector('main.content .collapsing'));
   const details=table.locator('xpath=ancestor::details[1]');
   if(await details.count()) {
    const summary=details.locator(':scope > summary');
    if(!await details.evaluate(d=>d.open)) await summary.click();
    await settled(p); assert(await details.evaluate(d=>d.open),`${kind}: real disclosure open`);
    const text=await table.textContent();
    await summary.click(); assert.equal(await details.evaluate(d=>d.open),false);
    await summary.click(); await settled(p); assert.equal(await table.textContent(),text,`${kind}: disclosure preserves fields`);
   }
   await settled(p);
   const state=await table.evaluate(t=>{
    const wrapper=t.closest('.pw-mobile-table-scroll,.gallery-coordinate-table');
    const r=wrapper.getBoundingClientRect();
    return {mode:wrapper.dataset.pwMode,representation:wrapper.dataset.pwRepresentation,variant:wrapper.dataset.pwVariant,width:r.width,articleWidth:document.querySelector('main.content').getBoundingClientRect().width,overflow:wrapper.scrollWidth-wrapper.clientWidth,headers:[...t.tHead.rows[0].cells].map(c=>c.textContent.trim())};
   });
   if(['path-record','path-comparison','condition-result','vault-record','archive-record'].includes(kind)) assert.equal(state.mode,'record',`${name}/${locale}/${width}/${kind}: prose needs full-width records`);
   if(kind==='compact-threshold') {
    assert.equal(state.representation,'compact');
    if(width===430) assert(state.width < state.articleWidth-16,`${name}/${locale}: short lookup should not be stretched`);
   }
   if(kind==='gallery-matrix') {
    assert.equal(state.representation,'matrix'); assert(state.overflow>1,'coordinate comparisons retain local scrolling');
    const region=table.locator('xpath=ancestor::*[contains(@class,"gallery-coordinate-table")][1]');
    assert(await region.evaluate(r=>!r.previousElementSibling.hidden),'visible horizontal-scroll hint');
    await region.locator('thead th').first().scrollIntoViewIfNeeded();
    await region.focus();
    assert(await region.evaluate(r=>document.activeElement===r),'scroll region owns keyboard focus');
    const documentY=await p.evaluate(()=>scrollY);
    await p.keyboard.press('ArrowRight');
    await p.waitForFunction(()=>document.querySelector('.gallery-coordinate-table').scrollLeft>0);
    assert.equal(await p.evaluate(()=>scrollY),documentY,'horizontal arrow does not scroll the document');
    await p.keyboard.press('ArrowLeft');
    await p.waitForFunction(()=>document.querySelector('.gallery-coordinate-table').scrollLeft===0).catch(async error=>{throw new Error(`${name}/${locale||'zh'}/${width}/gallery left arrow: ${await region.evaluate(r=>r.scrollLeft)}; ${error.message}`);});
   }
   // Capture the first two complete records, rather than a giant table image.
   if(output && name==='Edge') {
    await table.evaluate(t=>{const w=t.closest('.pw-mobile-table-scroll,.gallery-coordinate-table'); window.scrollTo({top:Math.max(0,w.getBoundingClientRect().top+scrollY-140),behavior:'instant'});});
    await settled(p);
    const filename=`${locale?'en':'zh'}-${width}-${kind}.png`;
    fs.mkdirSync(path.join(output,'screenshots'),{recursive:true});
    await p.screenshot({path:path.join(output,'screenshots',filename)});
    state.screenshot=filename;
   }
   // Real link activation after the responsive adaptation preserves destination.
   if(kind==='archive-record' && width===390) {
    const link=table.locator('tbody a').first();
    const target=await link.getAttribute('target'); const href=await link.getAttribute('href');
    if(target==='_blank') {
     const popupPromise=p.context().waitForEvent('page'); await link.click(); const popup=await popupPromise;
     await popup.waitForLoadState(); assert.equal(popup.url(),new URL(href,p.url()).href); await popup.close();
    } else {await link.click(); await p.waitForURL(new URL(href,p.url()).href);}
   }
   report.push({engine:name,locale:locale?'en':'zh',width,kind,...state}); await p.close();
  }
  console.log(`${name}: PASS ${2*widths.length*selectedCases.length} reading states (${selectedCases.map(([kind])=>kind).join(', ')}); applicable interaction and width checks`);
 } finally {await browser.close();}
}
(async()=>{
 await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
 await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{});
 if(output) fs.writeFileSync(path.join(output,'reading-states.json'),JSON.stringify({selectedKinds:selectedCases.map(([kind])=>kind),states:report},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
