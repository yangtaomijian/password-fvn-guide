'use strict';
// Synthetic local preview only. Non-loopback traffic is blocked before navigation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium, webkit } = require('playwright');
const root = process.env.GUIDE_ROOT || path.resolve(__dirname, '..');
const base = process.env.GUIDE_BASE_URL;
assert(base && ['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname), 'Use local preview only');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const panel = n => `.pw-discussion-reactions[data-comment-id="${id(n)}"]`;
const chip = (n,type) => `${panel(n)} .pw-discussion-reaction-chips [data-reaction-type="${type}"]`;
const add = n => `${panel(n)} .pw-discussion-reaction-add`;
const retry = n => `${panel(n)} .pw-discussion-reaction-retry`;
async function settled(page) {
  await page.waitForFunction(() => document.querySelector('.pw-discussion-comments')?.getAttribute('aria-busy') === 'false' &&
    [...document.querySelectorAll('.pw-discussion-reactions')].every(p => p.getAttribute('aria-busy') === 'false'));
}
async function open(browser,locale,width,options={}) {
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:options.coarseTouch || width<768});
  await page.route('**/*', route => ['localhost','127.0.0.1','[::1]'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.addInitScript(options => {
    const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
    const types=['like','heart','smile','celebrate','thinking'];
    window.reportOpens=[];Object.defineProperty(window,'__pwFeedbackDialog',{get:()=>({openReport:n=>window.reportOpens.push(n)}),set(){}});
    window.reactionReads=[];window.reactionWrites=[];window.commentsPosts=[];window.verifyCalls=0;
    window.reactMode='normal';window.readFail=false;window.locked=false;window.disabledTargets=[];window.versionReads=[];
    window.releaseWrite=null;window.releaseRead=null;window.holdRead=false;
    window.writeReleases={};window.readReleases={};window.writeReturned={};window.holdReactionReads=false;window.unknownWriteIds=[];
    if(options.storageFail) Object.defineProperty(window,'localStorage',{get(){throw Error('Synthetic storage blocked');}});
    window.turnstile={render(slot,callbacks){window.verifyCalls++;queueMicrotask(()=>callbacks.callback('synthetic-token'));return 1;},remove(){}};
    const counts=new Map(),selected=new Map();
    const data=(n,visitor)=>{
      if(!counts.has(n)) counts.set(n,options.emptyReactions?{like:0,heart:0,smile:0,celebrate:0,thinking:0}:options.allReactions?{like:2,heart:2,smile:2,celebrate:2,thinking:2}:{like:2,heart:1,smile:0,celebrate:0,thinking:0});
      return {commentId:n,counts:{...counts.get(n)},selected:[...(selected.get(n+'|'+visitor)||[])],canReact:!window.locked&&!window.disabledTargets.includes(n)};
    };
    const row=(n,version,parent=null)=>({id:id(n),parentCommentId:parent&&id(parent),replyToCommentId:parent&&id(parent),replyTo:null,
      status:'published',canReply:true,guideVersion:version,discussionScope:'version',authorKind:'guest',displayName:'Synthetic <b>name</b>',
      body:'Synthetic comment '+n,createdAt:'2026-10-10T08:00:00Z',pageHash:null,replies:[]});
    const transport={fixtureCanWrite:true,turnstileSitekey:'0xTest',
      async readDiscussion(request){window.versionReads.push(request);if(window.commentReadFail)throw Error('Synthetic comments read failed');const a=row(1,request.guideVersion);a.replies=[row(2,request.guideVersion,1)];
        a.status=window.rootStatus||'published';if(a.status!=='published'){a.body=null;a.displayName=null;}
        a.canReply=false; // Reaction eligibility must not be inferred from canReply.
        const hidden=row(3,request.guideVersion);hidden.status='hidden';hidden.body=null;hidden.displayName=null;
        const deleted=row(4,request.guideVersion);deleted.status='deleted';deleted.body=null;
        const roots=[a,hidden,deleted];if(options.bulk) for(let n=10;n<70;n++) roots.push(row(n,request.guideVersion));
        const p=row(5,'b0.7');p.discussionScope='persistent';
        return {ok:true,thread:{status:window.locked?'locked':'open'},currentVersion:{guideVersion:request.guideVersion,comments:roots,nextCursor:null},
          persistent:{comments:[p],nextCursor:null},earlierVersions:[{guideVersion:'b0.7',commentCount:2}]};},
      async postComment(payload){window.commentsPosts.push(payload);const e=Error('Synthetic rate');e.code='RATE_LIMITED';e.outcomeUnknown=false;throw e;},
      async sendFeedback(){throw Error('No report writes in this suite');},
      async readReactions(request){window.reactionReads.push(request);const response={ok:true,reactions:request.commentIds.map(n=>data(n,request.visitorId))};
        if(window.holdRead){window.holdRead=false;await new Promise(resolve=>{window.releaseRead=resolve;});}
        if(window.holdReactionReads) await new Promise(resolve=>{window.readReleases[request.commentIds[0]]=resolve;});
        if(window.readFail) throw Error('SECRET_SERVER_TEXT');return response;},
      async setReaction(request){window.reactionWrites.push(request);if(window.reactMode==='hold') await new Promise(resolve=>{window.releaseWrite=resolve;window.writeReleases[request.commentId]=resolve;});
        if(window.reactMode==='rate'){const e=Error('SECRET_SERVER_TEXT');e.code='RATE_LIMITED';e.outcomeUnknown=false;throw e;}
        const existing=new Set(selected.get(request.commentId+'|'+request.visitorId)||[]);const c=counts.get(request.commentId);
        if(request.intent==='add'&&!existing.has(request.type)){existing.add(request.type);c[request.type]++;}
        if(request.intent==='remove'&&existing.has(request.type)){existing.delete(request.type);c[request.type]--;}
        selected.set(request.commentId+'|'+request.visitorId,[...existing]);
        const response={ok:true,reaction:data(request.commentId,request.visitorId)};
        window.writeReturned[request.commentId]=true;
        if(window.reactMode==='unknown'||window.unknownWriteIds.includes(request.commentId)){const e=Error('SECRET_SERVER_TEXT');e.outcomeUnknown=true;throw e;}
        return response;}
    };
    if(options.missingMethods){delete transport.readReactions;delete transport.setReaction;}
    Object.defineProperty(window,'__pwDiscussionFixtureTransport',{get:()=>transport,set(){}});
  },options);
  await page.goto(`${base}/${locale==='en'?'en/':''}guide/route-overview.html`);await page.locator('.pw-discussion-refresh').waitFor();await settled(page);return page;
}
async function centerClick(page, locator, width) {
  await locator.scrollIntoViewIfNeeded();
  const rect=await locator.boundingBox();assert(rect,'Control needs a real layout box');
  const point={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
  assert(await locator.evaluate((node,p)=>node.contains(document.elementFromPoint(p.x,p.y)),point),'Control center is covered');
  if(width<768) await page.touchscreen.tap(point.x,point.y); else await page.mouse.click(point.x,point.y);
}
async function pick(page,n,type){await page.locator(add(n)).click();await page.locator(`${panel(n)} .pw-discussion-reaction-menu [data-reaction-type="${type}"]`).click();await settled(page);}
async function draft(page,text){await page.locator('.pw-discussion-add').click();await page.locator('#pw-discussion-new-body').fill(text);await page.waitForFunction(()=>!document.querySelector('.pw-discussion-submit').disabled);}
async function run(name,engine,executablePath){const browser=await engine.launch({headless:true,...(executablePath?{executablePath}:{})});let scenarios=0;
try{for(const locale of ['zh-CN','en'])for(const width of [390,1440]){
 let page=await open(browser,locale,width);
 assert.equal(await page.locator('.pw-discussion-reactions').count(),3,'Published root/reply/persistent only');
 assert.equal(await page.locator(add(1)).isEnabled(),true,'canReply=false must not disable canReact=true');
 const first=await page.evaluate(()=>window.reactionReads[0]);assert(/^[0-9a-f]{64}$/.test(first.visitorId));assert.equal(first.locale,locale);
 assert.equal(await page.evaluate(()=>localStorage.getItem('carambi.password.reactionVisitorId')),first.visitorId);
 assert.equal(await page.locator('.pw-discussion').innerText().then(t=>t.includes(first.visitorId)),false);
 await draft(page,'Keep reaction draft');const form=await page.locator('#pw-discussion-new-body').elementHandle();const article=await page.locator('#pw-comment-'+id(1)).elementHandle();
 await page.locator(add(1)).click();assert.equal(await page.locator(add(1)).getAttribute('aria-expanded'),'true');
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.dataset.reactionType),'heart');
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('pw-discussion-reaction-add')),true);
 await page.locator(add(1)).focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');await settled(page);
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.reactionType),'like','Keyboard choice restores focus to resulting chip');
 for(const type of ['heart','smile','celebrate','thinking']) await pick(page,1,type);
 assert.equal(await page.locator(`${panel(1)} .pw-discussion-reaction-chips [aria-pressed="true"]`).count(),5);
 assert((await page.locator(chip(1,'heart')).innerText()).includes('✓'));
 await page.locator(chip(1,'thinking')).focus();await page.keyboard.press('Enter');await settled(page);
 assert.equal(await page.locator(chip(1,'thinking')).count(),0);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('pw-discussion-reaction-add')),true,'Removing final count restores plus focus');
 await page.locator(chip(1,'heart')).click();await settled(page);assert.equal(await page.locator(chip(1,'heart')).getAttribute('aria-pressed'),'false');
 assert.equal(await page.evaluate(node=>node===document.querySelector('#pw-comment-'+node.dataset.commentId),article),true,'Emoji cannot rerender the comment tree');
 assert.equal(await page.evaluate(node=>node===document.querySelector('#pw-discussion-new-body'),form),true);assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Keep reaction draft');
 assert.equal(await page.evaluate(()=>window.verifyCalls),1,'Emoji never invokes Turnstile');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const changed='b'.repeat(64);await page.evaluate(value=>localStorage.setItem('carambi.password.reactionVisitorId',value),changed);
 await page.locator('.pw-discussion-refresh').click();await settled(page);assert.equal((await page.evaluate(()=>window.reactionReads.at(-1))).visitorId,changed);
 assert.equal(await page.locator(chip(1,'like')).getAttribute('aria-pressed'),'false');
 await page.locator('.pw-discussion-version-buttons button').last().click();await settled(page);await pick(page,2,'thinking');await pick(page,5,'celebrate');
 assert.equal((await page.evaluate(()=>window.reactionWrites.at(-1))).commentId,id(5));
 if(process.env.DISCUSSION_EVIDENCE_DIR){fs.mkdirSync(process.env.DISCUSSION_EVIDENCE_DIR,{recursive:true});await page.locator('.pw-discussion').screenshot({path:path.join(process.env.DISCUSSION_EVIDENCE_DIR,`${name}-${locale}-${width}.png`)});}
 await page.close();scenarios++;

 page=await open(browser,locale,width);await draft(page,'Preserved unknown');
 await page.evaluate(()=>{window.reactMode='unknown';window.readFail=true;});await page.locator(chip(1,'like')).click();await settled(page);
 assert.equal(await page.evaluate(()=>window.reactionWrites.length),1);assert.equal(await page.locator(add(1)).isDisabled(),true);
 assert((await page.locator(panel(1)).innerText()).includes(locale==='en'?'uncertain':'不确定'));
 assert(!(await page.locator('.pw-discussion').innerText()).includes('SECRET_SERVER_TEXT'));
 await page.locator(retry(1)).click();await settled(page);assert.equal(await page.evaluate(()=>window.reactionWrites.length),1);
 await page.evaluate(()=>{window.readFail=false;});await page.locator(retry(1)).click();await settled(page);assert.equal(await page.locator(chip(1,'like')).getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>{window.reactMode='rate';});await page.locator(chip(1,'like')).click();await settled(page);
 assert((await page.locator(panel(1)).innerText()).includes(locale==='en'?'Too many':'过于频繁'));
 assert.equal(await page.locator(chip(1,'like')).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Preserved unknown');
 await page.locator('.pw-discussion-submit').click();await page.waitForFunction(()=>window.commentsPosts.length===1);assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Preserved unknown');
 await page.close();scenarios++;

 page=await open(browser,locale,width);await page.evaluate(()=>{window.reactMode='hold';});await page.locator(chip(1,'like')).click();
 await page.waitForFunction(()=>window.releaseWrite!==null);assert.equal(await page.locator(add(1)).isDisabled(),true);
 await draft(page,'No focus steal');await page.locator('#pw-discussion-new-body').focus();
 await page.evaluate(()=>{window.reactMode='normal';window.releaseWrite();});await settled(page);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'pw-discussion-new-body','Pending completion must not steal focus from composer');
 await page.evaluate(()=>{window.reactMode='hold';window.releaseWrite=null;});await page.locator(chip(1,'like')).click();await page.waitForFunction(()=>window.releaseWrite!==null);
 await page.evaluate(()=>{window.locked=true;});await page.locator('.pw-discussion-refresh').click();await page.waitForFunction(()=>document.querySelector('.pw-discussion-comments').getAttribute('aria-busy')==='false');
 assert.equal(await page.locator(add(1)).isDisabled(),true,'Pending must survive comment render');
 await page.evaluate(()=>{window.reactMode='normal';window.releaseWrite();});await settled(page);
 assert.equal(await page.locator(add(1)).isDisabled(),true,'Late write cannot restore locked eligibility');assert.equal(await page.evaluate(()=>window.reactionWrites.length),2);
 await page.close();scenarios++;

 page=await open(browser,locale,width,{storageFail:true});assert.equal(await page.locator(chip(1,'like')).innerText(),'👍 2');assert.equal(await page.locator(add(1)).isDisabled(),true);
 assert((await page.locator(panel(1)).innerText()).includes(locale==='en'?'storage':'存储'));assert.equal((await page.evaluate(()=>window.reactionReads[0])).visitorId,undefined);
 await draft(page,'Storage blocked still posts');await page.locator('.pw-discussion-submit').click();await page.waitForFunction(()=>window.commentsPosts.length===1);
 await page.close();scenarios++;

 page=await open(browser,locale,width,{missingMethods:true});assert.equal(await page.locator('.pw-discussion-reactions').count(),0);assert.equal(await page.locator('.pw-discussion-comment').count(),3);await draft(page,'Old transport works');await page.close();scenarios++;

 page=await open(browser,locale,width);await draft(page,'Late read draft');
 await page.evaluate(()=>{window.holdRead=true;});await page.locator('.pw-discussion-refresh').click();await page.waitForFunction(()=>window.releaseRead!==null);
 await page.evaluate(()=>{window.disabledTargets=[window.reactionReads[0].commentIds.find(n=>n.endsWith('000000000001'))];});
 await page.locator('.pw-discussion-refresh').click();await settled(page);assert.equal(await page.locator(add(1)).isDisabled(),true);
 await page.evaluate(()=>window.releaseRead());await settled(page);assert.equal(await page.locator(add(1)).isDisabled(),true,'Stale read cannot restore old eligibility');
 assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Late read draft');await page.close();scenarios++;

 page=await open(browser,locale,width);
 for(const status of ['hidden','deleted']) {await page.evaluate(value=>{window.rootStatus=value;window.readFail=true;},status);await page.locator('.pw-discussion-refresh').click();await settled(page);assert.equal(await page.locator(panel(1)).count(),0);assert.equal(await page.locator(panel(2)).count(),0,'Known unavailable root hides cached child reactions even if reaction read fails');}
 await page.close();scenarios++;

 page=await open(browser,locale,width);await page.locator(chip(1,'like')).click();await settled(page);await draft(page,'Independent refresh draft');
 const preservedArticle=await page.locator('#pw-comment-'+id(1)).elementHandle();
 await page.evaluate(()=>{window.commentReadFail=true;localStorage.setItem('carambi.password.reactionVisitorId','c'.repeat(64));});
 await page.locator('.pw-discussion-refresh').click();await settled(page);
 assert.equal(await page.locator(chip(1,'like')).getAttribute('aria-pressed'),'false','Reactions refresh independently even when comments read fails');
 assert.equal((await page.evaluate(()=>window.reactionReads.at(-1))).visitorId,'c'.repeat(64));
 assert.equal(await page.evaluate(node=>node===document.querySelector('#pw-comment-'+node.dataset.commentId),preservedArticle),true);
 assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Independent refresh draft');await page.close();scenarios++;

 for(const unknown of [false,true]) {
 page=await open(browser,locale,width);await draft(page,'Cross-comment concurrent draft');
 await page.evaluate(({a,b,unknown})=>{window.reactMode='hold';window.holdReactionReads=true;if(unknown)window.unknownWriteIds=[a,b];},{a:id(1),b:id(2),unknown});
 await page.locator(chip(1,'like')).click();await page.locator(chip(2,'like')).click();
 await page.waitForFunction(({a,b})=>window.writeReleases[a]&&window.writeReleases[b],{a:id(1),b:id(2)});
 await page.evaluate(a=>window.writeReleases[a](),id(1));await page.waitForFunction(a=>window.writeReturned[a],id(1));
 await page.evaluate(b=>window.writeReleases[b](),id(2));await page.waitForFunction(b=>window.writeReturned[b],id(2));
 if(unknown)await page.waitForFunction(({a,b})=>window.readReleases[a]&&window.readReleases[b],{a:id(1),b:id(2)});
 await page.evaluate(b=>window.readReleases[b]?.(),id(2));await page.evaluate(a=>window.readReleases[a]?.(),id(1));await settled(page);
 const result={unknown,aEnabled:await page.locator(add(1)).isEnabled(),bEnabled:await page.locator(add(2)).isEnabled(),writes:await page.evaluate(()=>window.reactionWrites.length),reads:await page.evaluate(()=>window.reactionReads.length)};
 assert(result.aEnabled&&result.bEnabled,JSON.stringify(result));assert.equal(result.writes,2);
 assert.equal(await page.locator(chip(1,'like')).getAttribute('aria-pressed'),'true');assert.equal(await page.locator(chip(2,'like')).getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Cross-comment concurrent draft');
 await page.close();scenarios++;
 }

 for(const empty of [true,false]) {
 page=await open(browser,locale,width,{emptyReactions:empty,allReactions:!empty});
 const ownToolbar=`#pw-comment-${id(5)} > .pw-discussion-actions`;
 assert.equal(await page.locator(`${ownToolbar} > .pw-discussion-reactions`).count(),1);
 const report=page.locator(`${ownToolbar} > .pw-discussion-report-action`), reply=page.locator(`${ownToolbar} > .pw-discussion-reply-action`);
 const plus=page.locator(add(5));await plus.scrollIntoViewIfNeeded();
 const controlRects=await page.locator(ownToolbar).evaluate(node=>[...node.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})));
 assert(controlRects.every(r=>r.height>=(width<768?44:36)-.5&&r.width>=(width<768?44:0)),JSON.stringify(controlRects));
 if(empty){const a=await plus.boundingBox(),b=await reply.boundingBox(),c=await report.boundingBox();assert(Math.abs(a.y-b.y)<1&&Math.abs(b.y-c.y)<1,'Empty +, reply and report must share a line');}
 const docBefore=await page.evaluate(()=>document.documentElement.scrollHeight);
 await centerClick(page,plus,width);const menu=page.locator(`${panel(5)} .pw-discussion-reaction-menu`);assert(await menu.isVisible());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),docBefore,'Floating menu cannot grow document');
 const bounds=await menu.boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+.5&&bounds.y+bounds.height<=900+.5,JSON.stringify(bounds));
 assert.equal(await menu.locator('button').count(),5);
 const overlaps=await page.locator(ownToolbar).evaluate((node,box)=>[...node.querySelectorAll('.pw-discussion-reaction-chips button, :scope > .pw-discussion-reply-action, :scope > .pw-discussion-report-action')].filter(b=>{const r=b.getBoundingClientRect();return r.left<box.x+box.width&&r.right>box.x&&r.top<box.y+box.height&&r.bottom>box.y;} ).length,bounds);
 assert.equal(overlaps,0,'Menu must not cover this toolbar controls');
 await centerClick(page,menu.locator('[data-reaction-type="heart"]'),width);await settled(page);
 assert.equal(await page.locator(chip(5,'heart')).getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.reactionType),'heart');
 await centerClick(page,report,width);assert.equal(await page.evaluate(()=>window.reportOpens.at(-1)),id(5));
 await centerClick(page,reply,width);await page.waitForFunction(()=>!document.querySelector('.pw-discussion-submit').disabled);
 await page.locator('#pw-discussion-new-body').fill('Toolbar target draft');
 assert.equal(await page.locator('.pw-discussion-composer-target').getAttribute('data-reply-to-comment-id'),id(5));
 await centerClick(page,plus,width);await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('pw-discussion-reaction-add')),true);
 assert.equal(await page.locator('#pw-discussion-new-body').inputValue(),'Toolbar target draft');
 assert(await plus.isEnabled(),'No settled phantom disabled state');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.DISCUSSION_EVIDENCE_DIR){fs.mkdirSync(process.env.DISCUSSION_EVIDENCE_DIR,{recursive:true});await page.locator(ownToolbar).screenshot({path:path.join(process.env.DISCUSSION_EVIDENCE_DIR,`${name}-${locale}-${width}-toolbar-${empty?'empty':'five'}.png`)});}
 await page.close();scenarios++;
 }

 page=await open(browser,locale,width,{bulk:true});const batches=await page.evaluate(()=>window.reactionReads);assert(batches.length>=2);assert(batches.every(row=>row.commentIds.length<=50));
 assert.equal(new Set(batches.flatMap(row=>row.commentIds)).size,63);await page.close();scenarios++;
}console.log(`pw ${name}: PASS ${scenarios} bilingual 390/1440 emoji, keyboard, drafts, unknown-readback, 429, pending-refresh, lock, storage, old transport, center/touch toolbar, floating menu and batching scenarios`);
}finally{await browser.close();}}
async function transportTest(){const source=fs.readFileSync(path.join(root,'assets/pw-discussion-remote.html'),'utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'');
 let request,reply,network=false;const window={};
 vm.runInNewContext(source,{window,AbortController,setTimeout,clearTimeout,location:{hostname:'password.carambi.com'},URL,document:{querySelector:q=>({content:q.includes('environment')?'production':q.includes('api')?'https://discussion.carambi.com':'0xTest'})},
 fetch:async(url,opts)=>{request={url,...opts};if(network)throw Error('SECRET');return {status:reply.status,json:async()=>reply.body};}});
 const counts={like:2,heart:0,smile:0,celebrate:0,thinking:0},row={commentId:id(1),counts,selected:[],canReact:true};
 reply={status:200,body:{ok:true,reactions:[row]}};await window.__pwDiscussionRemoteTransport.readReactions({pageKey:'guide.route-overview',locale:'en',commentIds:[id(1)],visitorId:'a'.repeat(64)});
 assert(request.url.endsWith('/reactions/read'));assert(!request.url.includes('a'.repeat(64)));assert.equal(request.credentials,'omit');assert.equal(JSON.parse(request.body).visitorId,'a'.repeat(64));
 for(const invalid of [{...row,counts:{...counts,extra:1}},{...row,counts:{...counts,heart:-1}},{...row,selected:['bad']},{...row,canReact:'true'},{...row,commentId:id(2)}]){
  reply={status:200,body:{ok:true,reactions:[invalid]}};await assert.rejects(window.__pwDiscussionRemoteTransport.readReactions({pageKey:'p',locale:'en',commentIds:[id(1)]}),e=>e.message==='REACTION_REQUEST_FAILED');}
 const input={pageKey:'guide.route-overview',locale:'en',commentId:id(1),type:'heart',visitorId:'a'.repeat(64),intent:'add',turnstileToken:'MUST_NOT_SEND'};
 reply={status:200,body:{ok:true,reaction:row}};await window.__pwDiscussionRemoteTransport.setReaction(input);assert.equal(JSON.parse(request.body).turnstileToken,undefined);assert.equal(JSON.parse(request.body).intent,'add');
 reply={status:429,body:{message:'SECRET'}};await assert.rejects(window.__pwDiscussionRemoteTransport.setReaction(input),e=>e.code==='RATE_LIMITED'&&e.outcomeUnknown===false&&e.message==='REACTION_REQUEST_FAILED');
 reply={status:200,body:{ok:true,reaction:{...row,commentId:id(2)}}};await assert.rejects(window.__pwDiscussionRemoteTransport.setReaction(input),e=>e.outcomeUnknown===true);
 network=true;await assert.rejects(window.__pwDiscussionRemoteTransport.setReaction(input),e=>e.outcomeUnknown===true&&e.message==='REACTION_REQUEST_FAILED');
 let timeout,cleared=false;const boundedWindow={};
 vm.runInNewContext(source,{window:boundedWindow,AbortController,URL,location:{hostname:'password.carambi.com'},
  document:{querySelector:q=>({content:q.includes('environment')?'production':q.includes('api')?'https://discussion.carambi.com':'0xTest'})},
  setTimeout:callback=>{timeout=callback;return 1;},clearTimeout:()=>{cleared=true;},fetch:async()=>({status:200,json:()=>new Promise(()=>{})})});
 const waiting=boundedWindow.__pwDiscussionRemoteTransport.setReaction(input);timeout();await assert.rejects(waiting,e=>e.outcomeUnknown===true);assert(cleared,'Timeout cleanup covers stalled JSON');
 console.log('pw transport: PASS status/schema validation, explicit intent, body-only visitor, no Turnstile and sanitized errors');}
(async()=>{await transportTest();await run('Chromium',chromium,process.env.CHROMIUM_EXECUTABLE);await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE);})().catch(error=>{console.error(error);process.exitCode=1;});
