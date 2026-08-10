# WordPress Release Evidence

## Release status

**Status:** Ready for credentialed staging verification; not approved for production cutover.

The visitor-facing WordPress replica is complete and passes the repository's hermetic integration, route, responsive, security, packaging, and dependency checks. The existing GoDaddy site has not been modified. Production approval remains conditional on real staging tests against the configured Airtable, Square, Meta, SMTP, cron, TLS, backup, and rollback environment.

## Identifiers

| Item | Value |
| --- | --- |
| Repository | `barranaai/TBT` |
| WordPress branch | `codex/wordpress-migration` |
| Package source commit | `a4237b329f3b6e8b900e60bd52bac46f1d5b17c9` |
| Source baseline | `origin/main` at `e19aa7c` |
| GoDaddy project ID | `ukasxgp8ig` |
| Current Airo preview host | `ukasxgp8ig.preview.c36.airoapp.ai` |
| Custom production domain | **Unverified — requires authenticated GoDaddy access** |
| Current deployment/release ID | **Unverified — requires authenticated GoDaddy access** |
| Current rollback point | **Unverified — capture before any staging or production action** |

The GoDaddy project was checked read-only on 2026-08-10. Its project URL redirected to GoDaddy sign-in, so domain bindings, deployment history, environment variables, and rollback controls could not be inspected. No hosting action was attempted.

## Immutable package evidence

| Package | SHA-256 |
| --- | --- |
| `teeth-by-trev-theme.zip` | `28a869aa50aba152b3a2dd7e1ec415497194805092073d43ba2ded6380fadbba` |
| `tbt-core-plugin.zip` | `38c17c3baab90b27468720954accd870471b1b29c97cd17f2770252855d1d7c6` |

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
- `npm audit` reports zero known vulnerabilities.

Detailed evidence and commands are in [verification-log.md](verification-log.md). The exact production procedure is in [deployment-runbook.md](deployment-runbook.md).

## Required staging evidence

Do not approve production until every item below is recorded with timestamp, operator, result, and supporting screenshot/log reference.

| Gate | Result | Evidence |
| --- | --- | --- |
| HTTPS staging URL protected from public indexing | Pending | |
| Theme and plugin checksums match this release | Pending | |
| Airtable test lead saved with exact Social and attachments | Pending | |
| Airtable forced-failure retry recovered without a duplicate | Pending | |
| Square sandbox success, decline, and ambiguous retry verified | Pending | |
| Meta consent off/on and shared event ID verified | Pending | |
| SMTP delivery and reply-to verified | Pending | |
| Real cron runner and pending-sync recovery verified | Pending | |
| Mobile/tablet/desktop visual comparison approved | Pending | |
| Accessibility keyboard and screen-reader smoke test approved | Pending | |
| Performance and cache behavior approved | Pending | |
| Database/files backup created and restore tested | Pending | |
| Current Node release and environment configuration captured | Pending | |
| Custom domain/DNS inventory captured | Pending | |
| Rollback rehearsal completed | Pending | |
| GitHub branch pushed and draft PR reviewed | Pending | |

## Cutover rule

The WordPress release must first use a separate, protected staging hostname. The current live deployment and DNS remain unchanged until all staging gates pass. At cutover, retain the previous Node release, database backup, DNS snapshot, environment-variable inventory, and these package checksums so rollback is immediate and auditable.
