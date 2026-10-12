'use strict';
// Entirely synthetic, same-origin local transport. No remote calls or email.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function fixture() {
  const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  window.reads = []; window.posts = []; window.summaryReads = []; window.locked = false;
  window.failRead = false; window.failSummary = false;
  const row = (n, locale, parent = null) => ({ id: id(n), publicationLocale: locale, status: 'published',
    canReply: true, authorKind: 'guest', displayName: 'Synthetic reader', body: locale === 'en' ? 'Original English' : '原始中文',
    guideVersion: 'b0.85', discussionScope: 'versioned', createdAt: '2026-10-12T00:00:00Z',
    parentCommentId: parent === null ? null : id(parent), replyToCommentId: parent === null ? null : id(parent),
    replyTo: parent === null ? null : { id: id(parent), status: 'published', displayName: 'Synthetic reader', authorKind: 'guest' },
    pageHash: parent === null ? '#synthetic-section' : null, pinnedAt: null, replies: [] });
  window.turnstile = { render(slot, options) { queueMicrotask(() => options.callback('synthetic-token')); return 1; }, remove() {} };
  window.__pwDiscussionFixtureTransport = { fixtureCanWrite: true, turnstileSitekey: 'synthetic-only',
    async readDiscussion(request) {
      window.reads.push({ ...request });
      if (window.failRead) { window.failRead = false; throw Error('Synthetic failure'); }
      const roots = [row(1, 'en'), row(3, 'zh-CN'), row(5, null)];
      roots[0].replies = [row(2, 'zh-CN', 1)]; roots[1].replies = [row(4, 'en', 3)];
      return { ok: true, thread: { id: 'shared-synthetic', status: window.locked ? 'locked' : 'open' },
        currentVersion: { guideVersion: request.guideVersion, comments: roots, nextCursor: null },
        persistent: { comments: [], nextCursor: null }, earlierVersions: [] };
    },
    async postComment(input) { window.posts.push({ ...input }); const e = Error('Synthetic rejection'); e.code = 'RATE_LIMITED'; e.outcomeUnknown = false; throw e; },
    async readSummary(request) {
      window.summaryReads.push({ ...request });
      if (window.failSummary) { window.failSummary = false; throw Error('Synthetic failure'); }
      return { ok: true, discussions: [1, 3].map(n => ({ rootCommentId: id(n), locale: n === 1 ? 'en' : 'zh-CN',
        pageTitle: request.locale === 'en' ? 'Route overview' : '路线总览', guideVersion: 'b0.85', discussionScope: 'versioned', replyCount: 1,
        summary: n === 1 ? 'Original English' : '原始中文', lastActivityAt: '2026-10-12T00:00:00Z',
        publicUrl: `https://password.carambi.com/${n === 1 ? 'en/' : ''}guide/route-overview.html#pw-comment-${id(n)}` })), nextCursor: request.cursor ? null : 'synthetic-cursor' };
    },
  };
}
function html(url) {
  const en = url.pathname.startsWith('/en/'), hub = url.pathname.endsWith('/discussions.html');
  const assetRoot = path.join(root, en ? 'site-en/assets' : 'assets');
  const asset = name => fs.readFileSync(path.join(assetRoot, `pw-discussion-${name}.html`), 'utf8');
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none';script-src 'unsafe-inline';style-src 'unsafe-inline';connect-src 'none';img-src data:">
    ${asset('config')}</head><body><div id="quarto-content"><main id="quarto-document-content"><p id="synthetic-section">Synthetic section</p>
    ${hub ? '<div id="pw-discussion-hub"></div>' : ''}</main></div><script>(${fixture.toString()})();</script>${asset('runtime')}${asset(hub ? 'hub' : 'ui')}</body></html>`;
}
const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' }); res.end(html(new URL(req.url, 'http://127.0.0.1'))); });
async function settled(page) { await page.waitForFunction(() => document.querySelector('.pw-discussion-comments')?.getAttribute('aria-busy') === 'false'); }
async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let checks = 0;
  try {
    for (const [engine, launcher] of [['Chromium', chromium], ['WebKit', webkit]]) {
      const executablePath = process.env[`DISCUSSION_${engine.toUpperCase()}_EXECUTABLE`];
      const browser = await launcher.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
      try {
        for (const locale of ['en', 'zh-CN']) {
          const page = await browser.newPage({ viewport: { width: locale === 'en' ? 1440 : 390, height: 900 } });
          const errors = []; let external = 0; page.on('pageerror', e => errors.push(e.message));
          await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : (external++, route.abort()));
          const route = `${base}/${locale === 'en' ? 'en/' : ''}guide/route-overview.html`;
          await page.goto(`${route}#pw-comment-${id(locale === 'en' ? 4 : 2)}`); await settled(page);
          await page.waitForFunction(expected => document.activeElement?.id === expected, `pw-comment-${id(locale === 'en' ? 4 : 2)}`);
          assert.equal(await page.locator('.pw-discussion-refresh').innerText(), locale === 'en' ? 'Refresh' : '刷新');
          assert.equal(await page.locator(`#pw-comment-${id(1)} > .pw-discussion-body`).innerText(), 'Original English');
          assert.equal(await page.locator(`#pw-comment-${id(2)} > .pw-discussion-body`).innerText(), '原始中文');
          assert.equal(await page.locator(`#pw-comment-${id(3)} > .pw-discussion-body`).innerText(), '原始中文');
          assert.equal(await page.locator(`#pw-comment-${id(4)} > .pw-discussion-body`).innerText(), 'Original English');
          for (const [n, expected] of [[1, '/en/guide/route-overview.html'], [3, '/guide/route-overview.html'], [5, locale === 'en' ? '/en/guide/route-overview.html' : '/guide/route-overview.html']])
            assert.equal(await page.locator(`#pw-comment-${id(n)} > .pw-discussion-actions > .pw-discussion-fragment`).getAttribute('href'), `${expected}#synthetic-section`);
          const target = locale === 'en' ? 2 : 4;
          await page.locator(`#pw-comment-${id(target)} > .pw-discussion-actions > .pw-discussion-reply-action`).click();
          await page.locator('#pw-discussion-name').fill('Synthetic'); await page.locator('#pw-discussion-new-body').fill('跨语言 draft / unchanged');
          await page.waitForFunction(() => !document.querySelector('.pw-discussion-submit').disabled);
          await page.locator('.pw-discussion-submit').click();
          await page.waitForFunction(() => window.posts.length === 1 && !document.querySelector('.pw-discussion-submit').disabled);
          const post = await page.evaluate(() => window.posts[0]);
          assert.equal(post.locale, locale); assert.equal(post.replyToCommentId, id(target)); assert.equal(post.parentCommentId, id(locale === 'en' ? 1 : 3));
          assert.equal(post.body, '跨语言 draft / unchanged');
          await page.evaluate(() => { window.failRead = true; }); await page.locator('.pw-discussion-refresh').click(); await settled(page);
          assert.equal(await page.locator('#pw-discussion-new-body').inputValue(), '跨语言 draft / unchanged');
          await page.evaluate(() => { window.locked = true; }); await page.locator('.pw-discussion-refresh').click(); await settled(page);
          assert.equal(await page.locator('.pw-discussion-reply-action').count(), 0, 'Shared lock gates every publication language');
          assert.equal(await page.locator('#pw-discussion-new-body').inputValue(), '跨语言 draft / unchanged');
          await page.goto(`${base}/${locale === 'en' ? 'en/' : ''}discussions.html`);
          await page.waitForFunction(() => document.querySelector('#discussions')?.getAttribute('aria-busy') === 'false');
          assert.equal(await page.locator('#language').count(), 0); assert.equal(await page.locator('#discussions article').count(), 2);
          assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.summary')].map(n => n.textContent)), ['Original English', '原始中文']);
          assert.equal(await page.locator('#title').innerText(), locale === 'en' ? 'All guide discussions' : '全站讨论');
          await page.locator('#more').click(); await page.waitForFunction(() => document.querySelector('#discussions')?.getAttribute('aria-busy') === 'false');
          assert.equal(await page.locator('#discussions article').count(), 2, 'Summary UUID dedupe');
          assert(await page.evaluate(locale => window.summaryReads.every(r => r.locale === locale), locale));
          await page.locator('#scope').selectOption('persistent'); await page.waitForFunction(() => document.querySelector('#discussions')?.getAttribute('aria-busy') === 'false');
          assert.equal(await page.evaluate(() => window.summaryReads.at(-1).scope), 'persistent');
          await page.evaluate(() => { window.failSummary = true; }); await page.locator('#refresh').click();
          await page.waitForFunction(() => document.querySelector('#discussions')?.getAttribute('aria-busy') === 'false');
          assert((await page.locator('#state').innerText()).includes(locale === 'en' ? 'Couldn’t load' : '无法加载'));
          assert.deepEqual(errors, []); assert.equal(external, 0); await page.close(); checks++;
        }
      } finally { await browser.close(); }
      console.log(`PW ${engine}: shared crosslocale roots/replies, source links, old responses, draft/lock and summary PASS`);
    }
    console.log(`PASS ${checks} locale/browser groups; 0 remote calls, 0 real mail`);
  } finally { server.close(); }
}
run().catch(e => { server.close(); console.error(e); process.exitCode = 1; });
