# Teeth by Trev — Step-by-Step Elementor Build (free Elementor, GoDaddy Managed WP)

Follow these phases **in order**. The detailed per-section content (copy, widgets, images, colors) lives in [`elementor-build-kit.md`](elementor-build-kit.md) — this doc is the *procedure*; the kit is the *reference*. Reference design: https://tbt-2zh4.onrender.com

---

## Phase 0 — Prep (don't build on the live site yet)

1. **Build safely.** In GoDaddy → My Products → Managed WordPress → **create a Staging site** (or, if no staging on the plan, enable **Coming Soon / Maintenance mode** so visitors don't see a half-built site). Build there, publish at the end.
2. **Install plugins** (Plugins → Add New):
   - **Elementor** (free) — the page builder.
   - **Elementor Header & Footer Builder** by Nik (free) — *lets you build a global header/footer with free Elementor* (Elementor's own Theme Builder is Pro-only — this free plugin replaces it).
   - **Happy Addons for Elementor** (free) — adds a few widgets we need (image-compare/before-after, number counter, nicer galleries).
   - **WPForms Lite** *or* **Contact Form 7** (free) — for the inquiry form (Elementor's Form widget is Pro-only). *Use Contact Form 7 if you want the easiest free Airtable webhook (see Phase 6).*
3. **Theme:** use a lightweight theme like **Hello Elementor** (free, made for Elementor) so the theme doesn't fight your design.
4. **Upload images:** Media → Add New → upload every file from the **Asset Inventory** in the build kit. (They're already optimized in the project's `public/` folder.)
5. Fonts need no upload — Cormorant Garamond, Inter, Pinyon Script are built into Elementor's Google Fonts picker.

---

## Phase 1 — Global design system (do this FIRST — everything inherits it)

Open any page with Elementor → hamburger (≡) top-left → **Site Settings**.

1. **Global Colors** → set/add (from the kit's color table):
   - Primary = **Gold `#a8895c`**, Secondary = **Champagne `#b89b6e`**, Text = **Ink `#16130f`**, Accent = **Stone `#6f6557`**.
   - Add custom colors: **Onyx `#0c0a08`**, **Ink `#16130f`**, **Espresso `#2a241d`**, **Ivory `#f7f3ec`**, **Cream `#efe8dc`**, **Sand `#e3d8c6`**, **Taupe `#9a8f7d`**.
2. **Global Fonts** → create these typography styles:
   - **Primary / Headings** → Cormorant Garamond, weight 300–500.
   - **Text / Body** → Inter, weight 400 (300 for light passages).
   - **Accent (eyebrow labels)** → Inter, 500, size ~11–12px, **letter-spacing 0.28em, UPPERCASE**, color Gold.
   - **Script (signature)** → Pinyon Script, 400 (used only for "Dr. Trev" signature).
3. **Site Settings → Layout:** Content width **1200px** (sections can go full-width), default to **Flexbox containers**.
4. **Site Settings → Background:** set page background to **Onyx `#0c0a08`** (the site is dark) and default text to **Ivory `#f7f3ec`**.

> This is the highest-leverage step: once set, every heading/button/label across all pages pulls these tokens, so the whole site stays consistent and is easy to tweak later.

---

## Phase 2 — Header & footer (build once, shows on every page)

Using **Elementor Header & Footer Builder**: WordPress admin → **Appearance → Elementor Header & Footer Builder → Add New**.

1. **Header** (Type = Header, Display = Entire site):
   - Flexbox container, transparent background, padding ~30px, content width 1600px.
   - **Left:** the logo image → links to Home.
   - **Right:** a **Button** "Book" (links to the consultation/contact page) + a **menu**. With free Elementor, use the theme's **Nav Menu** via a WordPress menu (Appearance → Menus): create menu **Home, About, Services, Gallery, Financing, Contact**. (A full-screen overlay menu like the original needs Pro or a menu add-on — a standard horizontal or hamburger menu is the free equivalent.)
   - Optional: set it sticky (Happy Addons / Elementor "Motion Effects → Sticky" on the container).
2. **Footer** (Type = Footer, Display = Entire site) — per the kit's footer spec: logo, the address (436 N Bedford Dr #300, Beverly Hills, CA 90210), phone, social icons, the nav links, and the cities bar.

*(Skip Classic Site — it's been removed from the nav.)*

---

## Phase 3 — Build the Home page

1. Pages → **Add New** → title "Home" → **Edit with Elementor**.
2. Build it section-by-section following **Home (part 1 & 2)** in the build kit — for each section the kit gives the layout, the exact **widget** to use, the **verbatim copy**, the **image**, and the **colors/fonts**. Order: Hero → city marquee → Manifesto ("Dentistry is my ministry") → Stats → Selected Work → Trusted By / As Seen On → The Experience (3 steps) → Disciplines → Contact CTA.
3. Widget cheatsheet (all free): **Heading** (serif headlines), **Text Editor** (paragraphs), **Image**, **Button**, **Icon List** (the "—" bullet points), **Image Carousel/Gallery** (Selected Work / gallery), **Happy Addons Number Counter** (the stats), **Happy Addons Image Compare** (before/after).
4. Set it as the homepage: Settings → **Reading → Your homepage displays → A static page → Home**.

---

## Phase 4 — Build the inner pages

Repeat Phase 3 for each, using its section in the build kit:
- **About** (`/about`) — Meet Dr. Trev hero + philosophy.
- **Services** (`/services`) — 5 services incl. General Dentistry & Hygiene.
- **Gallery** (`/gallery`) — before/after slider + case grid.
- **Financing** (`/financing`) — benefits + the 4 partner cards (CareCredit, Alphaeon, Cherry, Proceed Finance) + FAQ.
- **Contact** (`/contact`) — hero + the form (Phase 5).

Each page → assign the right WordPress menu item so the nav links work.

---

## Phase 5 — The inquiry form

1. **Build the form** in your form plugin using the field list + options from the build kit's **Inquiry Form → Airtable** section. Fields: First/Last name, Phone (required), **Email (required)**, Social (required), City (select), Services (checkboxes), Goals (textarea, required), Budget (radios), Financing (Yes/No), Video Consult (checkbox), Photos (**file upload**, multiple), How did you hear (select).
   - Free plugins can't do the 4-step wizard — lay it out as **one page grouped into the same sections** with headings (or use a free CF7 multi-step add-on if you want the stepper feel).
2. **Embed it** on the Contact page: drop a **Shortcode** widget and paste the form's shortcode.
3. **$250 deposit:** add the "Reserve a private video consultation — $250" option, and link it to the **existing WooCommerce product / Square checkout** already set up on the site (no rebuild needed).

---

## Phase 6 — Wire the form to Airtable (free path)

Easiest free route is **Contact Form 7 + a webhook → Make.com (free) → Airtable**:

1. Install **"CF7 to Webhook"** (free). On the form, set its webhook URL to a **Make.com** scenario (free tier).
2. In **Make**: trigger = *Custom webhook* (receives the submission) → action = *Airtable → Create a Record* in base **Teeth By Trev**, table **Leads**.
3. **Map the fields** to the Airtable columns exactly as in the build kit (Caller Name = first+last, Phone Number, Email, Social, City, Services, Treatment Interest = goals, Budget, Financing, Video Consult, "How did you hear", Source = "Website").
4. **Photos:** the form's file-upload saves images to the WP **Media Library**; pass their URLs in the webhook and map them into Airtable's **Photos** (URL) field.
5. Send a test submission → confirm a row appears in **Leads**.

*(If you ever add Elementor Pro or WPForms Pro later, you can use their native Airtable/Zapier integrations instead — but the above is fully free.)*

---

## Phase 7 — Polish, responsive, SEO, launch

1. **Motion:** add subtle **Entrance Animations** (Advanced → Motion Effects → "Fade In Up") to headings/sections to echo the original's reveals. Keep it light.
2. **Responsive:** use Elementor's device preview (desktop/tablet/mobile) on every page — fix font sizes, stacking, and padding for mobile.
3. **SEO/meta:** install a free SEO plugin (Rank Math / Yoast free); set each page's title + meta description (reuse the descriptions from the current site), set the **favicon** and site logo (Site Settings → Site Identity).
4. **Final QA:** click every nav link + button, submit the form (→ Airtable row + photo + Square), check on a phone.
5. **Go live:** push **Staging → Production** (or turn off Coming Soon mode). Confirm the homepage, form, and payment all work on the real domain.
6. **Redirects (optional):** if the old WordPress pages had different URLs that are indexed, add redirects (Rank Math has a free redirect manager) so old links don't 404.

---

### Reality checks (free-Elementor limits)
- **No global header/footer in core Elementor** → solved by the free *Header & Footer Builder* plugin (Phase 2).
- **No multi-step form / native Airtable** in free → solved by single grouped form + CF7 webhook → Make → Airtable (Phases 5–6).
- **Rich interactions** (smooth-scroll, parallax, cursor-follow) → approximated with Elementor's standard entrance/motion effects; the *look* matches, the motion is simpler.
