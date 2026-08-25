# Teeth by Trev WordPress Replica

This directory contains the WordPress implementation of the current Teeth by
Trev Next.js website. It is intentionally isolated from the production source
on `main` while parity work happens on `codex/wordpress-migration`.

## Architecture

- `wp-content/themes/teeth-by-trev` — the visitor-facing custom theme.
- `wp-content/plugins/tbt-core` — enquiries, private photos, Airtable, Square,
  consent, Meta events, and operational data.
- `blueprint.json` — reproducible local WordPress setup for WordPress Playground.
- `docs/parity-contract.md` — the implementation and acceptance contract.
- `docs/release-evidence.md` — immutable package evidence and staging gates.

WordPress core, uploads, secrets, database files, and generated caches are not
committed.

## Local verification

The project uses WordPress Playground so contributors do not need a system-wide
PHP, MySQL, WordPress, or container installation.

```bash
npm install
npm run build
npm run playground
```

The local site runs at `http://127.0.0.1:9400` by default. The theme and plugin
directories are mounted into the Playground instance and activated by the
blueprint.

With Playground running, execute the repeatable parity checks in another
terminal:

```bash
npm run verify:local
npm run verify:responsive
npm run verify:quality
```

The verifier covers every source route (including `/classic`), exact titles and
descriptions, canonicals, redirects, internal links, visitor assets, health and
legacy Square endpoints, 404 behavior, and server-side mandatory-photo rules
for all three enquiry types. The responsive verifier uses an installed Chrome
or Chromium browser to check all routes at 375×844, 768×1024, and 1440×950. It
also exercises both menus, the comparison slider, counters, parallax, Classic
form handoff, enquiry requirements, default-off analytics consent, and the safe
Square fallback. Set `CHROME_PATH` only when the browser is not installed in a
standard location.

The quality verifier runs every route at mobile and desktop widths against axe
WCAG A/AA rules, the Chrome accessibility tree, heading/landmark and duplicate
ID checks, keyboard focus targets, and explicit CLS, LCP, load, TTFB, and
transfer budgets. It writes its ignored diagnostic report to
`artifacts/quality/quality-report.json`. Use `TBT_ROUTES` and `TBT_VIEWPORTS`
for a focused diagnostic run without weakening the default full matrix.

The credential-shaped Airtable, Square, and Meta paths have a separate
hermetic environment. It uses fake server constants and a mounted test-only
WordPress must-use plugin; no request can reach a real external account.

```bash
# Terminal 1
npm run playground:integration

# Terminal 2
npm run verify:integrations
```

This suite submits all three enquiry types, inspects exact Airtable fields,
retrieves private photos, proves failure/retry and scheduled recovery, verifies
Meta consent/deduplication without form-data leakage, and exercises Square
success, decline, idempotent retry, ambiguous-network handling, deposit
reconciliation, and browser SDK states.

To create production-ready install archives after a successful build:

```bash
npm run package
```

This writes `dist/teeth-by-trev-theme.zip` and
`dist/tbt-core-plugin.zip`, plus `dist/SHA256SUMS`. The source-only asset
directories are excluded; the compiled browser assets are included. Package
timestamps, entry order, locale, and timezone are normalized, so identical
source produces identical archives with the same build toolchain. Verify them with
`cd dist && shasum -a 256 -c SHA256SUMS` and `unzip -t`.

## Production configuration

The committed code contains no credentials. Configure the constants shown in
`config/wp-config.tbt.example.php` in the target site's `wp-config.php`, provide
matching server environment variables, or use **Settings → TBT Integrations**.
The admin screen encrypts secrets with the site's WordPress authentication
salts and never displays them again. Non-empty constants take precedence,
followed by non-empty environment variables and then encrypted site settings.
`SQUARE_ENABLED` is an independent fail-closed switch; leave it off on staging.

Production does not need Node.js: commit the generated files in each
`assets/dist` directory, then install and activate the theme and plugin. Plugin
activation creates the operational tables, canonical pages, front-page setting,
and rewrite rules.

See `docs/deployment-runbook.md` for the staged cutover and rollback procedure,
`docs/verification-log.md` for detailed test results, and
`docs/release-evidence.md` for package checksums and the production approval
gates.

## Non-negotiable rules

1. The current live site remains untouched until staging passes the parity
   contract.
2. Airtable, Square, Meta, and storage credentials remain server-side and are
   never committed.
3. Visitor smile images never enter the public WordPress Media Library.
4. Every change is verified locally before it is eligible for staging.
