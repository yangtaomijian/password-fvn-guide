(() => {
  "use strict";

  const initialize = () => {
    const root = document.querySelector("#gallery-locator-root");

    if (
      !root ||
      root.dataset.galleryLocatorInitialized === "true"
    ) {
      return;
    }

    root.dataset.galleryLocatorInitialized = "true";

  const setupIndexToggle = () => {
    const index = document.querySelector("#gallery-trigger-index");
    const oldHeader = index?.querySelector(":scope > .callout-header");
    const body = index?.querySelector(":scope > .callout-collapse");
    if (!oldHeader || !body) return;

    // Keep Quarto's collapse target and use a native keyboard-accessible button.
    const header = document.createElement("button");
    for (const { name, value } of oldHeader.attributes) {
      header.setAttribute(name, value);
    }
    header.type = "button";
    header.append(...oldHeader.childNodes);
    oldHeader.replaceWith(header);
    const title = header.querySelector(".callout-title-container");
    const titleCopy = title.cloneNode(true);
    titleCopy.querySelectorAll(".screen-reader-only").forEach((node) => node.remove());
    const closedTitle = titleCopy.textContent.trim();
    const action = document.createElement("span");
    action.className = "gallery-index-action";
    action.setAttribute("aria-hidden", "true");
    header.append(action);

    const navigation = document.querySelector("#quarto-header");
    const updateOffset = () => {
      const bottom = Math.max(0, navigation?.getBoundingClientRect().bottom || 0);
      index.style.setProperty("--gallery-index-top", `${bottom}px`);
      return bottom;
    };
    let pendingFrame = 0;
    const scheduleOffset = () => {
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        updateOffset();
        if (navigation?.getAnimations().some((animation) => animation.playState === "running")) {
          scheduleOffset();
        }
      });
    };
    window.addEventListener("scroll", scheduleOffset, { passive: true });
    window.addEventListener("resize", scheduleOffset);
    if (navigation) {
      new ResizeObserver(scheduleOffset).observe(navigation);
      navigation.addEventListener("transitionrun", scheduleOffset);
      navigation.addEventListener("transitionend", scheduleOffset);
    }

    const setExpanded = (expanded) => {
      index.classList.toggle("gallery-index-open", expanded);
      title.textContent = expanded ? "Full index" : closedTitle;
      action.textContent = expanded ? "Collapse" : "Expand";
      header.setAttribute("aria-label", expanded ? "Collapse full index" : "Expand full index");
      updateOffset();
    };
    let returnToHeader = false;
    body.addEventListener("show.bs.collapse", () => setExpanded(true));
    body.addEventListener("hide.bs.collapse", () => {
      returnToHeader = index.getBoundingClientRect().top < updateOffset();
    });
    body.addEventListener("hidden.bs.collapse", () => {
      setExpanded(false);
      if (returnToHeader) {
        window.scrollBy({
          top: index.getBoundingClientRect().top - (navigation?.offsetHeight || 0) - 8,
          behavior: "instant"
        });
        header.focus({ preventScroll: true });
      }
      returnToHeader = false;
    });
    setExpanded(body.classList.contains("show"));
  };
  setupIndexToggle();

  const EXPECTED_COUNTS = {
    Memories: 72,
    Trauma: 28
  };
  const DEBOUNCE_DELAY = 150;
  const records = [];
  const nonGalleryRecords = [];
  const searchRecords = [];
  const recordsByPosition = new Map();

  const normalizeText = (value) =>
    value.replace(/\s+/g, " ").trim();

  const normalizeGalleryFlag = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized === "yes") return true;
    if (normalized === "no") return false;
    return null;
  };

  const positionKey = (tab, row, column) =>
    `${tab.toLowerCase()}:${row}:${column}`;

  const pathSearchTerms = (date) => {
    const markedPaths = date.match(/^D\d+\s+([A-GP](?:\/[A-GP])?)(?:\s+Redux)?$/i);
    const datedBranch = date.match(/^D\d+([A-GP])$/i);
    const paths = markedPaths?.[1].split("/") ||
      (datedBranch ? [datedBranch[1]] : []);
    return paths.map((path) => `Path ${path}`).join(" ");
  };

  const readGallery = (selector) => {
    const grid = document.querySelector(selector);

    if (!grid) {
      throw new Error(`Gallery table container not found: ${selector}`);
    }

    const tab = grid.dataset.galleryTab;

    if (!Object.hasOwn(EXPECTED_COUNTS, tab)) {
      throw new Error(`Invalid Gallery tab: ${tab || "not set"}`);
    }

    const table = grid.querySelector("table");

    if (!table) {
      throw new Error(`${tab} Gallery table not found`);
    }

    table.querySelectorAll("tbody tr").forEach((rowElement) => {
      const cells = Array.from(rowElement.cells);
      const row = Number.parseInt(
        normalizeText(cells[0]?.textContent || ""),
        10
      );

      if (!Number.isInteger(row)) {
        throw new Error(`${tab} Gallery contains an unreadable row number`);
      }

      if (cells.length !== 5) {
        throw new Error(`${tab} row does not contain four scene cells ${row}`);
      }

      cells.slice(1).forEach((cellElement, index) => {
        const column = index + 1;
        const labelElement = cellElement.querySelector(".gallery-scene-label");
        const metadataElement = cellElement.querySelector("small");

        if (!labelElement || !metadataElement) {
          throw new Error(`${tab} incomplete position data ${row}:${column}`);
        }

        const sceneLabel = normalizeText(labelElement.textContent || "");
        const metadata = normalizeText(metadataElement.textContent || "");
        const date = normalizeText(metadata.split("·")[0] || "");
        const key = positionKey(tab, row, column);
        const id = `gallery-${tab.toLowerCase()}-r${row}-c${column}`;

        if (!sceneLabel || !date) {
          throw new Error(`${tab} incomplete position data ${row}:${column}`);
        }

        if (recordsByPosition.has(key)) {
          throw new Error(`${tab} duplicate coordinate ${row}:${column}`);
        }

        const record = {
          key,
          tab,
          row,
          column,
          sceneLabel,
          metadata,
          date,
          cellElement
        };

        cellElement.dataset.galleryTab = tab;
        cellElement.dataset.galleryRow = String(row);
        cellElement.dataset.galleryColumn = String(column);
        cellElement.id = id;

        records.push(record);
        recordsByPosition.set(key, record);
      });
    });
  };

  const showReadError = (error, message = "Unable to read Gallery data") => {
    console.error("Gallery locator data error:", error);
    root.innerHTML = "";

    const panel = document.createElement("section");
    panel.className = "gallery-locator gallery-locator-error";

    const heading = document.createElement("h2");
    heading.textContent = "CG Gallery Locator";

    const status = document.createElement("div");
    status.className = "gallery-locator-status";
    status.setAttribute("aria-live", "polite");
    status.textContent = message;

    panel.append(heading, status);
    root.append(panel);
  };

  try {
    readGallery("#gallery-memories");
    readGallery("#gallery-trauma");
  } catch (error) {
    showReadError(error);
    return;
  }

  const counts = records.reduce((result, record) => {
    result[record.tab] += 1;
    return result;
  }, { Memories: 0, Trauma: 0 });

  if (
    counts.Memories !== EXPECTED_COUNTS.Memories ||
    counts.Trauma !== EXPECTED_COUNTS.Trauma ||
    records.length !== 100
  ) {
    showReadError(
      new Error(
        `Expected Memories 72, Trauma 28, total 100; found ` +
        `Memories ${counts.Memories}, Trauma ${counts.Trauma}, ` +
        `total ${records.length}`
      )
    );
    return;
  }

  const readTriggerDetails = () => {
    const triggerIndex = document.querySelector("#gallery-trigger-index");

    if (!triggerIndex) {
      throw new Error("Complete trigger index not found: #gallery-trigger-index");
    }

    const details = [];
    const groups = triggerIndex.querySelectorAll(".gallery-trigger-group");

    groups.forEach((group) => {
      const category = normalizeText(group.dataset.category || "");
      const table = group.querySelector("table");

      if (!category || !table) {
        throw new Error("A trigger-index group is missing its category or table");
      }

      table.querySelectorAll("tbody tr").forEach((detailRowElement) => {
        const cells = Array.from(detailRowElement.cells);

        if (cells.length !== 4) {
          throw new Error(`${category} trigger-index row does not have four cells`);
        }

        const galleryFlag = normalizeGalleryFlag(cells[1].textContent || "");

        if (galleryFlag === false) {
          return;
        }

        if (galleryFlag !== true) {
          throw new Error(`${category} trigger-index row has an invalid Gallery flag`);
        }

        const link = cells[0].querySelector('a[href^="#gallery-"]');
        const sceneLabel = normalizeText(link?.textContent || "");
        const match = link?.getAttribute("href")?.match(
          /^#gallery-(memories|trauma)-r(\d+)-c(\d+)$/
        );

        if (!sceneLabel || !match) {
          throw new Error(`${category} trigger-index row is missing its scene position`);
        }

        const tab = match[1] === "memories" ? "Memories" : "Trauma";
        const row = Number.parseInt(match[2], 10);
        const column = Number.parseInt(match[3], 10);
        const key = positionKey(tab, row, column);
        const displayedPosition = normalizeText(
          cells[0].querySelector("small")?.textContent || ""
        );
        const expectedPosition = `${tab} · row ${row}, column ${column}`;

        if (displayedPosition !== expectedPosition) {
          throw new Error(`${category} displayed trigger position does not match its link ${key}`);
        }

        const triggerText = normalizeText(
          cells[2].innerText || cells[2].textContent || ""
        );
        const context = normalizeText(
          cells[3].innerText || cells[3].textContent || ""
        );

        details.push({
          key,
          sceneLabel,
          category,
          galleryFlag,
          triggerText,
          context,
          detailRowElement
        });
      });
    });

    return details;
  };

  const readNonGalleryDetails = () => {
    const index = document.querySelector("#gallery-non-gallery-index");
    const table = index?.querySelector("table");

    if (!index || !table) {
      throw new Error("Non-Gallery index not found: #gallery-non-gallery-index");
    }

    return Array.from(table.querySelectorAll("tbody tr")).map(
      (detailRowElement, index) => {
        const cells = Array.from(detailRowElement.cells);

        if (cells.length !== 4) {
          throw new Error("A non-Gallery index row does not have four cells");
        }

        const sceneLabel = normalizeText(
          cells[0].querySelector(".gallery-scene-label")?.textContent || ""
        );
        const galleryFlag = normalizeGalleryFlag(cells[1].textContent || "");
        const triggerText = normalizeText(
          cells[2].innerText || cells[2].textContent || ""
        );
        const context = normalizeText(
          cells[3].innerText || cells[3].textContent || ""
        );

        if (!sceneLabel || galleryFlag !== false) {
          throw new Error("A non-Gallery index row has an invalid scene or Gallery flag");
        }

        return {
          guideId: `non-gallery:${index + 1}`,
          sceneLabel,
          category: "Non-Gallery",
          galleryFlag,
          triggerText,
          context,
          detailRowElement
        };
      }
    );
  };

  const ensureTriggerTableScrollers = () => {
    document.querySelectorAll(
      "#gallery-trigger-index .gallery-trigger-group table"
    ).forEach((table) => {
      if (table.parentElement?.classList.contains(
        "gallery-trigger-table-scroll"
      )) {
        return;
      }

      const scroller = document.createElement("div");
      scroller.className = "gallery-trigger-table-scroll";
      table.before(scroller);
      scroller.append(table);
    });
  };

  const ensureNonGalleryTableScroller = () => {
    const table = document.querySelector(
      "#gallery-non-gallery-index table"
    );

    if (
      !table ||
      table.parentElement?.classList.contains(
        "gallery-non-gallery-table-scroll"
      )
    ) {
      return;
    }

    const scroller = document.createElement("div");
    scroller.className = "gallery-non-gallery-table-scroll";
    table.before(scroller);
    scroller.append(table);
  };

  try {
    const details = readTriggerDetails();
    const nonGalleryDetails = readNonGalleryDetails();
    const detailsByPosition = new Map();
    const nonGalleryByGuideId = new Map();

    details.forEach((detail) => {
      if (detailsByPosition.has(detail.key)) {
        throw new Error(`Duplicate position in trigger index: ${detail.key}`);
      }
      detailsByPosition.set(detail.key, detail);
    });

    nonGalleryDetails.forEach((detail) => {
      if (nonGalleryByGuideId.has(detail.guideId)) {
        throw new Error(`Duplicate local non-Gallery record: ${detail.guideId}`);
      }
      nonGalleryByGuideId.set(detail.guideId, detail);
    });

    const missingPositions = records
      .filter((record) => !detailsByPosition.has(record.key))
      .map((record) => record.key);
    const extraPositions = details
      .filter((detail) => !recordsByPosition.has(detail.key))
      .map((detail) => detail.key);

    if (
      details.length !== 100 ||
      detailsByPosition.size !== 100 ||
      missingPositions.length > 0 ||
      extraPositions.length > 0
    ) {
      throw new Error(
        `Trigger details do not match coordinate entries: ${details.length} / ${detailsByPosition.size}; ` +
        `missing [${missingPositions.join(", ") || "none"}]; ` +
        `extra [${extraPositions.join(", ") || "none"}]`
      );
    }

    if (
      nonGalleryDetails.length !== 4 ||
      nonGalleryByGuideId.size !== 4
    ) {
      throw new Error(`Expected 4 non-Gallery records; found: ${nonGalleryDetails.length}`);
    }

    records.forEach((record) => {
      const detail = detailsByPosition.get(record.key);
      if (record.sceneLabel !== detail.sceneLabel) {
        throw new Error(`Scene labels differ between coordinate and trigger tables: ${record.key}`);
      }
      Object.assign(record, detail);
      record.inGallery = true;
      record.searchText = [
        record.sceneLabel,
        record.metadata,
        record.date,
        pathSearchTerms(record.date),
        record.triggerText,
        record.context,
        record.category,
        record.tab,
        `${record.tab} ${record.row} ${record.column}`,
        `${record.tab} row ${record.row} column ${record.column}`,
        `row ${record.row} column ${record.column}`,
        `${record.tab} r${record.row} c${record.column}`,
        `r${record.row} c${record.column}`
      ].join(" ").toLowerCase();
    });

    nonGalleryDetails.forEach((detail) => {
      const record = {
        ...detail,
        inGallery: false,
        tab: null,
        row: null,
        column: null,
        cellElement: null,
        metadata: "",
        date: ""
      };

      record.searchText = [
        record.sceneLabel,
        record.triggerText,
        record.context,
        record.category,
        "Non-Gallery"
      ].join(" ").toLowerCase();
      nonGalleryRecords.push(record);
    });

    searchRecords.push(...records, ...nonGalleryRecords);

    ensureTriggerTableScrollers();
    ensureNonGalleryTableScroller();
    console.info("Gallery locator data linked: 100 Gallery + 4 non-Gallery");
  } catch (error) {
    showReadError(error, "Unable to link Gallery data");
    return;
  }

  root.innerHTML = `
    <section class="gallery-locator" aria-labelledby="gallery-locator-title">
      <header class="gallery-locator-header">
        <h2 id="gallery-locator-title">CG Gallery Locator</h2>
        <p>Locate a Gallery scene by tab and grid position, or search by scene, date, Path, story clue, or character category.</p>
        <p class="gallery-locator-count">100 Gallery CGs loaded</p>
      </header>

      <fieldset class="gallery-locator-section gallery-locator-exact">
        <legend>Locate by position</legend>
        <div class="gallery-locator-controls">
          <label for="gallery-locator-tab">Tab</label>
          <select id="gallery-locator-tab">
            <option value="Memories">Memories</option>
            <option value="Trauma">Trauma</option>
          </select>

          <label for="gallery-locator-row">Row</label>
          <select id="gallery-locator-row"></select>

          <label for="gallery-locator-column">Column</label>
          <select id="gallery-locator-column">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>

          <button type="button" id="gallery-locator-go">View details</button>
        </div>
        <div class="gallery-location-output">
          <div class="gallery-location-status" aria-live="polite"></div>
          <div class="gallery-location-detail" aria-live="polite"></div>
        </div>
      </fieldset>

      <fieldset class="gallery-locator-section gallery-locator-search">
        <legend>Search the Gallery</legend>
        <label for="gallery-locator-query">Search by scene, date, Path, story clue, character category, or grid position</label>
        <div class="gallery-locator-search-row">
          <input
            id="gallery-locator-query"
            type="search"
            placeholder="For example: Hoss, D8, or Memories row 6 column 4"
            autocomplete="off"
          >
          <button type="button" id="gallery-locator-clear">Clear</button>
        </div>
        <div class="gallery-search-status" aria-live="polite"></div>
        <div class="gallery-search-results"></div>
        <div class="gallery-search-detail" aria-live="polite"></div>
      </fieldset>
    </section>
  `;

  const tabSelect = root.querySelector("#gallery-locator-tab");
  const rowSelect = root.querySelector("#gallery-locator-row");
  const columnSelect = root.querySelector("#gallery-locator-column");
  const locateButton = root.querySelector("#gallery-locator-go");
  const searchInput = root.querySelector("#gallery-locator-query");
  const clearButton = root.querySelector("#gallery-locator-clear");
  const resultsElement = root.querySelector(
    ".gallery-search-results"
  );
  const locationStatusElement = root.querySelector(
    ".gallery-location-status"
  );
  const locationDetailElement = root.querySelector(
    ".gallery-location-detail"
  );
  const searchStatusElement = root.querySelector(
    ".gallery-search-status"
  );
  const searchDetailElement = root.querySelector(
    ".gallery-search-detail"
  );
  let debounceTimer;
  let currentTarget = null;
  let currentMode = null;
  let currentResults = [];

  const rowsForTab = (tab) =>
    Array.from(
      new Set(
        records
          .filter((record) => record.tab === tab)
          .map((record) => record.row)
      )
    ).sort((left, right) => left - right);

  const populateRows = (tab, preferredRow = 1) => {
    const rows = rowsForTab(tab);
    rowSelect.replaceChildren();

    rows.forEach((row) => {
      const option = document.createElement("option");
      option.value = String(row);
      option.textContent = String(row);
      rowSelect.append(option);
    });

    rowSelect.value = rows.includes(preferredRow)
      ? String(preferredRow)
      : String(rows[0]);
  };

  const clearLocationOutput = () => {
    locationStatusElement.replaceChildren();
    locationDetailElement.replaceChildren();
  };

  const clearSearchOutput = () => {
    searchStatusElement.replaceChildren();
    resultsElement.replaceChildren();
    searchDetailElement.replaceChildren();
  };

  const createDetailField = (label, value, className = "") => {
    const field = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    if (className) {
      field.className = className;
    }

    term.textContent = label;
    description.textContent = value;
    field.append(term, description);
    return field;
  };

  const renderDetail = (record, targetElement) => {
    const card = document.createElement("section");
    card.className = "gallery-detail-card";

    const heading = document.createElement("h3");
    heading.textContent = record.sceneLabel;

    const fields = document.createElement("dl");
    fields.className = "gallery-detail-grid";
    const detailFields = [
      createDetailField(
        record.inGallery ? "Gallery position" : "Gallery status",
        record.inGallery
          ? `${record.tab} · row ${record.row}, column ${record.column}`
          : "Not in Gallery"
      ),
      createDetailField("Category", record.category),
      createDetailField("Earliest appearance", record.triggerText)
    ];

    detailFields.push(
      createDetailField(
        "Story clue",
        record.context,
        "gallery-detail-context"
      )
    );
    fields.append(...detailFields);

    card.append(heading, fields);
    targetElement.replaceChildren(card);
  };

  const clearMatchHighlights = () => {
    records.forEach(({ cellElement }) => {
      cellElement.classList.remove("gallery-cell-match");
    });
  };

  const clearTargetHighlight = () => {
    if (!currentTarget) {
      return;
    }

    currentTarget.cellElement.classList.remove("gallery-cell-target");

    currentTarget = null;
    currentMode = null;
  };

  const replaceUrl = ({
    includeLocation = true,
    includeQuery = true
  } = {}) => {
    const url = new URL(window.location.href);
    const query = searchInput.value.trim();

    if (includeLocation) {
      url.searchParams.set("tab", tabSelect.value.toLowerCase());
      url.searchParams.set("row", rowSelect.value);
      url.searchParams.set("col", columnSelect.value);
    } else {
      ["tab", "row", "col"].forEach((parameter) => {
        url.searchParams.delete(parameter);
      });
    }

    if (includeQuery && query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState(null, "", url);
  };

  const locateRecord = (record, {
    updateUrl = true,
    mode = "location"
  } = {}) => {
    if (mode === "search") {
      clearLocationOutput();
    } else {
      clearSearchOutput();
      clearMatchHighlights();
      currentResults = [];
    }

    clearTargetHighlight();
    currentTarget = record;
    currentMode = mode;
    record.cellElement.classList.add("gallery-cell-target");

    const statusMessage =
      `${record.tab} · row ${record.row}, column ${record.column} · ` +
      record.sceneLabel;

    if (mode === "search") {
      searchStatusElement.textContent = statusMessage;
      renderDetail(record, searchDetailElement);
    } else {
      locationStatusElement.textContent = statusMessage;
      renderDetail(record, locationDetailElement);
    }

    if (updateUrl) {
      replaceUrl({
        includeLocation: true,
        includeQuery: mode === "search"
      });
    }
  };

  const selectSearchRecord = (record) => {
    if (record.inGallery) {
      tabSelect.value = record.tab;
      populateRows(record.tab, record.row);
      columnSelect.value = String(record.column);
      locateRecord(record, { mode: "search" });
      return;
    }

    clearLocationOutput();
    clearMatchHighlights();
    clearTargetHighlight();
    currentMode = "search";
    searchStatusElement.textContent =
      `Not in Gallery · ${record.sceneLabel}`;
    renderDetail(record, searchDetailElement);
    replaceUrl({ includeLocation: false, includeQuery: true });
  };

  const locateSelected = () => {
    const record = recordsByPosition.get(
      positionKey(
        tabSelect.value,
        Number.parseInt(rowSelect.value, 10),
        Number.parseInt(columnSelect.value, 10)
      )
    );

    if (!record) {
      clearLocationOutput();
      locationStatusElement.textContent = "No Gallery scene was found at that position.";
      return;
    }

    locateRecord(record, { mode: "location" });
  };

  const matchReasonFor = (record, rawQuery, positionRecord) => {
    const query = rawQuery.trim().toLowerCase();
    const includesQuery = (value) =>
      normalizeText(value || "").toLowerCase().includes(query);

    if (positionRecord === record) {
      return `Matched field: Gallery position · ${record.tab} row ${record.row}, column ${record.column}`;
    }

    if (includesQuery(record.sceneLabel)) {
      return "Matched field: scene";
    }

    if (
      includesQuery(record.triggerText) ||
      includesQuery(record.metadata) ||
      includesQuery(record.date) ||
      includesQuery(pathSearchTerms(record.date))
    ) {
      return `Matched field: appearance date / Path · ${record.triggerText}`;
    }

    if (includesQuery(record.category)) {
      return `Matched field: category · ${record.category}`;
    }

    if (includesQuery(record.context)) {
      return "Matched field: story clue";
    }

    if (!record.inGallery) {
      return "Matched field: Gallery status · Not in Gallery";
    }

    return `Matched field: Gallery position · ${record.tab} row ${record.row}, column ${record.column}`;
  };

  const renderSearchResults = (matches, rawQuery, positionRecord) => {
    resultsElement.replaceChildren();

    matches.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-locator-result";

      const name = document.createElement("strong");
      name.textContent = record.sceneLabel;

      const position = document.createElement("span");
      position.className = "gallery-result-position";
      position.textContent = record.inGallery
        ? `${record.tab} · row ${record.row}, column ${record.column}`
        : "Not in Gallery";

      const matchReason = document.createElement("span");
      matchReason.className = "gallery-result-match";
      matchReason.textContent = matchReasonFor(
        record,
        rawQuery,
        positionRecord
      );

      const category = document.createElement("span");
      category.className = "gallery-result-category";
      category.textContent = `Category: ${record.category}`;

      const trigger = document.createElement("span");
      trigger.className = "gallery-result-trigger";
      trigger.textContent = `Earliest appearance: ${record.triggerText}`;

      const context = document.createElement("span");
      context.className = "gallery-result-context";
      context.textContent = record.context;

      button.append(
        name,
        position,
        matchReason,
        category,
        trigger,
        context
      );
      button.addEventListener("click", () => {
        selectSearchRecord(record);
      });
      resultsElement.append(button);
    });
  };

  const parsePositionQuery = (value) => {
    const match = value.trim().match(
      /^(?:(memories|trauma)\s*(?:·\s*)?)?(?:row\s*(\d+)\s*(?:,\s*)?(?:column|col)\s*(\d+)|(\d+)\s*(?:[-/]\s*|\s+)(\d+))$/i
    );

    if (!match) {
      return null;
    }

    const explicitTab = match[1]?.toLowerCase();
    const tab = explicitTab === "memories"
      ? "Memories"
      : explicitTab === "trauma"
        ? "Trauma"
        : tabSelect.value;
    const row = Number.parseInt(match[2] || match[4], 10);
    const column = Number.parseInt(match[3] || match[5], 10);

    if (
      !rowsForTab(tab).includes(row) ||
      ![1, 2, 3, 4].includes(column)
    ) {
      return null;
    }

    return recordsByPosition.get(positionKey(tab, row, column)) || null;
  };

  const applySearch = ({ updateUrl = true } = {}) => {
    const rawQuery = searchInput.value.trim();
    const query = rawQuery.toLowerCase();
    clearMatchHighlights();

    if (!query) {
      currentResults = [];
      clearSearchOutput();

      if (updateUrl) {
        replaceUrl({
          includeLocation: currentMode === "location",
          includeQuery: false
        });
      }

      return currentResults;
    }

    clearLocationOutput();
    clearTargetHighlight();
    const positionRecord = parsePositionQuery(rawQuery);
    currentResults = positionRecord
      ? [positionRecord]
      : searchRecords.filter((record) =>
          record.searchText.includes(query)
        );

    currentResults.forEach(({ cellElement }) => {
      cellElement?.classList.add("gallery-cell-match");
    });
    renderSearchResults(currentResults, rawQuery, positionRecord);

    if (currentResults.length === 0) {
      searchStatusElement.textContent =
        `No Gallery CGs match “${rawQuery}”.`;
      searchDetailElement.replaceChildren();
    } else {
      const resultType = currentResults.every(
        (record) => record.inGallery
      )
        ? "Gallery CG"
        : "image record";
      searchStatusElement.textContent =
        `${currentResults.length} matching ${resultType}` +
        `${currentResults.length === 1 ? "" : "s"} found.`;

      if (currentResults.length === 1) {
        renderDetail(currentResults[0], searchDetailElement);
      } else {
        searchDetailElement.replaceChildren();
      }
    }

    if (updateUrl) {
      replaceUrl({ includeLocation: false, includeQuery: true });
    }

    return currentResults;
  };

  const clearSearchOnly = () => {
    window.clearTimeout(debounceTimer);
    searchInput.value = "";
    clearMatchHighlights();
    currentResults = [];
    clearSearchOutput();

    if (currentMode === "search") {
      clearTargetHighlight();
    }

    replaceUrl({
      includeLocation: currentMode === "location",
      includeQuery: false
    });
  };

  const clearAll = () => {
    window.clearTimeout(debounceTimer);
    searchInput.value = "";
    clearMatchHighlights();
    clearTargetHighlight();
    currentResults = [];
    clearSearchOutput();
    clearLocationOutput();
    tabSelect.value = "Memories";
    populateRows("Memories", 1);
    columnSelect.value = "1";

    const url = new URL(window.location.href);
    ["tab", "row", "col", "q"].forEach((parameter) => {
      url.searchParams.delete(parameter);
    });
    window.history.replaceState(null, "", url);
  };

  tabSelect.addEventListener("change", () => {
    populateRows(tabSelect.value, 1);
  });
  locateButton.addEventListener("click", locateSelected);
  clearButton.addEventListener("click", clearAll);

  searchInput.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);

    if (searchInput.value.trim()) {
      clearLocationOutput();
      clearTargetHighlight();
    }

    debounceTimer = window.setTimeout(() => {
      applySearch();
    }, DEBOUNCE_DELAY);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      clearSearchOnly();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      window.clearTimeout(debounceTimer);
      const matches = applySearch();

      if (matches.length > 0) {
        selectSearchRecord(matches[0]);
      }
    }
  });

  populateRows("Memories", 1);

  const parameters = new URLSearchParams(window.location.search);
  const requestedTab = parameters.get("tab")?.toLowerCase();
  const tab = requestedTab === "trauma" ? "Trauma" : "Memories";
  const availableRows = rowsForTab(tab);
  const requestedRow = Number.parseInt(parameters.get("row") || "1", 10);
  const requestedColumn = Number.parseInt(
    parameters.get("col") || "1",
    10
  );
  const row = availableRows.includes(requestedRow) ? requestedRow : 1;
  const column = [1, 2, 3, 4].includes(requestedColumn)
    ? requestedColumn
    : 1;
  const initialQuery = parameters.get("q") || "";
  const hasLocationParameters = ["tab", "row", "col"].every(
    (parameter) => parameters.has(parameter)
  );
  const hasValidLocationParameters =
    hasLocationParameters &&
    ["memories", "trauma"].includes(requestedTab) &&
    availableRows.includes(requestedRow) &&
    [1, 2, 3, 4].includes(requestedColumn);

  tabSelect.value = tab;
  populateRows(tab, row);
  columnSelect.value = String(column);
  searchInput.value = initialQuery;

  const initialRecord = hasValidLocationParameters
    ? recordsByPosition.get(
        positionKey(tab, row, column)
      )
    : null;

  if (initialQuery.trim()) {
    const initialResults = applySearch({ updateUrl: false });

    if (initialRecord && initialResults.includes(initialRecord)) {
      tabSelect.value = initialRecord.tab;
      populateRows(initialRecord.tab, initialRecord.row);
      columnSelect.value = String(initialRecord.column);
      locateRecord(initialRecord, {
        updateUrl: false,
        mode: "search"
      });
    }
  } else if (initialRecord) {
    locateRecord(initialRecord, {
      updateUrl: false,
      mode: "location"
    });
  }

  window.addEventListener("pageshow", () => {
    if (searchInput.value.trim()) {
      return;
    }

    const quartoSearchMark = document.querySelector("main mark");
    const recoveredQuery = normalizeText(
      quartoSearchMark?.textContent || ""
    );

    if (recoveredQuery) {
      searchInput.value = recoveredQuery;
      applySearch();
    }
  }, { once: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();
