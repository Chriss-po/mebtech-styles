# MebTech Design System v1.5.7 · implementation update

**Last updated:** 13.10.2026  
**Evidence:** site owner confirmed the full v8 mobile motion + v7 shared system pagination trial works correctly on the real MebTech website.  
**Release status:** source accepted for integration; tagged CDN deployment tracked separately. Figma remains visual source of truth; previous docs/design-system-v1.5.md is historical.

## Brand / Header
- Original supplied `Logo.svg` is a single-color path wordmark using `--logo-color` (default `--green-800 = #0C2A20`). The CSS mask makes the appearance themeable without uploading dark/white variants.
- Existing IQIT links and image alt remain; native IMG fallback if mask support is unavailable.
- Effective production logo sizes: 110px desktop; mobile/tablet up to 100px (clamp 96–100), preserving aspect ratio.
- IQIT mobile/tablet Header (<=1199px): existing menu, logo, search, profile, cart order; tappable icon region 44×44px, native dropdowns intact, DS Glass sticky treatment. 46px/56px forced-height experiments are rejected; retain accepted v7 baseline.
- Browser's native iOS system status bar is outside DOM and cannot receive webpage CSS blur.

## Carousel pagination — one DS pattern
- Visual source: `src/05-components.css` universal `.slick-dots > li > button` styles.
- Inactive circle 6px; active capsule 20px; dots gap `var(--space-2)` = 8px; green token, opacity and transitions reused, no local dot sizes.
- Home Hero mobile and Showroom Gallery mobile use pagination generated with semantic `aria-label`/`aria-current`; Gallery has no arrow prerequisite.
- The page-level Hero controls row and Gallery dots wrapper position the pager 12px (`--space-3`) below media. Dots over imagery require `.dots--overlay` shared glass variant; otherwise no glass.
- Desktop Hero retains arrows and counter; DS dots are hidden >=768px. Screen-specific placement stays separate from global dot visuals.

## Expandable Hero motion
- Mobile up to 440px: one active + one preview; widths 441–767px: one active + two previews. Desktop >=768px retains existing adaptive, window-based rail algorithm.
- Mobile maintains `--hero-mobile-stage-height`, while card width and media height animate over 520ms with cubic-bezier(.2,.8,.2,1). Scrolling to the new active element runs as one coordinated animation from final preview geometry.
- Forward, backward, last element, wrap, direct pager jumps tested in isolated Chromium; user reported completed site QA: “все работает”, after v8 was applied.
- Test adapter is integrated into shared `dist/mebtech-expandable.js` after native initializer. Exact trial v8 behavior deliberately preserved rather than introducing a new untested refactor. It handles mobile (<=767px) Home Hero only; desktop, Gallery, native touch handlers unaffected.
- `prefers-reduced-motion: reduce` retains instantaneous transitions; active states and touch events remain functional.

## Legacy graphics fallback
- CSS `@supports not (color: color-mix(...))` approximates legacy Chrome 109 and disables heavy veil mask/backdrop combinations while preserving readable tone-aware gradient. This is a capability proxy, not proof of browser identity.

## Source / deployment
- `src/09-site-adapters.css` is appended **after** `src/08-responsive.css` by Build MebTech CSS Action. Never hand-edit generated `dist/mebtech.css`.
- `dist/mebtech-expandable.js` contains production Hero/ Gallery behavior plus the approved pagination and coordinated-motion adapters.
- On CDN version upgrade, remove Global CSS test v7+v8 and Global JS test v3+v8 to prevent duplicate scripts. Keep v1.5.6 tag unchanged for rollback.
