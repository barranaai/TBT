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
6. Keep search indexing disabled and protect the staging hostname.
7. Confirm WordPress cron is functional. If loopback cron is disabled, schedule
   `wp cron event run --due-now` from the host at least every five minutes.

Required Airtable schema before testing:

- Leads: `Lead Reference`, `Submission Token`, `Caller Name`, `Email`, `Social`,
  and `Photos`. `Submission Token` must be a writable single-line text field and
  is the idempotent upsert key.
- Deposits: `Payment ID`, `Amount`, and `Service`. `Payment ID` must be a
  writable single-line text field and is the idempotent upsert key.
- Optional fields may be absent; the plugin drops an unknown optional field and
  retries once. Required fields are never silently dropped.

## 3. External integration verification

1. Submit one new, existing, and general enquiry with clearly labelled staging
   test data.
2. Confirm each Airtable record, including `Social = Instagram: <handle>` and a
   working `Photos` staff link.
3. Verify a second POST with the same submission token creates no duplicate.
4. Temporarily block Airtable in staging, submit one labelled test enquiry,
   restore access, run the due cron event, and confirm `airtablePending` returns
   to zero at `/wp-json/tbt/v1/health` without a duplicate record.
5. Run Square sandbox success, decline, retry/idempotency, and ambiguous-network
   cases. Confirm both the WordPress deposit table and Airtable Deposits record.
6. Repeat the Airtable interruption test for a labelled sandbox deposit and
   confirm `airtablePendingDeposits` returns to zero.
7. In Meta test events, verify no event before consent and one deduplicated Lead
   pair after consent. Confirm no form answers or contact data are sent.

## 4. Parity and quality gate

Verify every canonical route at desktop, tablet, and mobile widths against the
current preview. Check keyboard navigation, reduced motion, empty/error/success
states, links, metadata, redirects, 404s, image loading, cache behavior, and
page performance. Resolve every critical or high-severity difference before
cutover.

Run the same committed verification against the protected staging hostname:

```bash
TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
TBT_EXPECT_NOINDEX=1 \
npm run verify:local

TBT_BASE_URL=https://staging.example.com \
TBT_BASIC_AUTH='user:password' \
npm run verify:responsive
```

Omit `TBT_BASIC_AUTH` only when protection is enforced outside HTTP Basic Auth.
Keep the screenshots and command output with the release evidence.

## 5. Cutover

1. Take fresh WordPress and Node backups.
2. Put the domain behind the shortest safe DNS/proxy TTL available.
3. Bind the production domain to WordPress without deleting the Node project.
4. Switch Square to production values and remove Meta test-event mode.
5. Purge caches, then run home/contact/reserve smoke tests and one labelled live
   enquiry. Avoid a real charge unless explicitly approved for the cutover test.
6. Monitor HTTP errors, enquiries, Airtable, Square, and Meta for the agreed
   observation window.

Record the exact Git commit, both entries from `dist/SHA256SUMS`, database
backup identifier, Node rollback release, DNS values, and integration evidence
before changing the domain.

## 6. Rollback

If a critical route, lead, photo, or payment check fails, restore the previous
domain binding to the preserved Node release. Do not delete WordPress records;
reconcile any enquiries or payments created during the WordPress window by lead
reference/payment ID before retrying cutover.
