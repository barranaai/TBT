# Verification Log

Updated: 2026-08-10

## Passed locally

- WordPress Playground boot: WordPress 7.0.3, PHP 8.3.32.
- Theme/plugin activation, page seeding, schema migration, and health endpoint.
- Compiled CSS and all four JavaScript bundles build without errors.
- HTTP 200 and expected content markers for `/`, `/about`, `/services`,
  `/gallery`, `/financing`, `/contact`, `/consultation`, `/reserve`, and
  `/privacy`, plus the complete alternate `/classic` homepage.
- Every canonical route emits exactly one canonical URL; only `/reserve` emits
  the project-level `noindex,follow` directive.
- `/atelier` returns 301 to `/`.
- Legacy `/api/square/config` resolves to the WordPress compatibility route.
- Homepage production-preview comparison: same hero copy, section count,
  responsive width behavior, image assets, palette, typography, and framing.
- Browser checks: intro veil, menu open/close state, inert/ARIA state, no desktop
  or mobile horizontal overflow, consent default/off state, and no Meta script
  before consent.
- Automated Chromium matrix: all 10 canonical routes at 375×844, 768×1024,
  and 1440×950 passed without browser errors, broken images, or horizontal
  overflow. Representative Atelier and Classic screenshots were inspected at
  each breakpoint.
- Automated interaction checks: both mobile menus and Escape behavior, Classic
  comparison-slider keyboard control, animated counters, Atelier selected-work
  parallax, and the Classic consultation-to-contact prefill handoff.
- Final rendered desktop check: no WordPress admin bar, no broken images, nine
  homepage sections, no horizontal overflow, and no Meta script before consent.
- `/reserve/?type=video` renders the correct consultation label and the safe
  concierge fallback when Square credentials are absent.
- Contact wizard: General phone optional; New/Existing phone required;
  Instagram always visible and required; photos required in every branch.
- Automated mobile checks confirm that the Instagram control remains required,
  the correct phone indicator is shown, and every branch includes its smile
  photo control.
- Browser file chooser and a full local General-enquiry submission succeeded.
- REST validation rejects missing photos with 422.
- REST success for New, Existing, and General branches, each with a stored
  private photo and lead reference.
- Submission-token retry returned the original lead reference without a
  duplicate.
- Private gallery and image URLs return 200, `noindex`, and the original image
  MIME type.
- Dependency audit reports zero known vulnerabilities.
- Production theme and plugin ZIP archives build and pass `unzip -t` integrity
  checks; generated archives remain untracked.

## Requires staging credentials or infrastructure

- Airtable live record creation and column-by-column confirmation.
- Square sandbox tokenization, success, decline, retry, deposit logging, and
  reconciliation.
- Meta Pixel/CAPI test-event receipt and browser/server deduplication.
- Production-like cache, HTTPS, security-header, backup, and rollback rehearsal.
- Formal screenshot-diff thresholds across all pages and breakpoints.
- Accessibility/performance scans in the target hosting environment.
