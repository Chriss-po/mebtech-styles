# MebTech CSS

Production CSS for the MebTech PrestaShop / IQIT site.

## Production connection

The site loads one versioned stylesheet:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/Chriss-po/mebtech-styles@VERSION/dist/mebtech.css"
>
```

Current published baseline: `v1.6.1`. Furniture Showcase enhancements are pending a separate version tag and site deployment.

## Architecture

```text
src/
├── 01-foundations.css
├── 02-reset.css
├── 03-base.css
├── 04-layout.css
├── 05-components.css
├── 06-forms.css
├── 07-utilities.css
├── 08-responsive.css
├── 09-site-adapters.css
├── 10-desktop-header.css
├── 10-desktop-header.js
└── 11-furniture-showcase.js

dist/
├── mebtech.css
├── mebtech-expandable.js
├── mebtech-desktop-header.js
└── mebtech-furniture-showcase.js

docs/
├── design-system-v1.5.md
└── design-system-v1.5.7.md
```

### Ownership

- `01-foundations.css` — fonts + DS tokens.
- `02-reset.css` — minimal browser normalization.
- `03-base.css` — body, typography roles, focus.
- `04-layout.css` — geometry only where possible; existing legacy geometry is preserved.
- `05-components.css` — components + PrestaShop/IQIT/Elementor visual adapters.
- `06-forms.css` — fields and validation.
- `07-utilities.css` — small reusable helpers.
- `08-responsive.css` — core responsive overrides + reduced motion.
- `09-site-adapters.css` — approved mobile IQIT Header, SVG brand logo, DS pager placement, legacy veil fallback and mobile Hero motion.
- `10-desktop-header.css` — Desktop Header v4.5 and IQIT native global vertical mega-menu CSS, appended after existing adapters.
- `10-desktop-header.js` — Desktop Header v4.5 behavior; source of generated `dist/mebtech-desktop-header.js`.
- `11-furniture-showcase.js` — Furniture Showcase behavior; reuses existing DS images, Glass links and Slick-compatible pagination. Supports autoplay, accessible dot navigation, focus/visibility pauses and mobile-only swipe.
- `dist/mebtech-expandable.js` — shared Expandable Hero / Gallery interaction behavior.
- `dist/mebtech-desktop-header.js` — separate Desktop Header script; load **once** after theme markup with the matching release CSS. Keep IQIT global Vertical Menu enabled.
- `dist/mebtech-furniture-showcase.js` — showcase controller. Load **once** in site Global JS / footer via `<script defer src="https://cdn.jsdelivr.net/gh/Chriss-po/mebtech-styles@VERSION/dist/mebtech-furniture-showcase.js"></script>`, with VERSION matching stylesheet. Remove the showcase inline script and static pagination HTML; module generates existing DS `.slick-dots` elements from the slide count. No new Slick initialization.
- `docs/design-system-v1.5.md` — v1.5 historical contract.
- `docs/design-system-v1.5.7.md` — current approved 13 Oct 2026 adaptations.

## Editing rule

Edit `/src`, not `/dist`.

The GitHub Action `.github/workflows/build-css.yml` concatenates source files in the approved cascade order, updates `dist/mebtech.css`, and copies Desktop Header JS into `dist/mebtech-desktop-header.js` and Furniture Showcase JS into `dist/mebtech-furniture-showcase.js`.

Do not reorder source files without regression QA: cascade order is part of the implementation contract.

## Release workflow

1. Edit one or more `/src/*.css` files.
2. Commit to `main`.
3. Wait for the **Build MebTech CSS** action to finish.
4. Verify `dist/mebtech.css`.
5. Create a new version tag/release only after the build has committed `dist/mebtech.css`, `dist/mebtech-desktop-header.js` and `dist/mebtech-furniture-showcase.js`.
   For Desktop Header v4.5, the site must use the same version for CSS and Header JS; before enabling the new release, remove the standalone Global CSS/JS v4.5 test snippets to avoid double initialization.
6. Change only the version in the site's CDN `<link>`.
7. Keep the previous tag for instant rollback.

## Governance

- Figma is the visual source of truth.
- Tokens are preferred for systemic values.
- Theme selectors are adapters, not Design System component names.
- Keep `!important` localized to verified theme-integration conflicts.
- Breakpoints remain literal in media queries.
- New components should use existing DS tokens before adding new primitives.
