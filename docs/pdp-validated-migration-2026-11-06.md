# PDP CSS migration — 2026-11-06

Status: validated CSS committed and GitHub dist bundle generated. No verified site switchover.

## Included
- Complete user-supplied Custom CSS snapshot with PDP v5.3 and REPLACEMENT 05 styles.
- Approved region switch CSS-only selected-state design.
- Approved furniture project Primary CTA style.

Source: src/11-pdp-validated.css; output: dist/mebtech.css.

## Excluded
- Alerts Patch 08/09, which have not passed production review.
- Changes to fulfillment, deadlines, pricing, statuses or shipping business logic.
- Full live Custom JS, because the baseline v5.3 and PATCH 01/02 JS sources have not been recovered. REPLACEMENT 05 JS is not a standalone replacement.

## Safe migration steps
1. Export live Custom CSS and Custom JS from IQIT/PrestaShop before any removals.
2. Pin an immutable built CSS version and verify it loads on the site in the required order.
3. Check for duplicates and perform cross-page regression smoke testing.
4. Remove only proven-duplicated rules from the limited Custom CSS field.
5. Preserve all functional Custom JS unless its complete equivalent is verified deployed.
6. Keep the previous bundle URL for rollback.

Do not empty the site's Custom CSS/JS fields simply because GitHub integration succeeded.