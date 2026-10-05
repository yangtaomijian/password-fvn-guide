'use strict';
// Audit all rendered source tables, including tables inside disclosures/tabsets.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, webkit} = require('playwright');
const base = process.env.GUIDE_BASE_URL;
assert(base, 'Set GUIDE_BASE_URL to the completed bilingual preview');
const output = path.resolve(__dirname, '../_site');
const widths = [320, 375, 390, 430];
const routes = ['index.html', ...['guide', 'mechanics', 'collectibles', 'versions', 'extras'].flatMap(dir =>
  fs.readdirSync(path.join(output, dir)).filter(file => file.endsWith('.html')).map(file => `${dir}/${file}`))];
const reports = [];
async function frames(p) { await p.evaluate(() => window.pwAdaptiveTables.whenSettled()); }
async function inspect(p, where) {
  const state = await p.evaluate(() => {
    const tables = [...document.querySelectorAll('main.content table')].filter(t => t.getBoundingClientRect().width > 0);
    const broken = [], leaked = [], readability = [];
    let records = 0, compact = 0, matrices = 0;
    for (const table of tables) {
      const wrapper = table.closest('.pw-mobile-table-scroll,.gallery-coordinate-table,.gallery-trigger-table-scroll,.gallery-non-gallery-table-scroll');
      const r = wrapper?.getBoundingClientRect();
      if (!wrapper || r.left < -1 || r.right > innerWidth + 1 ||
          (table.getBoundingClientRect().width > wrapper.clientWidth + 1 && !['auto','scroll'].includes(getComputedStyle(wrapper).overflowX))) {
        leaked.push(wrapper?.className || 'uncontained');
      }
      if (wrapper?.classList.contains('pw-record-mode')) {
        records++;
        const headers = [...table.tHead.rows[0].cells];
        if (getComputedStyle(table.tHead).display === 'none' || table.getAttribute('role') !== 'table') readability.push('lost table semantics');
        for (const row of table.tBodies[0].rows) for (const [index, cell] of [...row.cells].entries()) {
          const header = headers[index];
          if (header.scope !== 'col' || !cell.getAttribute('headers')?.split(/\s+/).includes(header.id)) readability.push('lost header relationship');
          const label = cell.querySelector(':scope > .pw-record-label');
          if (label && (label.textContent.trim() !== header.textContent.trim() || label.getAttribute('aria-hidden') !== 'true')) readability.push('incorrect field label');
          if (wrapper.dataset.pwAuto && header.textContent.trim() && (!label || getComputedStyle(label).display === 'none')) readability.push('missing visible field label');
          if (wrapper.dataset.pwAuto && cell.getBoundingClientRect().width < wrapper.clientWidth - 2) readability.push('squeezed prose field');
        }
      }
      compact += wrapper?.dataset.pwRepresentation === 'compact' ? 1 : 0;
      matrices += wrapper?.dataset.pwRepresentation === 'matrix' ? 1 : 0;
      const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
      for (let node; (node = walker.nextNode());) {
        const parent = node.parentElement;
        if (!parent.getClientRects().length || parent.closest('.pw-ledger-day-label,.pw-record-label,.pw-ledger-empty-requirement')) continue;
        for (const match of node.textContent.matchAll(/[A-Za-z]{4,}/g)) {
          const range = document.createRange();
          range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
          const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
          if (rects.length > 1) broken.push({word:match[0], cell:parent.closest('td,th')?.textContent.trim().slice(0,80)});
        }
      }
    }
    return {pageOverflow:document.documentElement.scrollWidth-innerWidth, tables:tables.length, records, compact, matrices, broken, leaked, readability};
  });
  assert(state.pageOverflow <= 1, `${where}: page overflow ${state.pageOverflow}`);
  assert.deepEqual(state.leaked, [], `${where}: table overflow escapes its own scroller`);
  assert.deepEqual(state.broken, [], `${where}: English words split across lines`);
  assert.deepEqual(state.readability, [], `${where}: field readability or semantic regression`);
  reports.push({where,...state});
}
async function preserved(p, where) {
  const result = await p.evaluate(async () => {
    const source = new DOMParser().parseFromString(await (await fetch(location.href)).text(), 'text/html');
    const original = [...source.querySelectorAll('main.content table')];
    const current = [...document.querySelectorAll('main.content table')];
    const signature = table => {
      const copy = table.cloneNode(true);
      copy.querySelectorAll('.pw-record-label,.pw-ledger-day-label').forEach(label => label.remove());
      return [...copy.rows].map(row => [...row.cells].map(cell => ({
        text: cell.textContent.replace(/\s+/g, ' ').trim(),
        links: [...cell.querySelectorAll('a')].map(a => [a.textContent, new URL(a.getAttribute('href'), location.href).href])
      })));
    };
    return current.flatMap((table, index) => table.dataset.pwAdaptive === 'true' &&
      JSON.stringify(signature(table)) !== JSON.stringify(signature(original[index])) ? [index] : []);
  });
  assert.deepEqual(result, [], `${where}: source rows, headers, text or links changed`);
}
async function run(name, type, options) {
  const b = await type.launch({headless:true,...options});
  let pages=0;
  try {
    for (const locale of ['', 'en/']) for (const route of routes) {
      const p = await b.newPage({viewport:{width:320,height:740}});
      await p.goto(`${base}/${locale}${route}`);
      await p.locator('body.pw-custom-layout-ready').waitFor();
      await p.evaluate(() => {
        document.querySelectorAll('main.content details').forEach(d => d.open=true);
        document.querySelectorAll('main.content .callout-collapse').forEach(c => bootstrap.Collapse.getOrCreateInstance(c).show());
      });
      await p.waitForFunction(() => !document.querySelector('main.content .collapsing'));
      for (const width of widths) {
        await p.setViewportSize({width,height:740}); await frames(p);
        await inspect(p, `${name}/${locale}${route}/${width}/default`);
        const tabs = p.locator('main.content [data-bs-toggle="tab"]');
        for (let i=0;i<await tabs.count();i++) {
          await tabs.nth(i).evaluate(t => bootstrap.Tab.getOrCreateInstance(t).show());
          await frames(p);
          await inspect(p, `${name}/${locale}${route}/${width}/tab-${i}`);
        }
      }
      await preserved(p, `${name}/${locale}${route}`);
      await p.setViewportSize({width:1440,height:900}); await frames(p);
      await preserved(p, `${name}/${locale}${route}/desktop`);
      await p.close(); pages++;
    }
    console.log(`${name}: PASS ${pages} bilingual pages × ${widths.join('/')}px; disclosures/tabsets; intact words, local overflow, full-width labeled prose fields, semantic headers and unchanged source/links`);
  } finally {await b.close();}
}
(async()=>{
  await run('Edge',chromium,{executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'});
  await run('WebKit',webkit,process.env.WEBKIT_EXECUTABLE?{executablePath:process.env.WEBKIT_EXECUTABLE}:{});
  if(process.env.PW_TABLE_REPORT) fs.writeFileSync(process.env.PW_TABLE_REPORT,JSON.stringify(reports,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
