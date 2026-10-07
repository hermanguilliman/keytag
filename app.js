/* =========================================================
   БИРКА — логика редактора
   Состояние → рендер сетки в миллиметрах → печать.
   Без сборки и зависимостей: обычные скрипты, работает
   при открытии файла напрямую (file://).
   ========================================================= */

(function () {
  "use strict";

  /* ---------- утилиты ---------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const MM_PX = 96 / 25.4; // CSS-пикселей в 1 мм
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const FORMATS = {
    A4: { w: 210, h: 297 },
    A3: { w: 297, h: 420 },
    Letter: { w: 215.9, h: 279.4 },
    Legal: { w: 215.9, h: 355.6 }
  };

  const DEFAULT_TEMPLATES = { ru: "КЛЮЧ\n№{n}", en: "KEY\n{n}" };

  const DEFAULTS = {
    lang: "ru",
    paper: { format: "A4", orientation: "portrait", marginX: 10, marginY: 10, customW: 200, customH: 280 },
    tag: { w: 50, h: 30, gapX: 3, gapY: 3, radius: 3, cut: "dashed", bg: "#FFFFFF", guides: false },
    grid: { cols: 3, rows: 8 },
    text: {
      template: DEFAULT_TEMPLATES.ru,
      font: "Inter", size: 4.5, weight: 700,
      align: "center", color: "#17140F",
      letterSpacing: 0, lineHeight: 1.15, upper: false
    },
    icon: { key: "key", custom: null, pos: "above", size: 7, gap: 1.5 },
    number: { start: 1, pad: 2 },
    zoom: 1,
    zoomFit: true,
    overrides: {}
  };

  /* ---------- состояние и хранилище ---------- */

  const STORE_KEY = "birka.studio.v1";

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function mergeState(base, extra) {
    const out = {};
    Object.keys(base).forEach((k) => {
      const b = base[k];
      const e = extra && Object.prototype.hasOwnProperty.call(extra, k) ? extra[k] : undefined;
      if (isPlainObject(b)) out[k] = mergeState(b, isPlainObject(e) ? e : {});
      else out[k] = e === undefined ? b : e;
    });
    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      return mergeState(DEFAULTS, JSON.parse(raw));
    } catch (err) {
      return null;
    }
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
      } catch (err) {
        // переполнение (обычно из-за большой картинки) — сохраняем без неё
        try {
          const light = JSON.parse(JSON.stringify(state));
          light.icon.custom = null;
          localStorage.setItem(STORE_KEY, JSON.stringify(light));
        } catch (err2) { /* не критично */ }
      }
    }, 250);
  }

  function getPath(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), state);
  }

  function setPath(path, value) {
    const keys = path.split(".");
    let obj = state;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
  }

  let state = loadState() || mergeState(DEFAULTS, {});

  /* ---------- перевод ---------- */

  function t(key, vars) {
    const dict = window.I18N[state.lang] || window.I18N.ru;
    let s = dict[key];
    if (s === undefined) s = window.I18N.ru[key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(String(vars[k])); });
    }
    return s;
  }

  function applyLang() {
    document.documentElement.lang = state.lang;

    $$("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (el.tagName === "OPTGROUP") el.label = v;
      else el.textContent = v;
    });

    $$("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });

    $$("#iconGrid .icon-btn").forEach((btn) => {
      const def = window.ICONS[btn.dataset.icon];
      if (def) {
        btn.title = def.name[state.lang] || def.name.ru;
        btn.setAttribute("aria-label", btn.title);
      }
    });

    $$(".seg-dark button").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));
  }

  /* ---------- размеры ---------- */

  function sheetSize() {
    let w, h;
    if (state.paper.format === "custom") {
      w = Number(state.paper.customW) || 200;
      h = Number(state.paper.customH) || 280;
    } else {
      const f = FORMATS[state.paper.format] || FORMATS.A4;
      w = f.w; h = f.h;
    }
    if (state.paper.orientation === "landscape") { const tmp = w; w = h; h = tmp; }
    return { w: w, h: h };
  }

  function sheetLabel() {
    return state.paper.format === "custom" ? t("formatCustom") : state.paper.format;
  }

  function countTags() {
    return state.grid.cols * state.grid.rows;
  }

  function fitsSheet() {
    const s = sheetSize();
    const availW = s.w - 2 * state.paper.marginX;
    const availH = s.h - 2 * state.paper.marginY;
    const needW = state.grid.cols * state.tag.w + (state.grid.cols - 1) * state.tag.gapX;
    const needH = state.grid.rows * state.tag.h + (state.grid.rows - 1) * state.tag.gapY;
    return needW <= availW + 0.05 && needH <= availH + 0.05;
  }

  function fitGridToSheet() {
    const s = sheetSize();
    const availW = Math.max(1, s.w - 2 * state.paper.marginX);
    const availH = Math.max(1, s.h - 2 * state.paper.marginY);
    const w = state.tag.w, h = state.tag.h;
    const gx = state.tag.gapX, gy = state.tag.gapY;
    const cols = Math.floor((availW + gx) / (w + gx));
    const rows = Math.floor((availH + gy) / (h + gy));
    state.grid.cols = clamp(cols, 1, 40);
    state.grid.rows = clamp(rows, 1, 80);
  }

  /* ---------- текст бирок ---------- */

  function numberFor(i) {
    const n = state.number.start + i;
    const pad = clamp(Math.round(state.number.pad) || 0, 0, 6);
    return pad > 0 ? String(n).padStart(pad, "0") : String(n);
  }

  function applyCase(s) {
    return state.text.upper ? s.toUpperCase() : s;
  }

  function computedText(i) {
    const raw = String(state.text.template)
      .replace(/\{n\}/g, numberFor(i))
      .replace(/\{total\}/g, String(countTags()));
    return applyCase(raw);
  }

  function tagText(i) {
    const ov = state.overrides[String(i)];
    return ov != null ? applyCase(String(ov)) : computedText(i);
  }

  /* ---------- DOM ---------- */

  const panel = $("#panel");
  const sheet = $("#sheet");
  const grid = $("#grid");
  const frame = $("#sheetFrame");
  const scaler = $("#sheetScaler");
  const stageScroll = $("#stageScroll");
  const sheetCaption = $("#sheetCaption");
  const legend = $("#legend");
  const zoomValue = $("#zoomValue");
  const customSizeRow = $("#customSizeRow");
  const iconGrid = $("#iconGrid");
  const uploadPreview = $("#uploadPreview");
  const iconRemove = $("#iconRemove");

  /* Динамическое @page — размер листа для печати совпадает с настройками */
  const pageStyle = document.createElement("style");
  document.head.appendChild(pageStyle);

  function updatePageRule() {
    const s = sheetSize();
    pageStyle.textContent = "@page{size:" + s.w + "mm " + s.h + "mm;margin:0}";
  }

  /* Стек шрифта: имя из списка + корректный generic-фолбэк,
     чтобы бирка оставалась читаемой и без интернета. */
  const SERIF_FONTS = ["PT Serif", "Playfair Display", "Georgia", "Times New Roman"];
  const SCRIPT_FONTS = ["Caveat"];

  function fontStack(name) {
    let generic = "sans-serif";
    if (SERIF_FONTS.indexOf(name) !== -1) generic = "serif";
    else if (SCRIPT_FONTS.indexOf(name) !== -1) generic = "cursive";
    return '"' + name + '", ' + generic;
  }

  function iconNode() {
    const el = document.createElement("div");
    el.className = "tag-ico";
    if (state.icon.custom) {
      const img = document.createElement("img");
      img.src = state.icon.custom;
      img.alt = "";
      el.appendChild(img);
    } else {
      const def = window.ICONS[state.icon.key] || window.ICONS.key;
      el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + def.svg + "</svg>";
    }
    return el;
  }

  function buildIconPicker() {
    const frag = document.createDocumentFragment();
    window.ICON_ORDER.forEach((key) => {
      const def = window.ICONS[key];
      if (!def) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-btn";
      btn.dataset.icon = key;
      btn.title = def.name[state.lang] || def.name.ru;
      btn.setAttribute("aria-label", btn.title);
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + def.svg + "</svg>";
      frag.appendChild(btn);
    });
    iconGrid.appendChild(frag);
  }

  function renderGrid() {
    const s = sheetSize();

    sheet.style.width = s.w + "mm";
    sheet.style.height = s.h + "mm";
    sheet.style.padding = state.paper.marginY + "mm " + state.paper.marginX + "mm";

    grid.style.gridTemplateColumns = "repeat(" + state.grid.cols + ", " + state.tag.w + "mm)";
    grid.style.gridTemplateRows = "repeat(" + state.grid.rows + ", " + state.tag.h + "mm)";
    grid.style.gap = state.tag.gapY + "mm " + state.tag.gapX + "mm";
    grid.dataset.cut = state.tag.cut;
    grid.classList.toggle("show-guides", !!state.tag.guides);

    const count = countTags();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.style.setProperty("--tag-r", state.tag.radius + "mm");
      tag.style.setProperty("--tag-bg", state.tag.bg);
      tag.style.setProperty("--tag-color", state.text.color);
      tag.style.setProperty("--tf", fontStack(state.text.font));
      tag.style.setProperty("--fs", state.text.size + "mm");
      tag.style.setProperty("--fw", String(state.text.weight));
      tag.style.setProperty("--ta", state.text.align);
      tag.style.setProperty("--ls", state.text.letterSpacing + "em");
      tag.style.setProperty("--lh", String(state.text.lineHeight));
      tag.style.setProperty("--is", state.icon.size + "mm");
      tag.style.setProperty("--ig", state.icon.gap + "mm");

      const content = document.createElement("div");
      content.className = "tag-content";
      content.dataset.iconPos = state.icon.pos;

      if (state.icon.pos !== "none") content.appendChild(iconNode());

      const txt = document.createElement("div");
      txt.className = "tag-text";
      txt.dataset.index = String(i);
      txt.textContent = tagText(i);
      txt.setAttribute("spellcheck", "false");
      txt.setAttribute("contenteditable", "plaintext-only");
      if (!txt.isContentEditable) txt.setAttribute("contenteditable", "true");
      content.appendChild(txt);

      tag.appendChild(content);

      if (hasOverride(i)) tag.classList.add("has-override");

      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "tag-reset";
      reset.dataset.reset = String(i);
      reset.textContent = "\u21BA";
      reset.title = t("resetOverrides");
      reset.setAttribute("aria-label", t("resetOverrides"));
      tag.appendChild(reset);

      frag.appendChild(tag);
    }

    grid.innerHTML = "";
    grid.appendChild(frag);
  }

  function renderCaption() {
    const s = sheetSize();
    sheetCaption.textContent =
      sheetLabel() + " \u00B7 " + s.w + " \u00D7 " + s.h + " " + t("mm") +
      " \u00B7 " + Math.round(state.zoom * 100) + "%";
  }

  function renderLegend() {
    const s = sheetSize();
    const count = countTags();
    const ok = fitsSheet();
    const overrideCount = Object.keys(state.overrides)
      .filter((k) => Number(k) >= 0 && Number(k) < count).length;

    let html = "";
    html += '<span class="badge badge-accent">' + t("lTag", { w: state.tag.w, h: state.tag.h }) + "</span>";
    html += '<span class="badge">' + t("lSheet", { fmt: sheetLabel(), w: s.w, h: s.h }) + "</span>";
    html += "<span class=\"badge\">" + t("lGrid", { cols: state.grid.cols, rows: state.grid.rows }) +
            " \u00B7 <strong>" + t("lCount", { n: count }) + "</strong></span>";
    html += '<span class="badge">' + t("lGap", { gx: state.tag.gapX, gy: state.tag.gapY }) + "</span>";

    if (overrideCount > 0) {
      html += '<span class="badge">' + t("lOverrides", { n: overrideCount }) + "</span>";
    }

    html += '<span class="legend-spacer"></span>';

    if (!ok) {
      html += '<span class="badge badge-warn">' + t("lWarn") + "</span>";
    }

    html += '<span class="badge" title="' + t("printHint") + '">' + t("lPrint") + "</span>";
    html += '<span class="badge">' + t("lEdit") + "</span>";

    legend.innerHTML = html;
  }

  /* ---------- зум ---------- */

  function sheetPixels() {
    const s = sheetSize();
    return { w: s.w * MM_PX, h: s.h * MM_PX };
  }

  function applyZoom() {
    const px = sheetPixels();
    scaler.style.transform = "scale(" + state.zoom + ")";
    frame.style.width = px.w * state.zoom + "px";
    frame.style.height = px.h * state.zoom + "px";
    zoomValue.textContent = Math.round(state.zoom * 100) + "%";
    renderCaption();
  }

  function setZoom(z, isFit) {
    state.zoom = clamp(Math.round(z * 100) / 100, 0.2, 3);
    state.zoomFit = !!isFit;
    applyZoom();
    save();
  }

  function fitZoom() {
    const px = sheetPixels();
    const availW = stageScroll.clientWidth - 70;
    const availH = stageScroll.clientHeight - 96;
    if (availW <= 0 || availH <= 0) return;
    const z = Math.min(availW / px.w, availH / px.h, 1.4);
    state.zoom = clamp(Math.round(z * 100) / 100, 0.2, 3);
    state.zoomFit = true;
    applyZoom();
  }

  /* ---------- синхронизация панели ---------- */

  function syncControls() {
    $$("[data-bind]", panel).forEach((el) => {
      if (document.activeElement === el) return;
      const v = getPath(el.dataset.bind);
      if (el.type === "checkbox") el.checked = !!v;
      else el.value = v === null || v === undefined ? "" : String(v);
    });

    $$("[data-seg]", panel).forEach((seg) => {
      const cur = getPath(seg.dataset.seg);
      $$("button", seg).forEach((b) => {
        b.classList.toggle("active", String(cur) === b.dataset.val);
      });
    });

    $$("[data-color]", panel).forEach((box) => {
      const cur = String(getPath(box.dataset.color) || "").toUpperCase();
      $$(".swatch", box).forEach((sw) => {
        sw.classList.toggle("active", String(sw.dataset.val).toUpperCase() === cur);
      });
    });

    if (customSizeRow) customSizeRow.hidden = state.paper.format !== "custom";

    $$("#iconGrid .icon-btn").forEach((b) => {
      b.classList.toggle("active", !state.icon.custom && b.dataset.icon === state.icon.key);
    });

    if (state.icon.custom) {
      uploadPreview.src = state.icon.custom;
      uploadPreview.hidden = false;
      iconRemove.hidden = false;
    } else {
      uploadPreview.removeAttribute("src");
      uploadPreview.hidden = true;
      iconRemove.hidden = true;
    }
  }

  /* ---------- общий рендер ---------- */

  function render() {
    renderGrid();
    renderLegend();
    applyZoom();
    updatePageRule();
    syncControls();
    save();
  }

  /* ---------- события панели ---------- */

  function coerceValue(el, current) {
    if (el.type === "checkbox") return el.checked;
    if (el.type === "number") {
      if (el.value.trim() === "") return undefined;
      const n = Number(el.value);
      return Number.isNaN(n) ? undefined : n;
    }
    if (el.type === "color") return el.value.toUpperCase();
    if (typeof current === "boolean") return el.value === "true";
    if (typeof current === "number") {
      const n = Number(el.value);
      return Number.isNaN(n) ? el.value : n;
    }
    return el.value;
  }

  panel.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset || !el.dataset.bind) return;
    const next = coerceValue(el, getPath(el.dataset.bind));
    if (next === undefined) return;
    setPath(el.dataset.bind, next);
    render();
  });

  panel.addEventListener("change", (e) => {
    const el = e.target;
    if (el && el.dataset && el.dataset.bind && el.type === "file") return;
    if (el && el.dataset && el.dataset.bind) render();
  });

  panel.addEventListener("click", (e) => {
    /* сегментированные переключатели */
    const segBtn = e.target.closest("[data-seg] button");
    if (segBtn) {
      const seg = segBtn.closest("[data-seg]");
      const cur = getPath(seg.dataset.seg);
      const next = typeof cur === "boolean" ? segBtn.dataset.val === "true" : segBtn.dataset.val;
      setPath(seg.dataset.seg, next);
      render();
      return;
    }

    /* образцы цвета */
    const swatch = e.target.closest(".swatch");
    if (swatch && swatch.closest("[data-color]")) {
      setPath(swatch.closest("[data-color]").dataset.color, swatch.dataset.val);
      render();
      return;
    }

    /* выбор иконки */
    const iconBtn = e.target.closest("[data-icon]");
    if (iconBtn) {
      state.icon.key = iconBtn.dataset.icon;
      state.icon.custom = null;
      render();
      return;
    }

    /* готовые размеры */
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      const parts = preset.dataset.preset.split(",");
      state.tag.w = Number(parts[0]);
      state.tag.h = Number(parts[1]);
      fitGridToSheet();
      render();
      return;
    }
  });

  $("#fitGridBtn").addEventListener("click", () => {
    fitGridToSheet();
    render();
  });

  $("#resetOverrides").addEventListener("click", () => {
    state.overrides = {};
    render();
  });

  iconRemove.addEventListener("click", () => {
    state.icon.custom = null;
    render();
  });

  $("#iconUpload").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.icon.custom = String(reader.result);
      render();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  });

  /* ---------- правка текста прямо на бирке ---------- */

  function hasOverride(i) {
    return Object.prototype.hasOwnProperty.call(state.overrides, String(i));
  }

  function normalizeEditable(el) {
    return el.innerText.replace(/\u00A0/g, " ").replace(/\n+$/g, "");
  }

  /* Сохраняем правку сразу при вводе: фокус может уйти любым способом,
     а состояние должно обновиться в любом случае. */
  function commitOverride(i, el) {
    const value = normalizeEditable(el);
    const key = String(i);
    const before = hasOverride(i);
    if (value === computedText(i)) delete state.overrides[key];
    else state.overrides[key] = value;
    const after = hasOverride(i);
    const changed = before !== after;
    if (changed && el.closest(".tag")) {
      el.closest(".tag").classList.toggle("has-override", after);
      renderLegend();
    }
    save();
    return changed;
  }

  grid.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.classList || !el.classList.contains("tag-text")) return;
    commitOverride(Number(el.dataset.index), el);
  });

  /* Не даём blur увести фокус при клике по кнопке сброса:
     иначе перерисовка успеет удалить кнопку до самого click. */
  grid.addEventListener("mousedown", (e) => {
    if (e.target.closest && e.target.closest(".tag-reset")) e.preventDefault();
  });

  grid.addEventListener("focusout", (e) => {
    const el = e.target;
    if (!el.classList || !el.classList.contains("tag-text")) return;
    if (commitOverride(Number(el.dataset.index), el)) render();
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && e.target.classList && e.target.classList.contains("tag-text")) {
      e.target.blur();
    }
  });

  grid.addEventListener("click", (e) => {
    const reset = e.target.closest(".tag-reset");
    if (reset) {
      e.preventDefault();
      e.stopPropagation();
      delete state.overrides[reset.dataset.reset];
      render();
      return;
    }

    if (e.target.classList && e.target.classList.contains("tag-text")) return;

    const tag = e.target.closest(".tag");
    if (!tag) return;
    const txt = $(".tag-text", tag);
    if (!txt) return;
    txt.focus();
    const range = document.createRange();
    range.selectNodeContents(txt);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  /* ---------- шапка: язык, зум, печать ---------- */

  function setLang(lang) {
    if (lang !== "ru" && lang !== "en") return;
    const prev = state.lang;
    if (state.text.template === DEFAULT_TEMPLATES[prev]) {
      state.text.template = DEFAULT_TEMPLATES[lang];
    }
    state.lang = lang;
    applyLang();
    render();
  }

  $$(".seg-dark [data-lang]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  $("#zoomIn").addEventListener("click", () => setZoom(state.zoom + 0.1, false));
  $("#zoomOut").addEventListener("click", () => setZoom(state.zoom - 0.1, false));
  $("#zoomFit").addEventListener("click", () => { fitZoom(); save(); });

  $("#printBtn").addEventListener("click", () => {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.print();
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!state.zoomFit) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { fitZoom(); save(); }, 150);
  });

  /* ---------- запуск ---------- */

  buildIconPicker();
  applyLang();

  if (state.zoomFit) {
    requestAnimationFrame(() => { fitZoom(); save(); });
  } else {
    applyZoom();
  }

  render();
})();
