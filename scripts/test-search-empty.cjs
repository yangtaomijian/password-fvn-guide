'use strict';
// Search reading regression: real glyph bounds, local scrolling, and transitions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const base = process.env.GUIDE_BASE_URL;
assert(base, 'Set GUIDE_BASE_URL to the bilingual preview');
const output = process.env.PW_SEARCH_REPORT;
const baselineCss = process.env.PW_SEARCH_BASELINE_CSS && fs.readFileSync(process.env.PW_SEARCH_BASELINE_CSS, 'utf8');
const widths = [320, 375, 390, 430];
const heights = [240, 320, 568, 874];
const missing = 'zzzxnonexistent';
const report = [];
async function open(page, locale) {
  await page.goto(`${base}/${locale}guide/path-system.html`);
  await page.locator('body.pw-custom-layout-ready').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.pw-search-launcher').click();
  await page.locator('.aa-DetachedContainer .aa-Input').waitFor({ state: 'visible' });
}
async function noResults(page) {
  await page.locator('.aa-DetachedContainer .aa-Input').fill(missing);
  await page.locator('.quarto-search-no-results').waitFor({ state: 'visible' });
}
async function reading(page) {
  return page.locator('.quarto-search-no-results').evaluate(element => {
    const rect = node => { const r = node.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }; };
    const viewport = visualViewport;
    const clip = { top: viewport?.offsetTop || 0, bottom: (viewport?.offsetTop || 0) + (viewport?.height || innerHeight), left: 0, right: innerWidth };
    const scrollers = [];
    for (let node = element.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node), box = rect(node);
      if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)) {
        clip.top = Math.max(clip.top, box.top + node.clientTop);
        clip.bottom = Math.min(clip.bottom, box.top + node.clientTop + node.clientHeight);
      }
      if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX)) {
        clip.left = Math.max(clip.left, box.left + node.clientLeft);
        clip.right = Math.min(clip.right, box.left + node.clientLeft + node.clientWidth);
      }
      if (['auto', 'scroll'].includes(style.overflowY) && node.scrollHeight > node.clientHeight + 1) scrollers.push(node.className);
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT), lines = [];
    for (let node; (node = walker.nextNode());) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width && r.height) lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
    const style = getComputedStyle(element);
    return { text: element.textContent, box: rect(element), source: rect(element.closest('.aa-SourceNoResults')), clip, lines, scrollers, fontSize: style.fontSize, lineHeight: style.lineHeight, documentY: scrollY };
  });
}
function inClip(line, clip) { return line.top >= clip.top - 1 && line.bottom <= clip.bottom + 1; }
async function readable(page, label) {
  let state = await reading(page);
  assert(state.lines.length, `${label}: real text glyphs exist`);
  assert(state.source.top <= state.box.top + 1 && state.source.bottom >= state.box.bottom - 1, `${label}: source contains the whole hint instead of centering a taller child outside it`);
  assert(state.lines.every(line => line.left >= state.clip.left - 1 && line.right <= state.clip.right + 1), `${label}: no horizontal text clipping`);
  assert(inClip(state.lines[0], state.clip), `${label}: first line is fully visible`);
  if (!state.lines.every(line => inClip(line, state.clip))) {
    assert(state.scrollers.length, `${label}: short viewport exposes a local scroller`);
    const selector = '.aa-DetachedContainer .aa-Panel';
    const panel = await page.locator(selector).boundingBox();
    await page.mouse.move(panel.x + panel.width / 2, panel.y + Math.min(panel.height / 2, 25));
    await page.mouse.wheel(0, 1000);
    await page.waitForFunction(() => {
      const e = document.querySelector('.quarto-search-no-results'), r = document.createRange(); r.selectNodeContents(e);
      const lines = [...r.getClientRects()].filter(r => r.width && r.height), last = lines[lines.length - 1];
      let bottom = visualViewport.height + visualViewport.offsetTop;
      for (let n = e.parentElement; n; n = n.parentElement) if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(n).overflowY)) bottom = Math.min(bottom, n.getBoundingClientRect().top + n.clientTop + n.clientHeight);
      return last.bottom <= bottom + 1;
    });
    const bottom = await reading(page);
    assert(inClip(bottom.lines[bottom.lines.length - 1], bottom.clip), `${label}: last line can be read by real local scrolling`);
    assert.equal(bottom.documentY, state.documentY, `${label}: the background document stays still`);
    await page.mouse.wheel(0, -1000);
    await page.waitForFunction(() => document.querySelector('.aa-DetachedContainer .aa-Panel').scrollTop === 0);
    state = await reading(page);
    assert(inClip(state.lines[0], state.clip), `${label}: scrolling back restores the complete first line`);
  }
  return state;
}
async function desktopMetrics(page, query) {
  await page.locator('.aa-DetachedContainer .aa-Input').fill(query);
  await page.locator(query === missing ? '.quarto-search-no-results' : '.aa-Item a[href*="guide/path-system.html"]').first().waitFor({ state: 'visible' });
  return page.evaluate(() => [...document.querySelectorAll('.aa-DetachedContainer, .aa-DetachedFormContainer, .aa-Input, .aa-Panel, .aa-SourceNoResults, .quarto-search-no-results, .aa-Item')].map(element => {
    const r = element.getBoundingClientRect(), s = getComputedStyle(element);
    return { class: element.className, text: element.textContent, box: [r.x, r.y, r.width, r.height], styles: Object.fromEntries(['fontSize', 'lineHeight', 'height', 'maxHeight', 'overflowY', 'padding', 'color'].map(key => [key, s[key]])) };
  }));
}
async function run(name, type, options) {
  const browser = await type.launch({ headless: true, ...options });
  let mobile = 0, desktop = 0;
  try {
    for (const locale of ['', 'en/']) for (const colorScheme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 874 }, colorScheme });
      await open(page, locale);
      for (const width of widths) for (const height of heights) {
        await page.setViewportSize({ width, height });
        await noResults(page);
        const label = `${name}/${locale || 'zh'}/${colorScheme}/${width}x${height}`;
        const state = await readable(page, label);
        await page.locator('.aa-DetachedCancelButton').click();
        await page.locator('.aa-DetachedContainer').waitFor({ state: 'hidden' });
        await page.locator('.pw-search-launcher').click();
        await noResults(page); await readable(page, `${label}/reopened`);
        await page.locator('.aa-DetachedContainer .aa-Input').fill('Tyson');
        await page.locator('.aa-Item a[href*="guide/path-system.html"]').first().waitFor({ state: 'visible' });
        assert.equal(await page.locator('.quarto-search-no-results').count(), 0, `${label}: matching search replaces empty state`);
        await noResults(page); await readable(page, `${label}/returned`);
        if (output && width === 390 && height === 874) await page.screenshot({ path: path.join(output, `after-${name}-${locale ? 'en' : 'zh'}-${colorScheme}-390.png`) });
        await page.locator('.aa-DetachedContainer .aa-ClearButton').click();
        // Native autocomplete updates its controlled input after the click task.
        await page.waitForFunction(() => document.querySelector('.aa-DetachedContainer .aa-Input').value === '');
        assert.equal(await page.locator('.aa-DetachedContainer .aa-Input').inputValue(), '');
        await page.locator('.aa-DetachedContainer .aa-Panel').waitFor({ state: 'hidden' });
        // Quarto retains a no-query template; clearing must hide it and the panel.
        assert.equal(await page.locator('.quarto-search-no-results').isVisible(), false, `${label}: clearing hides the empty hint`);
        report.push({ engine: name, locale: locale ? 'en' : 'zh', colorScheme, width, height, state }); mobile++;
      }
      await page.close();
      for (const width of [768, 992, 1440]) {
        const candidate = await browser.newPage({ viewport: { width, height: 740 }, colorScheme });
        await open(candidate, locale);
        const actual = { empty: await desktopMetrics(candidate, missing), results: await desktopMetrics(candidate, 'Tyson') };
        if (baselineCss) {
          const before = await browser.newPage({ viewport: { width, height: 740 }, colorScheme });
          await before.route('**/assets/pw-search.css', route => route.fulfill({ body: baselineCss, contentType: 'text/css' }));
          await open(before, locale);
          const expected = { empty: await desktopMetrics(before, missing), results: await desktopMetrics(before, 'Tyson') };
          assert.deepEqual(actual, expected, `${name}/${locale}/${colorScheme}/${width}: desktop boxes, glyph styles, source and result layout unchanged`);
          await before.close();
        }
        report.push({ engine: name, locale: locale ? 'en' : 'zh', colorScheme, width, desktop: actual, baselineCompared: !!baselineCss }); desktop++;
        await candidate.close();
      }
    }
    console.log(`${name}: PASS ${mobile} mobile states; complete hint glyphs/local scroll, no-result↔result, clear, close/reopen; ${desktop} unchanged desktop states`);
  } finally { await browser.close(); }
}
(async () => {
  if (output) fs.mkdirSync(output, { recursive: true });
  await run('Edge', chromium, { executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' });
  await run('WebKit', webkit, { executablePath: process.env.WEBKIT_EXECUTABLE });
  if (output) fs.writeFileSync(path.join(output, 'search-empty-regression.json'), JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
