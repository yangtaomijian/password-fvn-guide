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

  function setMode(wrapper, table, rows, recordMode, indexLabel) {
    const mode = recordMode ? 'record' : 'table';
    if (wrapper.dataset.pwMode === mode) return;

    wrapper.classList.toggle('pw-record-mode', recordMode);
    wrapper.dataset.pwMode = mode;

    if (recordMode) {
      table.setAttribute('role', 'list');
      rows.forEach((row) => {
        row.setAttribute('role', 'listitem');
        Array.from(row.cells).forEach((cell) => cell.setAttribute('role', 'none'));
        if (indexLabel) row.cells[0].setAttribute('aria-label', indexLabel);
      });
    } else {
      table.removeAttribute('role');
      rows.forEach((row) => {
        row.removeAttribute('role');
        Array.from(row.cells).forEach((cell) => cell.removeAttribute('role'));
        if (indexLabel) row.cells[0].removeAttribute('aria-label');
      });
    }
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const state = entry.target.pwReferenceState;
      if (!state) continue;
      const width = entry.contentRect.width;
      if (width <= 0) continue;
      setMode(entry.target, state.table, state.rows, width < state.thresholdRem * rootFontSize(), state.indexLabel);
    }
  });

  function initialize(wrapper, thresholdRem, columns, variant, stickyDisclosure) {
    const table = wrapper.querySelector('table');
    const headers = table?.tHead?.rows[0] && Array.from(table.tHead.rows[0].cells);
    const rows = table?.tBodies[0] && Array.from(table.tBodies[0].rows);
    if (!table || !headers || headers.length !== columns || !rows?.length ||
        rows.some((row) => row.cells.length !== columns) ||
        table.dataset.pwAdaptive === 'true') return;

    const labels = headers.map((header) => normalize(header.textContent));
    rows.forEach((row) => {
      if (variant === 'ledger') {
        const dayLabel = document.createElement('span');
        dayLabel.className = 'pw-ledger-day-label';
        dayLabel.textContent = labels[0];
        row.cells[0].prepend(dayLabel);
        if (normalize(row.cells[2].textContent) === '—') {
          row.cells[2].classList.add('pw-ledger-empty-requirement');
        }
      }
      Array.from(row.cells).slice(1).forEach((cell, index) => {
        const label = document.createElement('span');
        label.className = 'pw-record-label';
        label.textContent = labels[index + 1];
        cell.prepend(label);
      });
    });

    table.dataset.pwAdaptive = 'true';
    wrapper.classList.add('pw-adaptive-table');
    if (variant) wrapper.dataset.pwVariant = variant;
    wrapper.pwReferenceState = { table, rows, thresholdRem, indexLabel: variant === 'index-ledger' ? labels[0] : null };
    observer.observe(wrapper);
    if (stickyDisclosure) initializeDisclosure(wrapper);
  }

  function initializeAll() {
    families.forEach(({ selector, thresholdRem, columns, variant, stickyDisclosure }) => {
      document.querySelectorAll(selector).forEach((wrapper) => initialize(wrapper, thresholdRem, columns, variant, stickyDisclosure));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
  } else {
    initializeAll();
  }
})();
