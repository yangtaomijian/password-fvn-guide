'use strict';
// Run against a built local bilingual preview. Every external request is blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium, webkit } = require('playwright');
const root = process.env.GUIDE_ROOT || path.resolve(__dirname, '..');
const base = process.env.GUIDE_BASE_URL;
assert(base && ['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname), 'Use a local preview');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const action = n => `#pw-comment-${id(n)} > .pw-discussion-actions > .pw-discussion-reply-action`;
const target = '.pw-discussion-composer-target';
const body = '#pw-discussion-new-body';
const submit = '.pw-discussion-submit';
const reference = n => `#pw-comment-${id(n)} > .pw-discussion-reply-reference`;
async function settled(page) { await page.waitForFunction(() => document.querySelector('.pw-discussion-comments')?.getAttribute('aria-busy') === 'false'); }
async function ready(page) { await page.waitForFunction(() => !document.querySelector('.pw-discussion-submit').disabled); }
async function refresh(page) { await page.locator('.pw-discussion-refresh').click(); await settled(page); }
async function open(browser,locale,width,query='') {
  const page = await browser.newPage({ viewport: { width,height:900 } });
  page.navigationRequests = 0;
  page.on('request', request => { if (request.isNavigationRequest()) page.navigationRequests++; });
  await page.route('**/*', route => ['localhost','127.0.0.1','[::1]'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.addInitScript(() => {
    const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
    const current = 'b0.85', historical = 'b0.7';
    const sameName = 'SameNickname0123456789012345678901234567';
    window.posts = []; window.reads = []; window.postMode = 'reject'; window.statuses = {};
    window.threadStatus = 'open'; window.shift = false;
    window.turnstile = { render(slot, options) { queueMicrotask(() => options.callback('synthetic-token')); return 1; }, remove() {} };
    const row = (n,version,root=null,replyTo=null,status='published') => {
      status = window.statuses[n] || status;
      return { id:id(n),parentCommentId:root===null?null:id(root),replyToCommentId:replyTo===null?null:id(replyTo),
        replyTo:null,status,canReply:status==='published' && n!==20 && n!==21,
        guideVersion:version,discussionScope:'version',authorKind:status==='published'?'guest':null,
        displayName:status==='published'?sameName:null,body:status==='published'?`Synthetic comment ${n}`:null,
        createdAt:'2026-10-10T08:00:00Z',pageHash:null,pinnedAt:n===1?'2026-10-10T08:00:00Z':null,replies:[] };
    };
    const mainRoot = version => {
      const a = row(1,version);
      a.authorKind = a.status === 'published' ? 'maintainer' : null;
      a.replies = [row(2,version,1,1),row(3,version,1,2),row(4,version,1,3),row(5,version,1),
        row(6,version,1,7),row(7,version,1,null,'hidden'),row(8,version,1,9),row(9,version,1,null,'deleted'),row(10,version,1,null,'deleted'),row(11,version,1,999)];
      for (const child of a.replies) if (child.replyToCommentId) {
        const to = child.replyToCommentId === a.id ? a : a.replies.find(row => row.id===child.replyToCommentId);
        if (!to) continue;
        child.replyTo = { id:to.id,status:to.status,
          // Hidden/deleted display values intentionally exercise defensive UI redaction.
          displayName:to.status==='published'?to.displayName:'PRIVATE_TARGET_NAME',authorKind:to.status==='published'?to.authorKind:'maintainer' };
      }
      if (window.omitTarget) { a.replies = a.replies.filter(row => row.id !== id(3)); a.replies.find(row => row.id === id(4)).replyTo = null; }
      return a;
    };
    const transport = { fixtureCanWrite:true,turnstileSitekey:'0xTest',
      async readDiscussion(request) {
        window.reads.push({...request});
        const version = request.guideVersion;
        const disabled = row(20,version); disabled.replies=[row(21,version,20)];
        const hidden = row(30,version,null,null,'hidden'); hidden.replies=[row(31,version,30)];
        const late = row(50,version); late.replies=[row(51,version,50)];
        let comments, nextCursor;
        if (window.shift) {
          comments = request.cursor==='c2' ? [mainRoot(version)] : request.cursor==='c1' ? [row(0,version)] : [disabled,hidden];
          nextCursor = request.cursor==='c2'?null:request.cursor==='c1'?'c2':'c1';
        } else { comments=request.cursor==='c1'?[late]:[mainRoot(version),disabled,hidden]; nextCursor=request.cursor==='c1'?null:'c1'; }
        const persistent = row(100,historical); persistent.discussionScope='persistent';
        persistent.replies=[row(101,historical,100,100)];
        persistent.replies[0].replyTo={id:persistent.id,status:persistent.status,displayName:persistent.displayName,authorKind:persistent.authorKind};
        return {ok:true,thread:{status:window.threadStatus},currentVersion:{guideVersion:version,comments,nextCursor},
          persistent:{comments:[persistent],nextCursor:null},earlierVersions:[{guideVersion:historical,commentCount:12}]};
      },
      async postComment(payload) {
        window.posts.push({...payload});
        if (window.postMode==='unknown') throw Error('Connection lost after send');
        const error = Error('Rejected'); error.outcomeUnknown=false;
        if (window.postMode==='target-invalid') {error.code='VALIDATION_FAILED';error.fieldErrors={replyToCommentId:'NOT_REPLYABLE'};}
        else error.code=window.postMode==='locked'?'THREAD_LOCKED':'RATE_LIMITED';
        throw error;
      },
      async sendFeedback() { throw Error('Reports are never submitted in this test'); }
    };
    Object.defineProperty(window,'__pwDiscussionFixtureTransport',{get:()=>transport,set(){}});
  });
  await page.goto(`${base}/${locale==='en'?'en/':''}guide/route-overview.html${query}`);
  await page.locator('.pw-discussion-refresh').waitFor(); await settled(page);
  return page;
}
async function select(page,n,text) {
  await page.locator(action(n)).click();
  if (text) await page.locator(body).fill(text);
  await ready(page);
  assert.equal(await page.locator(target).getAttribute('data-reply-to-comment-id'),id(n));
}
async function transportCheck() {
  const source = fs.readFileSync(path.join(root,'assets/pw-discussion-remote.html'),'utf8').replace(/^[\s\S]*?<script>/,'').replace(/<\/script>[\s\S]*$/,'');
  let payload;
  const window={};
  vm.runInNewContext(source,{window,location:{hostname:'password.carambi.com'},URL,
    document:{querySelector:selector=>({content:selector.includes('environment')?'production':selector.includes('api')?'https://discussion.carambi.com':'0xTest'})},
    fetch:async(url,options)=>{payload=JSON.parse(options.body);return {status:201,json:async()=>({commentId:id(99)})};}});
  await window.__pwDiscussionRemoteTransport.postComment({parentCommentId:id(1),replyToCommentId:id(3)});
  assert.equal(payload.parentCommentId,id(1)); assert.equal(payload.replyToCommentId,id(3));
}
async function run(name,type,options) {
  const browser=await type.launch({headless:true,...options}); let checks=0;
  try {
    for (const locale of ['zh-CN','en']) for (const width of [390,1440]) {
      let page=await open(browser,locale,width);
      assert.equal(await page.locator('.pw-discussion-reply-reference').count(),7); // 5 known references + 1 missing relation + persistent child.
      assert.equal(await page.locator(reference(11)).evaluate(node => node.tagName), 'SPAN', 'Missing target must have no dead link');
      assert.equal(await page.locator(reference(5)).count(),0,'Legacy NULL relation must have no invented marker');
      assert.equal(await page.locator('#pw-comment-'+id(10)).count(),0,'Unreferenced deleted reply remains projected away');
      assert.equal(await page.locator('#pw-comment-'+id(9)).count(),1,'Deleted target referenced by a published child has a tombstone');
      assert.equal(await page.locator(action(9)).count(),0);
      assert.equal(await page.locator(action(7)).count(),0);
      assert.equal(await page.locator(action(21)).count(),0,'canReply=false is authoritative');
      assert.equal(await page.locator(action(31)).count(),0,'Hidden root cannot receive child replies');
      assert((await page.locator(reference(6)).innerText()).includes(locale==='en'?'hidden':'隐藏'));
      assert((await page.locator(reference(8)).innerText()).includes(locale==='en'?'deleted':'删除'));
      assert(!(await page.locator('.pw-discussion').innerText()).includes('PRIVATE_TARGET_NAME'));
      await page.locator(reference(4)).click();
      await page.waitForFunction(id=>document.activeElement.id===id,'pw-comment-'+id(3));
      await page.locator(reference(8)).click();
      await page.waitForFunction(id=>document.activeElement.id===id,'pw-comment-'+id(9));
      assert.equal(await page.locator('.pw-discussion-replies .pw-discussion-replies').count(),0,'Reply chain stays flat');
      assert.equal(await page.locator('#pw-comment-'+id(1)+' > .pw-discussion-replies > .pw-discussion-reply').count(),9);
      await select(page,2,'Draft for B'); await select(page,3,'Draft for C');
      assert.equal(await page.locator(target).getAttribute('data-parent-comment-id'),id(1));
      assert((await page.locator(target).innerText()).includes(locale==='en'?'Replying to':'正在回复'));
      await select(page,2); assert.equal(await page.locator(body).inputValue(),'Draft for B');
      await select(page,3); assert.equal(await page.locator(body).inputValue(),'Draft for C');
      await page.locator(reference(4)).click();
      await page.waitForFunction(id=>document.activeElement.id===id,'pw-comment-'+id(3));
      assert.equal(page.navigationRequests,1,'Reply marker does not reload the page');
      assert.equal(await page.locator(body).inputValue(),'Draft for C','Marker navigation retains active draft');
      await page.locator(submit).click(); await ready(page);
      assert.deepEqual(await page.evaluate(()=>({parent:window.posts.at(-1).parentCommentId,target:window.posts.at(-1).replyToCommentId})),{parent:id(1),target:id(3)});
      assert.equal(await page.evaluate(()=>window.posts.at(-1).pageHash),'');
      await select(page,5,'Reply to legacy child'); await page.locator(submit).click(); await ready(page);
      assert.equal(await page.evaluate(()=>window.posts.at(-1).replyToCommentId),id(5));
      await select(page,3); await page.evaluate(()=>{window.shift=true;}); await refresh(page);
      assert.equal(await page.locator(target).getAttribute('data-reply-to-comment-id'),id(3),'Refresh retains child target while its root moves later');
      assert.equal(await page.locator(target).getAttribute('data-parent-comment-id'),id(1));
      assert.equal(await page.locator(body).inputValue(),'Draft for C');
      assert(await page.evaluate(()=>window.reads.some(row=>row.cursor==='c2')));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const cancel=page.locator('.pw-discussion-composer-actions button').last();
      await cancel.scrollIntoViewIfNeeded();
      assert(await cancel.evaluate(node=>{const r=node.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===node;}),'Mobile BTT cannot cover Cancel');
      const output=process.env.DISCUSSION_EVIDENCE_DIR;
      if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,`pw-2a-${name}-${locale}-${width}.png`)});}
      await page.close(); checks++;

      page=await open(browser,locale,width);await select(page,3,'Preserved invalid target draft');
      await page.evaluate(()=>{window.statuses[3]='hidden';window.postMode='target-invalid';});
      await page.locator(submit).click();
      await page.waitForFunction(()=>document.querySelector('.pw-discussion-submit').disabled && document.querySelector('.pw-discussion-form-status').textContent.includes(document.documentElement.lang==='en'?'no longer available':'已不可用'));
      assert((await page.locator('.pw-discussion-form-status').innerText()).includes(locale==='en'?'no longer available':'已不可用'));
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      assert.equal(await page.evaluate(()=>window.posts.at(-1).replyToCommentId),id(3));
      await refresh(page);assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      assert.equal(await page.locator(action(3)).count(),0);
      await page.evaluate(()=>{window.statuses[3]='published';});await refresh(page);await select(page,3);
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      await page.evaluate(()=>{window.postMode='unknown';});await page.locator(submit).click();
      await page.locator('.pw-discussion-confirm-unposted').waitFor();
      await select(page,2,'Other target draft');
      await page.locator(action(3)).click();
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      assert(await page.locator(submit).isDisabled());
      assert(await page.locator('.pw-discussion-confirm-unposted').isVisible());
      await refresh(page);assert(await page.locator(submit).isDisabled());
      assert.equal(await page.evaluate(()=>window.posts.length),2,'Target switch and refresh never auto-retry');
      await page.evaluate(()=>{window.statuses[3]='deleted';});await refresh(page);
      assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert(await page.locator('.pw-discussion-confirm-unposted').isDisabled());
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      assert.equal(await page.locator(action(3)).count(),0);
      assert.equal(await page.locator('#pw-comment-'+id(4)).count(),1,'Descendant relation remains after target deletion');
      assert((await page.locator(reference(4)).innerText()).includes(locale==='en'?'deleted':'删除'));
      await page.evaluate(()=>{window.statuses[3]='published';});await refresh(page);
      await page.locator(action(3)).click();
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      assert(await page.locator('.pw-discussion-confirm-unposted').isVisible());
      await page.evaluate(()=>{window.omitTarget=true;});await refresh(page);
      assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert.equal(await page.locator(target).getAttribute('data-reply-to-comment-id'),id(3));
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      await page.evaluate(()=>{window.omitTarget=false;});await refresh(page);
      await page.evaluate(()=>{window.threadStatus='locked';});await refresh(page);
      assert.equal(await page.locator('.pw-discussion-reply-action').count(),0);
      assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      await page.evaluate(()=>{window.threadStatus='open';});await refresh(page);
      await page.locator(action(3)).click();assert.equal(await page.locator(body).inputValue(),'Preserved invalid target draft');
      await select(page,1,'Root reply draft');
      await page.evaluate(()=>{window.statuses[1]='hidden';});await refresh(page);
      assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert.equal(await page.locator(target).getAttribute('data-reply-to-comment-id'),id(1));
      assert.equal(await page.locator(body).inputValue(),'Root reply draft');
      assert((await page.locator(target).innerText()).includes(locale==='en'?'hidden':'隐藏'));
      await page.evaluate(()=>{window.statuses[1]='published';});await refresh(page);await ready(page);
      await page.evaluate(()=>{window.postMode='locked';window.threadStatus='locked';});await page.locator(submit).click();
      await page.waitForFunction(()=>!document.querySelector('.pw-discussion-locked').hidden);
      assert(await page.locator('.pw-discussion-composer-host').isVisible());
      assert(await page.locator(submit).isDisabled());
      assert.equal(await page.locator(body).inputValue(),'Root reply draft');
      await page.close();checks++;

      page=await open(browser,locale,width,'?discussionVersion=b0.7#pw-comment-'+id(51));
      await page.waitForFunction(id=>document.activeElement.id===id,'pw-comment-'+id(51));
      await select(page,51,'Historical child reply');await page.locator(submit).click();await ready(page);
      assert.deepEqual(await page.evaluate(()=>({parent:window.posts.at(-1).parentCommentId,target:window.posts.at(-1).replyToCommentId})),{parent:id(50),target:id(51)});
      await refresh(page);assert.equal(await page.locator(body).inputValue(),'Historical child reply');
      assert((await page.locator('.pw-discussion-version-buttons [aria-pressed="true"]').innerText()).includes('b0.7'));
      await select(page,101,'Persistent child reply');await page.locator(submit).click();await ready(page);
      assert.deepEqual(await page.evaluate(()=>({parent:window.posts.at(-1).parentCommentId,target:window.posts.at(-1).replyToCommentId})),{parent:id(100),target:id(101)});
      await refresh(page);assert.equal(await page.locator(body).inputValue(),'Persistent child reply');
      assert.equal(await page.locator(target).getAttribute('data-parent-comment-id'),id(100));
      await page.close();checks++;
    }
    console.log(`pw ${name}: PASS ${checks} bilingual 390/1440 exact-chain, same-name, legacy, hidden/deleted, canReply, drafts, unknown, shifted-root refresh, historical/persistent and mobile-hit scenarios`);
  }finally{await browser.close();}
}
(async()=>{await transportCheck();console.log('pw transport: PASS exact parent/root and replyTo UUID serialization');
await run('Chromium',chromium,process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{});
await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{});
})().catch(error=>{console.error(error);process.exitCode=1;});
