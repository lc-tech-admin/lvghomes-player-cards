# Handoff: Leverage Homes Player Cards

## Overview

A FIFA-Ultimate-Team-style "player card" web app for the Leverage Homes sales team. It surfaces individual sales performance (Q1 2026 YTD) for two roles — **VPs (Vice Presidents)** and **AMs (Acquisition Managers)** — with a weighted **Overall** rating, a tier badge (Diamond / Gold / Silver / Bronze), animated stat reveals, a leaderboard, and a side-by-side compare view.

The end goal is a public, mobile-friendly site hosted on **GitHub Pages** at a custom subdomain (e.g. `players.lvghomes.com`), with stats pulled live from a **Google Sheet** via a Google Apps Script Web App backend.

## About the Design Files

The files in this bundle are **design references created in HTML/CSS + inline JSX (Babel-in-browser)**. They are a working prototype that demonstrates intended look, behavior, and data shape — they are **not** production code to ship as-is.

Your task is to recreate this design in a real codebase using a modern build setup. Recommended target: **Vite + React + TypeScript**, deployed to GitHub Pages via a GitHub Actions workflow. The design has no server-side requirements; data comes from a single JSON endpoint.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, animations, and interactions are all baked in. Match them exactly, then layer in your own production patterns (component library, routing, build pipeline, etc.).

---

## Stack & Hosting Plan

### Recommended target stack
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** keep `styles.css` as a global stylesheet (or migrate to CSS Modules / Tailwind — design tokens listed below)
- **Routing:** React Router (4 routes: `/`, `/roster/:role`, `/player/:id`, `/leaderboard`, `/compare`)
- **State:** local React state is sufficient; no global store needed
- **Hosting:** GitHub Pages, deployed via `actions/deploy-pages` on push to `main`
- **Custom domain:** add a `CNAME` file with `players.lvghomes.com` (or similar)

### Backend: Google Apps Script Web App

The sheet owner deploys a small Apps Script as a Web App (`Anyone with link` access). The script reads the `AMs` and `VPs` tabs and returns a single JSON payload. The frontend `fetch`es it on load.

**Apps Script (`Code.gs`) — paste into Extensions → Apps Script in the source sheet:**

```javascript
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = {
    updatedAt: new Date().toISOString(),
    quarter: "Q1 2026",
    vps: readTab(ss.getSheetByName("VPs"), "vp"),
    ams: readTab(ss.getSheetByName("AMs"), "am"),
  };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// Each player block in the sheet is 10 rows:
//   row 0: [Name, Q1, Q2, YTD, GradeWeight, Target, ...]
//   rows 1-9: stat rows (Number of APPTs, 5+ ICP %, ARIP %, ...)
// Blocks are separated by a blank row. Adjust SLOTS to match each tab's stat order.
const VP_SLOTS = ["appts", "contracts", "icp5", "arip", "dealReview",
                  "closedPct", "closedRevAttr", "closedRevQtr", "pipeline"];
const AM_SLOTS = ["appts", "icp5", "arip", "dealReviewLM", "dealReviewLLM",
                  "closedPct", "closedRevAttr", "closedRevQtr", "pipeline"];

function readTab(sheet, role) {
  const rows = sheet.getDataRange().getValues();
  const slots = role === "vp" ? VP_SLOTS : AM_SLOTS;
  const players = [];
  let i = 0;
  while (i < rows.length) {
    const header = rows[i];
    if (!header[0] || header[1] !== "Q1 2026") { i++; continue; }
    const player = { name: header[0], role, stats: {} };
    for (let j = 0; j < slots.length; j++) {
      const r = rows[i + 1 + j];
      if (!r) break;
      // YTD column is index 3 (D)
      player.stats[slots[j]] = parseValue(r[3]);
    }
    players.push(player);
    i += slots.length + 2; // skip block + blank
  }
  return players;
}

function parseValue(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[$,%\s]/g, "");
    const n = parseFloat(cleaned);
    if (!isNaN(n)) return v.includes("%") ? n / 100 : n;
  }
  return 0;
}
```

