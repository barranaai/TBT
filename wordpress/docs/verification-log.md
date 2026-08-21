# Verification Log

Updated: 2026-08-21

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
- Hermetic Airtable verification confirms exact `Social = Instagram: <handle>`
  and `Photos` mappings, intent-specific field scoping, required-field
  protection, optional-column compatibility, and PATCH upserts keyed by
  `Submission Token`.
- A temporary Airtable failure remains recorded locally, appears in health as
  pending, and is recovered by the scheduled upsert without duplicating the
  enquiry. The same recovery is verified for deposits keyed by `Payment ID`.
- Hermetic Meta verification confirms default-off behavior, consented browser
  and server `Lead` events with the same dedupe ID, retry reuse of that ID, and
  no form answers or contact data in the server payload.
- Hermetic Square verification confirms the server-fixed $250 USD amount,
  client-safe public configuration, sandbox endpoint, success, decline, local
  idempotency, ambiguous-network same-key recovery, lead matching, local and
  Airtable deposit logs, browser tokenization errors, and unsafe-retry lockout.
- Private gallery and image URLs return 200, `noindex`, and the original image
  MIME type.
- Dependency audit reports zero known vulnerabilities.
- Production theme and plugin ZIP archives build and pass `unzip -t` integrity
  checks; two consecutive normalized builds produce identical SHA-256 hashes;
  the manifest verifies; generated archives remain untracked.

## Passed on GoDaddy staging

Staging URL: `https://1254861.us6.myftpupload.com`

Verified: 2026-08-21

- GoDaddy one-click staging clone created without changing the production host.
- TBT Core 0.2.6 and the Teeth by Trev theme installed from the verified release
  archives and activated on staging.
- Legacy Elementor page-builder plugins deactivated on staging after they were
  shown to override the active theme; no legacy plugin was deleted.
- Health endpoint: WordPress 7.0.4, PHP 8.1.34.15, private WordPress database
  storage, zero pending records, Airtable and Square not yet configured.
- `verify:local` passes all ten routes, 21 same-origin image/video assets, 11
  internal links, protected-staging robots behavior, form requirements, image
  signature validation, health, the canonical Square configuration endpoint,
  and the legacy Square compatibility alias.
- Canonical `/wp-json/tbt/v1/*` operational responses send `no-store` headers;
  GoDaddy reports them as dynamic. The visitor-facing payment code uses the
  canonical Square endpoint. GoDaddy may apply its standard full-page cache
  policy to the inactive legacy `/api/square/config` compatibility alias.
- `verify:responsive` passes all ten routes at 375×844, 768×1024, and
  1440×950, including menus, slider, counters, parallax, Classic handoff,
  enquiry controls, consent/Meta behavior, and the unconfigured-Square fallback.
- GoDaddy staging is `noindex, nofollow`; WordPress's public page sitemap is
  suppressed until the site is made public.
- Production `32741.us6.myftpupload.com` remained unchanged throughout.

## Requires staging credentials or infrastructure

- Airtable live record creation and column-by-column confirmation.
- Square sandbox tokenization, success, decline, retry, deposit logging, and
  reconciliation.
- Meta Pixel/CAPI test-event receipt and browser/server deduplication.
- Production-like cache, security-header, backup, and rollback rehearsal.
- Formal screenshot-diff thresholds across all pages and breakpoints.
- Accessibility/performance scans in the target hosting environment.
