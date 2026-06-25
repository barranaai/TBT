# Teeth by Trev — Session Notes & Handoff

> Curated handoff (not a verbatim chat transcript) so this project can be continued on any machine or by anyone. Last updated: 2026-06-23.

---

## 1. What this is
A luxury cosmetic & implant dentistry site for **Dr. Trevor J. Thomas ("Teeth by Trev")**. Dark, editorial "Atelier" design. Built in **Next.js**, currently the primary marketing site + a working inquiry pipeline.

## 2. Where it lives
- **Git:** `https://github.com/barranaai/TBT.git` (private, `barranaai` account).
- **Live (staging/production) on Render:** service **`tbt-2zh4`** → **https://tbt-2zh4.onrender.com** — auto-deploys on every push to `main`. **Starter plan** + a **persistent disk** mounted at `/var/data` (for photo uploads).
- **Reference for the WordPress rebuild** (see §6).

## 3. Tech stack
Next.js 16 (App Router, React 19, TypeScript) · Tailwind CSS v4 (`@theme` in `app/globals.css`) · Lenis smooth-scroll · Turbopack. Node app with server API routes (so it needs a Node host — **not** PHP/WordPress).

## 4. Current state — routes & pages
| Route | Notes |
|---|---|
| `/` | Primary homepage (Atelier dark design) |
| `/about`, `/services`, `/gallery`, `/financing`, `/contact` | Inner pages (dark aesthetic, shared `PageHero`) |
| `/consultation` | Booking page — ⚠️ CTAs point at a placeholder URL (see punch-list #1) |
| `/classic` | Old light design, **orphaned** (nothing links to it) — candidate for deletion |
| `/atelier` | Redirects to `/` |

Two component trees: **`app/atelier/components/*`** (live site) and **`app/components/*`** (only powers `/classic`). See punch-list #12.

## 5. Integrations & how they work
- **Contact form** (`app/contact/InquiryForm.tsx`): a **4-step wizard** (Contact → Your Smile → Investment → Finish). On submit it POSTs JSON to **`/api/inquiry`**.
- **`/api/inquiry`** (`app/api/inquiry/route.ts`): writes a record to **Airtable** and saves photos.
  - Airtable base **`app6h7RW9nfFS723D`** ("Teeth By Trev"), table **`Leads`**.
  - Field mapping → columns: first+last → **Caller Name**; phone → **Phone Number**; goals → **Treatment Interest**; "how did you hear" → **How did you hear**; plus Email/Social/City/Services/Budget/Financing/Video Consult; **Source** hard-set to "Website"; **Photos** = gallery URL. Uses `typecast: true`.
  - **Photos:** downscaled in-browser → base64 in the JSON → written to a per-lead folder (`name-phone-random`) under `UPLOAD_DIR` on the Render disk. Served by **`/api/photos/[...path]`** as a gallery page (with path-traversal guard); that folder URL goes in Airtable's Photos field.
  - Degrades gracefully: if Airtable/disk aren't configured, the visitor still completes the flow; failures are logged server-side.
- **$250 deposit:** Square hosted link **`https://square.link/u/wISlz03Z`** (shown on the success screen when the video-consult box is ticked). The WordPress site also has an existing WooCommerce product for this.
- **Render env vars (secrets, set in dashboard):** `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID=app6h7RW9nfFS723D`, `AIRTABLE_TABLE_NAME=Leads`, `UPLOAD_DIR=/var/data/uploads`. (`PUBLIC_BASE_URL` optional — otherwise derived from request host.) See `.env.example`.

## 6. Go-live decision (IMPORTANT) — WordPress/Elementor rebuild
**The client mandates the site stay on their GoDaddy *Managed* WordPress hosting.** A Next.js (Node) app **cannot run** on Managed WordPress (PHP-only). Decision:
- **Keep the Next.js site on Render as the reference/spec** (do not try to host it on GoDaddy).
- **Rebuild the design as a free-Elementor WordPress site** on GoDaddy. They have **free Elementor only** (no Pro).
- Deliverables for that rebuild (in this repo):
  - **`docs/elementor-build-kit.md`** — design system (global colors/fonts for Elementor Site Settings), per-page section specs with verbatim copy + free-widget mapping, form→Airtable wiring, asset inventory.
  - **`docs/elementor-step-by-step.md`** — ordered build procedure (prep → globals → header/footer → pages → form → Airtable webhook → launch).
- WordPress-specific notes: global header/footer via the free **"Elementor Header & Footer Builder"** plugin; form via free **Contact Form 7** + **"CF7 to Webhook"** → **Make.com** (free) → Airtable; photos via the form's file upload → WP Media Library → Airtable URL; **$250 via the existing WooCommerce/Square** product.

### Domain / DNS facts (GoDaddy)
Domain `teethbytrev.com`: DNS at **GoDaddy** (`ns*.domaincontrol.com`), web at GoDaddy WP (`160.153.0.136`), **email at Proofpoint (`*.ppe-hosted.com` MX) — do NOT touch MX records.**

## 7. Open punch-list (from a full-site review — prioritized)
**🔴 High (fix before launch):**
1. **`/consultation` "Reserve $250" buttons → placeholder** `diverzeent.com/tbv-inquiry/` (has a `TODO`), not the real checkout. Decide the real URL (Square link or WooCommerce) and wire it. *(Blocks both the Next site and the WP build.)*
2. **`/classic` Consultation form silently discards submissions** (`app/components/Consultation.tsx` — `type=submit` with no `onSubmit`/`action`). Bounded to the orphaned `/classic`.
3. **22.9 MB hero video auto-downloads** on `/` and `/classic` (`AtelierHero.tsx`, `Hero.tsx`). Add `preload="none"` and re-encode to a few MB.
4. **Mobile nav: closed overlay links stay keyboard-focusable** (`AtelierNav.tsx`) — add `inert`/`aria-hidden` when closed. (Every page.)

**🟠 Medium:**
5. **Site-wide low-contrast text fails WCAG AA** — low-opacity `gold`/`ivory` tokens (eyebrows, footer, captions). Fix at the token level.
6. Mobile menu isn't a proper dialog (no Esc, focus trap/restore, `role=dialog`).
7. Hero video ignores `prefers-reduced-motion` (keeps looping).
8. Content vanishes with **no-JS / before hydration** (`.reveal` opacity:0; hero `<h1>` clipped until a timer; Stats show "0"). Make SSR state visible.
9. **SEO gaps:** no Open Graph/Twitter/`metadataBase`; no `robots.ts`/`sitemap.ts`/canonicals; `/classic` is an indexable duplicate homepage (needs `noindex` or deletion).
10. `/atelier` redirect is 307 (temporary) despite a "permanent" comment — use `permanentRedirect`.
11. Scroll-lock race on `/contact` cold load (nav effect overwrites IntroVeil's body-overflow lock).

**🟡 Architecture / dead code:**
12. `app/components/*` is orphaned (only `/classic` uses it). If retiring `/classic`, deletable: Nav, Hero, HeroHeadline, Philosophy, Services, Gallery, RevealImage, FeatureBand, Financing, Consultation, SectionDivider, PullQuote, and the fully-unused `SmilePlaceholder.tsx`. **Keep** `SectionMotifs` and `components/Process` (still used by `/services`).

**Lower notes:** BeforeAfter slider a11y (preventDefault, Home/End keys, `aria-valuetext`); gallery captions are hover-only (invisible to touch/keyboard); footer social icons <44px tap target; `/classic` duplicate `04` section index; InquiryForm has no client-side file size/type check (8 MB server cap vs "10 MB" copy); homepage CTA uses raw `<a>` instead of `next/link`.

## 8. Known content issue
Some AI images have **"LOS ANGELES" baked into the wall** (Smile Design, `trev-veneer-craft.jpg`, `trev-intraoral-scan.jpg`) — the practice is Beverly Hills-based. Client to regenerate those with "Beverly Hills" (Atlanta & New York on the wall are fine — they're real cities). `/gallery` cases 1 & 3 were already swapped to clean images.

## 9. Run locally / deploy
```bash
git clone https://github.com/barranaai/TBT.git && cd TBT
npm install
npm run dev        # http://localhost:3000
```
Deploy = push to `main` (Render auto-deploys). For the Airtable/photos to work locally, set the env vars from `.env.example` in a `.env.local`.

## 10. Companion docs
- `docs/elementor-build-kit.md` — full WP/Elementor build reference.
- `docs/elementor-step-by-step.md` — ordered build procedure.
- `CLAUDE.md` — project instructions (auto-loaded by Claude Code).