Deploy → New deployment → Type "Web app" → Execute as "Me" → Access "Anyone" → copy the `/exec` URL.

**Frontend integration:**
Replace the static arrays in `data.js` with:

```javascript
const SHEET_URL = "https://script.google.com/macros/s/XXXXX/exec";
async function loadRoster() {
  const res = await fetch(SHEET_URL, { cache: "no-store" });
  return await res.json(); // { vps: [...], ams: [...] }
}
```

Cache for 5 minutes in `localStorage` to keep page loads snappy.

---

## Screens / Views

### 1. Home (`/`)
- **Purpose:** Pick a role.
- **Layout:** Centered hero (`Individual Performance — Q1 2026`) above two large role tiles in a 2-col grid (1-col on mobile).
- **Role tile:** dark navy gradient (`#0F2A47 → #173D63`), 18px radius, oversized italic abbreviation (`VP` / `AM`) using Fraunces in mint gradient, subtitle ("Vice Presidents" / "Acquisition Managers"), member count in italic Fraunces.
- **Hover:** lift 4px, mint border glow, gradient overlay intensifies.

### 2. Roster (`/roster/:role`)
- **Purpose:** Pick a player from the chosen role.
- **Layout:** Section head ("Vice Presidents" / "Acquisition Managers" + count) with Back button → grid of cells (`auto-fill, minmax(200px, 1fr)`; 2-col on phones).
- **Roster cell:** white card, 12px radius, headshot drop slot (64px circle, navy gradient placeholder w/ gold initial), name in Fraunces, role subtitle, **OVR** number top-right colored by tier (Diamond mint `#1B6F5C`, Gold `#9A6A0E`, Silver navy `#1F507E`, Bronze `#8A4A1A`). Left tier-stripe in matching color.
- **Hover:** 3px lift, mint border, deeper shadow.

### 3. Player Detail (`/player/:id`)
- **Purpose:** Show the full player card + stat breakdown.
- **Layout:** 2-col stage. Left: vertical trading card (380×600, diagonal corner clip-path). Right: name (Fraunces 48px), role, animated count-up Overall (88px italic mint), stat breakdown bars (2-col, 1-col on phones).
- **Card composition:**
  - `--c1`/`--c2` body gradient by tier (diamond=mint, gold=brand emerald, silver=navy-tinted, bronze=warm slate)
  - Gold/mint frame edge (1.5px) using the masked-border technique
  - Role pill (top-left), tier badge (top-right)
  - Headshot drop slot (large)
  - Name banner (Fraunces 36px italic, mint gradient)
  - Stat list (8 rows, each: icon + label + tabular-nums value)
  - Footer cells (Closed Rev Attr / Closed Rev Qtr / Projected Pipeline, mono)
- **Bars:** target tick marker at 100%, value tick at clamped ratio. Animate from 0 to value over 800ms (cubic-bezier-out).

