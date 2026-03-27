# lovelace-evertz-quartz

A purpose-built Lovelace card for controlling Evertz EQX / EQT video routers via the [hass_evertz-quartz](https://github.com/karolperkowski/hass_evertz-quartz) Home Assistant integration.

## Requirements

The [Evertz Quartz Router integration](https://github.com/karolperkowski/hass_evertz-quartz) must be installed and configured first.

## Installation via HACS

1. Add this repository to HACS as a **Dashboard** custom repository
2. Download it
3. Add the resource — HACS will prompt you, or add it manually:
   ```
   /hacsfiles/lovelace-evertz-quartz/evertz-quartz.js
   ```
   Type: **JavaScript Module**
4. Hard refresh your browser (Ctrl+Shift+R)

## Card configuration

```yaml
type: custom:evertz-quartz-card
title: My Router
destinations:
  - entity: select.myrouter_dest_a
    name: DEST-A
```

### Full options

```yaml
type: custom:evertz-quartz-card
title: My Router            # optional — shown in header
destinations:               # required — list of destination select entities
  - entity: select.myrouter_dest_a
    name: DEST-A            # optional — overrides entity friendly name
  - entity: select.myrouter_dest_b
    name: DEST-B
connection_entity: binary_sensor.myrouter_connected   # optional
categories:                 # optional — custom source grouping (regex)
  Cameras: "CAM|CAMS"
  Graphics: "VIZ|GFX"
  Playback: "CLIP|DDR|EVS"
```

## Features

- **Favourites view** — star sources for quick access, search all sources below
- **Matrix view** — destinations as columns, sources as rows, grouped by category
- **Confirm before take** — confirm dialog prevents accidental routes
- **Connection status** — live badge in header
- **Last take log** — destination, source, timestamp of last route change
- **Persistent favourites** — saved to browser localStorage per router title
- **Category filters** — sources auto-grouped from names, customisable via config

## Views

### Favourites + Search
Click ★ on any source to pin it to the Favourites section. The search box below filters all sources instantly. Category filter buttons narrow the list further.

### Matrix
Switch to Matrix view for a full crosspoint grid — destinations as columns, sources as rows. Active routes highlighted with a green dot. Click any cell to route.
