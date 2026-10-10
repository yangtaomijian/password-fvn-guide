'use strict';
// Local synthetic discussion transport only. No remote writes, verification, or accounts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium, webkit } = require('playwright');
const root = process.env.GUIDE_ROOT || path.resolve(__dirname, '..');
const prefix = ['pw', 'dw', 'kt'].find(name => fs.existsSync(path.join(root, `assets/${name}-discussion-ui.html`)));
const base = process.env.GUIDE_BASE_URL;
assert(base && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Use a local bilingual preview');
const config = {
  pw: { route: 'guide/route-overview.html', current: 'b0.85', historical: 'b0.7', host: 'password.carambi.com' },
  dw: { route: 'guide/choices.html', current: 'Public 14.6', historical: 'Public 14.5', host: 'demonswithin.carambi.com' },
  kt: { route: 'guide/redroot.html', current: 'Public v0.57a', historical: 'Public v0.56', host: 'killiganstreasure.carambi.com' },
}[prefix];
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const sel = name => `.${prefix}-discussion-${name}`;

async function transportChecks() {
  const source = fs.readFileSync(path.join(root, `assets/${prefix}-discussion-remote.html`), 'utf8').replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '');
  let status = 201, body = { commentId: id(9) }, lostBody = false, lostResponse = false;
  const window = {};
  vm.runInNewContext(source, { window, location: { hostname: config.host }, URL,
    document: { querySelector: selector => ({ content: selector.includes('environment') ? 'production' : selector.includes('api') ? 'https://discussion.carambi.com' : '0xTest' }) },
    fetch: async () => {
      if (lostResponse) throw Error('Connection lost');
      return { status, json: async () => { if (lostBody) throw Error('Body lost'); return body; } };
    } });
  const transport = window[`__${prefix}DiscussionRemoteTransport`];
  assert(transport, 'Production host selected');
  lostBody = true;
  assert.equal((await transport.postComment({})).httpStatus, 201, 'Received 201 remains successful with lost response body');
  for (const code of [400,403,409,422,423,429]) {
    status = code; lostBody = false; body = { code: 'REJECTED' };
    await assert.rejects(transport.postComment({}), error => error.outcomeUnknown === false);
  }
  for (const code of [408,500,502,503]) {
    status = code;
    await assert.rejects(transport.postComment({}), error => error.outcomeUnknown === true);
  }
  lostResponse = true;
  await assert.rejects(transport.postComment({}), error => error.outcomeUnknown === true);
}

