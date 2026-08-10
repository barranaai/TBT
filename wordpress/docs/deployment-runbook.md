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
3. Add the server-only values from `config/wp-config.tbt.example.php`, starting
   with Square sandbox and Meta test-event mode.
4. Activate TBT Core, then the Teeth by Trev theme. Activation creates the
   pages, operational tables, front-page option, and rewrite rules.
5. Set **Settings → Permalinks** to **Post name** and save once.
6. Keep search indexing disabled and protect the staging hostname.

## 3. External integration verification

1. Submit one new, existing, and general enquiry with clearly labelled staging
   test data.
2. Confirm each Airtable record, including `Social = Instagram: <handle>` and a
   working `Photos` staff link.
3. Verify a second POST with the same submission token creates no duplicate.
4. Run Square sandbox success, decline, retry/idempotency, and ambiguous-network
   cases. Confirm both the WordPress deposit table and Airtable Deposits record.
5. In Meta test events, verify no event before consent and one deduplicated Lead
   pair after consent. Confirm no form answers or contact data are sent.

## 4. Parity and quality gate

Verify every canonical route at desktop, tablet, and mobile widths against the
current preview. Check keyboard navigation, reduced motion, empty/error/success
states, links, metadata, redirects, 404s, image loading, cache behavior, and
page performance. Resolve every critical or high-severity difference before
cutover.

## 5. Cutover

1. Take fresh WordPress and Node backups.
2. Put the domain behind the shortest safe DNS/proxy TTL available.
3. Bind the production domain to WordPress without deleting the Node project.
4. Switch Square to production values and remove Meta test-event mode.
5. Purge caches, then run home/contact/reserve smoke tests and one labelled live
   enquiry. Avoid a real charge unless explicitly approved for the cutover test.
6. Monitor HTTP errors, enquiries, Airtable, Square, and Meta for the agreed
   observation window.

## 6. Rollback

If a critical route, lead, photo, or payment check fails, restore the previous
domain binding to the preserved Node release. Do not delete WordPress records;
reconcile any enquiries or payments created during the WordPress window by lead
reference/payment ID before retrying cutover.
