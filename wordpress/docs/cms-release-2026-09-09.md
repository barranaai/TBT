# CMS management release — 9 September 2026

Scope: native navigation menus; Services, Testimonials and Smile Transformations;
page search metadata and social-sharing previews. Production, DNS, integrations
and private enquiry/photo storage are not changed.

## Components and safety

- Theme 0.4.0 contains presentation adapters retaining the approved layout.
- New TBT Content Manager 1.0.0 owns records, admin fields, permissions, metadata
  revisions and explicit migration. TBT Core remains 0.2.11 without code changes.
- No Elementor Pro licence or additional third-party CMS/SEO plugin is required.
- The explicit migration captures current saved Elementor data and prior menu
  assignments. Original Elementor documents are not overwritten.
- Only after successful setup does rendering switch to the new records/menus.
  Repeated setup preserves existing edits. Partial retries reuse captured source
  and previously created records. A lock prevents concurrent migrations.
- A display fallback switch retains both the old source and new CMS data.
- Public content records do not expose new individual URLs, archives or REST
  collections. Editing uses WordPress page capabilities and per-object checks.
- CSRF nonces, typed sanitization and output escaping protect save/render paths.
- Missing required content stays Draft with an explanatory message. Publishing
  patient content remains an editorial decision requiring permission to display it.
- SEO fields do not control canonicals or indexing policy; staging stays noindex.

## Local verification

- All 30 baseline visual comparisons against the pre-CMS Elementor replica passed:
  identical page heights and 0.00% raster difference.
- All ten functional routes, 16 assets and 11 internal navigation targets passed.
  Required phone/photos, upload validation and staging noindex/sitemap behavior
  remain intact.
- A separate backend regression instance verified preservation of a pre-existing
  client edit (including quotes/backslashes), an exact source backup, idempotency,
  rejected invalid nonces, denied author-level edits/migration, sanitization and
  native WordPress revision restoration for both content and SEO metadata.
- Full native management-UI regression passed: service editing/add/draft/publish/
  order/trash, Home selection, unlimited highlights, testimonial validation,
  Media Library upload, gallery cards, required comparison pictures, multiple
  keyboard-accessible comparisons, independent SEO/social fields and defaults,
  repeated migration and fallback/resume.
- Native menu add/order/remove passed, including preserving URL fragments.
- An actual Elementor heading save/reload retained the legacy gallery settings;
  the test restored the original heading afterward.
- Required content checks also apply to Quick Edit, bulk status changes and
  programmatic publication. A fresh backend regression passed these cases.
- Backend checks ran on WordPress 7.0 / PHP 8.1. Full UI checks ran on the local
  WordPress 7.1 / PHP 8.1 instance; hosted verification used WordPress 7.0.4.

Local fixtures stay on localhost. No live Airtable enquiry or payment is created
by these content tests. The enquiry/payment plugin archive is still byte-identical
to the previous release.

## Staging deployment and hosted verification

- Deployed theme 0.4.0 and TBT Content Manager 1.0.0 through the authenticated
  staging WordPress upload screens at https://1254861.us6.myftpupload.com/.
- Explicit setup confirmed **14 content records and 3 native menus**, CMS enabled,
  with captured source and previous assignments preserved. No production, DNS,
  payment configuration or integration credentials were changed.
- All 30 hosted/reference visual comparisons passed with identical page heights
  and **0.00% image difference**, across mobile, tablet and desktop.
- Ten routes, 16 assets, 11 links, noindex/sitemap behavior and mandatory phone/
  smile-picture rejection tests passed. No real enquiry or payment was submitted.
- All 30 responsive route checks and interactive menu/form/consent checks passed.
- Twenty automated accessibility/performance scans passed with zero axe
  violations; measured LCP 456–2640 ms and CLS no greater than 0.08. These are
  controlled browser measurements, not real-user field data or a guarantee of
  complete accessibility.
- Hosted incomplete-testimonial publishing correctly remained Draft. Only the
  unpublished QA item (2236) was moved to recoverable Trash afterward.
- Existing SMTP/Square/Apple Pay notices remain outside this CMS scope; this
  release does not claim those integrations are fully configured.

QA artifacts are generated under `artifacts/cms`, `artifacts/responsive`,
`artifacts/quality` and `artifacts/visual-parity` (not committed). Client
instructions: `cms-management-guide.md`. A full database/media backup is still
required for disaster recovery; the migration source snapshot is not a full-site
backup. No production deployment is authorized by this release record.

## Final deployment archive SHA-256

```text
165eace008a021148d78b7ee24732ca89412d68725fde673c8a99aff86aa5e9a  teeth-by-trev-theme.zip
ff7791fc3e4f5b0000c0571ad53654843ba4ebe0f9e308f51b1a93673bafef9b  tbt-content-plugin.zip
23b3241b10a5b55b50b47af2ce0ac107b09d9b154bc73cb96c9e751997fc8a0f  tbt-core-plugin.zip (unchanged; not redeployed)
```
