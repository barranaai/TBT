# Staged Deployment Runbook

The live Node application and its domain must remain unchanged until the final
cutover gate is approved. The WordPress site is deployed first to an isolated
staging hostname with its own database and uploads directory.

## 1. Preserve the rollback point

1. Record the live GoDaddy project/release identifier, domain bindings, runtime
   variables, and current health-check result.
2. Export the current Airtable schema and take a database backup.
3. Do not remove or repoint the Node application during WordPress staging.

## 2. Prepare staging WordPress

1. Use WordPress 6.6+ and PHP 8.1+ with HTTPS.
2. Install `wp-content/themes/teeth-by-trev` and
   `wp-content/plugins/tbt-core` from this branch.
3. Add server-only values from `config/wp-config.tbt.example.php`, or save them
   in **Settings → TBT Integrations**. The WordPress screen encrypts secret
   values and never renders them back. Keep `SQUARE_ENABLED` off until the
   approved Square test environment is ready.
4. Activate TBT Core, then the Teeth by Trev theme. Activation creates the
   pages, operational tables, front-page option, and rewrite rules.
5. Set **Settings → Permalinks** to **Post name** and save once.
6. Keep search indexing disabled and add host-level access control. `noindex`
   and sitemap suppression are not access control. If the host cannot protect
   staging, record that exception, use synthetic data only, and do not retain
   production credentials there.
7. Confirm WordPress cron is functional. If loopback cron is disabled, schedule
   `wp cron event run --due-now` from the host at least every five minutes.

Required Airtable schema before testing:

- Leads: `Lead Reference`, `Submission Token`, `Caller Name`, `Email`, `Phone
  Number`, `Social`, and `Photos`. `Submission Token` must be a writable
  single-line text field and is the idempotent upsert key.
- Deposits: `Payment ID`, `Amount`, and `Service`. `Payment ID` must be a
  writable single-line text field and is the idempotent upsert key.
- Optional fields may be absent; the plugin drops an unknown optional field and
  retries once. Required fields are never silently dropped.

### Staging-only GitHub deployment

The repository workflow `.github/workflows/deploy-tbt-core-staging.yml` is
intentionally limited to the TBT Core plugin. It runs only for relevant pushes
to `codex/wordpress-migration` whose head commit contains `[deploy-staging]`.
It rebuilds the deterministic archive, extracts only `tbt-core/`, and deploys
that directory to staging `wp-content/plugins/tbt-core` with deletion disabled
and GoDaddy health rollback enabled.

The private deploy key is stored as the encrypted repository secret
`TBT_STAGING_GODADDY_PRIVATE_KEY`. Keep GoDaddy production CI/CD disabled. Do
not add the production host, a production key, a pull-request trigger, or the
repository root to this workflow. Theme releases remain a separate reviewed
deployment until a dedicated staging-only theme workflow is approved.

Monitor GoDaddy's official deploy action for an update: its current `v1`
composite internally invokes `actions/checkout@v3`, which produces a
non-blocking Node 20 deprecation warning even though the deployment succeeds.

## 3. External integration verification

1. Submit one new, existing, and general enquiry with clearly labelled staging
   test data.
2. Confirm each Airtable record, including `Social = Instagram: <handle>` and a
   working `Photos` staff link.
3. Verify a second POST with the same submission token creates no duplicate.
4. Temporarily block Airtable in staging, submit one labelled test enquiry,
   restore access, run the due cron event, and confirm `airtablePending` returns
   to zero at `/wp-json/tbt/v1/health` without a duplicate record.
5. Before enabling payments, remove any production Square credentials from
   staging. Save a sandbox access token, sandbox application ID, sandbox
   location ID, and `SQUARE_ENVIRONMENT=sandbox`; confirm the public Square
   configuration still reports disabled until the independent enable switch is
   deliberately turned on.
6. Run Square sandbox success, decline, `PENDING`/`APPROVED`/missing-status,
   retry/idempotency, and ambiguous-network cases. Only `COMPLETED` may produce
   a confirmed deposit. Confirm the WordPress deposit table and Airtable
   Deposits record, then turn the staging enable switch off again.
7. Repeat the Airtable interruption test for a labelled sandbox deposit and
   confirm `airtablePendingDeposits` returns to zero.
8. In Meta test events, verify no event before consent and one deduplicated Lead
   pair after consent. Confirm no form answers or contact data are sent.

## 4. Parity and quality gate

Verify every canonical route at desktop, tablet, and mobile widths against the
current preview. Check keyboard navigation, reduced motion, empty/error/success
states, links, metadata, redirects, 404s, image loading, cache behavior, and
page performance. Resolve every critical or high-severity difference before
cutover.

From the `wordpress/` directory, run the same committed verification against
the staging hostname:

```bash
TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
TBT_EXPECT_NOINDEX=1 \
npm run verify:local

TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
npm run verify:responsive

TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
npm run verify:quality

TBT_REFERENCE_URL=https://teethbytrev.com \
TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
npm run verify:visual-parity
```

Omit `TBT_BASIC_AUTH` when the host uses another access-control mechanism or
when a documented public-staging exception has been approved. Keep the reports,
screenshots, exception dispositions, and command output with the release
evidence. Separately run the hermetic upstream suite locally with
`npm run playground:integration` and `npm run verify:integrations`; it is not a
substitute for the labelled staging integration tests.

## 5. Cutover

1. Take fresh WordPress and Node backups.
2. Put the domain behind the shortest safe DNS/proxy TTL available.
3. Bind the production domain to WordPress without deleting the Node project.
4. Save the production Square environment, application ID, location ID, and
   access token; verify the identifiers belong to the approved production
   Square application; then explicitly enable `SQUARE_ENABLED`. Remove Meta
   test-event mode only after its live configuration is verified.
5. Purge caches, then run home/contact/reserve smoke tests and one labelled live
   enquiry. Avoid a real charge unless explicitly approved for the cutover test.
6. Monitor HTTP errors, enquiries, Airtable, Square, and Meta for the agreed
   observation window.

Record the exact Git commit, the package hashes in tracked release evidence and
the freshly generated `dist/SHA256SUMS`, database backup identifier, Node
rollback release, DNS values, and integration evidence before changing the
domain. Generated `dist/` files are intentionally untracked, so the committed
release report is the durable checksum record.

## 6. Rollback

If a critical route, lead, photo, or payment check fails, restore the previous
domain binding to the preserved Node release. Do not delete WordPress records;
reconcile any enquiries or payments created during the WordPress window by lead
reference/payment ID before retrying cutover.
