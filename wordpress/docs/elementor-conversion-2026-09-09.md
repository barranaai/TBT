# Elementor CMS conversion — 9 September 2026

Theme version: **0.3.1**. TBT Core remains **0.2.11**, byte-identical to the
previous plugin package. Production Node hosting, DNS and credentials are outside
this release.

## Delivered implementation

- Ten canonical pages use real Elementor documents after explicit conversion.
- 36 custom sections expose 484 typed text, image/video, numeric and link controls.
- Gallery cards use Elementor's repeater with image/title/caption/alt fields.
- Separate editable header/footer documents work with Elementor Free.
- Content changes persist in the WordPress database and Elementor revisions;
  no Git deployment is needed for client edits.
- Enquiry/payment sections render the existing TBT Core shortcodes.
- Setup archives older content and Elementor metadata before replacing it;
  unrelated pages and completed conversions are never overwritten.
- Original PHP templates and a recovery function remain available.

## Local evidence

Tested with Elementor **4.2.4**, WordPress **7.1** in Playground and PHP **8.3**.

1. Browser tests edited and published an About heading, reloaded the visitor page,
   and restored the original text.
2. Browser tests uploaded a picture through the Media Library, selected it in
   Elementor, verified the saved uploads URL on the visitor page, and restored
   the original image.
3. Browser tests duplicated a gallery card, published seven cards, and restored six.
4. Repeating setup preserved existing client content.
5. A fresh `blueprint-editor.json` instance verified preservation of an older
   Elementor layout, exact metadata backup (including quotes/backslashes),
   rollback and re-conversion.
6. `verify:local` passed all routes, 16 public assets, 11 navigation targets,
   noindex/sitemap behavior and mandatory phone/Instagram/photo enforcement.
7. `verify:responsive` passed ten routes at mobile/tablet/desktop, form controls,
   analytics behavior and disabled Square fallback.
8. The full visual comparison against the original PHP replica passed all 30
   page/viewport combinations. The final homepage-specific rerun measured
   **0.00% raster difference and identical page height** at all three sizes.
   Other page geometry matched exactly after correcting Elementor's image reset.
9. The full quality scan found Elementor removed underlines on Contact/Privacy/
   Terms. The CSS correction passed all six targeted reruns with **zero axe
   violations**. The other fourteen scans already passed with zero violations.

The first comparison exposed Elementor image-sizing and figure-margin resets;
these were fixed. Initial test failures are not treated as passing evidence.

Theme archive SHA-256:
`fcebd10241d50e1230fd072c44e1b76b63906104e54ca169a03459d9739f88cf`

Unchanged plugin archive SHA-256:
`23b3241b10a5b55b50b47af2ce0ac107b09d9b154bc73cb96c9e751997fc8a0f`

## Staging disposition

Deployed to **https://1254861.us6.myftpupload.com/** with WordPress **7.0.4**,
PHP **8.1.34.15**, Elementor **4.2.4**, and theme **0.3.1**.

- The explicit archive-and-prepare action reported Ready for all ten pages and
  both shared documents. The older canonical page content/metadata was archived.
- A real hosted Elementor edit changed the About heading, published it, and
  verified it on the visitor page. The original heading was then restored and
  verified again. The hosted Media Library chooser opens from the image control.
- Initial hosted QA caught the old site's Elementor kit overriding typography,
  colors and buttons, including a font URL pointing at the production domain.
  Version 0.3.1 suppresses that kit's stylesheet only on explicitly prepared
  replica pages; the stored kit and unrelated pages are not modified.
- All 30 responsive route/viewport checks passed, including menu/form controls,
  analytics consent, and the disabled-payment fallback.
- All 20 mobile/desktop quality scans passed with **zero axe violations** and
  within the configured performance budgets. These are lab checks, not field
  Core Web Vitals certification.
- Staging integration health reports TBT Core 0.2.11, Airtable configured, zero
  queued enquiries/deposits, and Square disabled. This release does not claim a
  new end-to-end Airtable submission or payment test.
- Production was not deployed, reconfigured or modified. A read-only check of
  https://teethbytrev.com/ returned HTTP 200.

The final hosted visual comparison passed all **30** page/viewport combinations
against the original PHP replica, with identical full-page heights. All pages
except Contact measured **0.00%** raster difference; Contact measured **0.01–0.03%**.
The final functional rerun passed all ten routes, 16 assets, 11 navigation targets,
staging noindex/sitemap checks, mandatory phone/photo checks, image validation,
and the new regression assertion preventing inherited kit styles on replica pages.

Evidence is available locally in `artifacts/visual-parity/report.json`,
`artifacts/quality/quality-report.json`, and `artifacts/responsive/`.

This release addresses client CMS editing. It does not certify the unrelated
production readiness gaps from the previous standards audit.
