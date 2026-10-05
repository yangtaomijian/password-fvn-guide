(() => {
  const families = [
    { selector: '.table-medal-index', thresholdRem: 40, columns: 4 },
    { selector: '.affection-difference-table', thresholdRem: 48, columns: 4 },
    { selector: '.affection-point-table', thresholdRem: 46, columns: 4, variant: 'ledger' },
    { selector: '.affection-d19-summary-table', thresholdRem: 52, columns: 5, variant: 'compact-record' },
    { selector: '.additional-scenes-table', thresholdRem: 42, columns: 3, variant: 'index-ledger' },
    { selector: '.password-check-stages-table', thresholdRem: 40, columns: 3, variant: 'compact-record' },
    { selector: '.compendium-cast-table', thresholdRem: 46, columns: 3, variant: 'index-ledger' },
    { selector: '.easter-special-input-table', thresholdRem: 52, columns: 5, variant: 'compact-record' },
    { selector: '.oswin-dialogue-table', thresholdRem: 56, columns: 3, variant: 'compact-record', stickyDisclosure: true },
  ];

  if (typeof ResizeObserver !== 'function') return;

  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const rootFontSize = () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  function initializeDisclosure(wrapper) {
    const details = wrapper.closest('details');
    const summary = details?.querySelector(':scope > summary');
    const title = summary?.querySelector(':scope > strong');
    if (!details || !summary || !title || details.classList.contains('pw-oswin-disclosure')) return;

    const closedTitle = title.textContent;
    const chinese = document.documentElement.lang.toLowerCase().startsWith('zh');
    const openTitle = chinese ? '可尝试的对话表' : 'Prompt table';
    const collapseText = chinese ? '收起' : 'Collapse';
    const action = document.createElement('span');
    action.className = 'pw-oswin-disclosure-action';
    action.setAttribute('aria-hidden', 'true');
    action.textContent = collapseText;
    action.hidden = true;
    summary.append(action);
    details.classList.add('pw-oswin-disclosure');

    const headerHeight = () => Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--pw-header-height')
    ) || 0;
    const navigation = document.querySelector('#quarto-header');
    const activeHeaderBottom = () => Math.max(0, navigation?.getBoundingClientRect().bottom ?? headerHeight());
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const afterHeaderSettles = async () => {
      await nextFrame();
      for (let transition = 0; transition < 2; transition += 1) {
        const animations = navigation?.getAnimations()
          .filter((animation) => animation.playState === 'running')
          .map((animation) => animation.finished) || [];
        if (!animations.length) return;
        await Promise.allSettled(animations);
        await nextFrame();
      }
    };
    const updateStickyTop = () => {
      details.style.setProperty('--pw-oswin-sticky-top', `${activeHeaderBottom()}px`);
    };
    let pendingFrame = 0;
    const scheduleStickyTop = () => {
      if (!details.open || pendingFrame) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        updateStickyTop();
        if (navigation?.getAnimations().some((animation) => animation.playState === 'running')) {
          scheduleStickyTop();
        }
      });
    };
    window.addEventListener('scroll', scheduleStickyTop, { passive: true });
    window.addEventListener('resize', scheduleStickyTop);
    if (navigation) {
      new ResizeObserver(scheduleStickyTop).observe(navigation);
      navigation.addEventListener('transitionrun', scheduleStickyTop);
      navigation.addEventListener('transitionend', scheduleStickyTop);
    }
    let returnToSummary = false;
    const updateTitle = () => {
      title.textContent = details.open ? openTitle : closedTitle;
      action.hidden = !details.open;
      if (details.open) {
        summary.setAttribute('aria-label', `${collapseText} ${openTitle}`);
        updateStickyTop();
      } else {
        summary.removeAttribute('aria-label');
      }
    };

    summary.addEventListener('click', () => {
      returnToSummary = details.open && details.getBoundingClientRect().top < activeHeaderBottom();
    });
    details.addEventListener('toggle', () => {
      updateTitle();
      if (!details.open && returnToSummary) {
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            if (details.open) return;
            const summaryTop = summary.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: summaryTop - activeHeaderBottom() - 8, behavior: 'instant' });
            await afterHeaderSettles();
            if (details.open) return;
            window.scrollTo({ top: summaryTop - activeHeaderBottom() - 8, behavior: 'instant' });
            await afterHeaderSettles();
            if (details.open) return;
            window.scrollTo({ top: summaryTop - activeHeaderBottom() - 8, behavior: 'instant' });
            summary.focus({ preventScroll: true });
            returnToSummary = false;
          });
        });
      } else {
        returnToSummary = false;
      }
    });
    updateTitle();
  }

  // Preserve native table/header relationships even when CSS displays records.
  // Visual labels are redundant for assistive technology and are hidden there.
  const components = [];
  let headerSequence = 0;
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const widthOf = wrapper => wrapper.getBoundingClientRect().width;
  const prepareSemantics = (table, headers, rows) => {
    const identity = ++headerSequence;
    table.setAttribute('role', 'table');
    table.tHead.setAttribute('role', 'rowgroup');
    table.tHead.rows[0].setAttribute('role', 'row');
    table.tBodies[0].setAttribute('role', 'rowgroup');
    headers.forEach((header, index) => {
      if (!header.id) header.id = `pw-reference-header-${identity}-${index}`;
      header.scope = 'col';
      header.setAttribute('role', 'columnheader');
    });
    rows.forEach(row => {
      row.setAttribute('role', 'row');
      Array.from(row.cells).forEach((cell, index) => {
        cell.setAttribute('role', 'cell');
        const ids = new Set((cell.getAttribute('headers') || '').split(/\s+/).filter(Boolean));
        ids.add(headers[index].id);
        cell.setAttribute('headers', [...ids].join(' '));
      });
    });
  };

  const addLabel = (cell, text, className = 'pw-record-label') => {
    if (!text) return;
    const label = document.createElement('span');
    label.className = className;
    label.textContent = text;
    label.setAttribute('aria-hidden', 'true');
    cell.prepend(label);
  };

  // Long variable identifiers can break at their existing underscores, while
  // each English word stays intact and copied text remains unchanged.
  const addCodeBreaks = table => table.querySelectorAll('td code').forEach(code => {
    if (code.children.length || !code.textContent.includes('_')) return;
    const parts = code.textContent.split(/(?<=_)/);
    code.replaceChildren();
    parts.forEach((part, index) => {
      code.append(document.createTextNode(part));
      if (index < parts.length - 1) code.append(document.createElement('wbr'));
    });
  });

  function observeMode(wrapper, thresholdRem) {
    const component = { appliedWidth: -1, pending: 0 };
    const update = () => {
      component.appliedWidth = widthOf(wrapper);
      const record = component.appliedWidth > 0 && component.appliedWidth < thresholdRem * rootFontSize();
      wrapper.classList.toggle('pw-record-mode', record);
      wrapper.dataset.pwMode = record ? 'record' : 'table';
      wrapper.dataset.pwAdaptiveReady = 'true';
    };
    component.settled = () => !component.pending && widthOf(wrapper) === component.appliedWidth &&
      wrapper.classList.contains('pw-record-mode') === (component.appliedWidth > 0 && component.appliedWidth < thresholdRem * rootFontSize());
    component.update = update;
    new ResizeObserver(() => {
      // Height-only notifications cannot change the representation. Schedule
      // width-driven writes in the next frame to avoid layout feedback loops.
      if (widthOf(wrapper) === component.appliedWidth || component.pending) return;
      wrapper.dataset.pwAdaptiveReady = 'false';
      component.pending = requestAnimationFrame(() => { component.pending = 0; update(); });
    }).observe(wrapper);
    components.push(component);
    update();
  }

  function initialize(wrapper, thresholdRem, columns, variant, stickyDisclosure, automatic = false) {
    const table = wrapper.querySelector('table');
    const headers = table?.tHead?.rows[0] && Array.from(table.tHead.rows[0].cells);
    const rows = table?.tBodies[0] && Array.from(table.tBodies[0].rows);
    if (!table || !headers || headers.length !== columns || !rows?.length ||
        rows.some(row => row.cells.length !== columns || [...row.cells].some(cell => cell.colSpan !== 1 || cell.rowSpan !== 1)) ||
        table.dataset.pwAdaptive === 'true') return;

    const labels = headers.map(header => normalize(header.textContent));
    prepareSemantics(table, headers, rows);
    addCodeBreaks(table);
    rows.forEach(row => {
      if (variant === 'ledger') {
        addLabel(row.cells[0], labels[0], 'pw-ledger-day-label');
        if (normalize(row.cells[2].textContent) === '—') row.cells[2].classList.add('pw-ledger-empty-requirement');
      }
      Array.from(row.cells).forEach((cell, index) => {
        if (index > 0 || automatic) addLabel(cell, labels[index]);
      });
    });

    table.dataset.pwAdaptive = 'true';
    wrapper.classList.add('pw-adaptive-table');
    if (variant) wrapper.dataset.pwVariant = variant;
    if (automatic) wrapper.dataset.pwAuto = 'true';
    observeMode(wrapper, thresholdRem);
    if (stickyDisclosure) initializeDisclosure(wrapper);
  }

  function initializeScrollHint(wrapper, table) {
    const hint = document.createElement('p');
    hint.className = 'pw-table-scroll-hint';
    hint.textContent = document.documentElement.lang.startsWith('en')
      ? 'Swipe sideways to compare all columns.' : '左右滑动查看完整列。';
    hint.hidden = true;
    wrapper.before(hint);
    wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', document.documentElement.lang.startsWith('en')
      ? 'Table; scroll horizontally if needed' : '表格；必要时可左右滚动');
    // WebKit does not natively scroll a focused region with horizontal arrows.
    // Handle only the region itself; links/inputs and vertical page keys retain
    // their own behavior. Non-overflowing tables need no keyboard interception.
    wrapper.addEventListener('keydown', event => {
      if (event.target !== wrapper || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
          !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const maximum = wrapper.scrollWidth - wrapper.clientWidth;
      if (maximum <= 1) return;
      const distance = Math.max(32, Math.round(wrapper.clientWidth / 4)) * (event.key === 'ArrowRight' ? 1 : -1);
      const next = Math.max(0, Math.min(maximum, wrapper.scrollLeft + distance));
      if (next === wrapper.scrollLeft) return;
      event.preventDefault();
      wrapper.scrollTo({ left: next, behavior: 'instant' });
    });
    const update = () => { hint.hidden = wrapper.clientWidth === 0 || table.getBoundingClientRect().width <= wrapper.clientWidth + 1; };
    let pending = 0;
    new ResizeObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; update(); });
    }).observe(wrapper);
    document.fonts.ready.then(update);
    update();
  }

  function initializeAll() {
    families.forEach(({ selector, thresholdRem, columns, variant, stickyDisclosure }) => {
      document.querySelectorAll(selector).forEach(wrapper => initialize(wrapper, thresholdRem, columns, variant, stickyDisclosure));
    });
    document.querySelectorAll('main.content table').forEach(table => {
      if (table.dataset.pwAdaptive === 'true' || table.closest('#gallery-trigger-index, #gallery-non-gallery-index')) return;
      const wrapper = table.closest('.pw-mobile-table-scroll, .gallery-coordinate-table');
      const headers = table.tHead?.rows[0] && [...table.tHead.rows[0].cells];
      const rows = table.tBodies[0] && [...table.tBodies[0].rows];
      if (!wrapper || !headers || headers.length < 2 || !rows?.length) return;
      if (wrapper.classList.contains('gallery-coordinate-table')) {
        wrapper.dataset.pwRepresentation = 'matrix';
        initializeScrollHint(wrapper, table);
        return;
      }
      const texts = rows.flatMap(row => [...row.cells].map(cell => normalize(cell.textContent)));
      // Coordinate/numeric grids preserve comparisons. Prose-rich two-field
      // definitions and regular multi-field records get full-width fields.
      const denseMatrix = headers.length > 2 && texts.every(text => /^(?:[\d\s+−–—.,%≥≤?]+|yes|no|true|false|是|否)$/i.test(text));
      const hasProse = texts.some(text => text.length + (text.match(/[\u3400-\u9fff]/g)?.length || 0) > 36);
      if (!denseMatrix && (headers.length > 2 || hasProse)) {
        const variant = !normalize(headers[0].textContent) ? 'comparison-record' : headers.length === 2 ? 'definition' : 'record';
        initialize(wrapper, 34, headers.length, variant, false, true);
        wrapper.dataset.pwRepresentation = variant;
      } else {
        wrapper.dataset.pwRepresentation = denseMatrix ? 'matrix' : 'compact';
        addCodeBreaks(table);
        initializeScrollHint(wrapper, table);
      }
    });
    document.fonts.ready.then(() => components.forEach(component => component.update()));
  }

  // Tests and deep-link clients can wait for actual measured layout instead of
  // choosing delays; hidden tab/disclosure contents are measured on reveal.
  window.pwAdaptiveTables = Object.freeze({ whenSettled: async () => {
    await document.fonts.ready;
    do { await frame(); } while (!components.every(component => component.settled()));
  }});

  // The layout owns ordinary Quarto wrappers. Its explicit readiness event
  // avoids defer/DOMContentLoaded ordering differences between engines.
  if (document.documentElement.dataset.pwTablesReady === 'true') initializeAll();
  else document.addEventListener('pw:tables-ready', initializeAll, { once: true });
})();
