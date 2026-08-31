# WordPress Release Evidence

## Release status

**Status:** Theme 0.2.4 and TBT Core 0.2.9 are locally verified, packaged, and pushed to the migration branch. The verified plugin archive is selected on protected GoDaddy staging, but the admin session expired before installation was submitted; staging reauthentication and the browser's action-time install confirmation remain pending. Production approval remains pending.

The visitor-facing WordPress replica is deployed on staging, while the 0.2.4
theme and 0.2.9 plugin parity refresh pass the repository's local route,
responsive, visual, quality, hermetic integration, packaging, and WordPress
dependency checks. The refreshed staging upload is selected in the staging
admin and will be resumed after reauthentication. Neither the live Airo/Next.js site nor the separate production
WordPress host was modified. A restricted Airtable token remains encrypted on
staging and Square payment creation remains explicitly disabled. Production
approval remains conditional on the remaining Square, Meta, SMTP, cron,
backup, and rollback gates below.

## Identifiers

| Item | Value |
| --- | --- |
| Repository | `barranaai/TBT` |
| WordPress branch | `codex/wordpress-migration` |
| Package source commit | `5cb8e23` |
| Source baseline checked during refresh | `origin/main` at `a225d2d`; visitor parity was checked directly against `https://teethbytrev.com/` |
| GoDaddy project ID | `ukasxgp8ig` |
| Current Airo preview host | `ukasxgp8ig.preview.c36.airoapp.ai` |
| GoDaddy production WordPress host | `32741.us6.myftpupload.com` — unchanged |
| GoDaddy staging WordPress host | `1254861.us6.myftpupload.com` |
| Staging environment created | 2026-08-21 |
| WordPress / PHP | 7.0.4 / 8.1.34.15 |
| Custom production domain | `teethbytrev.com` and `www` currently serve GoDaddy Airo Node/Next.js; control-plane binding ID/actor pending |
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
| `teeth-by-trev-theme.zip` | `ad5ef213e856cee36b1f1301ae7547bb70a8228ae3481033f148f1a97b8c3291` |
| `tbt-core-plugin.zip` | `b265a5309a7496e811be89ec5c68cd4e6e5db187fa47ff9ebb20ffb16b84d022` |

Both archives pass `unzip -tq`. Two consecutive clean package runs produced
the same hashes. Rebuild them with `npm run package` and compare against
`wordpress/dist/SHA256SUMS` before deployment.

## Verification completed

- Ten visitor routes verified locally, including Terms and retired-Classic 404 behavior.
- Thirty responsive renders verified at mobile, tablet, and desktop sizes.
- Twenty-seven automated visual comparisons pass directly against the current
  public site at mobile, tablet, and desktop sizes. Visible headings, copy,
  links, and media order match exactly on every locally comparable route.
  Raster differences remain below the 6% budget; the largest is 3.85% on the
  mobile Contact page. Reserve is intentionally unconfigured locally and is
  covered by the hermetic Square suite until the staging sandbox is enabled.
- Twenty WCAG 2.0/2.1/2.2 A/AA route-and-viewport scans pass with no serious
  or critical axe violations, no unnamed interactive controls, valid landmark
  and heading structure, and keyboard-reachable controls.
- Local performance budgets pass on all ten routes at 375×844 and 1440×950.
  LCP measured 1.69–2.66 seconds and CLS remained at or below 0.052. The
  1080p hero video retains its 17.68-second visual source while its
  web payload was reduced from 22 MB to 4.2 MB by removing unused audio and an
  attached image stream and re-encoding with H.264 fast-start delivery.
