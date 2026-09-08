# WordPress Release Evidence

## Release status

**Status:** TBT Core `0.2.11` and Teeth by Trev theme `0.2.5` are deployed to
the isolated GoDaddy staging site. Automated functional QA passes; visual QA is
conditional pending named exception approval. Production cutover remains on
hold for the external and manual gates listed below.

The live Airo/Next.js site, production WordPress host, and production DNS were
not modified. Airtable is configured on staging with zero pending records.
Square is explicitly disabled and no card or payment was attempted.

The detailed professional QA disposition is in
[qa-report-2026-09-08.md](qa-report-2026-09-08.md).

## Identifiers

| Item | Value |
| --- | --- |
| Repository | `barranaai/TBT` |
| WordPress branch | `codex/wordpress-migration` |
| Deployed staging commit | `6d201b39829366b27d22c5de23b50e31960f5769` |
| TBT Core source commit | `e6f0f74f09d316b06aedaeede3ff5a14f6607be9` |
| Successful staging workflow | [Run 34262951673](https://github.com/barranaai/TBT/actions/runs/34262951673) |
| Workflow file | `.github/workflows/deploy-tbt-core-staging.yml` |
| Encrypted Actions secret | `TBT_STAGING_GODADDY_PRIVATE_KEY` — value not committed |
| QA tooling commit | `81b2137b15a7cb2d7c6c50738194bdefe7ca6447` |
| Source baseline | Visitor parity checked directly against `https://teethbytrev.com/` |
| GoDaddy project ID | `ukasxgp8ig` |
| GoDaddy production WordPress host | `32741.us6.myftpupload.com` — unchanged |
| GoDaddy staging WordPress host | `1254861.us6.myftpupload.com` |
| Staging WordPress / PHP | `7.0.4` / `8.1.34.15` |
| Live custom domain | `teethbytrev.com` and `www` continue to serve GoDaddy Airo Node/Next.js |
| Production DNS address | `160.153.0.235`, unchanged from inventory |
| Current rollback point | Pending capture before any production action |

## Immutable package evidence

| Release package | Version | SHA-256 |
| --- | --- | --- |
| `teeth-by-trev-theme.zip` | `0.2.5` | `fc4086e2bb1f9204cb613fe640cc044c2ae6763dc63ac1590fe5d958a675d229` |
| `tbt-core-plugin.zip` | `0.2.11` | `23b3241b10a5b55b50b47af2ce0ac107b09d9b154bc73cb96c9e751997fc8a0f` |

Both release archives pass ZIP integrity and manifest verification. Two
consecutive normalized package runs produced the same hashes. Active asset
markers confirm the installed versions; GoDaddy does not expose server-side
file hashes, so installed-byte hashes are not claimed.

## Verification completed

- The staging release reports TBT Core `0.2.11` and theme `0.2.5`.
- GitHub Actions run `34262951673` built the deterministic package, deployed
  only `.deploy/tbt-core` to staging `wp-content/plugins/tbt-core`, and passed
  the post-deploy integration health gate. The production host is absent from
  the workflow and GoDaddy production CI/CD remains disabled.
- Ten routes, 16 same-origin assets, and 11 internal links pass on staging.
- All ten routes pass at mobile, tablet, and desktop viewports.
- Twenty accessibility/performance scans pass with zero axe violations, LCP of
  approximately 580–1196 ms, and maximum CLS of 0.0829.
- New, Existing, and General enquiry branches require phone, Instagram handle,
  and at least one smile photo in the browser and REST endpoint.
- Hermetic Airtable mapping is exactly `Instagram: <handle>` for every intent.
- Hermetic Airtable, private-photo, Meta, and Square integration suites pass,
  including recovery, idempotency, and privacy checks.
- Square defaults to disabled, makes no outbound request while disabled, and
  accepts only exact `COMPLETED` payments as confirmed.
- Thirty staging-versus-live visual comparisons were reviewed: 20 direct
  passes and 10 documented controlled differences. Gallery passes at all three
  sizes; the remaining Reserve difference is the expected disabled-Square
  fallback. Named approval for the exceptions is pending.
- The staging health endpoint returned
  `{"ok":true,"plugin":"0.2.11","php":"8.1.34.15","wp":"7.0.4","storage":"wordpress-database","airtable":true,"airtablePending":0,"airtablePendingDeposits":0,"square":false}`.
- Staging remains `noindex, nofollow` with its page sitemap suppressed. The URL
  is publicly reachable; indexing controls are not access control.
- Production-only npm audit reports zero vulnerabilities. The full local QA
  toolchain has three moderate transitive findings in WordPress Playground's
  Express/`qs` dependency; no forced breaking downgrade was applied.
- The live site returned HTTP 200 and the production WordPress TBT health route
  remained HTTP 404, confirming that production still serves the existing
  GoDaddy Airo Node/Next.js application.
- The successful workflow has one non-blocking warning from GoDaddy's external
  `v1` action, which internally invokes `actions/checkout@v3`. Repository-owned
  checkout and setup-node steps use pinned Node 24-compatible v6 commits.

Detailed commands and chronology are in
[verification-log.md](verification-log.md). The production procedure is in
[deployment-runbook.md](deployment-runbook.md).

## Required staging evidence

Do not approve production until every pending item has timestamped evidence.

| Gate | Result | Evidence |
| --- | --- | --- |
| HTTPS staging excluded from indexing | Pass | `noindex, nofollow`; sitemap suppressed, 2026-09-08 |
| Staging access control | Pending | Publicly reachable; use only synthetic data and remove production credentials until access control exists |
| Theme and plugin versions/checksums | Pass | Theme `0.2.5` `fc4086e2…d229`; Core `0.2.11` `23b3241b…8a0f`, 2026-09-08 |
| Staging-only GitHub deployment | Pass | Actions run `34262951673`; plugin-only target and explicit health gate, 2026-09-08 |
| Automated route/responsive/accessibility/performance QA | Pass | 10 routes; 30 responsive renders; 20 axe/performance scans, 2026-09-08 |
| Automated visual/content comparison | Conditional | 30 comparisons reviewed; documented copy/footer and disabled-Square differences require named approval, 2026-09-08 |
| Hermetic Airtable/Meta/Square integrations | Pass | Complete integration suite, including all three enquiry types and payment safety states, 2026-09-08 |
| Three real staging leads with exact Social/private photos | Pending explicit submission approval | |
| Live Airtable forced-failure retry without duplicate | Pending | |
| Square sandbox credential isolation | Pending | Remove production credentials; validate sandbox app/location/token and environment before enabling |
| Square sandbox success/decline/ambiguous retry | Pending | Square intentionally disabled |
| Meta test-event receipt and deduplication | Pending | Hermetic coverage passes |
| SMTP delivery and reply-to | Pending | WordPress admin reports recent failures |
| Real cron pending-sync recovery | Pending | |
| Manual screen-reader smoke test | Pending | Automated axe/keyboard gates pass |
| Visual exception approval | Pending | Named reviewer; rerun Reserve after sandbox configuration |
| Database/files backup and isolated restore | Pending | |
| Current Node release/environment captured | Pending | DNS and runtime fingerprint captured |
| Rollback rehearsal | Pending | |
| Git branch and evidence | Pass at handoff | `origin/codex/wordpress-migration`; deployed staging commit `6d201b3`, Core source commit `e6f0f74`, tooling commit `81b2137`, and this report commit |

## Cutover rule

Production and DNS remain unchanged until every external gate passes and a
named production approval is recorded. Before cutover, capture the live Node
release, environment-variable inventory, database/files backup, DNS snapshot,
and rollback point. Retain the previous release and these exact package hashes
until the post-cutover observation window closes.
