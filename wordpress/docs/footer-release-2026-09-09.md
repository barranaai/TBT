# Footer / pre-footer live-site alignment — 9 September 2026

Reference: https://teethbytrev.com/ (read-only inspection). Target: WordPress
staging https://1254861.us6.myftpupload.com/. Theme 0.4.1 only; no plugin,
production, domain, enquiry, Airtable or payment changes.

## Changes

- Removed the old permanently visible street address from the shared footer and
  homepage pre-footer. Removed the extra footer corporation sentence absent from
  the current live footer. Stored Elementor source fields were not overwritten.
- Added eight city buttons to both sections. Verified seven physical-location
  entries (including two New York locations), plus Tampa/Memphis appointment-text
  fallbacks, against the live UI. Google Maps query URLs match the live site.
- Added one shared Elementor location repeater in Site Footer; edits update both
  sections. Existing native navigation menus and all surrounding content remain.
- Added single-open disclosures, Escape/focus return, keyboard link access,
  outside-click/focus dismissal, viewport clamping and small-screen scrolling.
- Corrected pre-footer heading line spacing to match the current live layout.
- Preserved existing WordPress small-text contrast improvements instead of
  reverting to the live site's lower-contrast text. This is not a pixel-identical
  color claim. Standalone privacy/terms pages have no footer on either site and
  were left unchanged.

## Verification

- Local city text and links matched all eight live pop-ups in both sections at
  375px, 768px and 1440px widths. Every panel remained within the viewport;
  keyboard/dismissal checks passed. All eight footer-bearing routes passed.
- Real Elementor edit/save test updated both sections and restored original
  local content. No hosted content fixture was needed.
- At 375px, final live/WordPress pre-footer heights both measured 801.5625px and
  footer heights both measured 817.859375px. Screenshots were visually reviewed.
- Four local automated accessibility scans (Home/About, mobile/desktop) passed
  with zero axe violations before staging deployment.
- Hosted verification passed on staging after the theme upload confirmed
  version 0.4.1: 24 footer-bearing route/viewport combinations and 48 city-popup
  comparisons (eight cities × two sections × three viewports), including text,
  links, visibility, viewport bounds, keyboard and dismissal behavior.
- All ten functional routes, 16 media assets, 11 navigation targets, noindex and
  required phone/photo validation checks passed. No real enquiry was submitted.
- Four hosted Home/About accessibility/performance scans passed with zero axe
  violations, plus two scans with the longest (New York) pop-up open. Browser
  measurements: LCP 520–732 ms and CLS at most 0.0508; not real-user field data.

QA: `scripts/verify-footer.mjs`, `scripts/verify-location-editor.mjs`; generated
screenshots and report in `artifacts/footer` (not committed). Source rollback is
the preceding commit `0182484`; no original Elementor documents were migrated or
overwritten by this release.

Theme ZIP SHA-256:
`ad1cb45bf677eba7ea5cef8f103319b280d214c12856835b37728bc70a6c32bc`.
