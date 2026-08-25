# Verification Log

Updated: 2026-08-25

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
- Automated WCAG quality matrix: all 10 canonical routes at mobile and desktop
  widths pass axe WCAG 2.0/2.1/2.2 A/AA checks with no serious or critical
  violations, no unnamed interactive AX-tree controls, exactly one `h1` and
  `main`, no duplicate IDs or skipped headings, and keyboard-reachable targets.
- The same 20 quality runs pass the local performance budgets. LCP measured
  approximately 1.6–2.7 seconds, CLS remained at or below 0.052, TTFB/load
  remained within budget, and transfer stayed below 25 MiB.
- The hero source remains 1920 by 1080 H.264 at 23.98 fps for 17.684 seconds.
  Removing unused audio and an attached MJPEG stream and applying web-focused
  H.264 fast-start compression reduced it from 22 MB to 4.2 MB; a side-by-side
  source-frame inspection showed no material visual change.
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
- TBT Core 0.2.7 and the Teeth by Trev theme installed from the verified release
  archives and activated on staging.
- The final deterministic TBT Core archive (`ef232156ae4e8579a9c29f8896abf8d3ad089d3d6506ee40af97b615e5b02a99`)
  replaced the staging plugin through WordPress's upload flow. The public
  inquiry bundle reports 0.2.7, and encrypted site settings persisted.
- Legacy Elementor page-builder plugins deactivated on staging after they were
  shown to override the active theme; no legacy plugin was deleted.
- Health endpoint: WordPress 7.0.4, PHP 8.1.34.15, private WordPress database
  storage, zero pending records, Airtable configured, and Square disabled.
- Integration secrets are stored encrypted in a staging-only admin screen;
  password inputs are blank after save and report only that an encrypted value
  exists. Empty legacy config constants fall back to these encrypted values.
- The existing Square production token, application ID, and location ID are
  stored on staging, but `SQUARE_ENABLED` is false. No Square tokenization,
  payment request, or charge was attempted.
- Authorized live Airtable verification passed with `Barrana WordPress Staging
  Test` (`recrcoQgS3wV6TJYX`, lead `TBT-260821-DERCC`). The `Social` field is
  exactly `Instagram: @barrana.wordpress.staging`; `Photos` contains the
  private staging photo URL; Caller Type, consent, source, and attribution
  fields are populated; Meta consent was off.
- Airtable revision history shows that the API initially stored `Phone Number
  = +14245550199` on the synthetic record. The live view now shows the field
  blank and no configured Airtable automation was visible. This confirms the
  WordPress payload/mapping and leaves an Airtable-side normalization/display
  anomaly to investigate; no WordPress contract change was made because
  General phone is intentionally optional.
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

## Remaining staging credentials or infrastructure

- Upload and activate the deterministic Teeth by Trev theme 0.2.3 and TBT Core
  0.2.8 archives
  after reauthenticating the expired GoDaddy admin session, then repeat the
  staging route, responsive, accessibility, performance, and health gates.
- Airtable forced-failure recovery against the live service (the equivalent
  retry and no-duplicate behavior already passes hermetically).
- Square sandbox tokenization, success, decline, retry, deposit logging, and
  reconciliation.
- Meta Pixel/CAPI test-event receipt and browser/server deduplication.
- Production-like cache, security-header, backup, and rollback rehearsal.
- Refreshed staging screenshot comparisons using the locally proven strict
  semantic/media gate and 6% raster threshold.
- Accessibility/performance scans of the refreshed 0.2.3/0.2.8 target environment.

## 2026-08-25 local parity refresh

- Theme 0.2.3 and TBT Core 0.2.8 pass the full local route, responsive,
  accessibility/performance, and hermetic integration suites.
- Thirty local visual comparisons against the checked-in Next.js source pass
  at 375×844, 768×1024, and 1440×950. Visible headings, main copy, links, and
  media sequences are exact; the maximum raster difference is 5.45% under the
  documented 6% cross-renderer budget.
- Contact intent cards now retain the source's responsive padding, and Reserve
  no longer forces its `main` element to a full viewport height. Contact and
  Reserve therefore match the source at tablet and desktop sizes.
- The exact enquiry SVG marks replace fallback text glyphs without changing
  enquiry behavior. Instagram remains visible and mandatory for every branch;
  smile photos remain mandatory for New, Existing, and General enquiries.
- Two consecutive package builds are byte-for-byte deterministic. Theme hash:
  `71483592a0a7058183e9ce862070d5bbba2e8489fcd31bbf94bd160d55f3b325`.
  Plugin hash:
  `67bcb4b699cd900d82e467060ffcb0b122b51fae2b237737c3006beb6898c54d`.
- WordPress `npm audit` reports zero findings. The legacy checked-in Node
  rollback source (Next.js 16.2.7) reports six high-severity production
  dependency findings and is not approved for redeployment until separately
  updated and regression-tested.
- Public DNS and HTTP evidence confirms `teethbytrev.com` and `www` still serve
  the live GoDaddy Airo Node/Next.js application. Neither live application nor
  either production hosting target was changed during this refresh.

## 2026-08-26 staging pre-deployment baseline

- GoDaddy SSO access was restored specifically for the protected staging host
  `1254861.us6.myftpupload.com`; the separate production WordPress host
  `32741.us6.myftpupload.com` was not changed.
- The active staging release remains TBT Core 0.2.7 and Teeth by Trev theme
  0.2.1. The verified 0.2.8 plugin and 0.2.3 theme archives have not yet been
  installed.
- The public health endpoint returned `ok: true`, WordPress 7.0.4, PHP
  8.1.34.15, WordPress-database storage, Airtable configured, zero pending
  enquiry or deposit records, and Square disabled.
- The verified TBT Core 0.2.8 archive was selected in WordPress's staging-only
  upload form, but the install/replace action remains paused for explicit
  approval. No production, DNS, or live-payment state changed.
