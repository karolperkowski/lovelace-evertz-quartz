/**
 * evertz-quartz-card — Lovelace custom card for Evertz Quartz Router integration
 * https://github.com/karolperkowski/hass_evertz-quartz
 *
 * Card config example:
 *
 *   type: custom:evertz-quartz-card
 *   title: CR47                          # optional, defaults to "Quartz Router"
 *   destinations:
 *     - entity: select.cr47_qc4720
 *       name: QC4720                     # optional, overrides entity name
 *     - entity: select.cr47_mon_a
 *       name: MON-A
 *   categories:                          # optional custom category rules
 *     Cameras: "CAM|CAMS"
 *     Graphics: "VIZ|G\\d"
 *     Playback: "CLIP|DDR|EVS"
 *     Program: "PGM|PREVIEW|PRESET"
 *   connection_entity: binary_sensor.cr47_connected   # optional
 */

const CARD_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'evertz-quartz-card-favs-';

// ── Default category rules (regex strings) ────────────────────────────────
const DEFAULT_CATEGORIES = {
  'Cameras':  'CAM|CAMS|CAMTRACK',
  'Graphics': 'VIZ|G\\d+K?$',
  'Playback': 'CLIP|DDR|EVS|DDRTV',
  'Switcher': 'MAX|ME\\d',
  'Program':  'PGM|PREVIEW|PRESET',
  'Web/WX':   'WX|WEB|TIE',
  'CG':       'FONT',
  'Utility':  'TUNER|PATCH|AUX',
  'Test':     'BARS|TEST|COLOUR|COLOR',
};

