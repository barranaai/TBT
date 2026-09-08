# Teeth by Trev Website

This repository contains two implementations:

- the existing Next.js application, retained as the production baseline and
  rollback source;
- the WordPress replica in [`wordpress/`](wordpress/), developed on
  `codex/wordpress-migration` and deployed only to the isolated GoDaddy staging
  environment until production approval.

The live domain and production WordPress host must not be changed from this
branch without completing the WordPress release gates and receiving explicit
cutover approval.

## Next.js baseline

Install dependencies and start the hot-reload local development server:

```bash
npm install
npm run dev:local
```

`npm run dev` and `npm start` run Next.js in production mode; they are not
hot-reload development commands. `npm run build:next` creates a fresh Next.js
build. Do not redeploy the baseline merely to test the WordPress migration.

The visitor design uses Cormorant Garamond, Inter, and Pinyon Script, with the
onyx, ivory, gold, and champagne palette documented in the WordPress parity
contract.

## WordPress replica

The custom theme, TBT Core plugin, reproducible WordPress Playground setup,
tests, package scripts, release evidence, and deployment runbook are under
[`wordpress/`](wordpress/).

```bash
cd wordpress
npm install
npm run build
npm run playground
```

See:

- [`wordpress/README.md`](wordpress/README.md) for local development and tests;
- [`wordpress/docs/qa-report-2026-09-08.md`](wordpress/docs/qa-report-2026-09-08.md)
  for the latest professional QA result;
- [`wordpress/docs/deployment-runbook.md`](wordpress/docs/deployment-runbook.md)
  for staging, cutover, and rollback controls.

## Deployment rule

WordPress is packaged as deterministic theme and plugin ZIP archives and is
deployed through the GoDaddy WordPress staging workflow. Vercel is not the
deployment target for this migration. Production DNS, the live Node project,
and the production WordPress host remain unchanged until every external gate
passes and a named approval is recorded.
