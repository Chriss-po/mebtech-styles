# MebTech Design System v1.5

Status: **v1.5.5 published / v1.5.6 responsive threshold prepared; real-site smoke test pending · 12.10.2026**

Figma remains the visual source of truth. This document records the accepted implementation contract, responsive behavior and component semantics for the v1.5 code release.

## 1. Expandable Hero

### Purpose
Primary promotional/navigation media component for Home. It presents one active banner plus contextual previews without turning the block into a conventional carousel.

### Shared structure
- root: `.expandable-hero[data-expandable-hero]`
- rail: `.expandable-hero__rail[data-hero-rail]`
- item: `.expandable-hero__item[data-hero-item]`
- media: `.expandable-hero__media`
- image/video: `.expandable-hero__image` / `.expandable-hero__video`
- controls: `.expandable-hero__controls`, `[data-hero-prev]`, `[data-hero-next]`, `[data-hero-counter]`

### Desktop / tablet geometry
- Hero fills the available parent width.
- Active item media: **3:4**.
- Active item max-height: **470px**.
- Inactive preview media: **9:16**.
- Preview width: adaptive, **150px minimum / 212px maximum**.
- Preview count: calculated from real rail width; no persistent partial preview and no artificial side gap.
- Stable-window geometry is used only when `data-scroll-active` is not `false`.

### Desktop interaction
- Hover is enabled only for a fine pointer.
- Only real pointer movement creates hover intent.
- Hover gate: **85ms**.
- Rail transition: **420ms ease-out**.
- Arrow navigation advances by one adjacent item.
- Loop is enabled by default and can be disabled with `data-loop="false"`.
- Last → first and first → last wrap without animating through all intermediate items.
- Controls are fixed to the component stage and do not jump when cards change width.
- Gap between media stage and controls: **space-4 = 16px**.

### Mobile
The Home Hero composition responds to browser viewport width:
- **up to 440px: 1 active + 1 preview**
- **from 441px through 767px: 1 active + 2 previews**
- one horizontal swipe = exactly one adjacent item
- native horizontal rail scrolling is disabled for Hero to prevent overshoot
- vertical page scrolling remains available
- Gallery is excluded from this Hero swipe rule

### Content / hierarchy
Active:
- Label M
- H3
- Body Small

Inactive preview:
- Label M
- Micro Title

Active preview metadata is removed from layout rather than only made transparent, preventing empty vertical space.

## 2. Showroom Gallery

### Purpose
Expandable image gallery for the MebTech showroom. It reuses the Hero media primitive but has its own geometry and does not use Hero rail-window navigation.

### Required root
```html
<section
  class="expandable-hero expandable-hero--gallery"
  data-expandable-hero
  data-scroll-active="false"
  data-swipe="false"
  data-tone-analysis="off">
```

Gallery items use:
```html
<button
  class="expandable-hero__item"
  data-hero-item
  data-type="image"
  type="button">
  <div class="expandable-hero__media">
    <img class="expandable-hero__image" ...>
    <div class="expandable-hero__copy">
      <span class="expandable-hero__label label-m">...</span>
    </div>
  </div>
</button>
```

### Desktop
- gallery height: **320px**
- inactive item flex: **0.75**
- active item flex: **4.2**
- gap uses the shared media spacing
- active item changes on click/focus/keyboard activation
- no Hero rail shift

### Mobile
- gallery height: **220px**
- inactive item flex: **0.6**
- active item flex: **3.6**
- gallery swipe remains disabled

## 3. Shared motion and accessibility
- component transitions use the existing DS motion language
- `prefers-reduced-motion: reduce` disables nonessential transitions
- focus-visible treatment is retained
- controls use the shared icon stroke language and `currentColor`
- Gallery uses semantic `button` items
- Hero controls remain keyboard accessible

## 4. Button semantics corrected in v1.5

### Secondary
`.btn-secondary` is the default secondary action:
- transparent background
- green outline
- green-50 hover surface
- green-700 hover text/border

### Info / link action
`.btn-info` is **not** a secondary button. It is a text/link action:
- no background
- no border
- no button-shaped radius
- default: green-800
- hover: green-500
- active: green-900
- disabled: gray-400
- focus ring remains visible for keyboard navigation

## 5. Implementation ownership
- component visual rules: `src/05-components.css`
- responsive rules: `src/08-responsive.css`
- generated global production CSS: `dist/mebtech.css`
- interaction behavior: `dist/mebtech-expandable.js`

Do not edit `dist/mebtech.css` manually. The GitHub Action regenerates it from `src/`.

## v1.5.5 candidate · Home Hero mobile preview threshold · 12.10.2026
- **Current approved change:** 1 preview at viewport widths 580px and below, 2 previews at viewport widths 581–767px. Desktop (768px+) uses existing adaptive geometry.
- **Supersedes:** v1.5.4 threshold of 428/429px; keep the published v1.5.4 tag unchanged for rollback.
- CSS responsive rules and JavaScript mobile stage measurement use the same breakpoint, excluding Showroom Gallery.
- **Release status:** publish v1.5.5 only after final source/build checks; real-site smoke testing is separate and remains required.

## v1.5.6 candidate · Home Hero responsive threshold · 12.10.2026
- **Decision:** 1 preview up to and including 440px; 2 previews from 441px through 767px. Desktop 768px+ remains adaptive.
- **Supersedes:** v1.5.5 580/581px breakpoint. Previous published tag must remain immutable for rollback. The historical v1.5.5 section above is retained as an archive, not current behavior.
- **Scope:** Home Expandable Hero; the Showroom Gallery variant remains unchanged.
- **Validation:** CSS and JS update plus repository build verification. Real-site responsive regression and smoke testing are still required before CDN activation.
