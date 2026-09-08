# Footer / pre-footer live-site alignment — 9 September 2026

Reference: https://teethbytrev.com/ (read-only inspection). Target: WordPress
staging https://1254861.us6.myftpupload.com/. This record now also covers the
follow-up Location CMS release (theme 0.4.2/content manager 1.1.0); no production,
domain, enquiry, Airtable or payment changes.

## Changes

- Removed the old permanently visible street address from the shared footer and
  homepage pre-footer. Removed the extra footer corporation sentence absent from
  the current live footer. Stored Elementor source fields were not overwritten.
- Added eight city buttons to both sections. Verified seven physical-location
  entries (including two New York locations), plus Tampa/Memphis appointment-text
  fallbacks, against the live UI. Google Maps query URLs match the live site.
- Replaced the temporary Elementor ownership with first-class **Locations**
  records in the content plugin. Administrators can add, edit, publish, reorder,
  draft or trash locations; both sections read the same published records.
- On upgrade, nine records are seeded idempotently from the saved Elementor rows
  when available, otherwise from the verified live data. Existing/trashed records
  are never overwritten, and the captured seed source is retained in the existing
  non-autoloaded migration backup.
- The old Elementor location repeater stays registered but hidden as recovery
  data so later Elementor saves cannot discard it.
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
- Real WordPress Locations workflow verification covers add, required-field draft,
  publish, order, edit, rendering in both sections and trash, with original local
  content restored. Backend regression also verifies revision restoration,
  sanitization, author denial and absence of a public endpoint/archive.
- At 375px, final live/WordPress pre-footer heights both measured 801.5625px and
  footer heights both measured 817.859375px. Screenshots were visually reviewed.
- Four local automated accessibility scans (Home/About, mobile/desktop) passed
  with zero axe violations before staging deployment.
- Hosted verification first passed for theme 0.4.1, then passed again after the
  staged upgrade to theme 0.4.2 and TBT Content Manager 1.1.0: 24
  footer-bearing route/viewport combinations and 48 city-popup comparisons
  (eight cities × two sections × three viewports), including text, links,
  visibility, viewport bounds, keyboard and dismissal behavior.
- WordPress confirmed nine published Location records. Hosted inspection verified
  the physical-address and appointment editor modes, the normalized SMS number,
  the two New York records, and the absence of a public REST endpoint or archive.
- All ten functional routes, 16 media assets, 11 navigation targets, noindex and
  required phone/photo validation checks passed. No real enquiry was submitted.
- Four final hosted Home/About accessibility/performance scans passed with zero
  axe violations. Browser measurements: LCP 504–560 ms and CLS at most 0.0523;
  not real-user field data. Earlier open-New-York-panel scans also passed with
  zero axe violations.

QA: `scripts/verify-footer.mjs`, `scripts/verify-location-admin.mjs`; generated
screenshots and report in `artifacts/footer` (not committed). Source rollback is
commit `ae00089` for the Location CMS upgrade, or `0182484` for the preceding
footer implementation; no original Elementor documents were migrated or
overwritten by either release.

Final archive SHA-256 checksums:

```text
f70b26ff8d436641b2f75e40b31d8a07df65fac54b5099431b6e80f8493453d3  teeth-by-trev-theme.zip
7f7810bc1699488dafb1b6a027f05f1bcea6142c4abf29fadf49ad5520911c07  tbt-content-plugin.zip
23b3241b10a5b55b50b47af2ce0ac107b09d9b154bc73cb96c9e751997fc8a0f  tbt-core-plugin.zip (unchanged; not redeployed)
```
