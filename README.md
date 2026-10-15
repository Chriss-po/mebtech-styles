# MebTech — Design System Assets

Production CSS and JavaScript for the MebTech PrestaShop / IQIT / Elementor storefront.

**Current published baseline:** `v1.6.1`. The unified JS entrypoint is available on `main` only until the next release/tag. Do not change a live CDN URL to an uncreated tag.

## One CSS + one JS on the storefront

After creating and validating a NEW version tag, load both from that SAME tag:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Chriss-po/mebtech-styles@VERSION/dist/mebtech.css">
<script defer src="https://cdn.jsdelivr.net/gh/Chriss-po/mebtech-styles@VERSION/dist/mebtech.js"></script>
```

**Important migration:** Remove/disable the old standalone `mebtech-expandable.js`, `mebtech-desktop-header.js`, and `mebtech-furniture-showcase.js` inclusions when enabling `mebtech.js`. Also remove temporary code from IQIT Global JS and inline `<script>` in Furniture Showcase HTML. Do not load the bundle AND any standalone module together: duplicate event handlers/observers can break interactions.

Load the single JS bundle **once** globally using a theme-wide script slot / footer HTML integration that accepts a `<script src>` tag. If the IQIT "Global JS" field only accepts raw JavaScript and NOT HTML, connect the URL through the theme's external-script setting rather than pasting an HTML `<script>` there. `defer` ensures HTML has parsed before any component starts. Per-widget Elementor blocks hold **HTML only**.

## Source of truth

```text
src/
├── 01-foundations.css        # DS tokens
├── 02-reset.css
├── 03-base.css
├── 04-layout.css
├── 05-components.css
├── 06-forms.css
├── 07-utilities.css
├── 08-responsive.css
├── 09-site-adapters.css
├── 10-desktop-header.css
└── js/
    ├── 01-expandable-hero.js   # Expandable Hero / Showroom Gallery + DS dots
    ├── 02-desktop-header.js    # Native IQIT Desktop Header and cart
    └── 03-furniture-showcase.js# Autoplay slides + mobile swipe

dist/                           # GENERATED, don't edit
├── mebtech.css                  # One CSS entrypoint
├── mebtech.js                   # One JS entrypoint (all three modules)
├── mebtech-expandable.js        # Legacy standalone endpoint
├── mebtech-desktop-header.js    # Legacy standalone endpoint
└── mebtech-furniture-showcase.js# Legacy standalone endpoint

docs/
├── design-system-v1.5.md
└── design-system-v1.5.7.md
```

### Module ownership

- **Expandable Hero / Gallery** — native existing interaction and Design System pagination. Its prior generated `dist/mebtech-expandable.js` is now backed by editable `src/js/01-expandable-hero.js`, preserving the original behavior.
- **Desktop Header** — the approved native IQIT menu, sticky Header and native cart restoration. CSS stays in `src/10-desktop-header.css` and JS source is `src/js/02-desktop-header.js`.
- **Furniture Showcase** — slide transitions, DS Glass benefits, Slick-compatible dots, autoplay every 9 seconds, pausing on hover/focus/background tab/reduced motion, keyboard/dots, **mobile-only swipe at <=767px**. JS source is `src/js/03-furniture-showcase.js`; existing styles remain in the layout/components/responsive CSS layers. No additional Slick initialization.

Each module checks its own HTML selectors and does nothing when its component is absent.

## Build and release

`.github/workflows/build-css.yml` triggers on `src/**` CSS/JS changes. Its deterministic build:
1. Concatenates CSS sources in their existing approved cascade order into `dist/mebtech.css`.
2. Copies each JS module into its existing legacy `dist` endpoint to preserve rollback.
3. Concatenates the **same** JS sources, in the explicit order shown above, into `dist/mebtech.js` with semicolon separators.
4. Commits generated assets back to `main`. Do not edit `dist` manually.

**Release checklist:** commit source -> wait for Action -> verify `dist/mebtech.css` and `dist/mebtech.js` and component smoke tests -> create new version tag FROM the latest build commit -> switch CSS and JS CDN URLs to the same tag -> remove old/inline JS includes -> verify Home, Product, Checkout, custom-furniture pages, Desktop Header/cart and responsive Showcases -> keep previous tag for rollback.

## Governance

- Figma is the visual source of truth; no new design tokens or component styles are created for JS bundling.
- Avoid modifications to existing accepted interactions during source migration.
- Do not reorder CSS or JS modules without regression QA.
- Preserve legacy endpoints for rollback and existing tagged releases.