### 4. Leaderboard (`/leaderboard`)
- **Purpose:** Rank everyone by Overall. **Two sections:** VPs first, then AMs, each with its own ranking.
- **Row:** rank (#1, #2 in tier color), name, role+tier sub, mini bar (max = top scorer in that group), Closed Rev Qtr in mono, Overall in italic Fraunces.
- **Mobile:** drop the bar + revenue columns; show rank/name/OVR only.

### 5. Compare (`/compare`)
- **Purpose:** Pick any two players, see stats side-by-side.
- **Layout:** 2 picker columns (each opens a roster modal), then a 3-col diff grid (left value | label | right value). Winner per row highlighted mint (`#1B6F5C`).

### 6. Tweaks Panel (dev-only)
- Floating panel toggled via `?edit` or host iframe message. Lets you flip accent (emerald/navy/gold), animation intensity, etc. **Do not ship in production build** — gate behind an env flag.

---

## Interactions & Behavior

- **Page transitions:** 320ms fade-up (`translateY(12px) → 0` + opacity), staggered 40ms per child.
- **Card reveal:** parent fades up, then card scales from 0.96 → 1 over 500ms, glow brightens, stat bars and overall counter animate in 100ms after.
- **Stat count-up:** Overall counts from 0 to value over 1100ms with `easeOutCubic`.
- **Hover:** subtle 3D parallax on the card body (`rotateY` ±4°, `rotateX` ±3°) following the cursor.
- **Drag-and-drop headshots:** any image dropped on a slot persists via `localStorage` keyed by player id. Provide a "Remove photo" button on hover.
- **Reduced motion:** respect `prefers-reduced-motion`; replace transforms with opacity-only.

---

## State Management

- `route` — current view (`'home' | 'roster' | 'player' | 'leaderboard' | 'compare'`)
- `roleFilter` — `'vp' | 'am'`
- `selectedId` — player id
- `comparePicks` — `[id, id]`
- `roster` — fetched roster (cached in `localStorage` for 5min)
- `playerPhotos` — `{ [playerId]: dataUrl }` in `localStorage`

---

## Design Tokens

### Colors (light theme)
| Token | Value | Use |
|-|-|-|
| `--brand-navy` | `#0F2A47` | Primary brand |
| `--brand-mint` | `#3BBFA0` | Primary accent |
| `--brand-mint-light` | `#5FE0BC` | Hover/glow |
| `--brand-mint-deep` | `#1B6F5C` | Diamond tier text |
| `--text` | `#0F2A47` | Body text |
| `--text-2` | `#4A6786` | Secondary |
| `--text-3` | `#6A839E` | Muted |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-2` | `#F7F5F0` | Page bg highlights |
| `--bg` | `linear-gradient(180deg, #F1EFEA, #E9E6DF)` | Page background |
| `--line` | `rgba(15,42,71,0.10)` | Borders |
| `--line-strong` | `rgba(15,42,71,0.18)` | Strong borders |

### Tier colors
| Tier | OVR range | Card body gradient | Text color (light theme) |
|-|-|-|-|
| Diamond | 90+ | mint (`#3BBFA0 → #0F2A47`) | `#1B6F5C` |
| Gold | 80–89 | brand emerald (`#3BBFA0 → #173D63`) | `#9A6A0E` |
| Silver | 70–79 | navy-tinted slate | `#1F507E` |
| Bronze | <70 | warm slate | `#8A4A1A` |

### Typography
- **Display:** Fraunces (Google Fonts), weights 400/500/600, italic for emphasis
- **UI:** Inter, weights 400/500/600/700
- **Mono / numerics:** JetBrains Mono (tabular-nums)

Type scale: H1 hero `clamp(44px, 6.4vw, 84px)` · Section H2 `clamp(32px, 4vw, 48px)` · Player name `48px` · Overall `88px` · Body `14–16px` · Labels `10–11px / 0.18em letterspace / uppercase`.

### Spacing / Radius / Shadow
- Container max width: `1200px`, padding `0 24px` (12px on mobile)
- Card radius: `18px` (role tiles), `12px` (roster), `24px` (player card with corner clip-path)
- Shadow: `0 12px 28px rgba(15,42,71,0.10)` for hover; `0 30px 60px -20px rgba(0,0,0,0.6)` for role tiles

---

## Overall Rating Formula

Implemented in `overall.js`. For each player:

1. For each stat, compute `ratio = clamp(value / target, 0, 1.25)` (soft 125% cap).
2. Weighted sum: `earned = Σ(ratio_k * weight_k)`, `total = Σ(weight_k)`.
3. `normalized = (earned / total) * 99`
4. `overall = round(min(99, normalized * 1.05))`, floored at 1.

Weights match the sheet's "Grade Weight" column. Tiers: 90+ Diamond, 80+ Gold, 70+ Silver, <70 Bronze.

---

## Stat Keys (must match Apps Script output)

**VPs:** `appts`, `contracts`, `icp5`, `arip`, `dealReview`, `closedPct`, `closedRevAttr`, `closedRevQtr`, `pipeline`
**AMs:** `appts`, `icp5`, `arip`, `dealReviewLM`, `dealReviewLLM`, `closedPct`, `closedRevAttr`, `closedRevQtr`, `pipeline`

Percentages are stored as decimals (`0.0852` not `8.52%`); revenue as raw dollars.

---

## Roster (current sheet)

**VPs (3):** Sam Dogbe, Joey Szal, Ray O'Donnell
**AMs (10):** Bhavin Shroff, Erick Bonilla, Nick Miller, Oscar Malik, Irish Manoguid, Francis Qhobosheane, Rodney Malloy, Billy Liapis, Luke Nam, Brian Chacon

The sheet is the source of truth — the frontend should never hardcode the list past initial scaffolding.

---

## Mobile / Responsive

Breakpoints in `styles.css`:
- `≤980px` — stage stacks, role tiles 1-col, compare 1-col
- `≤720px` — topbar wraps, hero shrinks, roster goes 2-col, leaderboard drops bar/revenue cols, player card scales to viewport, detail header stacks
- `(hover: none)` — disable all `:hover` lift transforms

Add a `<meta name="apple-mobile-web-app-capable" content="yes">` and a 192/512 PNG icon set so reps can pin to home screens.

---

## Accessibility

- All interactive elements use `<button>`; provide `aria-label` for icon-only controls
- Color contrast meets WCAG AA on light theme (verified for OVR numbers, body text, muted text)
- Honor `prefers-reduced-motion`
- Roster grid items are keyboard-navigable; `Enter` opens the player

---

## Deployment Checklist

1. Scaffold Vite + React + TS app
2. Port `app.jsx` → `App.tsx`, `card.jsx` → `PlayerCard.tsx`, etc. Keep `styles.css` as `index.css`.
3. Replace inline-Babel script tags with proper imports.
4. Type the data shape (`Player`, `Stats`, etc.).
5. Wire `fetch(SHEET_URL)` with localStorage caching.
6. Add React Router; map the 5 routes.
7. Strip the Tweaks panel from production builds.
8. Configure `vite.config.ts` `base: '/repo-name/'` (or `/` if using a custom domain).
9. Add GitHub Actions workflow:
   ```yaml
   # .github/workflows/deploy.yml
   on: { push: { branches: [main] } }
   permissions: { contents: read, pages: write, id-token: write }
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20 }
         - run: npm ci && npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: dist }
         - uses: actions/deploy-pages@v4
   ```
10. Enable GitHub Pages → Source: GitHub Actions.
11. Add `public/CNAME` with the custom subdomain; configure DNS CNAME → `<owner>.github.io`.
12. Test on iOS Safari + Android Chrome at 375px width.

---

## Files in this bundle

| File | Role |
|-|-|
| `Player Cards.html` | Entry point — inlines fonts, mounts React, includes script tags for everything else |
| `app.jsx` | Top-level App: routing, Home/Roster/Detail/Leaderboard/Compare components |
| `card.jsx` | The `PlayerCard` component (the FIFA-style trading card) |
| `data.js` | Roster + YTD stats + grade weights (replace with Sheets fetch in production) |
| `overall.js` | Weighted Overall calculation + tier mapping |
| `styles.css` | All styling, tokens, animations, responsive breakpoints |
| `tweaks-panel.jsx` | Dev-only customization panel — gate behind env flag |
| `image-slot.js` | `<image-slot>` web component used for drag-drop headshots; in production, swap for an `<img src>` once real headshots are uploaded to a CDN or `public/headshots/<id>.jpg` |

---

## Open questions for the developer

1. Where will real headshots live? Suggested: `public/headshots/<player-id>.jpg`, fall back to the gradient placeholder if missing.
2. Auth — is the site fully public or should it be behind a basic password gate? (GitHub Pages doesn't support server auth; if you need a gate, host on Cloudflare Pages instead and use Cloudflare Access.)
3. Month-over-month trends — the user wants sparklines next to each stat once the sheet has historical data. The `History` tab schema isn't defined yet; coordinate with the user on the format.
