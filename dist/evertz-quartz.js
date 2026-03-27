/**
 * evertz-quartz-card — Lovelace card for Evertz Quartz Router integration
 * https://github.com/karolperkowski/lovelace-evertz-quartz
 *
 * RULES:
 *  - Single file, no build step, no external dependencies
 *  - Card type stays custom:evertz-quartz-card
 *  - No real IPs, source names, or entity IDs in examples
 *
 * Config:
 *   type: custom:evertz-quartz-card
 *   title: My Router
 *   destinations:
 *     - entity: select.myrouter_dest_a
 *       name: DEST-A
 *   connection_entity: binary_sensor.myrouter_connected
 */

const CARD_VERSION = '2.0.0';
const STORAGE_KEY_PREFIX = 'evertz-quartz-card-v2-';

// ── Colours ────────────────────────────────────────────────────────────────
// Lighter, higher contrast dark theme. Still unmistakably dark but readable.
const STYLES = `
  :host {
    --c-bg:       #151820;
    --c-s1:       #1c2030;
    --c-s2:       #222840;
    --c-s3:       #2a3150;
    --c-border:   #2e3a54;
    --c-border2:  #3d4e6e;
    --c-text:     #e2e8f0;
    --c-dim:      #8899b4;
    --c-muted:    #4a5a78;
    --c-accent:   #38bdf8;
    --c-accent2:  #38bdf820;
    --c-active:   #34d399;
    --c-active2:  #34d39920;
    --c-warn:     #fb923c;
    --c-warn2:    #fb923c20;
    --c-r:        8px;
    --c-r-sm:     5px;
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Card ──────────────────────────────────────────────────── */
  .card {
    background: var(--c-bg);
    border-radius: var(--c-r);
    border: 1px solid var(--c-border);
    overflow: hidden;
    width: 100%;
  }

  /* ── Header ────────────────────────────────────────────────── */
  .hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    background: var(--c-s1);
    border-bottom: 1px solid var(--c-border);
    gap: 10px;
    flex-wrap: wrap;
  }

  .hdr-left { display: flex; align-items: center; gap: 10px; min-width: 0; }

  .title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--c-accent);
    white-space: nowrap;
  }

  .pill {
    display: flex; align-items: center; gap: 5px;
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 9px; border-radius: 20px; border: 1px solid; flex-shrink: 0;
    transition: all .3s;
  }
  .pill.connected { color: var(--c-active); border-color: var(--c-active); background: var(--c-active2); }
  .pill.disconnected { color: var(--c-warn); border-color: var(--c-warn); background: var(--c-warn2); }
  .pill.unknown { color: var(--c-dim); border-color: var(--c-border); }

  .pill-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: currentColor; box-shadow: 0 0 5px currentColor;
  }
  .pill.connected .pill-dot { animation: blink 2s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  .hdr-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .last-take { font-size: 11px; color: var(--c-dim); }
  .last-take .t-src { color: var(--c-active); font-weight: 600; }

  .vtog { display: flex; border: 1px solid var(--c-border); border-radius: var(--c-r-sm); overflow: hidden; }
  .vbtn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; font-size: 11px; font-weight: 600; letter-spacing: 1px;
    border: none; background: transparent; color: var(--c-dim); cursor: pointer;
    transition: all .15s; white-space: nowrap;
  }
  .vbtn + .vbtn { border-left: 1px solid var(--c-border); }
  .vbtn.on { background: var(--c-s2); color: var(--c-accent); }
  .vbtn:hover:not(.on) { color: var(--c-text); }

  /* ── Dest chips ─────────────────────────────────────────────── */
  .dest-row { display: flex; gap: 8px; padding: 12px 16px; flex-wrap: wrap; border-bottom: 1px solid var(--c-border); }

  .dest-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; border-radius: var(--c-r-sm);
    background: var(--c-s1); border: 1px solid var(--c-border);
    cursor: pointer; transition: all .15s; user-select: none;
  }
  .dest-chip:hover { border-color: var(--c-border2); }
  .dest-chip.on { border-color: var(--c-accent); background: var(--c-accent2); }

  .dc-name { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--c-dim); }
  .dest-chip.on .dc-name { color: var(--c-accent); }
  .dc-src { font-size: 11px; color: var(--c-active); font-weight: 600; }

  /* ── Toolbar ─────────────────────────────────────────────────── */
  .toolbar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-bottom: 1px solid var(--c-border);
    flex-wrap: wrap; background: var(--c-s1);
  }

  .search-wrap {
    flex: 1; min-width: 160px; display: flex; align-items: center; gap: 7px;
    background: var(--c-bg); border: 1px solid var(--c-border);
    border-radius: var(--c-r-sm); padding: 7px 12px;
    transition: border-color .15s;
  }
  .search-wrap:focus-within { border-color: var(--c-accent); }
  .search-wrap input {
    background: none; border: none; outline: none;
    font-size: 13px; color: var(--c-text); width: 100%;
  }
  .search-wrap input::placeholder { color: var(--c-muted); }

  .tool-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: var(--c-r-sm);
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    border: 1px solid var(--c-border); background: transparent;
    color: var(--c-dim); cursor: pointer; transition: all .15s;
    white-space: nowrap;
  }
  .tool-btn:hover { color: var(--c-text); border-color: var(--c-border2); }
  .tool-btn.on { background: var(--c-accent2); border-color: var(--c-accent); color: var(--c-accent); }

  /* ── Sources body ───────────────────────────────────────────── */
  .sources-body {
    overflow-y: auto;
    max-height: 60vh;
    padding: 12px 16px;
  }
  .sources-body::-webkit-scrollbar { width: 4px; }
  .sources-body::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 2px; }

  /* Favourites section */
  .fav-section { margin-bottom: 16px; }

  .group-hdr {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px; cursor: pointer; user-select: none;
  }
  .group-hdr-label {
    font-size: 10px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: var(--c-dim); white-space: nowrap;
  }
  .group-hdr-line { flex: 1; height: 1px; background: var(--c-border); }
  .group-hdr-count {
    font-size: 10px; color: var(--c-muted); letter-spacing: 1px;
  }

  /* Source grid */
  .src-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 5px;
  }

  /* Source button — star is a SIBLING span, not a nested button */
  .src-wrap { position: relative; }

  .src-btn {
    width: 100%;
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 2px; padding: 9px 28px 9px 11px;
    background: var(--c-s1); border: 1px solid var(--c-border);
    border-radius: var(--c-r-sm); cursor: pointer;
    transition: all .12s; text-align: left;
  }
  .src-btn:hover { border-color: var(--c-border2); background: var(--c-s2); transform: translateY(-1px); }
  .src-btn:active { transform: scale(.98); }
  .src-btn.active { background: var(--c-active2); border-color: var(--c-active); }

  .src-name { font-size: 12px; font-weight: 600; color: var(--c-text); line-height: 1.3; word-break: break-all; }
  .src-btn.active .src-name { color: var(--c-active); }

  /* Star — span positioned over the button, not inside it */
  .star {
    position: absolute; top: 5px; right: 6px;
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: var(--c-muted); cursor: pointer;
    border-radius: 3px; transition: color .12s, background .12s;
    z-index: 1;
  }
  .star:hover { color: var(--c-warn); background: var(--c-warn2); }
  .star.on { color: var(--c-warn); }

  .empty-msg {
    padding: 20px; text-align: center;
    font-size: 12px; color: var(--c-muted); letter-spacing: 1px;
  }

  /* ── Matrix view ────────────────────────────────────────────── */
  .matrix-outer { display: flex; flex-direction: column; max-height: 65vh; }

  .matrix-hdr {
    display: flex; flex-shrink: 0;
    background: var(--c-s1); border-bottom: 1px solid var(--c-border);
    position: sticky; top: 0; z-index: 3;
  }

  .matrix-corner {
    width: 160px; flex-shrink: 0;
    padding: 10px 14px; border-right: 1px solid var(--c-border);
  }

  .matrix-corner input {
    width: 100%; background: var(--c-s2); border: 1px solid var(--c-border);
    border-radius: var(--c-r-sm); padding: 5px 9px;
    font-size: 11px; color: var(--c-text); outline: none;
  }
  .matrix-corner input:focus { border-color: var(--c-accent); }
  .matrix-corner input::placeholder { color: var(--c-muted); }

  .matrix-dest-hdrs { display: flex; overflow-x: hidden; flex: 1; }

  .mdh {
    flex-shrink: 0; width: 140px; padding: 8px 12px;
    border-right: 1px solid var(--c-border);
  }
  .mdh:last-child { border-right: none; }
  .mdh-name { font-size: 12px; font-weight: 700; color: var(--c-accent); display: block; margin-bottom: 2px; }
  .mdh-src { font-size: 11px; color: var(--c-active); font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .matrix-body { display: flex; overflow-y: auto; flex: 1; }
  .matrix-body::-webkit-scrollbar { width: 4px; }
  .matrix-body::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 2px; }

  .matrix-labels { width: 160px; flex-shrink: 0; background: var(--c-s1); border-right: 1px solid var(--c-border); }

  .matrix-scroll { flex: 1; overflow-x: auto; }
  .matrix-scroll::-webkit-scrollbar { height: 4px; }
  .matrix-scroll::-webkit-scrollbar-thumb { background: var(--c-border2); border-radius: 2px; }

  .matrix-inner { display: flex; flex-direction: column; }

  .grp-sep { display: flex; background: var(--c-s2); border-bottom: 1px solid var(--c-border); height: 26px; align-items: center; }
  .grp-sep-lbl {
    width: 160px; flex-shrink: 0; padding: 0 14px;
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--c-dim); border-right: 1px solid var(--c-border);
  }
  .grp-sep-cells { display: flex; }
  .grp-sep-cell { flex-shrink: 0; width: 140px; border-right: 1px solid var(--c-border); }

  .mrow { display: flex; border-bottom: 1px solid var(--c-border); height: 38px; transition: background .08s; }
  .mrow:hover { background: #ffffff06; }

  .mrow-lbl {
    width: 160px; flex-shrink: 0; display: flex; align-items: center;
    padding: 0 14px; border-right: 1px solid var(--c-border); background: var(--c-s1);
  }
  .mrow-name { font-size: 12px; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }

  .mrow-cells { display: flex; }

  .mcell {
    flex-shrink: 0; width: 140px; height: 38px;
    border-right: 1px solid var(--c-border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .08s; position: relative;
  }
  .mcell:last-child { border-right: none; }
  .mcell:hover { background: var(--c-accent2); }
  .mcell.active { background: var(--c-active2); }
  .mcell.active::after { content: ''; position: absolute; inset: 0; border: 1px solid var(--c-active); pointer-events: none; }

  .cdot {
    width: 10px; height: 10px; border-radius: 50%;
    border: 1.5px solid var(--c-border2); transition: all .1s;
  }
  .mcell:hover .cdot { border-color: var(--c-accent); background: var(--c-accent2); }
  .mcell.active .cdot { background: var(--c-active); border-color: var(--c-active); box-shadow: 0 0 8px var(--c-active); }

  /* ── Footer ─────────────────────────────────────────────────── */
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 16px; background: var(--c-s1); border-top: 1px solid var(--c-border);
    flex-wrap: wrap; gap: 8px;
  }
  .footer-stat { font-size: 11px; color: var(--c-muted); }
  .footer-stat b { color: var(--c-dim); }

  /* ── Confirm overlay ─────────────────────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; opacity: 0; pointer-events: none; transition: opacity .2s;
  }
  .overlay.show { opacity: 1; pointer-events: all; }

  .dialog {
    background: var(--c-s1); border: 1px solid var(--c-border2);
    border-radius: var(--c-r); padding: 22px 26px;
    max-width: 340px; width: 90%;
    box-shadow: 0 24px 60px rgba(0,0,0,.7);
    transform: scale(.95); transition: transform .2s;
  }
  .overlay.show .dialog { transform: scale(1); }

  .dlg-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--c-dim); margin-bottom: 16px; }

  .route-prev { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .rbox { flex: 1; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--c-r-sm); padding: 10px; }
  .rbox .rl { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--c-muted); margin-bottom: 4px; }
  .rbox .rv { font-size: 15px; font-weight: 700; color: var(--c-text); }
  .rarrow { font-size: 18px; color: var(--c-accent); }

  .dlg-btns { display: flex; gap: 8px; }
  .dbtn {
    flex: 1; padding: 9px; border-radius: var(--c-r-sm);
    font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; border: 1px solid; transition: all .15s;
  }
  .dbtn.cancel { background: transparent; border-color: var(--c-border2); color: var(--c-dim); }
  .dbtn.cancel:hover { border-color: var(--c-warn); color: var(--c-warn); }
  .dbtn.take { background: var(--c-active2); border-color: var(--c-active); color: var(--c-active); }
  .dbtn.take:hover { background: var(--c-active); color: #000; box-shadow: 0 0 14px var(--c-active); }
`;

