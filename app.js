/* =========================================================
   KEYTAG — логика редактора
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
    theme: "light",
    overrides: {}
  };

  /* ---------- состояние и хранилище ---------- */

  const STORE_KEY = "keytag.studio.v1";

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

  /* Первый запуск: берём тёмную тему, если она включена в системе */
  try {
    if (localStorage.getItem(STORE_KEY) === null &&
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      state.theme = "dark";
    }
  } catch (err) { /* если localStorage недоступен — остаётся светлая тема */ }

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
    document.title = t("docTitle");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("docDesc"));

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
  const annotR = $("#annotR");
  const guidesEl = $("#guides");

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
    updateAnnot();
    renderGuides();
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

  /* ---------- тема ---------- */

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme === "dark" ? "dark" : "light");
  }

  /* ---------- тост ---------- */

  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    window.requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- размерные аннотации (только экран) ---------- */

  function fmtNum(v) {
    return (Math.round(v * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 });
  }

  function updateAnnot() {
    const z = state.zoom;
    const r = Number(state.tag.radius) || 0;
    if (annotR) {
      if (r > 0) {
        annotR.textContent = "R " + fmtNum(r);
        annotR.style.left = (state.paper.marginX * MM_PX * z + 4) + "px";
        annotR.style.top = (state.paper.marginY * MM_PX * z + 4) + "px";
        annotR.style.display = "flex";
      } else {
        annotR.style.display = "none";
      }
    }
  }

  /* Направляющие: отрисовываются SVG-оверлеем НАД листом, вне
     масштабируемого слоя (.sheet-scaler), чтобы пунктир не
     растеризовывался при scale() на GPU. Оверлей вне масштабируемого
     слоя, штрихи СПЛОШНЫЕ 1px c vector-effect: non-scaling-stroke —
     выглядят одинаково при любом зуме браузера и не дают субпиксельных
     миганий. Координаты — в пикселях предпросмотра (мм × zoom × MM_PX). */
  function renderGuides() {
    const s = sheetSize();
    const u = MM_PX * state.zoom;
    const r1 = (v) => Math.round(v * 10) / 10;
    const rect = (x, y, w, h, rx, cls) =>
      '<rect class="' + cls + '" x="' + r1(x) + '" y="' + r1(y) +
      '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(rx) + '"/>';
    /* зона печати: рамка внутри полей (видна всегда, повторяет CSS-поля) */
    let svg = rect(
      state.paper.marginX * u,
      state.paper.marginY * u,
      (s.w - 2 * state.paper.marginX) * u,
      (s.h - 2 * state.paper.marginY) * u,
      2 * u, "print-zone");
    if (state.tag.guides) {
      /* сетка центрируется в листе: повторяем расчёт CSS (.sheet flex + поля) */
      const gridW = state.grid.cols * state.tag.w + (state.grid.cols - 1) * state.tag.gapX;
      const gridH = state.grid.rows * state.tag.h + (state.grid.rows - 1) * state.tag.gapY;
      const baseX = state.paper.marginX + (s.w - 2 * state.paper.marginX - gridW) / 2;
      const baseY = state.paper.marginY + (s.h - 2 * state.paper.marginY - gridH) / 2;
      const radius = Math.max(0, (Number(state.tag.radius) || 0) * u);
      for (let r = 0; r < state.grid.rows; r++) {
        for (let c = 0; c < state.grid.cols; c++) {
          svg += rect(
            (baseX + c * (state.tag.w + state.tag.gapX)) * u,
            (baseY + r * (state.tag.h + state.tag.gapY)) * u,
            state.tag.w * u,
            state.tag.h * u,
            radius, "g");
        }
      }
    }
    guidesEl.innerHTML = '<svg viewBox="0 0 ' + r1(s.w * u) + ' ' + r1(s.h * u) + '">' + svg + '</svg>';
  }

  /* ---------- удобный ввод чисел: выделяем значение при фокусе ---------- */

  panel.addEventListener("focusin", (e) => {
    if (e.target && e.target.matches && e.target.matches('input[type="number"]')) {
      setTimeout(() => { try { e.target.select(); } catch (err) {} }, 0);
    }
  });
  panel.addEventListener("mouseup", (e) => {
    const el = e.target;
    if (el && el.matches && el.matches('input[type="number"]') && el === document.activeElement) {
      e.preventDefault(); // клик не снимает выделение «выбрать всё»
    }
  });

  /* ---------- сброс всех настроек ---------- */

  $("#resetAllBtn").addEventListener("click", () => {
    state = mergeState(DEFAULTS, {
      lang: state.lang,
      theme: state.theme,
      icon: { key: "key", custom: null, pos: "above", size: 7, gap: 1.5 },
      number: { start: 1, pad: 2 },
      overrides: {}
    });
    applyLang();
    applyTheme();
    render();
    toast(t("resetDone"));
  });

  /* ---------- экспорт PNG ---------- */

  function tagSvgData(key) {
    const def = window.ICONS[key] || window.ICONS.key;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      '<g fill="none" stroke="' + state.text.color + '" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + def.svg + "</g></svg>"
    );
  }

  function roundedRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    if (r === 0) { ctx.rect(x, y, w, h); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTextLine(ctx, line, cx, y, font, color, lsPx) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    const chars = Array.from(line);
    if (lsPx === 0 || chars.length < 2) {
      ctx.textAlign = "center";
      ctx.fillText(line, cx, y);
      return;
    }
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + lsPx * (chars.length - 1);
    let x = cx - total / 2;
    ctx.textAlign = "left";
    chars.forEach((c, idx) => {
      ctx.fillText(c, x, y);
      x += widths[idx] + lsPx;
    });
  }

  async function exportPNG() {
    const s = sheetSize();
    const scale = 2; // ≈192 dpi
    const px = MM_PX * scale;
    const cv = document.createElement("canvas");
    cv.width = Math.round(s.w * px);
    cv.height = Math.round(s.h * px);
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cv.width, cv.height);

    const count = countTags();
    const mX = state.paper.marginX * px;
    const mY = state.paper.marginY * px;
    const tw = state.tag.w * px;
    const th = state.tag.h * px;
    const gapX = state.tag.gapX * px;
    const gapY = state.tag.gapY * px;
    const radius = state.tag.radius * px;
    const fontName = fontStack(state.text.font);
    const fontSize = state.text.size * px;
    const lineHeight = state.text.lineHeight;
    const lsPx = state.text.letterSpacing * fontSize;
    const iconSize = state.icon.size * px;
    const iconGap = state.icon.gap * px;
    const withIcon = state.icon.pos !== "none";

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = state.icon.custom ? state.icon.custom : tagSvgData(state.icon.key);
    });

    for (let i = 0; i < count; i++) {
      const col = i % state.grid.cols;
      const row = Math.floor(i / state.grid.cols);
      const x = mX + col * (tw + gapX);
      const y = mY + row * (th + gapY);

      /* фон */
      ctx.fillStyle = state.tag.bg;
      roundedRect(ctx, x, y, tw, th, Math.min(radius, tw / 2, th / 2));
      ctx.fill();

      /* линия реза */
      if (state.tag.cut === "dashed" || state.tag.cut === "solid") {
        ctx.strokeStyle = state.tag.cut === "solid" ? "#1B1915" : "#8C8578";
        ctx.lineWidth = 0.3 * px;
        ctx.setLineDash(state.tag.cut === "dashed" ? [1.2 * px, 1 * px] : []);
        const inset = 0.15 * px;
        roundedRect(ctx, x + inset, y + inset, tw - 2 * inset, th - 2 * inset,
          Math.max(0, Math.min(radius, tw / 2, th / 2) - inset));
        ctx.stroke();
      }
      ctx.setLineDash([]);

      /* текст */
      const text = tagText(i);
      const lines = text.split("\n");
      const totalH = lines.length * fontSize * lineHeight;

      /* иконка + текст */
      ctx.textAlign = "center";
      if (withIcon && img.naturalWidth) {
        const column = state.icon.pos === "above";
        if (column) {
          const stackH = totalH + (withIcon ? iconSize + iconGap : 0);
          const iconTop = y + (th - stackH) / 2;
          ctx.drawImage(img, x + (tw - iconSize) / 2, iconTop, iconSize, iconSize);
          lines.forEach((ln, idx) => {
            drawTextLine(ctx, ln, x + tw / 2,
              iconTop + iconSize + iconGap + (idx + 0.5) * fontSize * lineHeight,
              state.text.weight + " " + fontSize + "px " + fontName, state.text.color, lsPx);
          });
        } else {
          ctx.font = state.text.weight + " " + fontSize + "px " + fontName;
          const maxW = Math.max.apply(null, lines.map((ln) => ctx.measureText(ln).width));
          const blockW = iconSize + iconGap + maxW;
          const blockLeft = x + (tw - blockW) / 2;
          const iconX = state.icon.pos === "right"
            ? x + tw - (tw - blockW) / 2 - iconSize
            : blockLeft;
          const textCx = blockLeft + iconSize + iconGap + maxW / 2;
          const textTopY = y + (th - totalH) / 2;
          ctx.drawImage(img, iconX, y + (th - iconSize) / 2, iconSize, iconSize);
          lines.forEach((ln, idx) => {
            drawTextLine(ctx, ln, textCx, textTopY + (idx + 0.5) * fontSize * lineHeight,
              state.text.weight + " " + fontSize + "px " + fontName, state.text.color, lsPx);
          });
        }
      } else {
        const top = y + (th - totalH) / 2;
        lines.forEach((ln, idx) => {
          drawTextLine(ctx, ln, x + tw / 2, top + (idx + 0.5) * fontSize * lineHeight,
            state.text.weight + " " + fontSize + "px " + fontName, state.text.color, lsPx);
        });
      }
    }

    try {
      const blob = await new Promise((resolve) => cv.toBlob(resolve, "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "keytag-" + state.tag.w + "x" + state.tag.h + "-" + count + "pcs.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) { /* в headless без download нет — не критично */ }
    window.__lastPng = cv.toDataURL("image/png");
    toast(t("pngDone"));
  }

  /* ---------- события шапки/инструментов ---------- */

  $("#themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  });

  $("#pngBtn").addEventListener("click", () => {
    exportPNG();
  });

  /* ---------- запуск ---------- */

  function boot() {
    buildIconPicker();
    applyLang();
    applyTheme();
    try {
      if (state.zoomFit) {
        requestAnimationFrame(() => { fitZoom(); save(); });
      } else {
        applyZoom();
      }
      render();
    } catch (err) {
      /* Самовосстановление: если сохранённое состояние ломает рендер,
         сбрасываем его к заводскому, чтобы интерфейс всегда оживал. */
      console.error("KEYTAG: ошибка рендера, сброс состояния:", err);
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      state = mergeState(DEFAULTS, {});
      try {
        buildIconPicker();
        applyLang();
        applyTheme();
        render();
      } catch (err2) {
        console.error("KEYTAG: повторная ошибка рендера:", err2);
      }
    }
  }
  boot();
})();
