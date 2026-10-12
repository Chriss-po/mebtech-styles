# Changelog

## v1.5.4 — Mobile Hero vertical stability

Corrects the v1.5.3 mobile page-jumping regression. **Do not retag old releases.**

- Root cause confirmed: the outgoing item becomes a 9:16 preview while it still has an expanded width. Its transitional height expands and pushes the whole mobile page down.
- Mobile now uses a **height-invariant media stage** with a CSS fallback and JS pre-measurement of all inactive captions, plus a small rounding allowance.
- Removed mobile item width/aspect-ratio transitions only, preserving smooth horizontal rail movement and content fades.
- Mobile rail scroll starts immediately after the card geometry change instead of waiting 540ms.
- Loop wrap on mobile jumps directly first ↔ last without sweeping through unrelated banners.
- Recomputes mobile stage after web fonts load and on resize.
- Hero controls remain in a separate normal-flow row. No change to desktop Hero, Showroom Gallery, or Category Quick Nav.
- Existing v1.5.3 corrected HTML can stay; no additional markup replacement is required.

**Status:** local browser regression test required and real-iPhone smoke test pending.
Rollback reference: **v1.5**.

## v1.5.3 — Mobile Hero layout recovery

Fixes the mobile regression introduced by the hard-height control stabilization in v1.5.2.

- Hero controls are now a **separate, normal-flow grid row** below the media rail (mobile only).
- Mobile rail uses **auto height** with a reserved minimum based on active 3:4 media and the tallest 9:16 preview plus caption; banner content cannot be cropped by a stale fixed height.
- Active cards no longer reserve invisible preview-caption height.
- Hero HTML should use **direct track children** (`<a class="expandable-hero__item">…</a>`), not nested `<a><article class="expandable-hero__item">…</article></a>` wrappers.
- Native 1-active/1-preview layout, one-step swipe, arrows, looping and desktop/gallery composition remain in scope.
- Also includes all v1.5.2 Category Quick Nav styles.

**Release requires the matching Hero HTML cleanup.** Do not replace production styles/scripts or tag until the HTML and mobile smoke test are ready.

Rollback reference: **v1.5**.

## v1.5.2 — Category Quick Nav release fix

- Added the accepted final Category Quick Nav styles to global source CSS.
- Base component rules → `src/05-components.css`.
- Tablet/desktop rules → `src/08-responsive.css`.
- Item/tile: 64px; pictogram: 36px; icon→Label: space-1; item gap: space-2.
- Mobile keeps native horizontal scrolling.
- Tablet/desktop uses fixed 64px auto-fit columns instead of stretched columns.
- This release corrects v1.5.1, whose tag was published before these source changes reached `main`.
- Fixed **mobile Expandable Hero controls jumping**: mobile now gets a stable computed stage height and controls stay anchored while banners change active state.

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
