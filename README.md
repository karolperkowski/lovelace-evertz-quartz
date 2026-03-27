# lovelace-evertz-quartz — Lovelace Card

[![HACS Custom Repository](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A purpose-built dashboard card for controlling Evertz video routers from Home Assistant.

> **This card requires the integration to be installed first.**
> Integration: [hass_evertz-quartz](https://github.com/karolperkowski/hass_evertz-quartz)

---

## Related Repository

| Repo | Purpose |
|---|---|
| **lovelace-evertz-quartz** (this repo) | Lovelace card — better UI for large routers |
| **[hass_evertz-quartz](https://github.com/karolperkowski/hass_evertz-quartz)** | HA integration — required, install this first |

---

## Why use this card?

Home Assistant's default select entity shows all sources in a single dropdown. For a router with hundreds of sources that becomes unusable. This card solves it with:

- A **Favourites** grid — star your most-used sources so they're always one tap away
- A **search box** that filters all sources instantly as you type
- **Category filters** that group sources automatically (Cameras, Graphics, Playback, etc.)
- A **Matrix view** that shows all destinations as columns and all sources as rows — the classic router control panel layout
- A **confirm dialog** to prevent accidental route changes

---

## Prerequisites

- Home Assistant 2024.6.0 or newer
- [hass_evertz-quartz](https://github.com/karolperkowski/hass_evertz-quartz) integration installed and working
- HACS installed ([hacs.xyz](https://hacs.xyz))

---

## Installation

### Step 1 — Add to HACS

1. Open HACS → **Dashboard**
2. Click ⋮ → **Custom repositories**
3. Add `https://github.com/karolperkowski/lovelace-evertz-quartz` as category **Dashboard**
4. Click **Download**

### Step 2 — Add the JS resource

1. Go to **Settings → Dashboards**
2. Click ⋮ (top right) → **Resources**
3. Click **Add Resource**
4. Enter:
   - **URL:** `/hacsfiles/lovelace-evertz-quartz/evertz-quartz.js`
   - **Type:** JavaScript Module
5. Click **Create**

### Step 3 — Hard refresh your browser

Press **Ctrl + Shift + R** (Windows/Linux) or **Cmd + Shift + R** (Mac).

> If you skip this step the browser may serve a cached version and the card will not appear.

### Step 4 — Add the card to a dashboard

Edit any dashboard, add a card manually, and paste:

```yaml
type: custom:evertz-quartz-card
title: My Router
destinations:
  - entity: select.myrouter_dest_a
    name: DEST-A
```

Replace `select.myrouter_dest_a` with the actual entity ID of your destination. You can find it at **Settings → Devices & Services → Evertz Quartz → your device**.

---

## Card Configuration

### Minimal (single destination)

```yaml
type: custom:evertz-quartz-card
title: My Router
destinations:
  - entity: select.myrouter_dest_a
```

### Multiple destinations

```yaml
type: custom:evertz-quartz-card
title: My Router
destinations:
  - entity: select.myrouter_dest_a
    name: Monitor A
  - entity: select.myrouter_dest_b
    name: Monitor B
  - entity: select.myrouter_dest_c
    name: Record Out
```

### All options

```yaml
type: custom:evertz-quartz-card
title: My Router            # shown in the card header (default: "Quartz Router")
destinations:               # required — at least one destination entity
  - entity: select.myrouter_dest_a
    name: Monitor A         # optional — overrides the entity's friendly name
connection_entity: binary_sensor.myrouter_connected   # optional — shows connected/disconnected badge
categories:                 # optional — custom source grouping rules (regex strings)
  Cameras: "CAM|CAMS"
  Graphics: "VIZ|GFX"
  Playback: "CLIP|DDR|EVS"
  Other: ".*"               # catch-all (always put last)
```

### Options reference

| Option | Required | Default | Description |
|---|---|---|---|
| `title` | No | `Quartz Router` | Router name shown in the card header |
| `destinations` | **Yes** | — | List of destination select entities from the integration |
| `destinations[].entity` | **Yes** | — | Entity ID of the destination select entity |
| `destinations[].name` | No | Entity friendly name | Display name for this destination |
| `connection_entity` | No | — | Binary sensor entity to show connection status badge |
| `categories` | No | Built-in rules | Custom source grouping rules as regex strings |

---

## Using the Card

### Favourites view (default)

When you open the card you see the **Favourites** view. It has two sections:

1. **Favourites** — sources you have starred. Click ★ on any source in the list below to add it here. Click ★ again to remove it. Favourites are saved in your browser and persist across page refreshes.

2. **All Sources** — every source from the router profile. Use the search box to filter by name, or click a category button (Cameras, Graphics, etc.) to narrow the list.

To route a source, click its button. A confirm dialog will appear — click **Take** to execute the route.

### Matrix view

Click **Matrix** in the card header to switch to the crosspoint grid view. Destinations appear as column headers, sources as rows grouped by category.

- The currently active route for each destination is shown with a glowing green dot
- Click any cell to route that source to that destination
- A confirm dialog appears before the route is executed

### Connection status

If you configure `connection_entity`, a badge in the header shows whether the router is connected or disconnected in real time.

### Last take log

The header shows the destination and source of the most recent route change, along with the time it happened.

---

## Default Source Categories

If you do not specify custom `categories`, the card groups sources automatically using these rules:

| Category | Matches |
|---|---|
| Cameras | Names containing `CAM`, `CAMS`, or `CAMTRACK` |
| Graphics | Names containing `VIZ` or ending in a number (e.g. `G1`, `G2K`) |
| Playback | Names containing `CLIP`, `DDR`, `EVS`, or `DDRTV` |
| Switcher | Names containing `MAX` or `ME` followed by a number |
| Program | Names containing `PGM`, `PREVIEW`, or `PRESET` |
| Web/WX | Names containing `WX`, `WEB`, or `TIE` |
| CG | Names containing `FONT` |
| Utility | Names containing `TUNER`, `PATCH`, or `AUX` |
| Test | Names containing `BARS`, `TEST`, `COLOUR`, or `COLOR` |
| Other | Everything else |

---

## Updating the Card

When a new version is released:

1. HACS → Dashboard → Evertz Quartz Router Card → **Update**
2. Hard refresh your browser (Ctrl+Shift+R)

No Home Assistant restart needed — the card is a browser-side resource only.

---

## Troubleshooting

### Card does not appear / "Custom element doesn't exist"

1. Check that the JS resource was added correctly (Settings → Dashboards → Resources)
2. The URL must be exactly `/hacsfiles/lovelace-evertz-quartz/evertz-quartz.js`
3. Hard refresh the browser (Ctrl+Shift+R)
4. Open browser DevTools (F12) → Console tab and look for error messages

### Sources show as "Source 1", "Source 2"

The integration does not have a CSV profile loaded. Upload your `profile_availability.csv` via the integration's Configure panel. See the [integration README](https://github.com/karolperkowski/hass_evertz-quartz) for instructions.

### Card shows no sources at all

Check that the integration is installed and working. The card reads source names from the destination select entity's `options` attribute — if the entity is unavailable the list will be empty.

### Favourites disappeared

Favourites are stored in your browser's localStorage keyed by the card's `title`. If you changed the title, changed browser, or cleared browser data, favourites will be lost.

---

## License

MIT
