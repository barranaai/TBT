# WordPress Parity Contract

The WordPress implementation is not eligible for staging or production until
every item in this contract is verified against the current live website.

## Canonical routes

| Route | WordPress template | Required behavior |
| --- | --- | --- |
| `/` | `front-page.php` | Atelier home, video hero, marquee, sections, global navigation/footer |
| `/about` | `page-about.php` | Dentist biography, credentials, CTA |
| `/services` | `page-services.php` | Complete services list, process, CTA |
| `/gallery` | `page-gallery.php` | Before/after and case imagery |
| `/financing` | `page-financing.php` | Benefits, partners, FAQ, CTA |
| `/contact` | `page-contact.php` | Three-path enquiry wizard |
| `/consultation` | `page-consultation.php` | In-person/video consultation options |
| `/reserve` | `page-reserve.php` | Square $250 deposit; `noindex` |
| `/privacy` | `page-privacy.php` | Enquiry, SMS, and optional analytics disclosures |
| `/terms` | `page-terms.php` | Business, messaging, consultation and site terms |

`/atelier` permanently redirects to `/`, matching the current canonical
homepage decision. The retired `/classic` path returns a normal 404 and is not
published or included in the sitemap.

## Global visual contract

- Cormorant Garamond, Inter, and Pinyon Script typography.
- Onyx/ivory/gold/champagne palette and editorial spacing.
- Fixed navigation, accessible full-screen menu, Intro Veil, film grain.
- Video hero, marquee, reveal, line-reveal, image curtain, and parallax behavior.
- Keyboard focus, inert closed menu, reduced-motion support, and responsive
  desktop/tablet/mobile layouts.
- Exact copy, link destinations, alt text, metadata, icons, and social previews.

## Enquiry contract

- Branches: new consultation, existing-patient support, general/business.
- Instagram handle is visible and mandatory for every branch/contact method.
- At least one smile image is mandatory for every branch.
- Phone is mandatory for every branch.
- Only the active branch's fields are submitted and stored.
- Submission tokens are unique and idempotent; success returns a human lead
  reference.
- Airtable writes are idempotent upserts on `Submission Token`; failed writes
  remain locally queued and are retried without duplicating the lead.
- Airtable `Social` stores `Instagram: <handle>` and `Photos` stores a working,
  access-controlled staff link.
- Required contact permission, optional SMS consent, optional email-marketing
  consent, and analytics consent stay distinct. SMS opt-in is stored separately
  with its timestamp and disclosure version.

## Operational contract

- Private image storage; no public Media Library URLs.
- Server-side Airtable, Square, and Meta credentials.
- Square browser tokenization, server charge, stable idempotency, and payment
  reconciliation.
- Deposit Airtable writes are idempotent upserts on `Payment ID`; locally logged
  deposits remain queued until Airtable confirms the record.
- Meta Pixel and CAPI run only after analytics consent and share a dedupe ID.
- Existing inquiry, photo, and deposit history remains recoverable after
  cutover.
- Production can roll back to the Node application without losing leads.

## Verification gates

1. Source/route inventory approved.
2. Theme/plugin boot on supported WordPress and PHP versions with no warnings.
3. Screenshot parity at desktop, tablet, and mobile breakpoints.
4. Accessibility and reduced-motion checks pass.
5. Three enquiry types pass client, server, Airtable, and photo checks.
6. Square sandbox success/decline/idempotency/reconciliation checks pass.
7. Consent, Meta deduplication, SEO, redirects, security, and performance pass.
8. Staging user acceptance and rollback rehearsal pass before domain cutover.
