# Elementor CMS conversion — 9 September 2026

Theme version: **0.3.0**. TBT Core remains **0.2.11**, byte-identical to the
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
`8ea4e2ce4aba72c4cd8abd726884f554617077b62b547de5cc0763abe21f47b8`

Unchanged plugin archive SHA-256:
`23b3241b10a5b55b50b47af2ce0ac107b09d9b154bc73cb96c9e751997fc8a0f`

## Staging disposition

Elementor 4.2.4 was already installed on staging and has been activated. The
staging database contains older Elementor pages as well as the replica pages.
The new conversion archives the older layouts for the exact canonical pages.
Theme upload, conversion and post-deployment verification are pending.

This release addresses client CMS editing. It does not certify the unrelated
production readiness gaps from the previous standards audit.