async function open(browser, locale, width, query = '') {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // Keep the entire test offline even if unrelated page widgets request assets.
  await page.route('**/*', route => ['localhost', '127.0.0.1', '[::1]'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.addInitScript(({ prefix, current, historical }) => {
    const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
    const comment = (n, version, persistent = false) => ({ id: id(n), status: 'published', parentCommentId: null,
      authorKind: 'guest', displayName: 'Reader', body: `Comment ${n}`, guideVersion: version,
      pageHash: null, pinnedAt: null, discussionScope: persistent ? 'persistent' : 'version',
      createdAt: '2026-10-10T00:00:00.000Z', replies: [] });
    window.reads = []; window.posts = []; window.postMode = 'reject'; window.readFail = null;
    window.threadStatus = 'open'; window.readHold = false; window.postHold = false;
    window.turnstile = { render(slot, options) { queueMicrotask(() => options.callback('synthetic-token')); return 1; }, remove() {} };
    const transport = { fixtureCanWrite: true, turnstileSitekey: '0xTest',
      async readDiscussion(request) {
        window.reads.push({ ...request });
        if (window.readHold) { window.readHold = false; await new Promise(resolve => { window.releaseRead = resolve; }); }
        if (window.readFail === 'all' || window.readFail && request.cursor === window.readFail) { window.readFail = null; throw Error('Synthetic read failure'); }
        const version = request.guideVersion;
        const offset = version === current ? 0 : 100;
        const number = window.shiftRoots ? request.cursor === 'c2' ? 2 : request.cursor === 'c1' ? 1 : 0 : request.cursor === 'c1' ? 2 : 1;
        const nextCursor = window.shiftRoots ? request.cursor === 'c2' ? null : request.cursor === 'c1' ? 'c2' : 'c1' : request.cursor === 'c1' ? null : 'c1';
        const roots = [comment(offset + number, version)];
        roots[0].replies = [{ ...comment(offset + 10, current), parentCommentId: roots[0].id }];
        return { ok: true, thread: { id: 'synthetic-thread', status: window.threadStatus },
          currentVersion: { guideVersion: version, comments: roots, nextCursor },
          persistent: { comments: [comment(request.cursor === 'p1' ? 202 : 201, historical, true)], nextCursor: request.cursor === 'p1' ? null : 'p1' },
          earlierVersions: [{ guideVersion: historical, commentCount: 999 }] };
      },
      async postComment(payload) {
        window.posts.push({ ...payload });
        if (window.postHold) { window.postHold = false; await new Promise(resolve => { window.releasePost = resolve; }); }
        if (window.postMode === 'unknown') throw Error('Connection lost after send');
        if (window.postMode === 'server') { const error = Error('Upstream failure'); error.outcomeUnknown = true; throw error; }
        if (window.postMode === 'success') return { httpStatus: 201, commentId: id(999) };
        const error = Error('Rejected');
        error.code = window.postMode === 'locked' ? 'THREAD_LOCKED' : window.postMode === 'fields' ? 'VALIDATION_FAILED' : window.postMode === 'verify' ? 'VERIFICATION_FAILED' : 'RATE_LIMITED';
        if (window.postMode === 'fields') error.fieldErrors = { displayName: 'Reserved' };
        throw error;
      } };
    Object.defineProperty(window, `__${prefix}DiscussionFixtureTransport`, { get: () => transport, set() {} });
  }, { prefix, ...config });
  await page.goto(`${base}/${locale === 'en' ? 'en/' : ''}${config.route}${query}`);
  await page.locator(sel('refresh')).waitFor();
  await settled(page);
  return page;
}
async function settled(page) {
  await page.waitForFunction(prefix => document.querySelector(`.${prefix}-discussion-comments`)?.getAttribute('aria-busy') === 'false', prefix);
}
async function ready(page) { await page.waitForFunction(prefix => !document.querySelector(`.${prefix}-discussion-submit`).disabled, prefix); }
async function composer(page, reply = false) {
  await page.locator(reply ? `#${prefix}-comment-${id(1)} ${sel('reply-action')}` : sel('add')).click();
  await page.locator(`#${prefix}-discussion-name`).fill('Draft reader');
  await page.locator(`#${prefix}-discussion-new-body`).fill(reply ? 'Reply draft' : 'Root draft');
  await ready(page);
}
async function run(name, type, options) {
  const browser = await type.launch({ headless: true, ...options });
  let checks = 0;
  try {
    for (const locale of ['zh-CN', 'en']) for (const width of [390,1440]) {
      let page = await open(browser, locale, width);
      const refresh = page.locator(sel('refresh'));
      assert.equal(await refresh.innerText(), locale === 'en' ? 'Refresh' : '刷新');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator(sel('heading')).evaluate(node => {
        const title = node.querySelector('h2').getBoundingClientRect();
        const button = node.querySelector('button').getBoundingClientRect();
        return title.right > button.left && title.bottom > button.top && title.top < button.bottom;
      }), false, 'Discussion heading must not overlap refresh');
      await page.locator(sel('comments') + ' + button').click(); await settled(page);
      await page.locator(sel('persistent') + ' > button').click(); await settled(page);
      assert.equal(await page.locator(sel('comment')).count(), 4);
      await composer(page, true);
      const before = await page.locator(sel('comment')).evaluateAll(nodes => nodes.map(node => node.dataset.commentId));
      // Fail on the second page, after receiving a valid first-page refresh.
      await page.evaluate(() => { window.readFail = 'c1'; });
      await refresh.click(); await settled(page);
      assert.deepEqual(await page.locator(sel('comment')).evaluateAll(nodes => nodes.map(node => node.dataset.commentId)), before);
      assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), 'Reply draft');
      assert((await page.locator(sel('status')).innerText()).includes(locale === 'en' ? 'Existing comments' : '已有评论'));
      await page.locator(sel('status') + ' button').click(); await settled(page);
      assert.equal(await page.locator(sel('comment')).count(), 4);
      assert.equal(await page.locator(sel('composer-host')).evaluate(node => node.closest('article').dataset.commentId), id(1));
      // Refresh preserves the focused input and caret when triggered without a focus change.
      await page.locator(`#${prefix}-discussion-new-body`).focus();
      await page.evaluate(prefix => { const input = document.querySelector(`#${prefix}-discussion-new-body`); input.setSelectionRange(2,5); window.scrollTo(0, input.getBoundingClientRect().top + scrollY - 200); window.inputTopBefore = input.getBoundingClientRect().top; document.querySelector(`.${prefix}-discussion-refresh`).click(); }, prefix);
      await settled(page);
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'TEXTAREA');
      assert.deepEqual(await page.locator(`#${prefix}-discussion-new-body`).evaluate(node => [node.selectionStart,node.selectionEnd]), [2,5]);
      assert(Math.abs(await page.locator(`#${prefix}-discussion-new-body`).evaluate(node => node.getBoundingClientRect().top) - await page.evaluate(() => window.inputTopBefore)) < 3);
      // Repeated refresh while a read is held makes one reload sequence.
      await page.evaluate(prefix => { window.readHold = true; window.startReads = window.reads.length; document.querySelector(`.${prefix}-discussion-refresh`).click(); document.querySelector(`.${prefix}-discussion-refresh`).click(); }, prefix);
      await page.waitForFunction(() => typeof window.releaseRead === 'function');
      assert.equal(await page.evaluate(() => window.reads.length - window.startReads), 1);
      assert(await refresh.isDisabled());
      assert(await page.locator(sel('submit')).isDisabled());
      await page.evaluate(() => window.releaseRead()); await settled(page);
      await page.locator(sel('composer-actions') + ' button').last().click();
      assert.equal(await page.evaluate(() => document.activeElement.closest('article').dataset.commentId), id(1), 'Cancel restores the refreshed reply opener');
      await page.locator(`#${prefix}-comment-${id(2)} ${sel('reply-action')}`).click();
      await page.locator(`#${prefix}-discussion-new-body`).fill('Last-page reply draft');
      await ready(page);
      await page.evaluate(() => { window.shiftRoots = true; });
      await refresh.click(); await settled(page);
      assert.equal(await page.locator(sel('composer-host')).evaluate(node => node.closest('article').dataset.commentId), id(2), 'Refresh follows reply root shifted beyond loaded pages');
      assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), 'Last-page reply draft');
      assert.equal(await page.locator(sel('comments') + ' > article').count(), 3);
      assert.equal(await page.evaluate(() => window.reads.filter(read => read.section === 'current').at(-1).cursor), 'c2');
      await page.close(); checks++;

      for (const reply of [false,true]) {
        page = await open(browser, locale, width); await composer(page, reply);
        await page.evaluate(() => { window.postMode = 'unknown'; });
        await page.locator(sel('submit')).click();
        await page.locator(sel('confirm-unposted')).waitFor();
        assert(await page.locator(sel('submit')).isDisabled());
        assert((await page.locator(sel('form-status')).innerText()).includes(locale === 'en' ? 'uncertain' : '不确定'));
        assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), reply ? 'Reply draft' : 'Root draft');
        await page.locator(sel('refresh')).click(); await settled(page);
        assert(await page.locator(sel('submit')).isDisabled());
        await page.locator(sel('composer-actions') + ' button').last().click();
        await page.locator(reply ? `#${prefix}-comment-${id(1)} ${sel('reply-action')}` : sel('add')).click();
        assert(await page.locator(sel('confirm-unposted')).isVisible());
        assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), reply ? 'Reply draft' : 'Root draft');
        assert.equal(await page.evaluate(() => window.posts.length), 1, 'No automatic retry');
        await page.locator(sel('confirm-unposted')).click(); await ready(page);
        await page.evaluate(() => { window.postMode = 'reject'; });
        await page.locator(sel('submit')).click(); await ready(page);
        assert(!(await page.locator(sel('confirm-unposted')).isVisible()));
        assert.equal(await page.evaluate(() => window.posts.length), 2);
        // Clear verification/field rejections continue to allow an explicit retry.
        for (const rejection of ['verify','fields']) {
          await page.evaluate(mode => { window.postMode = mode; }, rejection);
          await page.locator(sel('submit')).click(); await ready(page);
          assert(!(await page.locator(sel('confirm-unposted')).isVisible()));
        }
        await page.evaluate(() => { window.postMode = 'server'; });
        await page.locator(sel('submit')).click(); await page.locator(sel('confirm-unposted')).waitFor();
        assert(await page.locator(sel('submit')).isDisabled());
        await page.close(); checks++;
      }

      page = await open(browser, locale, width); await composer(page);
      await page.evaluate(() => { const node = document.createElement('div'); node.id = 'qa-div'; document.querySelector('main#quarto-document-content').append(node); });
      const validHash = await page.locator('main#quarto-document-content section[id]').first().getAttribute('id');
      for (const hash of [`#${encodeURIComponent(validHash)}`, `#${prefix}-comment-${id(1)}`, `#${id(1)}`, '#pw-discussion-title', '#title-block-header', '#toc-title', '#qa-div', '#%invalid', '#not-an-anchor']) {
        await page.evaluate(hash => history.replaceState(null, '', location.pathname + hash), hash);
        await page.locator(sel('submit')).click(); await ready(page);
        assert.equal(await page.evaluate(() => window.posts.at(-1).pageHash), hash === `#${encodeURIComponent(validHash)}` ? hash : '');
      }
      // Submitting locks out refresh, repeated submit, and version switches.
      await page.evaluate(prefix => { window.postHold = true; window.postMode = 'success'; window.startReads = window.reads.length; document.querySelector(`.${prefix}-discussion-composer`).requestSubmit(); }, prefix);
      await page.waitForFunction(() => typeof window.releasePost === 'function');
      assert(await page.locator(sel('refresh')).isDisabled());
      assert(await page.locator(sel('submit')).isDisabled());
      assert(await page.locator(sel('version-buttons') + ' button').first().isDisabled());
      await page.evaluate(prefix => document.querySelector(`.${prefix}-discussion-refresh`).click(), prefix);
      assert.equal(await page.evaluate(() => window.reads.length - window.startReads), 0);
      await page.evaluate(() => window.releasePost());
      await page.waitForFunction(prefix => document.querySelector(`.${prefix}-discussion-post-notice`).dataset.state === 'success', prefix);
      await page.waitForFunction(prefix => !document.querySelector(`.${prefix}-discussion-refresh`).disabled, prefix);
      assert(!(await page.locator(sel('composer-host')).isVisible()));
      await page.close(); checks++;

      page = await open(browser, locale, width, `?discussionVersion=${encodeURIComponent(config.historical)}#${prefix}-comment-${id(102)}`);
      await page.waitForFunction(id => document.activeElement.id === id, `${prefix}-comment-${id(102)}`);
      assert.equal(await page.locator(sel('version-buttons') + ' button[aria-pressed="true"]').innerText(), `${config.historical} · ${locale === 'en' ? '4 comments' : '4 条评论'}`);
      await page.locator(sel('refresh')).click(); await settled(page);
      assert.equal(await page.locator(sel('comments') + ' > article').count(), 2);
      assert(await page.locator(`#${prefix}-comment-${id(102)}`).isVisible());
      assert.equal(await page.evaluate(() => window.reads.filter(r => r.section === 'current').at(-1).guideVersion), config.historical);
      // Current root draft survives switching away and reopening after returning.
      await page.locator(sel('version-buttons') + ' button').first().click(); await settled(page);
      await composer(page);
      await page.locator(sel('version-buttons') + ' button').last().click(); await settled(page);
      await page.locator(sel('version-buttons') + ' button').first().click(); await settled(page);
      await page.locator(sel('add')).click();
      assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), 'Root draft');
      await page.evaluate(() => { window.postMode = 'locked'; window.threadStatus = 'locked'; });
      await ready(page); await page.locator(sel('submit')).click();
      await page.waitForFunction(prefix => !document.querySelector(`.${prefix}-discussion-locked`).hidden, prefix);
      assert(!(await page.locator(sel('composer-host')).isVisible()));
      assert.equal(await page.locator(sel('comments') + ' > article').count(), 1);
      await page.close(); checks++;

      // A real browser Back during refresh is deferred, then restores the latest URL.
      page = await open(browser, locale, width); await composer(page);
      await page.evaluate(() => { window.postMode = 'unknown'; });
      await page.locator(sel('submit')).click(); await page.locator(sel('confirm-unposted')).waitFor();
      await page.evaluate(version => { history.pushState(null, '', `?discussionVersion=${encodeURIComponent(version)}`); dispatchEvent(new PopStateEvent('popstate')); }, config.historical);
      await page.waitForFunction(({ prefix, historical }) => document.querySelector(`.${prefix}-discussion-version-buttons button[aria-pressed="true"]`)?.textContent.includes(historical), { prefix, ...config });
      await page.evaluate(() => { window.readHold = true; window.startReads = window.reads.length; });
      await page.locator(sel('refresh')).click(); await page.waitForFunction(() => typeof window.releaseRead === 'function');
      await page.goBack(); await page.waitForFunction(() => location.search === '');
      assert((await page.locator(sel('version-buttons') + ' button[aria-pressed="true"]').innerText()).includes(config.historical));
      assert.equal(await page.evaluate(() => window.reads.length - window.startReads), 1, 'Back must not start a read while refresh is pending');
      await page.evaluate(() => window.releaseRead());
      await page.waitForFunction(({ prefix, current }) => document.querySelector(`.${prefix}-discussion-version-buttons button[aria-pressed="true"]`)?.textContent.includes(current), { prefix, ...config });
      await settled(page); await page.locator(sel('add')).click();
      assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), 'Root draft');
      assert(await page.locator(sel('confirm-unposted')).isVisible());
      assert(await page.locator(sel('submit')).isDisabled());
      assert.equal(await page.evaluate(() => window.posts.length), 1);
      await page.close(); checks++;

      // Back plus a newer hash during POST are coalesced, preserving an uncertain reply.
      page = await open(browser, locale, width);
      await page.evaluate(version => { history.pushState(null, '', `?discussionVersion=${encodeURIComponent(version)}`); dispatchEvent(new PopStateEvent('popstate')); }, config.historical);
      await page.waitForFunction(({ prefix, historical }) => document.querySelector(`.${prefix}-discussion-version-buttons button[aria-pressed="true"]`)?.textContent.includes(historical), { prefix, ...config });
      await page.locator(`#${prefix}-comment-${id(201)} ${sel('reply-action')}`).click();
      await page.locator(`#${prefix}-discussion-new-body`).fill('Reply navigation draft'); await ready(page);
      await page.evaluate(() => { window.postHold = true; window.postMode = 'unknown'; window.startReads = window.reads.length; });
      await page.locator(sel('submit')).click(); await page.waitForFunction(() => typeof window.releasePost === 'function');
      await page.goBack(); await page.waitForFunction(() => location.search === '');
      await page.evaluate(hash => { location.hash = hash; }, `${prefix}-comment-${id(2)}`);
      await page.waitForFunction(hash => location.hash === '#' + hash, `${prefix}-comment-${id(2)}`);
      assert((await page.locator(sel('version-buttons') + ' button[aria-pressed="true"]').innerText()).includes(config.historical));
      assert.equal(await page.evaluate(() => window.reads.length - window.startReads), 0, 'Navigation must not read during an active POST');
      await page.evaluate(() => window.releasePost());
      await page.waitForFunction(id => document.activeElement.id === id, `${prefix}-comment-${id(2)}`);
      await settled(page);
      assert((await page.locator(sel('version-buttons') + ' button[aria-pressed="true"]').innerText()).includes(config.current));
      assert.equal(await page.locator(`#${prefix}-discussion-new-body`).inputValue(), 'Reply navigation draft');
      assert(await page.locator(sel('confirm-unposted')).isVisible());
      assert(await page.locator(sel('submit')).isDisabled());
      assert.equal(await page.locator(sel('composer-host')).evaluate(node => node.closest('article').dataset.commentId), id(201));
      assert.equal(await page.evaluate(() => window.posts.length), 1, 'Navigation replay must not repost');
      await page.close(); checks++;

      page = await open(browser, locale, width, `?discussionScope=persistent#${prefix}-comment-${id(202)}`);
      await page.waitForFunction(id => document.activeElement.id === id, `${prefix}-comment-${id(202)}`);
      await page.locator(sel('refresh')).click(); await settled(page);
      assert.equal(await page.locator(sel('persistent-comments') + ' > article').count(), 2);
      const output = process.env.DISCUSSION_EVIDENCE_DIR;
      if (output) { fs.mkdirSync(output, { recursive: true }); await page.locator(sel('refresh')).scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(output, `${prefix}-${name}-${locale}-${width}.png`) }); }
      await page.close(); checks++;
    }
    console.log(`${prefix} ${name}: PASS ${checks} bilingual/mobile/desktop submit outcome, draft, pageHash, atomic refresh, focus, scroll, concurrency, version, deferred Back/hash and deep-link scenarios`);
  } finally { await browser.close(); }
}
(async () => {
  await transportChecks();
  console.log(`${prefix} transport: PASS 201/body loss, clear 4xx rejects, uncertain 408/5xx, network loss`);
  await run('Edge', chromium, { executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' });
  await run('WebKit', webkit, process.env.WEBKIT_EXECUTABLE ? { executablePath: process.env.WEBKIT_EXECUTABLE } : {});
})().catch(error => { console.error(error); process.exitCode = 1; });