- Internal links and 16 same-origin media assets verified.
- Enquiry requirements verified for new patient, existing patient, and general enquiry branches.
- Instagram handle, phone, and smile photos verified as mandatory in every enquiry branch.
- Complete browser submissions pass for all three enquiry types, including
  separate storage of optional SMS consent and one private smile photo per enquiry.
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
- Airtable revision history confirms that the staging API initially stored
  `Phone Number = +14245550199` on that synthetic record. The current Airtable
  view later displays the field blank, with no visible configured Airtable
  automation explaining the change. WordPress's payload and field mapping are
  therefore verified; the remaining discrepancy is recorded as an external
  Airtable normalization/display investigation. General-enquiry phone remains
  intentionally optional under the parity contract.
- Existing Square production credentials are encrypted on staging, but the
  independent `SQUARE_ENABLED` guard is off. No card was tokenized and no
  Square payment or charge was attempted.
- Canonical TBT REST responses, including health and Square configuration, send
  `no-store` headers and bypass GoDaddy's full-page cache. The visitor-facing
  payment code uses the canonical endpoint. The legacy `/api/square/config`
  alias remains available only for backward compatibility and may receive the
  host's standard-page cache policy.
- `npm audit` reports zero known vulnerabilities for the WordPress toolchain.
- The checked-in legacy Node rollback source is pinned to Next.js 16.2.7 and
  currently reports six high-severity production dependency findings. The
  public site identifies itself as Next.js, but its exact deployed release is
  not yet captured. Do not redeploy the repository's Node rollback source until
  it is updated and regression-tested separately; no live Node dependency was
  changed during this WordPress work.

Detailed evidence and commands are in [verification-log.md](verification-log.md). The exact production procedure is in [deployment-runbook.md](deployment-runbook.md).

## Required staging evidence

Do not approve production until every item below is recorded with timestamp, operator, result, and supporting screenshot/log reference.

| Gate | Result | Evidence |
| --- | --- | --- |
| HTTPS staging URL protected from public indexing | Pass | `https://1254861.us6.myftpupload.com`; `noindex, nofollow`, 2026-08-21 |
| Theme and plugin checksums match this release | Refreshed staging install pending reauthentication and action-time confirmation | Theme 0.2.4 `ad5ef213…` and TBT Core 0.2.9 `b265a530…` are deterministic locally; staging remains on its prior verified release, 2026-08-28 |
| Airtable test lead saved with exact Social and private photo handoff | Pass | Record `recrcoQgS3wV6TJYX`; lead `TBT-260821-DERCC`; verified in Airtable, 2026-08-21 |
| Airtable forced-failure retry recovered without a duplicate | Pending | |
| Square sandbox success, decline, and ambiguous retry verified | Pending | |
| Meta consent off/on and shared event ID verified | Pending | |
| SMTP delivery and reply-to verified | Pending | |
| Real cron runner and pending-sync recovery verified | Pending | |
| Mobile/tablet/desktop visual comparison approved | Automated local pass; refreshed staging/formal approval pending | 27 strict live-reference comparisons, 30 responsive renders, and interaction suite, 2026-08-28 |
| Accessibility keyboard and screen-reader smoke test approved | Automated local pass; formal screen-reader approval pending | 20 WCAG route/viewport scans, AX-tree naming, structure, and keyboard checks, 2026-08-28 |
| Performance and cache behavior approved | Automated local pass; refreshed staging approval pending | 20 local performance scans; LCP 1.69–2.66 s, CLS ≤0.052, 2026-08-28 |
| Database/files backup created and restore tested | Pending | |
| Current Node release and environment configuration captured | Pending | |
| Custom domain/DNS inventory captured | Public inventory pass; GoDaddy control-plane evidence pending | `docs/dns-inventory.md`, public DNS and HTTP headers, 2026-08-25 |
| Rollback rehearsal completed | Pending | |
| GitHub branch pushed and draft PR reviewed | Branch pushed; review pending | `codex/wordpress-migration` at `5cb8e23`, 2026-08-28 |

## Cutover rule

The WordPress release must first use a separate, protected staging hostname. The current live deployment and DNS remain unchanged until all staging gates pass. At cutover, retain the previous Node release, database backup, DNS snapshot, environment-variable inventory, and these package checksums so rollback is immediate and auditable.
