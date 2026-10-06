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

The currently confirmed working baseline before this structural refactor was `v1.3.4`.

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
└── 08-responsive.css

dist/
└── mebtech.css
```

### Ownership

- `01-foundations.css` — fonts + DS tokens.
- `02-reset.css` — minimal browser normalization.
- `03-base.css` — body, typography roles, focus.
- `04-layout.css` — geometry only where possible; existing legacy geometry is preserved.
- `05-components.css` — components + PrestaShop/IQIT/Elementor visual adapters.
- `06-forms.css` — fields and validation.
- `07-utilities.css` — small reusable helpers.
- `08-responsive.css` — all breakpoint overrides + reduced motion.

## Editing rule

Edit `/src`, not `/dist`.

The GitHub Action `.github/workflows/build-css.yml` concatenates source files in the approved cascade order and updates `dist/mebtech.css`.

Do not reorder source files without regression QA: cascade order is part of the implementation contract.

## Release workflow

1. Edit one or more `/src/*.css` files.
2. Commit to `main`.
3. Wait for the **Build MebTech CSS** action to finish.
4. Verify `dist/mebtech.css`.
5. Create a new version tag/release, e.g. `v1.4.1`.
6. Change only the version in the site's CDN `<link>`.
7. Keep the previous tag for instant rollback.

## Governance

- Figma is the visual source of truth.
- Tokens are preferred for systemic values.
- Theme selectors are adapters, not Design System component names.
- Keep `!important` localized to verified theme-integration conflicts.
- Breakpoints remain literal in media queries.
- New components should use existing DS tokens before adding new primitives.
