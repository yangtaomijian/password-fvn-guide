// Rendered-title contract: mobile Chinese hierarchy; unchanged English/desktop.
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=process.env.GUIDE_BASE_URL;assert(base,'Set GUIDE_BASE_URL');
const output=process.env.PW_HOME_TITLE_REPORT;assert(output,'Set PW_HOME_TITLE_REPORT');
const widths=[320,375,390,430,768,820,992,1440];
const baselineFile=path.join(output,'home-title-baseline.json');
const capture=process.env.PW_HOME_TITLE_CAPTURE==='baseline';
const baseline=capture?null:JSON.parse(fs.readFileSync(baselineFile,'utf8'));
const states=[];
async function run(name,type,options){const b=await type.launch({headless:true,...options});try{
 for(const locale of ['','en/']){
  const p=await b.newPage({viewport:{width:320,height:740}});await p.goto(`${base}/${locale}index.html`);await p.locator('body.pw-custom-layout-ready').waitFor();
  for(const width of widths){await p.setViewportSize({width,height:740});await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const s=await p.locator('h1.title').evaluate(h=>{
    const c=getComputedStyle(h),box=h.getBoundingClientRect(),walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),glyphs=[];
    for(let node;(node=walker.nextNode());) for(let i=0;i<node.textContent.length;i++){const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();glyphs.push({char:node.textContent[i],x:r.x-box.x,y:r.y-box.y,width:r.width});}
    const rows=[];for(const glyph of glyphs){let row=rows.find(row=>Math.abs(row.y-glyph.y)<Number.parseFloat(c.lineHeight)/2);if(!row){row={y:glyph.y,text:'',left:glyph.x,right:glyph.x+glyph.width};rows.push(row);}row.text+=glyph.char;row.left=Math.min(row.left,glyph.x);row.right=Math.max(row.right,glyph.x+glyph.width);}
    return{text:h.textContent,rows:rows.map(row=>({...row,text:row.text.trim(),width:row.right-row.left})),glyphs,styles:Object.fromEntries(['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight'].map(k=>[k,c[k]])),pageOverflow:document.documentElement.scrollWidth-innerWidth,headingWidth:box.width,documentTitle:document.title,meta:[...document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[name="twitter:title"]')].map(m=>[m.getAttribute('name')||m.getAttribute('property'),m.content])};
   });
   const key=`${name}/${locale||'zh'}/${width}`;
   if(!capture){const previous=baseline.find(x=>x.key===key);assert(previous,`${key}: baseline exists`);assert.equal(s.text,previous.text,`${key}: title text unchanged`);assert.equal(s.documentTitle,previous.documentTitle);assert.deepEqual(s.meta,previous.meta,'title metadata unchanged');assert(s.pageOverflow<=1,`${key}: no overflow`);
    if(!locale&&width<768){assert.deepEqual(s.rows.map(row=>row.text),['Password 中文','攻略与机制资料库'],`${key}: exactly the requested two lines`);assert(s.rows[0].width<s.rows[1].width,'first line is shorter');assert(s.rows.every(row=>row.right<=s.headingWidth+1),'both lines fit the title container');}
    else {assert.deepEqual(s.styles,previous.styles,`${key}: desktop/English typography unchanged`);assert.equal(s.rows.length,previous.rows.length,`${key}: desktop/English line count unchanged`);assert.equal(s.glyphs.length,previous.glyphs.length);s.glyphs.forEach((g,i)=>{for(const k of ['x','y','width'])assert(Math.abs(g[k]-previous.glyphs[i][k])<=1,`${key}: desktop/English glyph ${i} ${k} changed`);});}
   }
   if(name==='Edge'&&width<768){fs.mkdirSync(path.join(output,capture?'home-before':'home-after'),{recursive:true});await p.screenshot({path:path.join(output,capture?'home-before':'home-after',`${locale?'en':'zh'}-${width}.png`)});}
   states.push({key,...s});
  }await p.close();
 }
 console.log(`${name}: ${capture?'CAPTURE':'PASS'} 16 home-title states; four mobile widths and unchanged desktop/English metadata and glyph layout`);
}finally{await b.close();}}
(async()=>{await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});await run('WebKit',webkit,{executablePath:process.env.WEBKIT_EXECUTABLE});fs.writeFileSync(capture?baselineFile:path.join(output,'home-title-final.json'),JSON.stringify(states,null,2));})().catch(e=>{console.error(e);process.exitCode=1});
