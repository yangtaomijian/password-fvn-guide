// Real native-disclosure reading checks for every source detail containing a table.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=process.env.GUIDE_BASE_URL;assert(base,'Set GUIDE_BASE_URL');
const root=path.resolve(__dirname,'../_site');const report=[];
const routes=['guide','mechanics','collectibles','versions','extras'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`)).filter(route=>[...fs.readFileSync(path.join(root,route),'utf8').matchAll(/<details\b[\s\S]*?<\/details>/g)].some(([html])=>/<table\b/.test(html)));
const widths=[320,375,390,430];
async function settled(p){await p.evaluate(()=>pwAdaptiveTables.whenSettled());}
async function inspect(table){return table.evaluate(t=>{
 const w=t.closest('.pw-adaptive-table'),wr=w.getBoundingClientRect(),errors=[];
 const norm=s=>s.replace(/\s+/g,' ').trim();const strip=c=>{const copy=c.cloneNode(true);copy.querySelectorAll('.pw-record-label,.pw-ledger-day-label').forEach(l=>l.remove());return norm(copy.textContent);};
 const rows=[...t.tBodies[0].rows],headers=[...t.tHead.rows[0].cells];
 for(const row of rows)for(const [index,cell]of [...row.cells].entries()){
  const cr=cell.getBoundingClientRect();if(cr.width<w.clientWidth-2)errors.push({reason:'narrow field',index,text:strip(cell),width:cr.width});
  if(!cell.getAttribute('headers')?.split(/\s+/).includes(headers[index].id))errors.push({reason:'header relationship',index});
  const label=cell.querySelector(':scope > .pw-record-label');if(index>0&&(!label||norm(label.textContent)!==norm(headers[index].textContent)))errors.push({reason:'missing or mismatched route/field label',index});
  const walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);for(let n;(n=walker.nextNode());){if(n.parentElement.closest('.pw-record-label,.pw-ledger-day-label'))continue;for(let i=0;i<n.textContent.length;i++){if(/\s/.test(n.textContent[i]))continue;const range=document.createRange();range.setStart(n,i);range.setEnd(n,i+1);const r=range.getBoundingClientRect();if(r.right>wr.right+1||r.left<wr.left-1)errors.push({reason:'clipped source glyph',char:n.textContent[i],index});}}
 }
 const named=t.closest('.path-exception-comparison-table');const titles=rows.slice(0,3).map(row=>strip(row.cells[0]));
 if(named&&document.documentElement.lang.startsWith('zh')){
  const expected=['豁免生效时点','是否视为密码成功','失败场景'];expected.forEach((text,index)=>{if(titles[index]!==text)errors.push({reason:'named comparison row identity',index});const cell=rows[index].cells[0],walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT),ys=[];for(let n;(n=walker.nextNode());){if(n.parentElement.closest('.pw-record-label'))continue;for(let i=0;i<n.textContent.length;i++){if(!/[\u3400-\u9fff]/.test(n.textContent[i]))continue;const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);ys.push(r.getBoundingClientRect().top);}}if(Math.max(...ys)-Math.min(...ys)>1)errors.push({reason:'named heading split into narrow vertical lines',text});});
 }
 return{mode:w.dataset.pwMode,width:w.clientWidth,scrollWidth:w.scrollWidth,open:t.closest('details').open,errors,titles,headers:headers.map(h=>norm(h.textContent)),rows:rows.length,viewport:{width:innerWidth,height:innerHeight}};
});}
async function run(name,type,options){const b=await type.launch({headless:true,...options});let checks=0;try{
 for(const locale of ['', 'en/'])for(const route of routes){const p=await b.newPage({viewport:{width:390,height:874},deviceScaleFactor:3,colorScheme:'dark'});const fragment=route==='guide/path-system.html'?(locale?'#tyson-route-exception':'#tyson-线的特殊情况'):'';await p.goto(`${base}/${locale}${route}${fragment}`);await p.locator('body.pw-custom-layout-ready').waitFor();const tables=p.locator('main.content details table');assert(await tables.count()>0,`${locale}${route}: discovered disclosure tables`);
  for(let i=0;i<await tables.count();i++){const table=tables.nth(i),details=table.locator('xpath=ancestor::details[1]'),summary=details.locator(':scope > summary');
   for(const width of widths){await p.setViewportSize({width,height:874});if(await details.evaluate(d=>d.open))await summary.click();assert.equal(await details.evaluate(d=>d.open),false,'start closed');await summary.click();await settled(p);let state=await inspect(table);assert.equal(state.open,true,'real click expands disclosure');assert.equal(state.mode,'record','prose disclosure needs readable records');assert(state.scrollWidth-state.width<=1,'all fields visible without horizontal scroll');assert.deepEqual(state.errors,[],`${name}/${locale}${route}/${width}: source reading contract`);report.push({engine:name,locale:locale?'en':'zh',route,index:i,...state});checks++;
    await p.setViewportSize({width:1440,height:874});await settled(p);
    // Representation follows the measured details container, not viewport width.
    // The desktop contract here is unchanged semantic headers and source fields.
    const desktop=await table.evaluate(t=>({role:t.getAttribute('role'),headers:[...t.tHead.rows[0].cells].map(h=>({text:h.textContent.replace(/\s+/g,' ').trim(),scope:h.scope,id:h.id})),titles:[...t.tBodies[0].rows].slice(0,3).map(row=>{const c=row.cells[0].cloneNode(true);c.querySelectorAll('.pw-record-label,.pw-ledger-day-label').forEach(l=>l.remove());return c.textContent.replace(/\s+/g,' ').trim();}),hasHeaders:getComputedStyle(t.tHead).display!=='none'}));
    assert.equal(desktop.role,'table');assert(desktop.hasHeaders,'desktop retains its semantic table header');assert.deepEqual(desktop.headers.map(h=>h.text),state.headers);assert(desktop.headers.every(h=>h.scope==='col'&&h.id));assert.deepEqual(desktop.titles,state.titles,'desktop keeps the original row meanings');await p.setViewportSize({width,height:874});await settled(p);state=await inspect(table);assert.equal(state.mode,'record','Safari resize returns to records');assert.deepEqual(state.errors,[],'resize preserves readable glyphs and field labels');await summary.click();await summary.click();await settled(p);state=await inspect(table);assert.deepEqual(state.errors,[],'reopen preserves reading contract');
   }
  }await p.close();
 }
 console.log(`${name}: PASS ${checks} source-disclosure reading states; real open/close, 390×874/3×, four widths, desktop resize, complete field glyphs, named Chinese headings`);
}finally{await b.close();}}
(async()=>{await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});await run('WebKit',webkit,{executablePath:process.env.WEBKIT_EXECUTABLE});if(process.env.PW_DISCLOSURE_REPORT)fs.writeFileSync(process.env.PW_DISCLOSURE_REPORT,JSON.stringify({routes,states:report},null,2));})().catch(e=>{console.error(e);process.exitCode=1});