// ── Styles ────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500&display=swap');

  :host {
    --eq-bg:          #0a0c0f;
    --eq-surface:     #111418;
    --eq-surface2:    #161b22;
    --eq-border:      #1e2530;
    --eq-border-hi:   #2d3748;
    --eq-text:        #c9d1d9;
    --eq-dim:         #4a5568;
    --eq-muted:       #2a3342;
    --eq-accent:      #00d4ff;
    --eq-accent-dim:  #00d4ff18;
    --eq-active:      #00ff88;
    --eq-active-dim:  #00ff8815;
    --eq-warn:        #ff6b35;
    --eq-mono:        'JetBrains Mono', monospace;
    --eq-sans:        'IBM Plex Sans', sans-serif;
    --eq-r:           6px;
    display: block;
    font-family: var(--eq-sans);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Card shell ──────────────────────────────────────────── */
  .card {
    background: var(--eq-bg);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--eq-border);
  }

  /* ── Header ──────────────────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    background: var(--eq-surface);
    border-bottom: 1px solid var(--eq-border);
    gap: 12px;
    flex-wrap: wrap;
  }

  .header-left { display: flex; align-items: center; gap: 10px; }

  .router-title {
    font-family: var(--eq-mono);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--eq-accent);
    text-shadow: 0 0 14px #00d4ff55;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--eq-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
    border: 1px solid;
    transition: all .3s;
  }

  .status-pill.connected { color: var(--eq-active); border-color: #00ff8840; background: var(--eq-active-dim); }
  .status-pill.disconnected { color: var(--eq-warn); border-color: #ff6b3540; background: #ff6b3510; }
  .status-pill.unknown { color: var(--eq-dim); border-color: var(--eq-border); background: transparent; }

  .status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 5px currentColor;
    animation: blink 2s ease-in-out infinite;
  }

  .status-pill.disconnected .status-dot,
  .status-pill.unknown .status-dot { animation: none; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .last-take {
    font-family: var(--eq-mono);
    font-size: 9px;
    color: var(--eq-dim);
    letter-spacing: 1px;
  }

  .last-take .take-src { color: var(--eq-active); }

  .view-toggle {
    display: flex;
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-r);
    overflow: hidden;
  }

  .view-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 11px;
    font-family: var(--eq-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: none;
    background: transparent;
    color: var(--eq-dim);
    cursor: pointer;
    transition: all .15s;
  }

  .view-btn + .view-btn { border-left: 1px solid var(--eq-border); }
  .view-btn.active { background: var(--eq-surface2); color: var(--eq-accent); }
  .view-btn:hover:not(.active) { color: var(--eq-text); }

  /* ── Favourites view ─────────────────────────────────────── */
  .fav-view { padding: 16px 18px; }

  .section { margin-bottom: 20px; }

  .section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .section-title {
    font-family: var(--eq-mono);
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--eq-dim);
    white-space: nowrap;
  }

  .section-line { flex: 1; height: 1px; background: var(--eq-border); }

  /* Destination chips */
  .dest-chips { display: flex; gap: 8px; flex-wrap: wrap; }

  .dest-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 13px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-r);
    cursor: pointer;
    transition: all .15s;
    user-select: none;
  }

  .dest-chip:hover { border-color: var(--eq-border-hi); }

  .dest-chip.selected {
    border-color: var(--eq-accent);
    background: var(--eq-accent-dim);
  }

  .dest-chip-name {
    font-family: var(--eq-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--eq-dim);
  }

  .dest-chip.selected .dest-chip-name { color: var(--eq-accent); }

  .dest-chip-src {
    font-family: var(--eq-mono);
    font-size: 10px;
    color: var(--eq-active);
    letter-spacing: 1px;
  }

  /* Source buttons */
  .src-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 5px;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 5px;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .results-grid::-webkit-scrollbar { width: 3px; }
  .results-grid::-webkit-scrollbar-track { background: transparent; }
  .results-grid::-webkit-scrollbar-thumb { background: var(--eq-border); border-radius: 2px; }

  .src-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    padding: 9px 11px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-r);
    cursor: pointer;
    transition: all .12s;
    text-align: left;
    width: 100%;
  }

  .src-btn:hover { border-color: var(--eq-border-hi); background: var(--eq-surface2); transform: translateY(-1px); }
  .src-btn:active { transform: translateY(0) scale(.98); }

  .src-btn.active {
    background: var(--eq-active-dim);
    border-color: var(--eq-active);
    box-shadow: 0 0 10px #00ff8818;
  }

  .src-btn .sname {
    font-family: var(--eq-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .5px;
    color: var(--eq-text);
    line-height: 1.3;
    word-break: break-all;
    padding-right: 14px;
  }

  .src-btn.active .sname { color: var(--eq-active); }

  .src-btn .snum {
    font-family: var(--eq-mono);
    font-size: 9px;
    color: var(--eq-muted);
    letter-spacing: 1px;
  }

  .src-btn.active .snum { color: #00ff8844; }

  .star-btn {
    position: absolute;
    top: 5px; right: 6px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 11px;
    color: var(--eq-muted);
    padding: 0;
    line-height: 1;
    transition: color .1s, transform .1s;
    z-index: 1;
  }

  .star-btn:hover { color: var(--eq-warn); transform: scale(1.2); }
  .star-btn.on { color: var(--eq-warn); opacity: .9; }

  /* Search */
  .search-row {
    display: flex;
    gap: 7px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .search-wrap {
    flex: 1;
    min-width: 160px;
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-r);
    padding: 8px 12px;
    transition: border-color .15s;
  }

  .search-wrap:focus-within { border-color: var(--eq-accent); }

  .search-wrap input {
    background: none; border: none; outline: none;
    font-family: var(--eq-mono);
    font-size: 12px;
    color: var(--eq-text);
    width: 100%;
    letter-spacing: 1px;
  }

  .search-wrap input::placeholder { color: var(--eq-muted); }

  .search-icon { color: var(--eq-dim); flex-shrink: 0; }

  .cat-filters { display: flex; gap: 5px; flex-wrap: wrap; }

  .cat-btn {
    font-family: var(--eq-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: var(--eq-r);
    border: 1px solid var(--eq-border);
    background: transparent;
    color: var(--eq-dim);
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
  }

  .cat-btn:hover { border-color: var(--eq-border-hi); color: var(--eq-text); }
  .cat-btn.active { background: var(--eq-accent-dim); border-color: var(--eq-accent); color: var(--eq-accent); }

  .empty-msg {
    padding: 24px;
    text-align: center;
    font-family: var(--eq-mono);
    font-size: 10px;
    color: var(--eq-muted);
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  /* ── Matrix view ─────────────────────────────────────────── */
  .matrix-wrap {
    display: flex;
    flex-direction: column;
    max-height: 520px;
    overflow: hidden;
  }

  .matrix-header {
    display: flex;
    background: var(--eq-surface);
    border-bottom: 1px solid var(--eq-border);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 3;
  }

  .matrix-corner {
    width: 150px;
    flex-shrink: 0;
    padding: 10px 14px;
    border-right: 1px solid var(--eq-border);
  }

  .matrix-search-mini {
    background: var(--eq-surface2);
    border: 1px solid var(--eq-border);
    border-radius: 4px;
    padding: 5px 8px;
    font-family: var(--eq-mono);
    font-size: 10px;
    color: var(--eq-text);
    width: 100%;
    outline: none;
    letter-spacing: 1px;
  }

  .matrix-search-mini::placeholder { color: var(--eq-muted); }
  .matrix-search-mini:focus { border-color: var(--eq-accent); }

  .matrix-dest-headers {
    display: flex;
    overflow-x: hidden;
    flex: 1;
  }

  .matrix-dest-hdr {
    flex-shrink: 0;
    width: 130px;
    padding: 8px 12px;
    border-right: 1px solid var(--eq-border);
  }

  .matrix-dest-hdr:last-child { border-right: none; }

  .dh-name {
    font-family: var(--eq-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--eq-accent);
    display: block;
    margin-bottom: 2px;
  }

  .dh-active {
    font-family: var(--eq-mono);
    font-size: 9px;
    color: var(--eq-active);
    letter-spacing: 1px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 110px;
  }

  .matrix-body {
    display: flex;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .matrix-body::-webkit-scrollbar { width: 3px; }
  .matrix-body::-webkit-scrollbar-track { background: transparent; }
  .matrix-body::-webkit-scrollbar-thumb { background: var(--eq-border); border-radius: 2px; }

  .matrix-labels {
    width: 150px;
    flex-shrink: 0;
    border-right: 1px solid var(--eq-border);
    background: var(--eq-surface);
  }

  .matrix-cells-scroll {
    flex: 1;
    overflow-x: auto;
  }

  .matrix-cells-scroll::-webkit-scrollbar { height: 3px; }
  .matrix-cells-scroll::-webkit-scrollbar-track { background: transparent; }
  .matrix-cells-scroll::-webkit-scrollbar-thumb { background: var(--eq-border); border-radius: 2px; }

  .matrix-cells-inner { display: flex; flex-direction: column; }

  .cat-sep {
    display: flex;
    background: var(--eq-surface2);
    border-bottom: 1px solid var(--eq-border);
    height: 28px;
    align-items: center;
  }

  .cat-sep-label {
    width: 150px;
    flex-shrink: 0;
    padding: 0 14px;
    font-family: var(--eq-mono);
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--eq-dim);
    border-right: 1px solid var(--eq-border);
  }

  .cat-sep-cells {
    display: flex;
  }

  .cat-sep-cell {
    flex-shrink: 0;
    width: 130px;
    border-right: 1px solid var(--eq-border);
  }

  .matrix-row {
    display: flex;
    border-bottom: 1px solid var(--eq-border);
    height: 38px;
    transition: background .08s;
  }

  .matrix-row:hover { background: #ffffff04; }

  .matrix-row-lbl {
    width: 150px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    border-right: 1px solid var(--eq-border);
    background: var(--eq-surface);
  }

  .row-lbl-name {
    font-family: var(--eq-mono);
    font-size: 10px;
    font-weight: 600;
    color: var(--eq-text);
    letter-spacing: .5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
  }

  .row-lbl-num {
    font-family: var(--eq-mono);
    font-size: 9px;
    color: var(--eq-muted);
    flex-shrink: 0;
  }

  .matrix-row-cells { display: flex; }

  .m-cell {
    flex-shrink: 0;
    width: 130px;
    height: 38px;
    border-right: 1px solid var(--eq-border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background .08s;
    position: relative;
  }

  .m-cell:last-child { border-right: none; }
  .m-cell:hover { background: var(--eq-accent-dim); }

  .m-cell.active {
    background: var(--eq-active-dim);
  }

  .m-cell.active::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid #00ff8840;
    pointer-events: none;
  }

  .cell-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 1.5px solid var(--eq-border-hi);
    transition: all .1s;
  }

  .m-cell:hover .cell-dot { border-color: var(--eq-accent); background: var(--eq-accent-dim); }

  .m-cell.active .cell-dot {
    background: var(--eq-active);
    border-color: var(--eq-active);
    box-shadow: 0 0 8px var(--eq-active);
  }

  /* ── Footer ───────────────────────────────────────────────── */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 18px;
    background: var(--eq-surface);
    border-top: 1px solid var(--eq-border);
    gap: 10px;
    flex-wrap: wrap;
  }

  .footer-stat {
    font-family: var(--eq-mono);
    font-size: 9px;
    color: var(--eq-muted);
    letter-spacing: 1px;
  }

  .footer-stat b { color: var(--eq-dim); }

  /* ── Confirm overlay ──────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s;
  }

  .overlay.show { opacity: 1; pointer-events: all; }

  .dialog {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border-hi);
    border-radius: 12px;
    padding: 24px 28px;
    max-width: 340px;
    width: 90%;
    box-shadow: 0 32px 80px rgba(0,0,0,.8);
    transform: scale(.94);
    transition: transform .2s;
  }

  .overlay.show .dialog { transform: scale(1); }

  .dialog-title {
    font-family: var(--eq-mono);
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--eq-dim);
    margin-bottom: 18px;
  }

  .route-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .rbox {
    flex: 1;
    background: var(--eq-bg);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-r);
    padding: 10px;
  }

  .rbox .rlbl {
    font-family: var(--eq-mono);
    font-size: 8px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--eq-muted);
    margin-bottom: 4px;
  }

  .rbox .rval {
    font-family: var(--eq-mono);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--eq-text);
  }

  .rarrow { font-size: 16px; color: var(--eq-accent); flex-shrink: 0; }

  .dialog-btns { display: flex; gap: 8px; }

  .dbtn {
    flex: 1;
    padding: 9px;
    border-radius: var(--eq-r);
    font-family: var(--eq-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid;
    transition: all .15s;
  }

  .dbtn.cancel { background: transparent; border-color: var(--eq-border); color: var(--eq-dim); }
  .dbtn.cancel:hover { border-color: var(--eq-warn); color: var(--eq-warn); }
  .dbtn.take { background: var(--eq-active-dim); border-color: var(--eq-active); color: var(--eq-active); }
  .dbtn.take:hover { background: var(--eq-active); color: #000; box-shadow: 0 0 16px var(--eq-active); }

  /* ── Error state ──────────────────────────────────────────── */
  .error-card {
    padding: 24px;
    font-family: var(--eq-mono);
    font-size: 11px;
    color: var(--eq-warn);
    letter-spacing: 1px;
    background: var(--eq-bg);
    border-radius: 12px;
    border: 1px solid #ff6b3533;
  }

  .error-card h3 {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
`;

// ── SVG icons ─────────────────────────────────────────────────────────────
const ICON_STAR = `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const ICON_GRID = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;
const ICON_FAV  = `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const ICON_SEARCH = `<svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;

// ── Card class ────────────────────────────────────────────────────────────
class EvertzQuartzCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;

    // UI state
    this._view = 'fav';           // 'fav' | 'matrix'
    this._selectedDest = 0;       // index into config.destinations
    this._search = '';
    this._matrixSearch = '';
    this._category = 'All';
    this._pending = null;         // { destIdx, srcName }
    this._lastTake = null;        // { destName, srcName, time }
    this._favs = new Set();
    this._storageKey = '';

    this._categories = {};
    this._categoryList = [];
  }

  // ── HA config ────────────────────────────────────────────────────────────
  setConfig(config) {
    if (!config.destinations || !config.destinations.length) {
      throw new Error('evertz-quartz-card: destinations list is required');
    }

    this._config = config;
    this._storageKey = STORAGE_KEY_PREFIX + (config.title || 'default');

    // Load favourites from localStorage
    try {
      const saved = localStorage.getItem(this._storageKey);
      if (saved) this._favs = new Set(JSON.parse(saved));
    } catch (_) {}

    // Build category rules
    const ruleDefs = config.categories || DEFAULT_CATEGORIES;
    this._categories = {};
    for (const [name, pattern] of Object.entries(ruleDefs)) {
      this._categories[name] = new RegExp(pattern, 'i');
    }
    this._categoryList = ['All', ...Object.keys(this._categories), 'Other'];

    this._render();
  }

  // ── HA state ─────────────────────────────────────────────────────────────
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  _getCategory(name) {
    for (const [cat, re] of Object.entries(this._categories)) {
      if (re.test(name)) return cat;
    }
    return 'Other';
  }

  _saveFavs() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify([...this._favs]));
    } catch (_) {}
  }

  _destState(destIdx) {
    if (!this._hass || !this._config) return null;
    const dest = this._config.destinations[destIdx];
    if (!dest) return null;
    return this._hass.states[dest.entity] || null;
  }

  _destName(destIdx) {
    const dest = this._config.destinations[destIdx];
    if (!dest) return '—';
    if (dest.name) return dest.name;
    const st = this._destState(destIdx);
    return st ? (st.attributes.friendly_name || dest.entity) : dest.entity;
  }

  _activeSrc(destIdx) {
    const st = this._destState(destIdx);
    return st ? st.state : '—';
  }

  _allSources(destIdx) {
    const st = this._destState(destIdx);
    if (!st) return [];
    return (st.attributes.options || []).map((name, idx) => ({ name, idx }));
  }

  _isConnected() {
    if (!this._config || !this._hass) return null;
    if (this._config.connection_entity) {
      const st = this._hass.states[this._config.connection_entity];
      if (st) return st.state === 'on';
    }
    // Fall back to checking if any dest entity is available
    const first = this._destState(0);
    if (!first) return null;
    return first.state !== 'unavailable';
  }

  _fmt(d) {
    return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  }

  // ── Route action ──────────────────────────────────────────────────────────
  _requestTake(destIdx, srcName) {
    this._pending = { destIdx, srcName };
    const dlg = this.shadowRoot.querySelector('.overlay');
    this.shadowRoot.querySelector('#cdest').textContent = this._destName(destIdx);
    this.shadowRoot.querySelector('#csrc').textContent = srcName;
    dlg.classList.add('show');
  }

  _doTake(destIdx, srcName) {
    const dest = this._config.destinations[destIdx];
    if (!dest || !this._hass) return;
    this._hass.callService('select', 'select_option', {
      entity_id: dest.entity,
      option: srcName,
    });
    this._lastTake = { destName: this._destName(destIdx), srcName, time: new Date() };
    this._render();
  }

  // ── Main render ───────────────────────────────────────────────────────────
  _render() {
    if (!this._config) return;

    const connected = this._isConnected();
    const statusClass = connected === null ? 'unknown' : connected ? 'connected' : 'disconnected';
    const statusText = connected === null ? 'Unknown' : connected ? 'Connected' : 'Disconnected';

    const title = this._config.title || 'Quartz Router';
    const totalSrcs = this._allSources(this._selectedDest).length;

    const lastTakeHtml = this._lastTake
      ? `${this._lastTake.destName} → <span class="take-src">${this._lastTake.srcName}</span> @ ${this._fmt(this._lastTake.time)}`
      : 'No takes this session';

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="card">

        <div class="header">
          <div class="header-left">
            <span class="router-title">${title}</span>
            <div class="status-pill ${statusClass}">
              <div class="status-dot"></div>
              <span>${statusText}</span>
            </div>
          </div>
          <div class="header-right">
            <span class="last-take">${lastTakeHtml}</span>
            <div class="view-toggle">
              <button class="view-btn ${this._view==='fav'?'active':''}" id="btn-fav">${ICON_FAV} Favourites</button>
              <button class="view-btn ${this._view==='matrix'?'active':''}" id="btn-matrix">${ICON_GRID} Matrix</button>
            </div>
          </div>
        </div>

        <div id="body">${this._view === 'matrix' ? this._renderMatrix() : this._renderFav()}</div>

        <div class="footer">
          <span class="footer-stat">Sources: <b>${totalSrcs}</b> &nbsp;|&nbsp; Destinations: <b>${this._config.destinations.length}</b></span>
          <span class="footer-stat">v${CARD_VERSION}</span>
        </div>

        <div class="overlay" id="overlay">
          <div class="dialog">
            <div class="dialog-title">Confirm Route Take</div>
            <div class="route-preview">
              <div class="rbox"><div class="rlbl">Destination</div><div class="rval" id="cdest">—</div></div>
              <div class="rarrow">→</div>
              <div class="rbox"><div class="rlbl">Source</div><div class="rval" id="csrc">—</div></div>
            </div>
            <div class="dialog-btns">
              <button class="dbtn cancel" id="d-cancel">Cancel</button>
              <button class="dbtn take" id="d-take">Take</button>
            </div>
          </div>
        </div>

      </div>
    `;

    this._bindEvents();
  }

  // ── Favourites view ────────────────────────────────────────────────────────
  _renderFav() {
    const srcs = this._allSources(this._selectedDest);
    const activeSrc = this._activeSrc(this._selectedDest);

    // Destination chips
    const chips = this._config.destinations.map((d, i) => `
      <div class="dest-chip ${i===this._selectedDest?'selected':''}" data-destchip="${i}">
        <span class="dest-chip-name">${this._destName(i)}</span>
        <span class="dest-chip-src">${this._activeSrc(i)}</span>
      </div>
    `).join('');

    // Favourites
    const favSrcs = srcs.filter(s => this._favs.has(s.name));
    const favHtml = favSrcs.length
      ? `<div class="src-grid">${favSrcs.map(s => this._srcBtn(s.name, s.name === activeSrc, true)).join('')}</div>`
      : `<div class="empty-msg">No favourites yet — click ★ on any source</div>`;

    // Search results
    const q = this._search.toLowerCase();
    const filtered = srcs.filter(s => {
      const matchQ = !q || s.name.toLowerCase().includes(q);
      const matchCat = this._category === 'All' || this._getCategory(s.name) === this._category;
      return matchQ && matchCat;
    });

    const catBtns = this._categoryList.map(c =>
      `<button class="cat-btn ${this._category===c?'active':''}" data-cat="${c}">${c}</button>`
    ).join('');

    const resultsHtml = filtered.length
      ? `<div class="results-grid">${filtered.map(s => this._srcBtn(s.name, s.name === activeSrc, this._favs.has(s.name))).join('')}</div>`
      : `<div class="empty-msg">No sources match</div>`;

    return `<div class="fav-view">
      <div class="section">
        <div class="section-head"><span class="section-title">Destination</span><div class="section-line"></div></div>
        <div class="dest-chips">${chips}</div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">Favourites</span><div class="section-line"></div></div>
        ${favHtml}
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">All Sources (${srcs.length})</span><div class="section-line"></div></div>
        <div class="search-row">
          <div class="search-wrap">${ICON_SEARCH}<input id="search-input" type="text" placeholder="Search…" value="${this._search}" autocomplete="off"></div>
          <div class="cat-filters">${catBtns}</div>
        </div>
        ${resultsHtml}
      </div>
    </div>`;
  }

  _srcBtn(name, isActive, isFav) {
    return `<button class="src-btn ${isActive?'active':''}" data-src="${name}">
      <button class="star-btn ${isFav?'on':''}" data-star="${name}" title="${isFav?'Remove':'Add'} favourite">${ICON_STAR}</button>
      <span class="sname">${name}</span>
    </button>`;
  }

  // ── Matrix view ────────────────────────────────────────────────────────────
  _renderMatrix() {
    const destHeaders = this._config.destinations.map((d, i) => `
      <div class="matrix-dest-hdr">
        <span class="dh-name">${this._destName(i)}</span>
        <span class="dh-active">${this._activeSrc(i)}</span>
      </div>
    `).join('');

    // Group sources by category
    const srcs0 = this._allSources(0);
    const q = this._matrixSearch.toLowerCase();
    const filtered = q ? srcs0.filter(s => s.name.toLowerCase().includes(q)) : srcs0;

    const groups = {};
    for (const s of filtered) {
      const cat = this._getCategory(s.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }

    let rowsHtml = '';
    for (const [cat, srcs] of Object.entries(groups)) {
      // Category separator
      const sepCells = this._config.destinations.map(() =>
        `<div class="cat-sep-cell"></div>`
      ).join('');
      rowsHtml += `<div class="cat-sep">
        <div class="cat-sep-label">${cat}</div>
        <div class="cat-sep-cells">${sepCells}</div>
      </div>`;

      // Source rows
      for (const s of srcs) {
        const cells = this._config.destinations.map((d, i) => {
          const isActive = this._activeSrc(i) === s.name;
          return `<div class="m-cell ${isActive?'active':''}" data-dest="${i}" data-src="${s.name}" title="${this._destName(i)} → ${s.name}">
            <div class="cell-dot"></div>
          </div>`;
        }).join('');

        rowsHtml += `<div class="matrix-row">
          <div class="matrix-row-lbl">
            <span class="row-lbl-name">${s.name}</span>
          </div>
          <div class="matrix-row-cells">${cells}</div>
        </div>`;
      }
    }

    if (!rowsHtml) rowsHtml = `<div class="empty-msg">No sources match</div>`;

    return `<div class="matrix-wrap">
      <div class="matrix-header">
        <div class="matrix-corner">
          <input class="matrix-search-mini" id="matrix-search" type="text" placeholder="Filter…" value="${this._matrixSearch}" autocomplete="off">
        </div>
        <div class="matrix-dest-headers">${destHeaders}</div>
      </div>
      <div class="matrix-body">
        <div class="matrix-labels"></div>
        <div class="matrix-cells-scroll">
          <div class="matrix-cells-inner">${rowsHtml}</div>
        </div>
      </div>
    </div>`;
  }

  // ── Event binding ──────────────────────────────────────────────────────────
  _bindEvents() {
    const root = this.shadowRoot;

    // View toggle
    root.querySelector('#btn-fav')?.addEventListener('click', () => {
      this._view = 'fav'; this._render();
    });
    root.querySelector('#btn-matrix')?.addEventListener('click', () => {
      this._view = 'matrix'; this._render();
    });

    // Destination chips
    root.querySelectorAll('[data-destchip]').forEach(el => {
      el.addEventListener('click', () => {
        this._selectedDest = +el.dataset.destchip;
        this._render();
      });
    });

    // Source buttons
    root.querySelectorAll('.src-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-star]')) return;
        const name = el.dataset.src;
        const active = this._activeSrc(this._selectedDest);
        if (name && name !== active) this._requestTake(this._selectedDest, name);
      });
    });

    // Star buttons
    root.querySelectorAll('[data-star]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = el.dataset.star;
        if (this._favs.has(name)) this._favs.delete(name);
        else this._favs.add(name);
        this._saveFavs();
        this._render();
      });
    });

    // Category filters
    root.querySelectorAll('[data-cat]').forEach(el => {
      el.addEventListener('click', () => {
        this._category = el.dataset.cat; this._render();
      });
    });

    // Matrix cells
    root.querySelectorAll('.m-cell').forEach(el => {
      el.addEventListener('click', () => {
        const destIdx = +el.dataset.dest;
        const srcName = el.dataset.src;
        if (this._activeSrc(destIdx) !== srcName) this._requestTake(destIdx, srcName);
      });
    });

    // Search inputs
    const si = root.querySelector('#search-input');
    if (si) {
      si.addEventListener('input', e => { this._search = e.target.value; this._render(); });
      si.addEventListener('keydown', e => e.stopPropagation());
    }

    const ms = root.querySelector('#matrix-search');
    if (ms) {
      ms.addEventListener('input', e => { this._matrixSearch = e.target.value; this._render(); });
      ms.addEventListener('keydown', e => e.stopPropagation());
    }

    // Confirm dialog
    root.querySelector('#d-take')?.addEventListener('click', () => {
      if (this._pending) {
        this._doTake(this._pending.destIdx, this._pending.srcName);
        this._pending = null;
      }
      root.querySelector('#overlay').classList.remove('show');
    });

    root.querySelector('#d-cancel')?.addEventListener('click', () => {
      this._pending = null;
      root.querySelector('#overlay').classList.remove('show');
    });

    root.querySelector('#overlay')?.addEventListener('click', (e) => {
      if (e.target === root.querySelector('#overlay')) {
        this._pending = null;
        root.querySelector('#overlay').classList.remove('show');
      }
    });
  }

  getCardSize() { return 6; }

  static getConfigElement() {
    return document.createElement('evertz-quartz-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'CR47',
      destinations: [
        { entity: 'select.cr47_qc4720', name: 'QC4720' },
      ],
    };
  }
}

customElements.define('evertz-quartz-card', EvertzQuartzCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'evertz-quartz-card',
  name: 'Evertz Quartz Router',
  description: 'Matrix router control card for Evertz Quartz / MAGNUM systems',
  preview: false,
});

console.info(`%c EVERTZ-QUARTZ-CARD %c v${CARD_VERSION} `, 
  'background:#00d4ff;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px',
  'background:#161b22;color:#00d4ff;padding:2px 4px;border-radius:0 3px 3px 0'
);