// ── Icons ──────────────────────────────────────────────────────────────────
const I = {
  star:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  grid:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  favs:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  search: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  group:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></svg>`,
};

// ── Grouping helpers ───────────────────────────────────────────────────────
/**
 * Group sources by their name prefix — strip trailing digits.
 * "57CAM1" → "57CAM", "47DDR7" → "47DDR", "BARS" → "BARS"
 * Returns an ordered Map: prefix → [source, ...]
 */
function groupByPrefix(srcs) {
  const groups = new Map();
  for (const s of srcs) {
    const key = s.name.replace(/\d+$/, '') || s.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return groups;
}

// ── Card class ─────────────────────────────────────────────────────────────
class EvertzQuartzCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._config   = null;
    this._hass     = null;
    this._view     = 'fav';      // 'fav' | 'matrix'
    this._selDest  = 0;
    this._search   = '';
    this._mSearch  = '';
    this._grouped  = true;       // toggle: grouped vs flat list
    this._pending  = null;
    this._lastTake = null;
    this._favs     = new Set();
    this._storeKey = '';
  }

  setConfig(config) {
    if (!config.destinations?.length) throw new Error('evertz-quartz-card: destinations required');
    this._config   = config;
    this._storeKey = STORAGE_KEY_PREFIX + (config.title || 'default');
    try {
      const s = localStorage.getItem(this._storeKey);
      if (s) this._favs = new Set(JSON.parse(s));
    } catch (_) {}
    this._render();
  }

  set hass(hass) { this._hass = hass; this._render(); }

  // ── Helpers ────────────────────────────────────────────────────────────────
  _saveFavs() {
    try { localStorage.setItem(this._storeKey, JSON.stringify([...this._favs])); } catch (_) {}
  }

  _destState(i) {
    if (!this._hass || !this._config) return null;
    const d = this._config.destinations[i];
    return d ? (this._hass.states[d.entity] || null) : null;
  }

  _destName(i) {
    const d = this._config.destinations[i];
    if (!d) return '—';
    if (d.name) return d.name;
    const st = this._destState(i);
    return st ? (st.attributes.friendly_name || d.entity) : d.entity;
  }

  _activeSrc(i) {
    const st = this._destState(i);
    return st ? st.state : '—';
  }

  _allSources(i) {
    const st = this._destState(i);
    if (!st) return [];
    return (st.attributes.options || []).map(name => ({ name }));
  }

  _connected() {
    if (!this._config || !this._hass) return null;
    if (this._config.connection_entity) {
      const st = this._hass.states[this._config.connection_entity];
      if (st) return st.state === 'on';
    }
    const st = this._destState(0);
    if (!st) return null;
    return st.state !== 'unavailable';
  }

  _fmt(d) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }

  // ── Route ──────────────────────────────────────────────────────────────────
  _requestTake(destIdx, srcName) {
    this._pending = { destIdx, srcName };
    const r = this.shadowRoot;
    r.querySelector('#cdest').textContent = this._destName(destIdx);
    r.querySelector('#csrc').textContent  = srcName;
    r.querySelector('#overlay').classList.add('show');
  }

  _doTake(destIdx, srcName) {
    const d = this._config.destinations[destIdx];
    if (!d || !this._hass) return;
    this._hass.callService('select', 'select_option', { entity_id: d.entity, option: srcName });
    this._lastTake = { destName: this._destName(destIdx), srcName, time: new Date() };
    this._render();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  _render() {
    if (!this._config) return;

    const conn        = this._connected();
    const connClass   = conn === null ? 'unknown' : conn ? 'connected' : 'disconnected';
    const connText    = conn === null ? 'Unknown'  : conn ? 'Connected' : 'Disconnected';
    const title       = this._config.title || 'Quartz Router';
    const totalSrcs   = this._allSources(this._selDest).length;

    const lastTakeHtml = this._lastTake
      ? `${this._lastTake.destName} → <span class="t-src">${this._lastTake.srcName}</span> @ ${this._fmt(this._lastTake.time)}`
      : 'No takes this session';

    // Destination chips
    const chips = this._config.destinations.map((d, i) => `
      <div class="dest-chip ${i === this._selDest ? 'on' : ''}" data-destchip="${i}">
        <span class="dc-name">${this._destName(i)}</span>
        <span class="dc-src">${this._activeSrc(i)}</span>
      </div>`).join('');

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="card">

        <!-- Header -->
        <div class="hdr">
          <div class="hdr-left">
            <span class="title">${title}</span>
            <div class="pill ${connClass}">
              <div class="pill-dot"></div>
              <span>${connText}</span>
            </div>
          </div>
          <div class="hdr-right">
            <span class="last-take">${lastTakeHtml}</span>
            <div class="vtog">
              <button class="vbtn ${this._view === 'fav' ? 'on' : ''}" id="btn-fav">${I.favs} Favourites</button>
              <button class="vbtn ${this._view === 'matrix' ? 'on' : ''}" id="btn-matrix">${I.grid} Matrix</button>
            </div>
          </div>
        </div>

        <!-- Destination selector -->
        <div class="dest-row">${chips}</div>

        <!-- Body -->
        <div id="body">
          ${this._view === 'matrix' ? this._renderMatrix() : this._renderFav()}
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="footer-stat">Sources: <b>${totalSrcs}</b> &nbsp;·&nbsp; Destinations: <b>${this._config.destinations.length}</b></span>
          <span class="footer-stat">v${CARD_VERSION}</span>
        </div>

        <!-- Confirm dialog -->
        <div class="overlay" id="overlay">
          <div class="dialog">
            <div class="dlg-title">Confirm Route Take</div>
            <div class="route-prev">
              <div class="rbox"><div class="rl">Destination</div><div class="rv" id="cdest">—</div></div>
              <div class="rarrow">→</div>
              <div class="rbox"><div class="rl">Source</div><div class="rv" id="csrc">—</div></div>
            </div>
            <div class="dlg-btns">
              <button class="dbtn cancel" id="d-cancel">Cancel</button>
              <button class="dbtn take"   id="d-take">Take</button>
            </div>
          </div>
        </div>
      </div>`;

    this._bind();
  }

  // ── Favourites view ────────────────────────────────────────────────────────
  _renderFav() {
    const srcs      = this._allSources(this._selDest);
    const activeSrc = this._activeSrc(this._selDest);

    // Favourites
    const favSrcs = srcs.filter(s => this._favs.has(s.name));
    const favHtml = favSrcs.length
      ? `<div class="fav-section">
           <div class="group-hdr">
             <span class="group-hdr-label">${I.favs} Favourites</span>
             <div class="group-hdr-line"></div>
             <span class="group-hdr-count">${favSrcs.length}</span>
           </div>
           <div class="src-grid">${favSrcs.map(s => this._srcWrap(s.name, s.name === activeSrc)).join('')}</div>
         </div>`
      : '';

    // Filter sources by search
    const q        = this._search.toLowerCase();
    const filtered = q ? srcs.filter(s => s.name.toLowerCase().includes(q)) : srcs;

    // Build source list — grouped or flat
    let listHtml = '';
    if (this._grouped && !q) {
      const groups = groupByPrefix(filtered);
      for (const [prefix, items] of groups) {
        listHtml += `
          <div style="margin-bottom:12px">
            <div class="group-hdr">
              <span class="group-hdr-label">${prefix}</span>
              <div class="group-hdr-line"></div>
              <span class="group-hdr-count">${items.length}</span>
            </div>
            <div class="src-grid">${items.map(s => this._srcWrap(s.name, s.name === activeSrc)).join('')}</div>
          </div>`;
      }
    } else {
      listHtml = filtered.length
        ? `<div class="src-grid">${filtered.map(s => this._srcWrap(s.name, s.name === activeSrc)).join('')}</div>`
        : `<div class="empty-msg">No sources match</div>`;
    }

    return `
      <div class="toolbar">
        <div class="search-wrap">
          ${I.search}
          <input id="search-input" type="text" placeholder="Search ${srcs.length} sources…" value="${this._search}" autocomplete="off">
        </div>
        <button class="tool-btn ${this._grouped ? 'on' : ''}" id="btn-group" title="Toggle grouping">
          ${I.group} ${this._grouped ? 'Grouped' : 'Flat'}
        </button>
      </div>
      <div class="sources-body">
        ${favHtml}
        ${!q ? `<div class="group-hdr" style="margin-bottom:10px">
          <span class="group-hdr-label">All Sources (${srcs.length})</span>
          <div class="group-hdr-line"></div>
        </div>` : ''}
        ${listHtml}
      </div>`;
  }

  /**
   * Source button wrapper — star is a SIBLING span (not nested button).
   * Nested buttons are invalid HTML and cause browser DOM reordering
   * which broke the star/favourite feature.
   */
  _srcWrap(name, isActive) {
    const isFav = this._favs.has(name);
    return `<div class="src-wrap">
      <button class="src-btn ${isActive ? 'active' : ''}" data-src="${name}">
        <span class="src-name">${name}</span>
      </button>
      <span class="star ${isFav ? 'on' : ''}" data-star="${name}" title="${isFav ? 'Remove' : 'Add'} favourite">${I.star}</span>
    </div>`;
  }

  // ── Matrix view ────────────────────────────────────────────────────────────
  _renderMatrix() {
    const destHdrs = this._config.destinations.map((d, i) => `
      <div class="mdh">
        <span class="mdh-name">${this._destName(i)}</span>
        <span class="mdh-src">${this._activeSrc(i)}</span>
      </div>`).join('');

    const srcs0    = this._allSources(0);
    const q        = this._mSearch.toLowerCase();
    const filtered = q ? srcs0.filter(s => s.name.toLowerCase().includes(q)) : srcs0;

    // Group by prefix in matrix too
    const groups   = groupByPrefix(filtered);
    let rows       = '';

    for (const [prefix, items] of groups) {
      const sepCells = this._config.destinations.map(() =>
        `<div class="grp-sep-cell"></div>`).join('');
      rows += `<div class="grp-sep">
        <div class="grp-sep-lbl">${prefix}</div>
        <div class="grp-sep-cells">${sepCells}</div>
      </div>`;

      for (const s of items) {
        const cells = this._config.destinations.map((d, i) => {
          const isActive = this._activeSrc(i) === s.name;
          return `<div class="mcell ${isActive ? 'active' : ''}" data-dest="${i}" data-src="${s.name}" title="${this._destName(i)} → ${s.name}">
            <div class="cdot"></div>
          </div>`;
        }).join('');

        rows += `<div class="mrow">
          <div class="mrow-lbl"><span class="mrow-name">${s.name}</span></div>
          <div class="mrow-cells">${cells}</div>
        </div>`;
      }
    }

    if (!rows) rows = `<div class="empty-msg">No sources match</div>`;

    return `<div class="matrix-outer">
      <div class="matrix-hdr">
        <div class="matrix-corner">
          <input id="matrix-search" type="text" placeholder="Filter…" value="${this._mSearch}" autocomplete="off">
        </div>
        <div class="matrix-dest-hdrs">${destHdrs}</div>
      </div>
      <div class="matrix-body">
        <div class="matrix-labels"></div>
        <div class="matrix-scroll">
          <div class="matrix-inner">${rows}</div>
        </div>
      </div>
    </div>`;
  }

  // ── Event binding ──────────────────────────────────────────────────────────
  _bind() {
    const r = this.shadowRoot;

    // View toggle
    r.querySelector('#btn-fav')?.addEventListener('click',    () => { this._view = 'fav';    this._render(); });
    r.querySelector('#btn-matrix')?.addEventListener('click', () => { this._view = 'matrix'; this._render(); });

    // Grouped toggle
    r.querySelector('#btn-group')?.addEventListener('click',  () => { this._grouped = !this._grouped; this._render(); });

    // Dest chips
    r.querySelectorAll('[data-destchip]').forEach(el => {
      el.addEventListener('click', () => { this._selDest = +el.dataset.destchip; this._render(); });
    });

    // Source buttons — only on the button itself, not the star span
    r.querySelectorAll('.src-btn').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.src;
        if (name && name !== this._activeSrc(this._selDest)) this._requestTake(this._selDest, name);
      });
    });

    // Stars — spans, not buttons, so no nesting conflict
    r.querySelectorAll('.star[data-star]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const name = el.dataset.star;
        if (!name) return;
        if (this._favs.has(name)) this._favs.delete(name);
        else this._favs.add(name);
        this._saveFavs();
        this._render();
      });
    });

    // Matrix cells
    r.querySelectorAll('.mcell').forEach(el => {
      el.addEventListener('click', () => {
        const di  = +el.dataset.dest;
        const src = el.dataset.src;
        if (this._activeSrc(di) !== src) this._requestTake(di, src);
      });
    });

    // Search
    const si = r.querySelector('#search-input');
    if (si) {
      si.addEventListener('input',   e => { this._search = e.target.value; this._render(); });
      si.addEventListener('keydown', e => e.stopPropagation());
    }
    const ms = r.querySelector('#matrix-search');
    if (ms) {
      ms.addEventListener('input',   e => { this._mSearch = e.target.value; this._render(); });
      ms.addEventListener('keydown', e => e.stopPropagation());
    }

    // Confirm dialog
    r.querySelector('#d-take')?.addEventListener('click', () => {
      if (this._pending) { this._doTake(this._pending.destIdx, this._pending.srcName); this._pending = null; }
      r.querySelector('#overlay').classList.remove('show');
    });
    r.querySelector('#d-cancel')?.addEventListener('click', () => {
      this._pending = null;
      r.querySelector('#overlay').classList.remove('show');
    });
    r.querySelector('#overlay')?.addEventListener('click', e => {
      if (e.target === r.querySelector('#overlay')) {
        this._pending = null;
        r.querySelector('#overlay').classList.remove('show');
      }
    });
  }

  getCardSize() { return 6; }

  static getStubConfig() {
    return {
      title: 'My Router',
      destinations: [{ entity: 'select.myrouter_dest_a', name: 'DEST-A' }],
    };
  }
}

customElements.define('evertz-quartz-card', EvertzQuartzCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'evertz-quartz-card',
  name: 'Evertz Quartz Router',
  description: 'Router control card for Evertz Quartz / MAGNUM systems',
  preview: false,
});

console.info(
  `%c EVERTZ-QUARTZ-CARD %c v${CARD_VERSION} `,
  'background:#38bdf8;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px',
  'background:#1c2030;color:#38bdf8;padding:2px 4px;border-radius:0 3px 3px 0'
);
