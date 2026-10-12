# Changelog

## v1.5.2 — Category Quick Nav release fix

- Added the accepted final Category Quick Nav styles to global source CSS.
- Base component rules → `src/05-components.css`.
- Tablet/desktop rules → `src/08-responsive.css`.
- Item/tile: 64px; pictogram: 36px; icon→Label: space-1; item gap: space-2.
- Mobile keeps native horizontal scrolling.
- Tablet/desktop uses fixed 64px auto-fit columns instead of stretched columns.
- This release corrects v1.5.1, whose tag was published before these source changes reached `main`.

Rollback reference: **v1.5**.

## v1.5 — Expandable media + button semantics

Validated on the live MebTech site before release.

- Added **Expandable Hero** to the global Design System CSS.
  - desktop/tablet active card: exact **3:4**, max-height **470px**
  - desktop/tablet previews: exact **9:16**
  - preview width adapts to the available container (**150–212px**) and preview count adapts automatically
  - mobile behavior remains **1 active + 1 preview**
  - one mobile swipe = one adjacent banner
  - desktop hover, arrows and activation share the same transition path
  - circular arrow/swipe navigation wraps last ↔ first without sweeping through the entire rail
  - controls are pinned to a stable stage and sit **space-4 (16px)** below the banners
- Added **Showroom Gallery** as a shared Expandable Media variant.
  - uses the same root/item/media primitives as Hero
  - Gallery disables Hero rail scrolling, swipe and tone analysis through data attributes
  - clicking/focusing a gallery item changes the active flex item without Hero window geometry
- Corrected button semantics:
  - `.btn-secondary` remains the outlined secondary action
  - `.btn-info` is a text/link action: no fill, no border, no button radius; green-800 → green-500 on hover
- Added shared behavior asset: `dist/mebtech-expandable.js`.
- Integrated component styles into `src/05-components.css` and responsive behavior into `src/08-responsive.css`.
- Removed the temporary standalone beta CSS from the release architecture; v1.5 component styles ship through `dist/mebtech.css`.

Rollback reference: **v1.4.3**.
## v1.4.0 — Structured source package

Structural refactor only; no visual redesign intended.

- Split the confirmed v1.3.4 production stylesheet into eight maintainable source files.
- Added full section/subsection comments.
- Preserved the existing cascade order inside each top-level section.
- Added one readable production bundle: `dist/mebtech.css`.
- Added a GitHub Actions build workflow that requires no Node/npm.
- Added repository/editing/release governance documentation.

The v1.3.4 production baseline remains the rollback reference.
