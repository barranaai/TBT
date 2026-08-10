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

To create production-ready install archives after a successful build:

```bash
npm run package
```

This writes `dist/teeth-by-trev-theme.zip` and
`dist/tbt-core-plugin.zip`. The source-only asset directories are excluded;
the compiled browser assets are included.

## Production configuration

The committed code contains no credentials. Configure the constants shown in
`config/wp-config.tbt.example.php` in the target site's `wp-config.php`, or
provide matching server environment variables. The plugin reads constants
first and environment variables second.

Production does not need Node.js: commit the generated files in each
`assets/dist` directory, then install and activate the theme and plugin. Plugin
activation creates the operational tables, canonical pages, front-page setting,
and rewrite rules.

See `docs/deployment-runbook.md` for the staged cutover and rollback procedure,
and `docs/verification-log.md` for current evidence and remaining external
checks.

## Non-negotiable rules

1. The current live site remains untouched until staging passes the parity
   contract.
2. Airtable, Square, Meta, and storage credentials remain server-side and are
   never committed.
3. Visitor smile images never enter the public WordPress Media Library.
4. Every change is verified locally before it is eligible for staging.
