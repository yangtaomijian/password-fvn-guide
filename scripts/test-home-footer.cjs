'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const base = process.env.GUIDE_BASE_URL;
const output = process.env.PW_FOOTER_REPORT;
assert(base, 'Set GUIDE_BASE_URL to the bilingual preview');
// Optional release CSS supports before/after preservation checks.
const baseline = process.env.PW_FOOTER_BASELINE_CSS && fs.readFileSync(process.env.PW_FOOTER_BASELINE_CSS, 'utf8');
const report = [];
async function openFooter(page, locale, route) {
  await page.goto(`${base}/${locale}${route}`);
  await page.locator('body.pw-custom-layout-ready').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Existing article discussion GET settles asynchronously after page load.
  // Measure the footer after its final read state, without any backend writes.
  if (route) await page.locator('.pw-discussion-comments[aria-busy="false"]').waitFor();
  // Do not start overlapping native smooth scrolls while docking adds a row.
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  try { await page.waitForFunction(() => document.querySelector('footer #quarto-back-to-top')); } catch (error) { console.error('Footer setup state', await page.evaluate(() => ({ url:location.href, scrollY, innerHeight, scrollHeight:document.documentElement.scrollHeight, footer:document.querySelector('footer')?.getBoundingClientRect().toJSON(), bodyClass:document.body.className }))); throw error; }
  // Docking adds the return-control row. Read the final, reachable footer.
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  // WebKit can expose the docked row's new scrollHeight before committing
  // its scroll range. Re-establish the requested bottom as that state updates.
  await page.waitForFunction(() => {
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    return scrollY + innerHeight >= document.documentElement.scrollHeight - 1;
  });
}
async function metrics(page) {
  return page.evaluate(() => {
    const footer = document.querySelector('footer.footer').getBoundingClientRect();
    const selectors = ['footer.footer', '.nav-footer', '.nav-footer-left', '.pw-publication-footer', '#quarto-back-to-top'];
    return {
      viewport: innerWidth,
      main: (() => { const r = document.querySelector('main.content').getBoundingClientRect(); return [r.x, r.width, r.height]; })(),
      nodes: selectors.map(selector => {
        const element = document.querySelector(selector), r = element.getBoundingClientRect(), s = getComputedStyle(element);
        return { selector, box: [r.x, r.y - footer.y, r.width, r.height], center: r.x + r.width / 2,
          styles: Object.fromEntries(['paddingLeft', 'paddingRight', 'fontSize', 'lineHeight', 'color', 'textAlign', 'display'].map(k => [k, s[k]])),
          text: element.textContent, links: [...element.querySelectorAll('a')].map(a => [a.textContent, a.getAttribute('href')]) };
      })
    };
  });
}
async function run(name, type, options) {
  const browser = await type.launch({ headless: true, ...options });
  let centered = 0, unchanged = 0, search = 0;
  try {
    for (const locale of ['', 'en/']) for (const colorScheme of ['light', 'dark']) {
      const cases = [320, 390, 430, 768, 992, 1099, 1100, 1440, 1920].map(width => ({ width, route: '' }));
      for (const width of [390, 992, 1440]) cases.push({ width, route: 'guide/path-system.html' });
      for (const { width, route } of cases) {
        const label = `${name}/${locale || 'zh'}/${colorScheme}/${route || 'home'}/${width}`;
        console.log(`${label}: checking`);
        const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
        const before = baseline ? await browser.newPage({ viewport: { width, height: 900 }, colorScheme }) : null;
        if (before) await before.route('**/assets/pw-color-schemes.css', r => r.fulfill({ body: baseline, contentType: 'text/css' }));
        await openFooter(page, locale, route);
        if (before) await openFooter(before, locale, route);
        const actual = await metrics(page), old = before ? await metrics(before) : null;
        if (old) assert.deepEqual(actual.main, old.main, `${label}: content geometry is unchanged`);
        if (!route && width >= 1100) {
          for (const selector of ['.nav-footer', '.pw-publication-footer', '#quarto-back-to-top']) {
            const a = actual.nodes.find(n => n.selector === selector), b = old?.nodes.find(n => n.selector === selector);
            assert(Math.abs(a.center - width / 2) <= 1, `${label}: ${selector} centers on the page`);
            if (b) {
              if (width >= 1440) assert.deepEqual(a.box.slice(2), b.box.slice(2), `${label}: wide footer size is preserved`);
              assert.deepEqual(a.styles, b.styles, `${label}: inner appearance is preserved`);
              assert.equal(a.text, b.text); assert.deepEqual(a.links, b.links);
            }
          }
          centered++;
        } else {
          if (old) assert.deepEqual(actual, old, `${label}: mobile, tablet, and article footer remain unchanged`);
          for (const node of actual.nodes) assert(node.box[0] >= -1 && node.box[0] + node.box[2] <= width + 1, `${label}: footer stays within the page`);
          unchanged++;
        }
        if (output && !route && colorScheme === 'dark' && [390, 1440, 1920].includes(width)) {
          await page.screenshot({ path: path.join(output, `footer-after-${name}-${locale ? 'en' : 'zh'}-${width}.png`) });
        }
        if (!route && width === 390) {
          await page.goto(`${base}/${locale}`);
          await page.locator('body.pw-custom-layout-ready').waitFor();
          await page.locator('.pw-search-launcher').click();
          await page.locator('.aa-DetachedContainer .aa-Input').fill('zzzxnonexistent');
          await page.locator('.quarto-search-no-results').waitFor({ state: 'visible' });
          const visible = await page.locator('.quarto-search-no-results').evaluate(e => {
            const r = e.getBoundingClientRect(), parent = e.closest('.aa-SourceNoResults').getBoundingClientRect();
            return r.top >= parent.top - 1 && r.bottom <= parent.bottom + 1 && r.top >= 0 && r.bottom <= visualViewport.height;
          });
          assert(visible, `${label}: mobile homepage search hint is complete`);
          await page.locator('.aa-DetachedCancelButton').click();
          await page.locator('.aa-DetachedContainer').waitFor({ state: 'hidden' }); search++;
        }
        if (!route && width === 1440) {
          await page.locator('#quarto-back-to-top').focus(); await page.keyboard.press('Enter');
          await page.waitForFunction(() => scrollY === 0 && document.activeElement === document.querySelector('main.content h1'));
        }
        report.push({ engine: name, locale: locale || 'zh', colorScheme, width, route: route || 'home', actual });
        if (before) await before.close(); await page.close();
      }
      console.log(`${name}: ${locale || 'zh'} ${colorScheme} footer cases complete`);
    }
  } finally { await browser.close(); }
  console.log(`${name}: PASS ${centered} centered desktop home footers; ${unchanged} unchanged mobile/tablet/article footers; ${search} mobile home search states`);
}
(async () => {
  await run('Edge', chromium, { executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' });
  await run('WebKit', webkit, process.env.WEBKIT_EXECUTABLE ? { executablePath: process.env.WEBKIT_EXECUTABLE } : {});
  if (output) fs.writeFileSync(path.join(output, 'footer-regression.json'), JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
