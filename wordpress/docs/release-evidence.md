# WordPress Release Evidence

## Release status

**Status:** Deployed to protected GoDaddy staging; Airtable is live-tested, Square is safety-disabled, and production approval remains pending.

The visitor-facing WordPress replica is deployed and passes the repository's
hermetic integration, live staging route, responsive, security, packaging, and
dependency checks. The existing production WordPress site has not been
modified. A restricted Airtable token and the existing Square production
credentials are stored encrypted on staging. Square payment creation remains
explicitly disabled. Production approval remains conditional on the remaining
Square, Meta, SMTP, cron, backup, and rollback gates below.

## Identifiers

| Item | Value |
| --- | --- |
| Repository | `barranaai/TBT` |
| WordPress branch | `codex/wordpress-migration` |
| Package source commit | `aea1612522f1ecde46f448f7318f9ca995958750` |
| Source baseline | `origin/main` at `e19aa7c` |
| GoDaddy project ID | `ukasxgp8ig` |
| Current Airo preview host | `ukasxgp8ig.preview.c36.airoapp.ai` |
| GoDaddy production WordPress host | `32741.us6.myftpupload.com` — unchanged |
| GoDaddy staging WordPress host | `1254861.us6.myftpupload.com` |
| Staging environment created | 2026-08-21 |
| WordPress / PHP | 7.0.4 / 8.1.34.15 |
| Custom production domain | **Unverified — GoDaddy workspace reports no attached domains** |
| Current Node deployment/release ID | **Unverified** |
| Current rollback point | **Unverified — capture before any staging or production action** |

GoDaddy's one-click staging facility cloned the pre-existing WordPress site to
the staging host. The verified TBT Core plugin and Teeth by Trev theme were
installed and activated only on that clone. Legacy Elementor page-builder
plugins were deactivated on staging, not deleted, after they were proven to
override the new theme. The production host and DNS were not changed.

## Immutable package evidence

| Package | SHA-256 |
| --- | --- |
| `teeth-by-trev-theme.zip` | `28a869aa50aba152b3a2dd7e1ec415497194805092073d43ba2ded6380fadbba` |
| `tbt-core-plugin.zip` | `ef232156ae4e8579a9c29f8896abf8d3ad089d3d6506ee40af97b615e5b02a99` |

Both archives pass `unzip -tq`. Two consecutive clean package runs produced
the same hashes. Rebuild them with `npm run package` and compare against
`wordpress/dist/SHA256SUMS` before deployment.

## Verification completed

- Ten visitor routes verified locally, including Classic and 404 behavior.
- Thirty responsive renders verified at mobile, tablet, and desktop sizes.
- Internal links and 21 same-origin media assets verified.
- Enquiry requirements verified for new patient, existing patient, and general enquiry branches.
- Instagram handle and smile photos verified as mandatory in every enquiry branch; phone remains mandatory for patient branches.
- Airtable lead and deposit upserts, retry recovery, pending-sync cron, exact `Social`/photo mapping, and idempotency verified with deterministic upstream doubles.
- Private photo signature checks and response security headers verified.
- Square fixed $250 amount, browser tokenization, success, decline, ambiguous recovery, and idempotency verified.
- Meta consent gating, browser/server shared event ID, and visitor-data minimization verified.
- SEO metadata, canonical behavior, reserve noindex, sitemap exclusion, and staging robots behavior verified.
- GoDaddy staging emits `noindex, nofollow`; its public page sitemap is
  intentionally suppressed while protected.
- All ten routes, 21 same-origin media assets, and 11 internal links pass on
  the deployed staging host.
- All ten routes pass at mobile, tablet, and desktop sizes on GoDaddy staging;
  menus, slider, counters, parallax, form controls, Meta consent, and the safe
  unconfigured-Square state pass in a real browser.
- TBT Core `0.2.7` stores integration secrets encrypted with the staging
  site's WordPress authentication salts and never renders the plaintext back
  into the admin screen. Empty legacy constants no longer mask encrypted
  staging values.
- The staging health endpoint reports private WordPress database storage,
  Airtable configured, Square disabled, and no pending records.
- The authorized `Barrana WordPress Staging Test` submission was stored in
  Airtable as record `recrcoQgS3wV6TJYX`, lead reference
  `TBT-260821-DERCC`, with `Social = Instagram:
  @barrana.wordpress.staging` and a private staging smile-photo URL. Meta
  consent was off and no Meta server event was attempted.
- Existing Square production credentials are encrypted on staging, but the
  independent `SQUARE_ENABLED` guard is off. No card was tokenized and no
  Square payment or charge was attempted.
- Canonical TBT REST responses, including health and Square configuration, send
  `no-store` headers and bypass GoDaddy's full-page cache. The visitor-facing
  payment code uses the canonical endpoint. The legacy `/api/square/config`
  alias remains available only for backward compatibility and may receive the
  host's standard-page cache policy.
- `npm audit` reports zero known vulnerabilities.

Detailed evidence and commands are in [verification-log.md](verification-log.md). The exact production procedure is in [deployment-runbook.md](deployment-runbook.md).

## Required staging evidence

Do not approve production until every item below is recorded with timestamp, operator, result, and supporting screenshot/log reference.

| Gate | Result | Evidence |
| --- | --- | --- |
| HTTPS staging URL protected from public indexing | Pass | `https://1254861.us6.myftpupload.com`; `noindex, nofollow`, 2026-08-21 |
| Theme and plugin checksums match this release | Pass | Plugin `ef232156…` installed through WordPress's staging-only replacement flow; deterministic archives and deployed routes/assets verified, 2026-08-21 |
| Airtable test lead saved with exact Social and private photo handoff | Pass | Record `recrcoQgS3wV6TJYX`; lead `TBT-260821-DERCC`; verified in Airtable, 2026-08-21 |
| Airtable forced-failure retry recovered without a duplicate | Pending | |
| Square sandbox success, decline, and ambiguous retry verified | Pending | |
| Meta consent off/on and shared event ID verified | Pending | |
| SMTP delivery and reply-to verified | Pending | |
| Real cron runner and pending-sync recovery verified | Pending | |
| Mobile/tablet/desktop visual comparison approved | Automated pass; formal approval pending | 30 staging renders plus interaction suite, 2026-08-21 |
| Accessibility keyboard and screen-reader smoke test approved | Pending | |
| Performance and cache behavior approved | Pending | |
| Database/files backup created and restore tested | Pending | |
| Current Node release and environment configuration captured | Pending | |
| Custom domain/DNS inventory captured | Pending | |
| Rollback rehearsal completed | Pending | |
| GitHub branch pushed and draft PR reviewed | Pending | |

## Cutover rule

The WordPress release must first use a separate, protected staging hostname. The current live deployment and DNS remain unchanged until all staging gates pass. At cutover, retain the previous Node release, database backup, DNS snapshot, environment-variable inventory, and these package checksums so rollback is immediate and auditable.
