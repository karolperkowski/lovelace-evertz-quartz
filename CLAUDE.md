# lovelace-evertz-quartz — Session Reference

## Repository
**https://github.com/karolperkowski/lovelace-evertz-quartz**

HACS custom repository — Category: Dashboard (Plugin)

Companion card for the **hass_evertz-quartz** integration:
**https://github.com/karolperkowski/hass_evertz-quartz**

---

## What This Is

A purpose-built Lovelace custom element (`custom:evertz-quartz-card`) for
controlling Evertz EQX / EQT video routers from a Home Assistant dashboard.
Provides a more usable UI than the default select entity dropdown for large
router profiles (e.g. 1164 sources).

---

## File Structure

```
lovelace-evertz-quartz/
  dist/
    evertz-quartz.js     Single-file custom element — all HTML/CSS/JS inline
  hacs.json              Category: plugin, render_readme: true
  README.md
  CLAUDE.md
```

### HACS naming convention
The `lovelace-` prefix allows HACS to accept `evertz-quartz.js` as the
valid filename (repo name with `lovelace-` stripped). HACS serves it at:
```
/hacsfiles/lovelace-evertz-quartz/evertz-quartz.js
```

---

## Card Registration

```javascript
customElements.define('evertz-quartz-card', EvertzQuartzCard);

window.customCards.push({
  type: 'evertz-quartz-card',
  name: 'Evertz Quartz Router',
  description: '...',
});
```

Console registration message on load:
```
EVERTZ-QUARTZ-CARD v1.0.0
```

---

## Card Config

```yaml
type: custom:evertz-quartz-card
title: My Router              # optional, shown in header
destinations:                 # required
  - entity: select.myrouter_dest_a
    name: DEST-A              # optional, overrides entity friendly name
  - entity: select.myrouter_dest_b
    name: DEST-B
connection_entity: binary_sensor.myrouter_connected   # optional
categories:                   # optional custom source grouping (regex strings)
  Cameras: "CAM|CAMS"
  Graphics: "VIZ|GFX"
  Playback: "CLIP|DDR|EVS"
```

---

## Architecture

Single vanilla JS class extending `HTMLElement` with Shadow DOM.
No external dependencies, no build step required.

### State (all in-memory)
- `_view` — 'fav' | 'matrix'
- `_selectedDest` — index into config.destinations for fav view
- `_search` / `_matrixSearch` — search box values
- `_category` — active category filter
- `_pending` — pending route take awaiting confirm dialog
- `_lastTake` — last take info for header display
- `_favs` — Set of starred source names (persisted to localStorage)

### Key methods
- `setConfig(config)` — called by HA with card YAML config
- `set hass(hass)` — called by HA on every state update
- `_render()` — full re-render via `shadowRoot.innerHTML`
- `_bindEvents()` — attaches event listeners after innerHTML
- `_requestTake(destIdx, srcName)` — shows confirm dialog
- `_doTake(destIdx, srcName)` — calls `hass.callService('select', 'select_option')`
- `renderFav()` / `renderMatrix()` — view-specific HTML strings

### Data flow
1. `hass.states[dest.entity]` → `state.state` = current source name
2. `state.attributes.options` = full source list (from HA select entity)
3. On route: `hass.callService('select', 'select_option', {entity_id, option})`
4. HA integration sends `.SV` to router, updates entity state
5. If MAGNUM sends `.UV`, integration updates entity, `set hass` fires, card re-renders

### Favourites persistence
```javascript
localStorage.setItem('evertz-quartz-card-favs-{title}', JSON.stringify([...favs]))
```
Keyed by `config.title` so multiple routers have separate favourite lists.

### Source categories
Default grouping rules (regex applied to source name):
```javascript
Cameras:  /CAM|CAMS|CAMTRACK/i
Graphics: /VIZ|G\d+K?$/i
Playback: /CLIP|DDR|EVS|DDRTV/i
Switcher: /MAX|ME\d/i
Program:  /PGM|PREVIEW|PRESET/i
Web/WX:   /WX|WEB|TIE/i
CG:       /FONT/i
Utility:  /TUNER|PATCH|AUX/i
Test:     /BARS|TEST|COLOUR|COLOR/i
Other:    (everything else)
```
Custom rules can be passed via `categories:` in card config.

---

## Installation

1. HACS → Dashboard → ⋮ → Custom repositories
2. URL: `https://github.com/karolperkowski/lovelace-evertz-quartz`
3. Category: **Dashboard**
4. Download
5. Settings → Dashboards → Resources → Add Resource:
   - URL: `/hacsfiles/lovelace-evertz-quartz/evertz-quartz.js`
   - Type: JavaScript Module
6. Hard refresh (Ctrl+Shift+R)

---

## Updating

When `dist/evertz-quartz.js` is updated in the repo:
1. HACS → Dashboard → Evertz Quartz Router Card → Update
2. Hard refresh browser (Ctrl+Shift+R)

No HA restart required — the card is a browser-side resource only.

---

## Rules

- **Never put real IP addresses, source names, destination names, or
  entity IDs in documentation examples or Claude artifacts.**
  Use generic placeholders: `router.local`, `MY-ROUTER`, `DEST-A`,
  `SRC-001`, `select.myrouter_dest_a`.

- The card must remain a single file with no external dependencies
  and no build step. All CSS/HTML/JS inline in `dist/evertz-quartz.js`.

- Card type stays `custom:evertz-quartz-card` regardless of filename changes.

- When updating the card, also update the version constant `CARD_VERSION`
  inside the JS file and push to this repo. The main integration repo
  (`hass_evertz-quartz`) does not need updating for card-only changes.
