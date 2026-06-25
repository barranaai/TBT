# Teeth by Trev — WordPress + Elementor Build Kit

This is a build guide to recreate the live Next.js design (reference: https://tbt-2zh4.onrender.com) as a **WordPress site using the FREE Elementor** page builder, hosted on the client's GoDaddy Managed WordPress.

**How to use this kit**
1. In WordPress, install Elementor (free). Optionally a free add-on pack (Happy Addons / ElementsKit free) for a few widgets noted below.
2. Set up the **Design System** below in Elementor → Site Settings → Global Colors & Global Fonts so every section pulls from the same tokens.
3. Upload all images from the **Asset Inventory** into the Media Library.
4. Build each page section-by-section using the per-page specs (free Elementor widgets only). The copy is verbatim and launch-ready.
5. Build the inquiry form per the **Inquiry Form → Airtable** section, and use the existing WooCommerce/Square product for the $250 deposit.

> Note: the original site has rich interactions (multi-step form wizard, smooth-scroll, scroll reveals, parallax). In free Elementor these become standard Elementor entrance/motion effects — close in feel, not identical. Where a feature needs Pro or an add-on, it's flagged with a free fallback.

---

## Recommended free Elementor setup
- **Elementor (free)** — core builder.
- A **free add-on pack** for missing widgets where flagged (e.g. Happy Addons Free, ElementsKit Free) — for counters, before/after, advanced galleries.
- A **free form plugin** (WPForms Lite or Contact Form 7) for the inquiry form (Elementor's Form widget is Pro-only).
- Set the container layout to Flexbox containers (Elementor's modern default).

---

## Design System

### Global Colors

| Token Name | Hex Value | Where Used |
|------------|-----------|------------|
| Ivory | `#f7f3ec` | Default page background (`--color-background`); body bg; selection text color; lightest surface |
| Cream | `#efe8dc` | Secondary warm surface / panel fill |
| Sand | `#e3d8c6` | Tertiary warm surface, subtle dividers/cards |
| Taupe | `#9a8f7d` | Muted mid-tone accent, secondary text |
| Stone | `#6f6557` | Body/secondary text; default border (used at 18% opacity for hairline borders) |
| Espresso | `#2a241d` | Dark warm tone, deep section backgrounds |
| Ink | `#16130f` | Default foreground/text color (`--color-foreground`); body text |
| Onyx | `#0c0a08` | Darkest tone — near-black backgrounds, footer/hero overlays |
| Champagne | `#b89b6e` | Decorative accents (drifting dental line-art motifs at low opacity) |
| Gold | `#a8895c` | Primary brand accent — eyebrow labels, accent lines, link underline sweep, text selection background |

Suggested Elementor roles: Primary = Gold `#a8895c`, Secondary = Champagne `#b89b6e`, Text = Ink `#16130f`, Accent = Stone `#6f6557`, plus custom colors for Ivory/Cream/Sand/Taupe/Espresso/Onyx.

### Global Fonts / Typography

All three are free Google Fonts available natively in Elementor's font picker.

| Font | Role | Weights | Style | Conventions (size / spacing / case) |
|------|------|---------|-------|--------------------------------------|
| **Cormorant Garamond** | Headings (serif) — h1/h2/h3, display | 300, 400, 500, 600 | Normal + Italic | Large display serif; enables ligatures/kerning (`dlig`); `text-wrap: balance`. Use for hero/section headlines. |
| **Inter** | Body + UI (sans-serif) — default | 300, 400, 500, 600 | Normal | Default body font; paragraphs `text-wrap: pretty`; also used for eyebrow labels. |
| **Pinyon Script** | Script accent (signature) | 400 | Normal | Handwritten signature flourish (`.font-script`); decorative use only, e.g. doctor's signature. |

Typography conventions observed in CSS:

| Element | Family | Size | Weight | Letter-spacing | Transform |
|---------|--------|------|--------|----------------|-----------|
| Eyebrow label (`.eyebrow`) | Inter (sans) | `0.72rem` (~11.5px) | 500 | `0.28em` (`--tracking-luxe`) | UPPERCASE, color = Gold |
| H1 / H2 / H3 | Cormorant Garamond (serif) | Display scale | 300–600 | normal | Balanced line breaks |
| Body / paragraph | Inter (sans) | base | 300–400 | normal | sentence case |
| Signature script (`.font-script`) | Pinyon Script | as-placed | 400 | normal | as-typed |

Notes: body has antialiasing + `font-feature-settings: "kern" 1, "liga" 1, "calt" 1`; serif headings add `"dlig" 1` and `font-kerning: normal`.

### Reusable Style Conventions

- **Gold "eyebrow" label** (`.eyebrow`): small uppercase tracked label above headings — Inter 500, `0.72rem`, letter-spacing `0.28em`, color Gold `#a8895c`. The signature tracked-cap micro-label of the brand.
- **Thin gold accent line** (`.accent-line`): 1px-tall rule, width `3.5rem` (56px), background Gold `#a8895c`, left-origin; pairs under eyebrows/headings. Animates in (`scaleX 0→1`) with its parent reveal.
- **Gold link underline sweep** (`.link-sweep`): 1px gold underline that wipes in on hover/focus (`scaleX`, origin right→left) over `0.45s`.
- **Luxe tracking token** (`--tracking-luxe = 0.28em`): the standard wide letter-spacing for all uppercase labels.
- **Hairline borders**: global border color is Stone at 18% opacity — `color-mix(in srgb, #6f6557 18%, transparent)`. Use a very faint warm-grey for dividers/card outlines.
- **Text selection**: background Gold `#a8895c`, text Ivory `#f7f3ec`.
- **Section padding rhythm**: generous vertical spacing with editorial reveal motion — content rises `32px` with a blur-in (`reveal`), headlines use a clip-mask line rise (`line-reveal`), and images wipe in via clip-path with a slight scale settle (`img-reveal`); standard easing `cubic-bezier(0.16, 1, 0.3, 1)` over ~1.1–1.5s.
- **Atmosphere**: fixed film-grain overlay at 6% opacity (`overlay` blend) site-wide; low-opacity (0.14) Champagne dental line-art motifs drift in section backgrounds. All motion respects `prefers-reduced-motion`.

Source files: `/Users/faran/TBT/app/globals.css` and `/Users/faran/TBT/app/layout.tsx`.

---

# Pages

---


## Home (part 1: nav → hero → marquee → manifesto → stats) Page (/)

> Design system tokens referenced throughout: **onyx** (near-black page background, `bg-onyx`), **ink** (slightly different dark for the stats band, `bg-ink`), **ivory** (off-white primary text), **gold** (metallic accent — links, italic emphasis, frame, dividers), **champagne** (lighter gold used on stat numbers/suffix). Fonts: **serif** (display headings, the marquee, the manifesto), **sans** (small uppercase labels and the tiny menu numerals), **script** (the handwritten "Dr. Trev" signature). Recurring label style: tiny (~0.6rem) UPPERCASE, very wide letter-spacing (`tracking-[0.24em]` → `[0.34em]`), low-opacity ivory or gold. The whole page sits on an onyx background.

---

### Section 0 — Site Header / Navigation (`AtelierNav`)

**Purpose:** Fixed top bar with the brand logo, a "Book" button, and a hamburger that opens a full-screen overlay menu.

**Verbatim copy**
- Logo image alt text: `Teeth by Trev — Dental Atelier`
- Logo link aria-label: `Teeth by Trev — home`
- Inline button text: `Book` (links to `/consultation`)
- Hamburger toggle label text: `Menu` (changes to `Close` when open); aria-labels `Open menu` / `Close menu`
- Overlay menu items (each prefixed with a zero-padded number `01`–`06`), in order:
  - `01` `Home` → `/`
  - `02` `About` → `/about`
  - `03` `Services` → `/services`
  - `04` `Gallery` → `/gallery`
  - `05` `Financing` → `/financing`
  - `06` `Contact` → `/contact`
- Overlay CTA button: `Book a Consultation →` (links to `/consultation`)

**Layout**
- Fixed bar, full width, max content width 1600px, generous side padding. Logo on the LEFT, a right group containing the **Book** button + hamburger/"Menu" toggle on the RIGHT.
- Behavior on scroll: when the page is scrolled past ~32px the bar gains a translucent onyx backdrop with blur and a thin bottom border, and the vertical padding shrinks (tall when at top, compact once scrolled).
- The "Book" inline button is hidden on mobile (`sm:` and up only); the hamburger/Menu toggle is always visible.
- Clicking the hamburger opens a **full-screen onyx overlay** that fades in and covers the viewport; menu items are vertically centered, stacked as a list with the numeral to the left and the large serif label to the right; the CTA button sits below. Opening the menu locks body scroll.
- Logo renders at a fixed height (~48px, `h-12`, width auto).

**Free Elementor widgets to use**
- Build this as the Elementor **Site Header** template part (Theme Builder is Pro; on free Elementor use the theme's native menu/header or the free **"ElementsKit"** / **"Header Footer Elementor"** plugin to assign an Elementor-built header).
- Logo: **Image** widget (or Site Logo) linked to `/`.
- Menu: free Elementor has no native nav-menu widget — use the theme's built-in menu, or the free **"ElementsKit"** add-on (its Nav Menu widget) / **"Header Footer Elementor"** plugin. Reproduce the 6 items above.
- "Book" button: **Button** widget, link `/consultation`.
- Hamburger + full-screen overlay menu: not available in free Elementor natively. Simplest free path: use the free **"Header Footer Elementor"** or **"ElementsKit"** mobile/off-canvas menu for the overlay; the numbered, vertically-centered serif overlay is a custom effect — fall back to a standard responsive toggle menu, or hand-code the overlay with an **HTML** widget if exact fidelity is required.
- Sticky/shrink-on-scroll bar: use the theme's "sticky header" option (many free themes like Astra/Hello+Header-Footer-Elementor support it); the padding-shrink animation is a nice-to-have, not essential.

**Images used**
- `/brand/tbt-atelier-logo.png`

**Style notes**
- Bar transparent at top; on scroll → `bg-onyx/85` with backdrop blur and `border-ivory/10` bottom border.
- "Book" button: gold text, gold/50 border, no fill; on hover fills gold with onyx text. Tiny uppercase, wide tracking (`0.24em`).
- Hamburger label: ivory, tiny uppercase, `0.28em` tracking; three 1px ivory bars that animate into an X when open.
- Overlay numerals: sans, gold at ~70% opacity. Overlay labels: serif, light weight, large (4xl → 6xl), ivory at ~80% opacity, turning gold on hover. Overlay CTA: gold text/gold border, fills gold on hover.

---

### Section 1 — Hero (`AtelierHero` + `AtelierHeroIntro`)

**Purpose:** Full-viewport cinematic opener establishing the "smile as art" positioning, with an autoplaying background video and the primary consultation CTA.

**Verbatim copy** (top eyebrow row, left → right)
- `N° 01`
- `Cosmetic Atelier — Est. Beverly Hills` (hidden on mobile, shown `sm:` and up)
- `Dr. Trevor J. Thomas`

**Headline** (one `<h1>`, two lines):
- Line 1: `Where the smile`
- Line 2: `becomes art.` — the word **`art.`** is italic and gold; "becomes" is regular.

**Subhead paragraph:**
> An atelier of cosmetic & implant dentistry — composing faces, restoring confidence, and finishing every smile by hand.

(Note: the source uses `&amp;` = a literal `&`.)

**CTA button:** `Request a Consultation →` (links to `/consultation`)

**Scroll cue (bottom-center):** `Scroll to enter`

**Layout**
- Full viewport height (`min-h-dvh`), content vertically centered, horizontally centered text. Single column, max ~1600px wide with centered headline constrained to ~5xl width.
- Background: a looping muted autoplay video at ~30% opacity with a slow zoom; two dark gradient overlays (top-to-bottom onyx fade + a radial vignette) so text stays legible.
- A thin **gold inset frame** (border) is inset from all four edges of the section.
- Eyebrow row is a 3-part justified row across the top of the content block; the middle item drops on mobile.
- Entrance animation: headline lines reveal upward in sequence, subhead and button fade/slide up shortly after (decorative — not required for WP).

**Free Elementor widgets to use**
- Use a full-height **Section/Container** with the video as background. Background video is supported in free Elementor's section background settings (set a poster image and the MP4 URL) — this covers the autoplay/loop/mute behavior natively. Add the dark overlay via the section's Background Overlay (a gradient overlay, free).
- Eyebrow row: a 3-column inner **Container** with three **Text Editor**/**Heading** widgets (left/center/right). Hide the center column on mobile via Elementor's responsive visibility (free).
- Headline: **Heading** widget (allow the inline `art.` to be italic+gold using the heading's HTML, or split into two Heading widgets).
- Subhead: **Text Editor**.
- CTA: **Button** widget, link `/consultation`, label `Request a Consultation →`.
- Gold inset frame: add a border to an absolutely-styled inner Container, or use **HTML** widget; simplest free fallback is a Container with a gold border and inner padding.
- Scroll cue: small **Heading**/**Text Editor** pinned bottom-center (use Spacer + alignment).
- The magnetic-cursor button effect and line-reveal animations are not in free Elementor — use a plain button + Elementor's built-in entrance animation as the closest free approximation.

**Images / media used**
- Video: `/video/trevor-hero.mp4`
- Video poster: `/video/trevor-hero-poster.jpg`

**Style notes**
- Section background onyx; video at 30% opacity with gradient + radial vignette overlays toward onyx.
- Headline: serif, light weight, very large (≈3.25rem mobile → 7.5rem desktop), tight leading, ivory; `art.` italic gold.
- Subhead: small, relaxed leading, ivory at ~55% opacity, narrow max-width (~md), centered.
- Eyebrow + scroll cue: tiny uppercase, wide tracking, ivory at low opacity.
- CTA: ivory text, ivory/30 border, transparent fill; hover → gold border + gold text.

---

### Section 2 — City Marquee (`Marquee`)

**Purpose:** A thin horizontally-scrolling strip of cities served, reinforcing reach/exclusivity.

**Verbatim copy** (the city list, in order; the array is duplicated for a seamless loop):
- `Beverly Hills`
- `New York`
- `Atlanta`
- `Houston`
- `Washington D.C.`
- `Tampa`
- `Memphis`

Each city is followed by a gold star glyph: `✦`

**Layout**
- Full-width thin band with a top and bottom hairline border, modest vertical padding. Content is a single horizontal row that auto-scrolls right-to-left in an infinite loop (~38s linear, paused/none for reduced-motion users). Overflow hidden.

**Free Elementor widgets to use**
- Free Elementor has no native scrolling-marquee/ticker widget. Options:
  - Free add-on: **"Happy Addons" (free)** does not include a ticker; **"ElementsKit"** free tier has limited tickers. The most reliable free route is an **HTML** widget containing the city list + a small CSS keyframe marquee (replicates the code exactly).
  - Static fallback (no motion): an **Icon List** or a single **Heading**/**Text Editor** with the cities separated by the `✦` glyph, centered, with top/bottom **Divider**s for the hairline borders.

**Images used**
- None (the `✦` is a text glyph, not an image).

**Style notes**
- Band background onyx, top & bottom borders at `ivory/10` (very faint hairlines).
- City words: serif, light weight, large (2xl → 3xl), ivory at ~70% opacity, generous horizontal spacing between items.
- Star `✦`: gold.

---

### Section 3 — Manifesto / "The Maison" (`Manifesto`)

**Purpose:** Brand-philosophy statement plus the doctor's signature, framing the practice as artisanal ("we compose faces").

**Verbatim copy**
- Eyebrow: `The Maison`
- Heading (`h2`): `Dentistry is my ministry.`
- Body paragraph (serif, large; italic+gold emphasis on the marked phrases):
  > We do not sell dentistry. We compose *faces* — reading the light of a smile, the line of a lip, the architecture beneath. Every veneer is drawn by hand, every restoration weighed against a single question: *does it look inevitable?* The finest work is the work no one can see was done.

  (Italic-gold spans: **faces** and **does it look inevitable?**)
- Pull line (italic gold): `Real people. Real problems. Real results.`
- Signature block:
  - Script signature: `Dr. Trev`
  - Caption below: `Dr. Trevor J. Thomas, DDS`
  - Portrait alt text: `Dr. Trevor J. Thomas, DDS`

**Layout**
- Single centered column, max ~5xl width, large vertical padding (`py-32` → `py-44`). Stacked top-to-bottom: eyebrow → big heading → large body paragraph → pull line → signature row.
- Signature row: portrait image on the LEFT (small, tall ~112×144px with a thin gold inset border), the script "Dr. Trev" + caption on the RIGHT. On mobile it stacks vertically (image above text); on `sm:` and up it's a horizontal row, vertically centered.
- Each block fades/reveals in on scroll with staggered delays (decorative).

**Free Elementor widgets to use**
- Eyebrow: **Heading** or **Text Editor** (tiny uppercase, gold).
- Heading: **Heading** widget.
- Body paragraph: **Text Editor** (use inline italic + gold color on the two emphasized phrases via the editor's HTML).
- Pull line: **Heading**/**Text Editor** (italic, gold).
- Signature row: a 2-column inner **Container** — **Image** widget (left) + a **Heading** (the script "Dr. Trev") and **Text Editor**/**Heading** caption (right). Set the column to stack on mobile via responsive controls.
- Gold inset border on the portrait: use the Image widget's Border controls (gold, 1px) or wrap in a bordered Container.
- The on-scroll reveal stagger maps to Elementor's free built-in **Entrance Animation** per widget (with animation delays).

**Images used**
- `/people/dr-trev-portrait.png` (object-position roughly center / 20% from top, cover)

**Style notes**
- Section background onyx.
- Eyebrow: tiny uppercase, gold at ~70%, very wide tracking (`0.34em`).
- Main heading: serif, light, 4xl → 5xl, ivory.
- Body: serif, light, large (3xl → ~2.85rem), relaxed leading, ivory at ~85%; emphasized phrases italic + gold.
- Pull line: serif, italic, gold, 2xl → 3xl.
- Signature: script font, gold, 5xl → 6xl. Caption: tiny uppercase, ivory at ~50%, wide tracking.
- Portrait: thin gold/30 inset border.

---

### Section 4 — Stats / Counters (`Stats`)

**Purpose:** Four animated proof-point counters (experience, reach, volume, care).

**Verbatim copy** (number + label, in order):
1. `10` `+` — `Years in Practice`
2. `7` — `Cities Served`
3. `5000` `+` — `Smiles Transformed` (number renders with a thousands separator → displays as **5,000+**)
4. `100` `%` — `Care, Every Visit`

**Layout**
- Full-width band on the slightly-different dark **ink** background, generous vertical padding (`py-24` → `py-28`). Content max ~7xl width, centered.
- Grid: **2 columns on mobile**, **4 columns on desktop** (`lg:grid-cols-4`). Each cell is centered and contains: big number (with optional suffix) → a short centered hairline divider that animates from 0 to full width → small uppercase label below.
- Numbers count up from 0 to their target when the section scrolls into view (~40% visible), using a cubic ease over ~1.6s; reduced-motion users see the final value immediately and the divider lines just appear.

**Free Elementor widgets to use**
- Animated counters are **not** in free Elementor's core. Use a free add-on counter:
  - Free **"ElementsKit"** or **"Happy Addons" (free)** both provide a **Counter** widget that counts up on scroll into view, with prefix/suffix support — use 4 of them in a 2×4 grid (Section/Container with two responsive column counts).
  - If no add-on is allowed: static fallback — four **Heading** widgets showing `10+`, `7`, `5,000+`, `100%` (no animation), each with a **Divider** beneath and a small **Text Editor** label.
- The thin animated underline maps to a **Divider** widget (short width, centered) beneath each counter.
- Suffix coloring (`+`, `%`, in champagne) and the champagne divider: set via the add-on counter's suffix typography color / Divider color.

**Images used**
- None.

**Style notes**
- Section background **ink** (a dark tone distinct from onyx).
- Numbers: serif, light, very large (5xl → 7xl), ivory, tabular numerals; suffix (`+` / `%`) in **champagne**.
- Divider line beneath each: ~40px wide, 1px, champagne at ~60% opacity, centered.
- Labels: tiny (~0.62rem) uppercase, wide tracking (`0.26em`), ivory at ~50%.

---


## Home (part 2: selected work → trusted by → process → disciplines → contact → footer) Page (/)

> Render order on route `/` (from `app/page.tsx`): IntroVeil, AtelierNav, AtelierHero, Marquee, Manifesto, Stats, **WorkIndex**, **Clientele**, **Process**, **ServiceList**, **Testimonials (dark)**, **AtelierContact**, **AtelierFooter**. This spec covers WorkIndex onward.

### Global design tokens (apply throughout)
- **Backgrounds:** `onyx` (near-black, primary page bg), `ink` (very dark, slightly off-black — used for Trusted By + dark Testimonials), `espresso` (dark warm brown — Process section).
- **Text:** `ivory` (off-white, primary), with opacity variants used heavily (`ivory/75`, `/70`, `/60`, `/55`, `/45`, `/40`, `/35`, `/15`, `/10`, `/05`).
- **Accents:** `gold` (`#a8895c`-ish metallic) for eyebrows, accent lines, hover states; `champagne` (lighter warm gold) for emphasized words and Process numerals; `taupe` / `stone` (muted warm grays — only in light Testimonials variant, not used in the dark homepage).
- **Fonts:** `font-serif` (light-weight serif) for all headlines/numerals; `font-sans` for eyebrows, labels, numbers, body micro-copy.
- **Type treatment:** eyebrows/labels are tiny (≈0.6rem), UPPERCASE, wide letter-spacing (tracking 0.26–0.34em). Headlines are large, `font-light`, often with negative tracking.
- **Animation note (free Elementor):** the React site uses scroll reveals (`Reveal`/`LineReveal`), parallax images, magnetic buttons, grayscale→color image hover, and a cursor-following preview image. Elementor Free covers entrance animations + basic CSS hover; the cursor-follow preview and magnetic button have **no free-native equivalent** — use static fallbacks (noted per section).

---

### 1. Selected Work (Case Studies) — `WorkIndex`
**Purpose:** Showcase four signature treatment "cases" as an editorial, alternating image/text portfolio index.

**Verbatim copy:**
- Eyebrow: `Case Studies`
- Headline (H2): `Selected Work`
- Right-aligned label (hidden on mobile): `Cosmetic & Implant Dentistry`

Four case articles (each = subtitle label, title H3, body note):

1. Number `01` · subtitle `Where artistry meets engineering` · title `The Porcelain Veneer` · note: `A hand-layered ceramic restoration tuned to the patient's complexion and lip dynamics — translucency at the edge, warmth at the core.`
2. Number `02` · subtitle `Reconstruction · function & form` · title `Full-Mouth Rehabilitation` · note: `Rebuilding a collapsed bite into a balanced, youthful smile — engineered for the jaw, finished for the eye.`
3. Number `03` · subtitle `Small in size, built to last` · title `The Implant Restoration` · note: `A titanium foundation crowned in custom ceramic, placed so precisely that the result disappears into the natural arch.`
4. Number `04` · subtitle `The foundation of every smile` · title `General Dentistry & Hygiene` · note: `Cleanings, exams, and preventive care performed with the same precision as the artistry — because a beautiful smile begins with a healthy one.`

**Layout:**
- Section header is a flex row with a bottom hairline divider (`border-ivory/10`): eyebrow + H2 on the left, the "Cosmetic & Implant Dentistry" label bottom-right.
- Each case is a 2-column grid that **alternates**: odd rows (01, 03) = image left / text right (`5fr_7fr`); even rows (02, 04) = text left / image right (`7fr_5fr`).
- Each text block has a huge faint serif index number (01–04) ghosted behind it (`ivory/05`, ~7–12rem).
- Subtitle label sits on a row with a thin horizontal rule extending to the right (`h-px flex-1 bg-ivory/15`).
- Images are 4:5 portrait, with a thin gold inset border (`border-gold/20`) and a bottom-up dark gradient overlay.
- Container `max-w-6xl`, generous vertical rhythm (`space-y-24 lg:space-y-32`, section `py-24 lg:py-32`).
- **Mobile:** columns collapse to single column (image stacks above text); right-side label hidden.

**Free Elementor widgets:**
- Section header: **Heading** (eyebrow as small Heading or Text Editor) + **Heading** (H2 "Selected Work") + **Divider** for the hairline; the right label as a small **Text Editor** in a second column.
- Each case: a 2-column **Inner Section** → one column **Image** widget, other column = **Text Editor** (subtitle), **Divider** (the thin rule), **Heading** (title), **Text Editor** (note). Flip the column order per row using Elementor's "Reverse Columns" responsive option.
- Ghost index numeral: add it as a large **Heading** with very low opacity, absolutely positioned (set z-index/position in Advanced), or bake it into the image — pure-CSS-free; achievable via the Heading widget's color/opacity controls.
- **Effects not in free Elementor:** the grayscale→color + scale image hover and parallax scroll. Workaround: use Elementor's free **hover animations** (e.g., "Grow") on the Image, and apply a CSS grayscale filter via a custom class with `:hover` removing it (small Custom CSS snippet in the section's Advanced > Custom CSS — note Custom CSS is Pro; if strictly free, ship images in full color with a simple Grow hover, or use the free **Happy Addons** image widget which supports grayscale/hover filters). Parallax → drop it (static image) or use **Happy Addons free** parallax.

**Images used:**
- `/gallery/trev-veneer-craft.jpg` (case 01)
- `/gallery/trev-scan-suite.jpg` (case 02)
- `/gallery/trev-intraoral-scan.jpg` (case 03)
- `/gallery/trev-consult-blue.jpg` (case 04)

**Style notes:** `onyx` bg; ivory headings, gold eyebrow/subtitles (`gold/70`); serif light headings; title hover color shifts to `champagne`. Eyebrow 0.6rem uppercase tracking-0.34em; subtitle 0.62rem tracking-0.28em.

---

### 2. Trusted By / As Seen On — `Clientele`
**Purpose:** Establish celebrity/press credibility — "the dentist the stars come to" plus a press logo/name wall.

**Verbatim copy:**
- Eyebrow (with index `04`): `Trusted By`
- Headline (H2): `The dentist the stars come to.`
- Paragraph: `Star of SMILE: LA, and the Hollywood smile behind some of music and entertainment's most recognizable faces — designed with the same care given to every patient who sits in the chair.` (the phrase `SMILE: LA` is emphasized in `champagne`)
- Sub-label: `As Seen On`
- Outlet list (10 items, in order): `SMILE: LA`, `Zeus Network`, `TMZ`, `Yahoo`, `Black Enterprise`, `The Source`, `AllHipHop`, `HotNewHipHop`, `The Hype Magazine`, `Respect Magazine`

**Layout:**
- Intro block constrained to `max-w-2xl`: eyebrow, H2, a short gold "accent line" rule, then paragraph (`max-w-xl`).
- Below: a top hairline divider (`border-ivory/15`, `pt-10`), the "As Seen On" label, then the outlets as a **wrapping flex row** of serif text names (gap-x-12 gap-y-6), each hovering from `ivory/60` to full ivory.
- Container `max-w-7xl`; section `py-28 lg:py-40`. Decorative background motifs (`SectionMotifs variant={2}`) — faint ornamental SVG behind content.

**Free Elementor widgets:**
- **Heading** (eyebrow — prefix the "04" index manually), **Heading** (H2), **Divider** (the short accent line — set short width + gold color), **Text Editor** (paragraph, with `<span>` styling for "SMILE: LA").
- **Divider** for the full-width hairline, **Heading/Text Editor** for "As Seen On".
- Outlet wall: simplest free path is a single **Text Editor** with the names separated by spacing, or a **Icon List** (no icons, text only) set to inline; for the per-item serif look + hover color, an **Image Carousel**/Gallery is wrong here (these are text, not logos) — use **Text Editor** with inline-block spans, or repeat small **Heading** widgets in a flex container. Hover color change needs a tiny CSS class (Custom CSS is Pro) → fallback: static `ivory/60` color, no hover.
- `SectionMotifs` decorative SVG: not a widget — add as a low-opacity background **Image** on the section, or omit.

**Images used:** none (text-only outlets; background motif is decorative SVG, not a `/public` asset referenced here).

**Style notes:** `ink` bg; `champagne` eyebrow + emphasized "SMILE: LA"; ivory serif H2; gold accent line; `gold/70` "As Seen On"; outlet names serif `font-light` `ivory/60`.

---

### 3. The Experience (Process / 3 steps) — `Process`
**Purpose:** Reassure prospective patients by walking through the 3-step treatment journey, paired with a portrait of Dr. Thomas.

**Verbatim copy:**
- Eyebrow (with index `04`): `The Experience`
- Headline (H2): `Three steps to the smile that's always been yours.`

Three steps (Roman-numeral, title H3, body):
1. `I` — `The Consultation` — `We listen first. Your goals, your history, your story — mapped into a clear, honest plan with no surprises.`
2. `II` — `The Design` — `Your new smile is sculpted digitally and previewed before a single procedure — designed around your face, not a template.`
3. `III` — `The Reveal` — `Precision execution, hand-finished detail, and the moment you see yourself fully — often for the very first time.`

**Layout:**
- 2-column grid (`lg:grid-cols-[0.85fr_1fr]`, vertically centered): **left = image** (3:2 landscape, thin inset ring `ring-ivory/10`), **right = text** (eyebrow, H2, then the 3 steps).
- Each step is a flex row: large champagne Roman numeral on the left, then a stacked H3 title + body paragraph (`max-w-md`). Each step separated by a top hairline divider (`border-ivory/15`, `pt-8`), steps spaced `space-y-12`.
- Container `max-w-7xl`; section `py-28 lg:py-40`. Background motifs (`SectionMotifs variant={3}`).
- **Mobile:** single column — image on top, text below.

**Free Elementor widgets:**
- 2-column **Inner Section**: left column **Image** widget; right column = **Heading** (eyebrow), **Heading** (H2), then three step blocks.
- Each step: an **Icon List** is close, but the big Roman numeral + 2-line body is better as a small 2-column Inner Section per step → left **Heading** (the numeral "I/II/III"), right **Heading** (title) + **Text Editor** (body), with a **Divider** above each. Alternatively use the free **Icon List** with the numeral as the "text" and rely on **Divider**s between rows.
- This section maps cleanly to free widgets — no special effects beyond optional entrance animations.

**Images used:**
- `/stock/process.jpg` (alt: "Dr. Trevor J. Thomas holding a mirror and explorer in the Teeth by Trev operatory")

**Style notes:** `espresso` bg; ivory text; `champagne` eyebrow + Roman numerals; serif light H2/H3; body `ivory/70`; thin `ivory/15` dividers and `ivory/10` image ring.

---

### 4. The Atelier (Disciplines / service list) — `ServiceList`
**Purpose:** A large, interactive list of the six dental disciplines, each linking to the contact CTA.

**Verbatim copy:**
- Headline (H2): `The Atelier`
- Right-aligned label: `Disciplines`

Six list items (number is auto `01`–`06`, label, right-side meta tag). All items link to `#contact`:
1. `01` — `Porcelain Veneers` — meta `Cosmetic`
2. `02` — `Dental Implants` — meta `Restorative`
3. `03` — `Smile Design` — meta `Bespoke`
4. `04` — `Full-Mouth Rehabilitation` — meta `Reconstruction`
5. `05` — `Professional Whitening` — meta `Refinement`
6. `06` — `General Dentistry & Hygiene` — meta `Foundation`

**Layout:**
- Header: flex row with bottom hairline (`border-ivory/10`) — H2 "The Atelier" left, "Disciplines" label right.
- Body: a vertical list `<ul>`; each row is a full-width link with a bottom hairline divider, padded `py-7 lg:py-9`. Left side: tiny gold number (`01`…) + large serif label; right side (hidden on mobile): the uppercase meta tag. Label hovers from `ivory/75` to `gold`.
- Wide container `max-w-[1600px]`; section `py-24 lg:py-32`.
- **Desktop-only effect:** a 224×288px image preview follows the cursor, fading/swapping to the hovered service's image. **Mobile:** preview hidden; rows just list normally.

**Free Elementor widgets:**
- Header: **Heading** ("The Atelier") + **Text Editor** ("Disciplines") + **Divider**.
- List: best as a stacked set of **Button** widgets (each linking to the contact anchor `#contact`) styled as full-width text rows with a bottom **Divider**, OR a single **Icon List** (linkable items) — but Icon List won't give the number + right-aligned meta layout. Recommended: per row, a 2-column **Inner Section** wrapped in a link → left = small **Text Editor** (number) + large **Heading** (label), right = **Text Editor** (meta); **Divider** under each. Apply Elementor's free hover color change on the Heading where possible.
- **Effect not in free Elementor:** the cursor-following image preview that swaps per hovered item — **no free-native equivalent.** Workaround: drop it entirely (the list works without it), or use the free **Happy Addons** "Image Hover" / tooltip-style widgets for a static thumbnail-on-hover approximation. Simplest: static list, no preview.

**Images used (only shown in the cursor-preview, optional):**
- `/gallery/trev-veneer-craft.jpg` (Porcelain Veneers)
- `/gallery/trev-intraoral-scan.jpg` (Dental Implants)
- `/gallery/trev-smile-design.jpg` (Smile Design)
- `/gallery/trev-scan-suite.jpg` (Full-Mouth Rehabilitation)
- `/stock/after-smile.jpg` (Professional Whitening)
- `/gallery/trev-consult-blue.jpg` (General Dentistry & Hygiene)

**Style notes:** `onyx` bg; serif light H2 ivory; numbers `gold/60`; labels `ivory/75` → hover `gold`; meta tags `ivory/40` (→`ivory/70` on hover), 0.6rem uppercase tracking-0.28em. Labels are very large (up to `text-6xl`).

---

### 5. Testimonials (dark variant) — `Testimonials dark`
**Purpose:** Two emotional patient quotes for social proof, in the dark theme.

> Rendered as `<Testimonials dark />` on the homepage, so use the **dark** styling (ink bg, ivory text, gold caption detail). The light variant in the code is not used here.

**Verbatim copy:**
- Quote 1: `"I hid my smile for fifteen years. Dr. Trev gave me back something I didn't know I'd lost — myself."` — name `Maya R.` — detail `Smile makeover`
- Quote 2: `"It never felt clinical. It felt like someone finally saw me, then made me look the way I always felt inside."` — name `Andre T.` — detail `Full-mouth rehabilitation`

(Quotes are wrapped in curly quotation marks `“ … ”` in render.)

**Layout:**
- 2-column grid (`lg:grid-cols-2`, gap-20); each is a `<figure>` with a top hairline divider (`border-ivory/15`), the large italic serif blockquote, and at the bottom a figcaption with the name (medium weight) and the detail label.
- Container `max-w-7xl`; section `py-28 lg:py-40`; dark variant adds a top border + `ink` bg.
- **Mobile:** stacks to single column.

**Free Elementor widgets:**
- Two-column **Inner Section**; per column: **Divider** (top rule) + **Text Editor** (blockquote, italic serif) + **Text Editor**/**Heading** (name) + **Text Editor** (detail label). Elementor's free **Testimonial** widget exists but its built-in layout (avatar, star, fixed structure) doesn't match this minimalist editorial look — prefer plain Heading/Text Editor blocks styled to match.

**Images used:** none.

**Style notes:** `ink` bg; blockquote serif `font-light italic` ivory, large (`text-3xl`→`text-4xl`); name ivory medium; detail `gold/70` 0.72rem uppercase tracking-0.16em; `ivory/15` dividers.

---

### 6. Request a Consultation (Contact CTA) — `AtelierContact`
**Purpose:** Centered closing call-to-action driving phone/email consultation requests.

**Verbatim copy:**
- Eyebrow: `Request a Consultation`
- Headline (H2, two lines): line 1 `Begin your` / line 2 (italic, gold) `commission.`
- Paragraph: `Consultations are by appointment and limited each month, so that every smile receives the attention of the atelier.`
- Primary button: `Call the Studio` (links to `tel:+14243946159`)
- Secondary link: `TeethByTrev@gmail.com` (links to `mailto:TeethByTrev@gmail.com`)
- Address: `436 N Bedford Dr #300 · Beverly Hills, CA 90210`

**Layout:**
- Centered single column, `max-w-3xl`, text-center; section `py-32 lg:py-44`.
- A radial gold glow background overlay (`radial-gradient(ellipse at center, rgba(168,137,92,0.08), transparent 60%)`).
- Order: eyebrow → big 2-line serif H2 (line 2 italic gold) → paragraph (`max-w-md`) → CTA row (button + email link, side-by-side on `sm+`, stacked on mobile) → address line.

**Free Elementor widgets:**
- **Heading** (eyebrow), **Heading** (H2 — use a `<br>` and a styled `<span class="italic" style="color:gold">commission.</span>` for line 2), **Text Editor** (paragraph), **Button** ("Call the Studio", link `tel:+14243946159`, outlined gold style with hover fill), **Button** or **Text Editor** link for the email, **Text Editor** (address).
- Radial gold glow: set as a **section background** (Elementor free supports radial gradient backgrounds) — fully achievable.
- **Effect not in free Elementor:** the "Magnetic" button that drifts toward the cursor — no free-native equivalent. Workaround: use a normal Button with a free hover transition (Elementor hover background/border animation). The outlined→filled hover (`border gold` → `bg-gold text-onyx`) is native via Button hover styles.

**Images used:** none.

**Style notes:** `onyx` bg + gold radial glow; eyebrow `gold/70` 0.6rem tracking-0.34em; H2 serif `font-light`, very large (`text-5xl`→`text-7xl`), line 2 italic `gold`; paragraph `ivory/55`; button outlined `gold` → hover `bg-gold text-onyx`, 0.66rem uppercase tracking-0.26em; email link `ivory/60`→ivory; address `ivory/40` uppercase 0.66rem tracking-0.26em.

---

### 7. Footer — `AtelierFooter`
**Purpose:** Brand sign-off — logo, studio blurb, address/phone, social icons, mirrored nav, copyright, cities bar.

**Verbatim copy:**
- Logo alt text: `Teeth by Trev — Dental Atelier`
- Blurb: `An atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas, DDS.`
- Address: `436 N Bedford Dr #300` / `Beverly Hills, CA 90210`
- Phone (link): `424-394-6159` (href `tel:+14243946159`)
- Social icons (aria-labels / links, in order):
  - Instagram → `https://www.instagram.com/dr.trevthomas/`
  - Facebook → `https://www.facebook.com/dr.trevthomas/`
  - TikTok → `https://www.tiktok.com/@dr.trevthomas`
  - LinkedIn → `https://www.linkedin.com/in/drtrev/`
- Nav links (label → href, in order): `Home` → `/`, `About` → `/about`, `Services` → `/services`, `Gallery` → `/gallery`, `Financing` → `/financing`, `Contact` → `/contact`
- Copyright: `© [current year] Teeth by Trev. All rights reserved.` (year is dynamic — `new Date().getFullYear()`)
- Cities bar: `Beverly Hills · New York · Atlanta · Houston · Washington D.C. · Tampa · Memphis`

**Layout:**
- Top border (`border-ivory/10`); section `py-16`; wide container `max-w-[1600px]`.
- Upper area: flex row, on `lg` justified left/right and bottom-aligned. **Left block:** logo (height ~56px, auto width), blurb (`max-w-xs`), address + phone, then a horizontal row of 4 circular social icon buttons (9×9, bordered circles, hover border/text → gold). **Right block:** vertical nav list (right-aligned on `lg`), tiny uppercase links.
- Lower bar: top hairline (`border-ivory/10`, `pt-8`); flex row — copyright left, cities string right (stacks on mobile).
- **Mobile:** upper area stacks vertically (logo block then nav); lower bar stacks copyright above cities.

**Free Elementor widgets:**
- **Image** (logo), **Text Editor** (blurb), **Text Editor** (address + phone link), **Icon List** or a row of **Icon** widgets / **Social Icons** widget (Elementor free has a **Social Icons** widget — use it for IG/FB/TikTok/LinkedIn with circular bordered style + gold hover).
- Nav: **Icon List** (no icons) or a stack of **Button**/text links; Elementor free has no "menu" widget without a theme builder, so use an **Icon List** styled as text links pointing to `/about`, `/services`, etc.
- **Divider** for the hairline; **Text Editor** for copyright (use Elementor's dynamic year shortcode or hardcode the year) and the cities string.
- All achievable in free Elementor; the circular social buttons + hover color are native to the Social Icons widget.

**Images used:**
- `/brand/tbt-atelier-logo.png` (footer logo)

**Style notes:** `onyx` bg, top `ivory/10` border; logo ~56px tall; blurb/address `ivory/45`; phone hover → `gold`; social icons `ivory/55` in `ivory/15` bordered circles, hover → `gold`; nav links 0.62rem uppercase tracking-0.26em `ivory/45` → hover `gold`; copyright/cities 0.58rem uppercase tracking-0.26em `ivory/35`.

---

### Build summary for the developer
- **Sequence on `/`:** Selected Work → Trusted By → The Experience (Process) → The Atelier (Disciplines) → Testimonials → Request a Consultation → Footer.
- **Repeating pattern:** every section uses a tiny uppercase eyebrow/label + a large light serif headline on a dark (`onyx`/`ink`/`espresso`) background with ivory text and gold/champagne accents. Replicate with Elementor's **Heading** + **Text Editor** + **Divider** as the backbone.
- **Free-Elementor gaps to flag:** (1) grayscale→color image hover + parallax (Selected Work), (2) cursor-following image preview (The Atelier), (3) magnetic button drift (Contact), (4) per-item hover color changes where Custom CSS would be needed. All four degrade gracefully to static/simple-hover versions; for richer parity install a free add-on like **Happy Addons** or **ElementsKit**.

---


## About Page (/about)

> Route `/about`. Page background: **onyx** (`bg-onyx`), default text **ivory**. Headings use the **serif** display font (light weight), body copy uses ivory at reduced opacity, accents are **gold** / **champagne**. The page wraps with a shared site nav (`AtelierNav`) at top and footer (`AtelierFooter`) at bottom — documented separately; this spec covers only the page body. An `IntroVeil` (dark variant) plays a one-time page-load curtain animation — in free Elementor, skip it or use a simple section entrance animation; it carries no copy.
>
> **Global motion note:** Most blocks are wrapped in a `Reveal` component (fade/slide-up on scroll into view). In free Elementor, apply the built-in **Entrance Animation** (e.g. "Fade In Up") per widget/section to approximate this. It is decorative only.

---

### Section 1 — Page Hero ("The Dentist")
**Purpose:** Full-bleed intro banner that names the page and introduces Dr. Trev.

**Verbatim copy:**
- Eyebrow: `The Dentist`
- H1: `Meet Dr. Trev.`
- Intro paragraph: `Dr. Trevor J. Thomas, DDS — an artist working in enamel and light, devoted to the people behind every smile.`

**Layout:** Full-width hero, min-height ~60vh. A background image covers the section at **40% opacity** with a dark gradient overlay rising from the bottom (ink → translucent ink) so text stays legible. Content is left-aligned and bottom-anchored: eyebrow, then large H1, then intro paragraph (intro constrained to a narrow ~max-w-xl column). Generous top padding (clears the fixed nav) and bottom padding. The eyebrow renders as a small row: a short horizontal rule (line) followed by the label text, all in **champagne**.

**Free Elementor widgets to use:**
- Section/Container with the hero image set as **Background Image**, plus a **Background Overlay** (dark gradient, bottom-up) and the image opacity dialed to ~40%. This is all native in free Elementor's section background settings.
- **Heading** widget for the H1.
- **Text Editor** (or Heading) for the intro paragraph.
- Eyebrow: combine an inline **Divider** (short line) + small **Heading**/**Text** styled as an uppercase label, or just a small Heading with letter-spacing. The decorative leading line is easiest as a left-border or a tiny Divider; a static text label is an acceptable fallback.

**Images used:**
- `/stock/process.jpg` (alt: "Dr. Trevor J. Thomas holding dental instruments in the Teeth by Trev operatory")

**Style notes:** Section base bg **ink**; image at opacity 40% with a `from-ink via-ink/70 to-ink/60` bottom-up gradient overlay. H1: serif, light weight, very large (responsive: 5xl → 6xl → 7xl), ivory, tight line-height. Intro: ivory at ~75% opacity, relaxed line-height, slightly larger on desktop. Eyebrow: champagne, tiny uppercase, wide letter-spacing.

---

### Section 2 — Bio ("01 — The Philosophy")
**Purpose:** Personal philosophy + portrait; the emotional core of the page, signed by Dr. Trev.

**Verbatim copy:**
- Eyebrow label: `01 — The Philosophy`
- H2: `Dentistry is my ministry.`
- Paragraph 1: `For Dr. Trev, a smile is a gateway — to confidence, to better mental health, to a fuller life. Every case begins not with a tooth, but with a person and the story they carry.`
- Paragraph 2: `Over ten years he has refined a practice where world-class craftsmanship meets genuine care. He studies the face before the teeth, designs every smile by hand, and treats each patient like he'd treat his own mother.`
- Paragraph 3: `The result is work that looks effortless and feels like coming home to yourself — restorations so natural they seem not done, but inevitable.`
- Pull-quote (gold, serif italic): `Real people. Real problems. Real results.`
- Signature (script font, large, gold): `Dr. Trev`
- Signature caption (small uppercase): `Dr. Trevor Thomas, DDS`

**Layout:** 2-column on desktop, image LEFT / text RIGHT, centered vertically, large gap. The portrait sits in a **4:5 portrait aspect** frame with a thin ivory border inset, plus a small decorative **square outline in gold** offset to the bottom-right (desktop only). Text column: eyebrow → H2 → a short gold horizontal rule (~14px wide) → three stacked paragraphs → italic gold pull-quote → script signature + caption. **Mobile:** stacks to a single column with the **text first, image second** (note the reversed source order: on mobile text appears above the image).

**Free Elementor widgets to use:**
- Two-column **Section/Inner Section** (or a Container with 2 columns).
- **Image** widget for the portrait (set a 4:5 crop; add a thin border for the inset frame).
- The offset gold square is decorative — easiest as an empty styled container/Divider box, or omit. A free add-on like **Happy Addons** can layer a shape, but a plain bordered empty column is the simplest free workaround.
- **Heading** for the H2; **Divider** for the short gold rule.
- **Text Editor** for the three body paragraphs (one widget, three paragraphs).
- **Heading** (italic, gold) for the pull-quote.
- Signature: **Heading**/**Text** using the script font for "Dr. Trev" + a small **Heading**/**Text** caption beneath. (Requires the script font available in the WP theme; if unavailable, an **Image** of the signature is the fallback.)
- For the desktop image-left / mobile-text-first behavior: in free Elementor set the column **Reverse order** on mobile (Responsive settings) to achieve the order swap.

**Images used:**
- `/people/dr-trev-portrait.png` (alt: "Dr. Trevor J. Thomas, DDS") — `object-cover`, top-aligned.

**Style notes:** Section bg **onyx**, very tall vertical padding (py-28 → lg:py-40). Eyebrow: gold at ~70% opacity, tiny uppercase, wide tracking. H2: serif, light, 4xl→5xl, ivory. Body paragraphs: ivory at ~65% opacity. Short rule + pull-quote + signature all **gold**. Portrait frame border: ivory at ~10%; decorative square border: gold at ~40%.

---

### Section 3 — Credentials ("02 — The Credentials")
**Purpose:** Four short credibility statements presented as a tidy two-column list.

**Verbatim copy:**
- Eyebrow label: `02 — The Credentials`
- H2: `Training, taste, and a steady hand.`
- Item 1 title: `Doctor of Dental Surgery`
  - body: `Advanced training in cosmetic and restorative dentistry, with a focus on the art of the natural smile.`
- Item 2 title: `Cosmetic & Implant Focus`
  - body: `Years dedicated to veneers, implants, and full-mouth rehabilitation — the most demanding work in dentistry.`
- Item 3 title: `Hands-On, Every Case`
  - body: `Every restoration is designed and finished by Dr. Thomas himself. Nothing is outsourced, nothing is templated.`
- Item 4 title: `Cities Coast to Coast`
  - body: `Caring for patients across Beverly Hills, New York, Atlanta, Houston, Washington D.C., Tampa, and Memphis — by appointment.`

**Layout:** Heading block (eyebrow + H2) left-aligned in a narrow ~max-w-2xl column. Below it, a **2-column grid** of the four items (1 column on mobile). Each item has a **thin top border rule** (ivory, ~15% opacity), then a serif title, then a body paragraph (constrained ~max-w-md width).

**Free Elementor widgets to use:**
- **Heading** for the H2 + small **Heading**/**Text** for the eyebrow label (same eyebrow treatment as Section 2).
- For the four items: a 2-column **Section** with four cells, each = **Divider** (top rule) + **Heading** (title) + **Text Editor** (body). Alternatively the free **Icon Box** widget without an icon, but separate Heading+Text gives closest control over the top-rule look. No animated counters or special effects needed here.

**Images used:** None.

**Style notes:** Section bg **ink**, with a top border (ivory ~10%) separating it from the bio section; tall padding (py-28 → lg:py-40). Eyebrow gold ~70%. H2 serif light 4xl→5xl ivory. Item titles: serif light 2xl ivory. Item bodies: ivory ~60% opacity. Item top rules: ivory ~15%.

---

### Section 4 — CTA (Closing call-to-action)
**Purpose:** Final prompt to book, pairing a closing headline with the booking button.

**Verbatim copy:**
- H2: `Let's design the smile that's always been yours.`
- Button text: `Book Your Consultation` (links to `/consultation`)

**Layout:** A row on desktop: **headline LEFT, button RIGHT**, vertically centered, with space between. On mobile it **stacks vertically, left-aligned** (headline on top, button below). Headline constrained to ~max-w-2xl.

**Free Elementor widgets to use:**
- **Heading** for the H2.
- **Button** widget linking to `/consultation` (the WordPress consultation/booking page).
- Lay out with a 2-column Section (or a flex Container) so it sits side-by-side on desktop and stacks on mobile.
- The button has a **magnetic hover** (it drifts toward the cursor) via the `Magnetic` component — free Elementor cannot do cursor-follow natively. Use the standard button **Hover** state instead (see below); this is a non-critical effect and a static hover is an acceptable fallback. (A free add-on like Happy Addons offers some hover motion but not true magnetic follow.)

**Images used:** None.

**Style notes:** Section bg **onyx**, top border ivory ~10%, padding py-24 → lg:py-32. H2 serif light 4xl→5xl ivory. Button: **outline style** — gold 1px border, gold uppercase text, wide letter-spacing, generous padding; on **hover** the background fills **gold** and the text turns **onyx** (300ms transition). Set these exact states in the Button widget's Normal/Hover style tabs.

---

### Global tokens referenced
- **onyx** — primary page background (darkest).
- **ink** — secondary/section background (hero, credentials).
- **ivory** — primary text (used at 100% and reduced opacities: 75/65/60/15/10%).
- **gold** — accent: rules, pull-quote, signature, button border/fill.
- **champagne** — hero eyebrow accent.
- **serif** font — all headings (light weight).
- **script** font — the "Dr. Trev" signature only.
- Body/eyebrow text — system/sans default; eyebrows are tiny, uppercase, wide letter-spacing.

---


## Services Page (/services)

> Route: `/services` · Page background: **onyx** (`#0c0a08`), default text **ivory** (`#f7f3ec`). Fonts: headings = **serif** (Cormorant Garamond), body/labels = **sans** (Inter). Accent colors: **gold** (`#a8895c`) and **champagne** (`#b89b6e`). Decorative-only elements (animated dental line-art motifs in the Process section, IntroVeil page-load curtain, magnetic hover on the CTA button) are NOT achievable in free Elementor — drop them; they carry no copy and are noted inline as "static fallback".
>
> Site shell (shared, not unique to this page): top `AtelierNav` header and bottom `AtelierFooter` — document these from the global header/footer template, not here.

---

### Section 1 — Page Hero ("The Craft")
**Purpose:** Full-bleed intro banner that frames the page as artistry, over a dimmed craft photo.

**Verbatim copy:**
- Eyebrow label: `The Craft`
- H1: `Signature services, executed as artistry.`
- Intro paragraph: `Every treatment is designed and finished by hand — proportion, translucency, and line drawn to your features.`

**Layout:** Single full-width section, min-height ~60vh. Background image fills the section at 40% opacity with a dark gradient overlay (bottom→top: ink solid → ink/70 → ink/60). Content is left-aligned and bottom-anchored within a max-width container with generous top padding (~pt-40/pt-52). Stack order top-to-bottom: eyebrow, H1, intro. Mobile: same single-column stack; type scales down (H1 ~text-5xl mobile → text-7xl desktop).

**Free Elementor widgets to use:**
- Section/container with the hero image set as **Background Image** (position center, size cover), plus a dark **Background Overlay** (Elementor free supports a color/gradient overlay + opacity natively — use a vertical gradient from solid ink at bottom to ~60% at top, and set image opacity via the overlay). Set min-height 60vh and bottom-align content (Column vertical align = Bottom).
- **Heading** widget for the eyebrow (small caps, letter-spaced — see style notes). The original prefixes it with a short horizontal rule + gap; reproduce with a thin **Divider** (8px-ish, gold) inline, or just style the heading and skip the rule.
- **Heading** widget for the H1.
- **Text Editor** widget for the intro paragraph.

**Images used:**
- `/gallery/trev-veneer-craft.jpg` (alt: "Porcelain veneer craftsmanship in the Teeth by Trev atelier")

**Style notes:** Eyebrow = champagne color, uppercase, font-size 0.72rem, weight 500, wide letter-spacing (~0.34em "luxe" tracking), sans font. H1 = serif, light weight (300), tight line-height (~1.04), ivory. Intro = sans, ivory at 75% opacity, relaxed line-height. Hero base background = ink (`#16130f`).

---

### Section 2 — Services List (5 alternating service blocks)
**Purpose:** Presents the five core services, each as an image + numbered description pair, alternating sides down the page.

**Layout:** One section (onyx bg, large vertical padding ~py-28/py-40). Inside, **five** two-column rows (`lg:grid-cols-2`), vertically centered, with large gaps between rows (~space-y-28/40) and between columns (~gap-24). Alternation: rows 1, 3, 5 = **image left / text right**; rows 2, 4 = **text left / image right** (achieved via order-swap on desktop). Each image is a 4:5 portrait aspect box with a hairline inset border (ivory at 10%). Text column stacks: large faded serial number, H2 title, body paragraph, then a horizontal wrapped list of 3 feature tags each prefixed with a gold em-dash. **Mobile:** all rows collapse to a single column, image stacked above text (no alternation on mobile).

**Free Elementor widgets to use (per row):**
- **Inner Section / 2-column container** (free) to hold image + text. For the alternating sides, build odd and even rows with columns ordered differently; on mobile set both columns to full width stacked image-first. (Elementor free lets you reverse column order per-breakpoint via the column's responsive ordering, or just hand-place each row.)
- **Image** widget for the photo (set ratio ~4:5, object-fit cover; add a 1px ivory/10% border for the inset frame).
- **Heading** widget for the big serial number (`01`–`05`).
- **Heading** widget for the service title.
- **Text Editor** widget for the body paragraph.
- **Icon List** widget for the three feature points — set list to horizontal/inline, replace the bullet icon with an em-dash (or a small gold dash icon), uppercase + letter-spaced text. (If inline wrapping is awkward in free Icon List, fall back to a single **Text Editor** line separating items, or **Happy Addons free** "Skill Bars/Image"-style inline list. A static inline em-dash list is the simplest fallback.)

**Verbatim copy — Block 01:**
- Number: `01`
- H2: `Smile Makeovers`
- Body: `A fully bespoke redesign of your smile. We study proportion, shade, and character against your face and personality, then build a plan that looks like the best version of you — never someone else.`
- Feature list: `Digital smile preview` · `Custom shade & shape` · `Face-first design`
- Image: `/stock/service-smile-makeover.jpg` (alt: "Dr. Trevor J. Thomas presenting a smile makeover plan to a patient"; note: image is top-anchored — set object-position top)

**Verbatim copy — Block 02:**
- Number: `02`
- H2: `Porcelain Veneers`
- Body: `Hand-finished ceramic artistry that corrects shape, color, and alignment with natural, light-catching translucency. Each veneer is layered by hand until it disappears into your smile.`
- Feature list: `Minimal-prep options` · `Hand-layered ceramic` · `Lifelike translucency`
- Image: `/gallery/trev-veneer-craft.jpg` (alt: "Porcelain veneer craftsmanship in the Teeth by Trev atelier")

**Verbatim copy — Block 03:**
- Number: `03`
- H2: `Dental Implants`
- Body: `Permanent, lifelike tooth replacement engineered for function and finished for beauty. From single teeth to full arches, implants restore your bite and your confidence for good.`
- Feature list: `Single & full-arch` · `Guided placement` · `Restored function`
- Image: `/gallery/trev-intraoral-scan.jpg` (alt: "Dental implant components beside a 3D arch rendering on screen")

**Verbatim copy — Block 04:**
- Number: `04`
- H2: `Full-Mouth Rehabilitation`
- Body: `Complex, life-restoring reconstruction that rebuilds health, bite, and confidence from the ground up. The most demanding work in dentistry, performed with patience and precision.`
- Feature list: `Comprehensive plan` · `Bite & health restored` · `Staged for comfort`
- Image: `/gallery/trev-scan-suite.jpg` (alt: "Full-mouth rehabilitation plan with 3D imaging and an implant model")

**Verbatim copy — Block 05:**
- Number: `05`
- H2: `General Dentistry & Hygiene`
- Body: `The foundation beneath every transformation. Routine cleanings, exams, and preventive care delivered with the same precision and calm as the artistry — because a beautiful smile begins with a healthy one.`
- Feature list: `Cleanings & exams` · `Preventive care` · `Healthy foundation`
- Image: `/gallery/trev-consult-blue.jpg` (alt: "The Teeth by Trev treatment studio, prepared for a hygiene visit")

**Images used (this section):**
- `/stock/service-smile-makeover.jpg`
- `/gallery/trev-veneer-craft.jpg`
- `/gallery/trev-intraoral-scan.jpg`
- `/gallery/trev-scan-suite.jpg`
- `/gallery/trev-consult-blue.jpg`

**Style notes:** Section bg = onyx. Serial number = serif, light (300), large (~text-5xl, line-height 1, gold at 40% opacity — i.e. faded gold). H2 = serif, light (300), tight line-height (~1.1), ivory, ~text-4xl mobile → text-5xl desktop. Body = sans, ivory at 65% opacity, max-width ~28rem. Feature tags = sans, uppercase, very small (~0.72rem), wide tracking (~0.18em), ivory at 55%; each tag's leading em-dash is gold. Each image has a 1px ivory/10% inset border. (The fade-in-on-scroll "Reveal" animation is decorative — free Elementor's built-in entrance Motion Effects / animation can approximate it, but it's optional.)

---

### Section 3 — Process / "The Experience" (3 steps)
**Purpose:** Reassures by laying out the 3-step patient journey beside an operatory photo.

**Layout:** Single section, **espresso** background (`#2a241d`), large vertical padding (~py-28/40). Two-column grid on desktop (~0.85fr image / 1fr text), vertically centered. **Left:** a 3:2 landscape photo with a 1px ivory/10% inset ring. **Right:** eyebrow + H2 at top, then three stacked steps below. Each step is a row: large serif Roman numeral on the left, title + body stacked on the right; each step is separated by a top hairline border (ivory/15) with padding above. Background also carries faintly drifting decorative dental line-art motifs (decorative only — omit in Elementor). **Mobile:** collapses to single column, image stacked above the text block; steps remain a single stacked list.

**Verbatim copy:**
- Eyebrow index + label: `04` `The Experience`
- H2: `Three steps to the smile that's always been yours.`  *(rendered with a typographic apostrophe)*
- Step I — numeral `I`, title `The Consultation`, body: `We listen first. Your goals, your history, your story — mapped into a clear, honest plan with no surprises.`
- Step II — numeral `II`, title `The Design`, body: `Your new smile is sculpted digitally and previewed before a single procedure — designed around your face, not a template.`
- Step III — numeral `III`, title `The Reveal`, body: `Precision execution, hand-finished detail, and the moment you see yourself fully — often for the very first time.`

**Free Elementor widgets to use:**
- **Inner Section / 2-column container** for image + content; set image column narrower than text column. Mobile: stack image first.
- **Image** widget for the photo (3:2 ratio, cover; add 1px ivory/10% inset border).
- **Heading** widget for the eyebrow (with leading `04` index + a thin gold **Divider** rule to mimic the eyebrow's inline rule, or just include "04 — The Experience" as styled text).
- **Heading** widget for the H2.
- For the three steps: an **Icon List** won't carry the two-line title+body structure well, so use **three repeated blocks**, each = a small 2-column inner section (Heading widget for the Roman numeral + Heading for the step title + Text Editor for the body), with a top **Divider** (ivory/15%) above each block to reproduce the hairline separators. (Alternatively, free **Happy Addons** has an "Icon Box" you could repeat, but plain Heading + Text Editor + Divider needs no add-on.)
- Background dental-motif animation is not free-Elementor-native — **static fallback: omit** (purely decorative, no copy).

**Images used:**
- `/stock/process.jpg` (alt: "Dr. Trevor J. Thomas holding a mirror and explorer in the Teeth by Trev operatory")

**Style notes:** Section bg = espresso (`#2a241d`), text ivory. Eyebrow = champagne, uppercase, small, wide tracking; its leading index uses tabular figures. H2 = serif, light (300), line-height ~1.1, ivory, ~text-4xl→5xl. Roman numerals = serif, light (300), ~text-4xl, **champagne**. Step title (H3) = serif, light (300), ~text-2xl, ivory. Step body = sans, ivory at 70%, max-width ~28rem. Step separators = 1px ivory/15% top border with ~2rem padding above.

---

### Section 4 — Closing CTA ("Begin")
**Purpose:** Final prompt to book a consultation for undecided visitors.

**Layout:** Single section, onyx bg, top hairline border (ivory/10%), padding ~py-24/32. Content row inside a max-width container: on desktop a **horizontal split** — eyebrow + headline on the left, button on the right, vertically centered, space-between. **Mobile:** stacks vertically, left-aligned (eyebrow, headline, then button below).

**Verbatim copy:**
- Eyebrow label: `Begin`
- H2: `Not sure where to start? Let's talk it through.`  *(rendered with a typographic apostrophe)*
- Button text: `Book Your Consultation` → links to `/consultation`

**Free Elementor widgets to use:**
- Section/container with a top **Divider** or top border (ivory/10%) for the hairline.
- **Inner Section** 2-column (text left, button right; stack on mobile, both left-aligned).
- **Heading** widget for the eyebrow label.
- **Heading** widget for the H2.
- **Button** widget for the CTA — outlined style: transparent fill, 1px gold border, gold text, uppercase, letter-spaced; hover swaps to gold fill with onyx text (Elementor free Button supports normal + hover background/text/border colors natively). Link to `/consultation`. The original's "magnetic" cursor-follow hover effect is not free-Elementor-native — **static fallback: standard hover color swap only.**

**Images used:** none.

**Style notes:** Section bg = onyx, top border ivory/10%. Eyebrow = gold at 70% opacity, uppercase, very small (~0.6rem), very wide tracking (~0.34em). H2 = serif, light (300), line-height ~1.08, ivory, ~text-4xl→5xl, max-width ~42rem. Button = ~0.72rem text, weight 500, uppercase, tracking ~0.2em; border + text gold; hover bg gold (`#a8895c`) + text onyx; ~300ms color transition; padding ~px-8/py-4.

---

### Global design tokens (apply site-wide in Elementor Site Settings)
- **Colors:** ivory `#f7f3ec`, cream `#efe8dc`, sand `#e3d8c6`, taupe `#9a8f7d`, stone `#6f6557`, espresso `#2a241d`, ink `#16130f`, onyx `#0c0a08`, champagne `#b89b6e`, gold `#a8895c`.
- **Fonts:** serif headings = **Cormorant Garamond** (use light/300 weights for the airy look); body/labels/buttons = **Inter** (sans). (A third script font, Pinyon Script, exists in the design system but is not used on this page.)
- **Eyebrow style (reusable):** Inter, uppercase, 0.72rem, weight 500, gold color, "luxe" letter-spacing; often preceded by a short horizontal rule + numeric index.

Source files: `/Users/faran/TBT/app/services/page.tsx`, `/Users/faran/TBT/app/components/PageHero.tsx`, `/Users/faran/TBT/app/components/Process.tsx`, `/Users/faran/TBT/app/components/Eyebrow.tsx`, `/Users/faran/TBT/app/components/SectionMotifs.tsx`, `/Users/faran/TBT/app/globals.css`.

---


## Gallery Page (/gallery)

> Page background: **onyx** with **ivory** text (`bg-onyx text-ivory`). Headings use the **serif** font; body/labels use the default sans. Accent color is **gold**; secondary accent **champagne**. The page is wrapped by the shared **AtelierNav** (top) and **AtelierFooter** (bottom) — documented separately as site chrome — plus an `IntroVeil` dark page-load animation overlay. SEO title: `Smile Gallery — Teeth by Trev`.

---

### Section 1 — Page Hero
**Purpose:** Full-bleed intro banner that sets the emotional frame for the gallery.

**Verbatim copy:**
- Eyebrow: `The Smile Gallery`
- H1: `Transformations, not just teeth.`
- Intro paragraph: `Every smile here belongs to a real person with a real story. This is the work — placed, balanced, and unmistakably theirs.`

**Layout:** Single full-width section, min-height ~60vh. Background image fills the section (object-cover) at 40% opacity, with a bottom-to-top dark gradient overlay (ink → ink/70 → ink/60). Text block is bottom-aligned and left-aligned inside a max-width 1280px container, generous top padding (so content sits below the fixed nav) and bottom padding. Order top-to-bottom: eyebrow, then H1, then intro. Mobile: same single-column stack; H1 scales down (text-5xl mobile → 7xl desktop), intro slightly smaller.

**Free Elementor widgets to use:**
- Build the section as a single full-width Section/Container with a **Background Image** + a dark **Background Overlay** (Elementor free supports both natively, including overlay opacity/gradient). Set min-height ~60vh and vertical align content to bottom.
- **Heading** widget for the eyebrow text (small, uppercase, letter-spaced, champagne color).
- **Heading** widget (H1) for the title, serif.
- **Text Editor** widget for the intro paragraph (constrain max-width ~36rem).
- Use **Spacer** widgets between eyebrow/title/intro to mimic the spacing.

**Images used:**
- `/stock/feature-bg.jpg` (hero background; alt: "Dr. Trevor J. Thomas and his assistant caring for a patient in the studio")

**Style notes:** Eyebrow in **champagne**, ~0.6rem, uppercase, wide tracking. H1 **serif**, light weight, **ivory**, tight line-height (~1.04). Intro **ivory at ~75% opacity**, relaxed line-height. Background image dimmed to 40% with an **ink** gradient for legibility.

---

### Section 2 — Before & After
**Purpose:** Interactive side-by-side comparison slider demonstrating one transformation.

**Verbatim copy:**
- Eyebrow label: `01 — Before & After` (note: rendered from `01 — Before &amp; After`, i.e. the `&` is a literal ampersand)
- H2: `See the difference, side by side.`
- In-image label (top-left of the "before" half): `Before`
- In-image label (top-right, on the "after" image): `After`
- Caption under the slider: `Drag to reveal the transformation`

**Layout:** Centered intro block (eyebrow + H2) within a max-width 1280px container, text-centered, max ~42rem wide. Below it, a full-width comparison widget at a **16:10 aspect ratio**. The "After" image is the full base layer; the "Before" image is clipped and revealed by a draggable vertical divider handle (round ivory button with a left/right chevron icon) starting at 50%. Two small frosted pill labels ("Before" top-left, "After" top-right). Caption centered below. Large vertical padding (py-28 → lg:py-40). Mobile: same stacked layout, slider remains full-width.

**Free Elementor widgets to use:**
- **Heading** widget for eyebrow (`01 — Before & After`) and **Heading** (H2) for the title — both centered.
- The **drag-to-reveal before/after slider is NOT possible in free Elementor natively.** Simplest options, in order of preference:
  1. **Free add-on:** "Happy Addons" (free) or "ElementsKit" (free) — both ship an Image Comparison / Before-After widget with a draggable handle. This is the closest match to the original.
  2. **No-add-on fallback:** place the two images side-by-side using a 2-column structure (Before left, After right), each an **Image** widget with a caption ("Before" / "After"). Loses the drag interaction but preserves the comparison.
  3. **HTML widget** containing a small self-contained before/after slider script if no plugins are allowed.
- **Text Editor** or small **Heading** for the centered caption "Drag to reveal the transformation".
- **Spacer** to reproduce the gap between the heading block and the slider.

**Images used:**
- `/stock/before-smile.jpg` ("before"; alt: "Worn, damaged smile before treatment by Dr. Trevor J. Thomas")
- `/stock/after-smile.jpg` ("after"; alt: "Bright, restored smile after treatment by Dr. Trevor J. Thomas")

**Style notes:** Section background **onyx**. Eyebrow in **gold at ~70% opacity**, ~0.6rem, uppercase, very wide tracking (~0.34em). H2 **serif**, light, **ivory**. The "Before"/"After" pill labels: tiny uppercase ivory text on a semi-transparent **ink** background with backdrop blur. Divider line and handle button are **ivory** (handle is a circular ivory button with dark chevron icon, soft drop shadow). Caption is **ivory at ~45% opacity**, uppercase, ~0.72rem.

---

### Section 3 — The Cases (image grid)
**Purpose:** A gallery grid of process/transformation images, each revealing a caption on hover.

**Verbatim copy:**
- Eyebrow label: `02 — The Cases`
- H2: `A few of the smiles we've had the honor to craft.` (rendered from `we&apos;ve`, i.e. an apostrophe in "we've")
- Per-card captions (title + note), in order:
  1. `Inside the Chair` / `Precision diagnostics`
  2. `The Treatment` / `Planned to the detail`
  3. `The Consultation` / `Your plan, personalized`
  4. `The Craft` / `Hand-finished veneers`
  5. `Digital Scanning` / `3D smile design`
  6. `The Studio` / `Calm, precise, unhurried`

**Layout:** Left-aligned intro block (eyebrow + H2, max ~42rem). Below it, a responsive grid of 6 image tiles: **3 columns on desktop, 2 columns on tablet, 1 column on mobile**, ~20px gap. Each tile is a **4:5 portrait** image (object-cover). On hover: the image zooms slightly (scale 110%), a bottom-up dark gradient deepens, and the caption (serif title + small uppercase note) slides up and fades in from the bottom-left. A thin inner ivory border frames each tile. Section sits on a slightly different dark background (**ink**) with a top hairline border and large vertical padding.

**Free Elementor widgets to use:**
- **Heading** widgets for eyebrow (`02 — The Cases`) and H2.
- For the grid: the simplest faithful approach is **6 Image Box** widgets (or **Image** widgets) arranged in a 3-column inner section/container layout. Use the column structure to get 3/2/1 responsive columns.
  - **Hover zoom** is available via Elementor's free Image hover animation (set Hover Animation = "Grow"/"Zoom-in").
  - The **hover-reveal caption** (caption hidden until hover, sliding up) is **not native to free Elementor**. Workarounds: (a) free add-on "Happy Addons" Image Box/Card has hover-content options; or (b) static fallback — always-show the title + note as a caption under or overlaid on each image; or (c) custom CSS on the column (free Elementor allows a Custom CSS field only in Pro — on free, add the rule in Customizer/Additional CSS targeting the image box) to fade the caption in on `:hover`.
  - Alternatively use the free **Image Gallery** widget for a quick grid, but it won't carry the per-image title/note captions cleanly — prefer the Image Box approach to preserve the two-line captions.
- **Spacer** between the heading block and the grid.
- **Divider** (or section top-border styling) for the hairline top border.

**Images used (in grid order):**
- `/stock/financing-hero.jpg` (alt: "A patient reviewing a panoramic X-ray and dental implant model in the studio")
- `/gallery/trev-scan-suite.jpg` (alt: "Full-mouth rehabilitation plan with 3D imaging and an implant model")
- `/stock/service-smile-makeover.jpg` (alt: "Dr. Trevor J. Thomas presenting a smile makeover plan to a patient")
- `/gallery/trev-veneer-craft.jpg` (alt: "Dr. Trevor J. Thomas hand-finishing a porcelain veneer at the bench")
- `/gallery/trev-intraoral-scan.jpg` (alt: "Implant components and a 3D arch rendering on screen")
- `/gallery/trev-consult-blue.jpg` (alt: "The Teeth by Trev treatment studio")

**Style notes:** Section background **ink** with a top border of **ivory at 10% opacity**. Eyebrow in **gold/70**, uppercase, wide tracking. H2 **serif**, light, **ivory**. Card caption title in **serif ivory** (~text-2xl); note in **champagne**, tiny uppercase, ~0.72rem, wide tracking. Each tile has a thin **ivory/10** inner border and an **ink** bottom-up gradient overlay (deepens on hover).

---

### Section 4 — Closing CTA
**Purpose:** Final call-to-action inviting the visitor to book a consultation.

**Verbatim copy:**
- H2: `Your story could be the next one we tell.`
- Button text: `Start Your Story` (links to `/consultation`)

**Layout:** Single row inside a max-width 1280px container. On desktop: **2-part horizontal layout** — H2 on the left (max ~42rem), button on the right, vertically centered, space-between. On mobile/tablet: stacks vertically, left-aligned, H2 above the button (~40px gap). Generous vertical padding (py-24 → lg:py-32). Top hairline border separates it from the grid section.

**Free Elementor widgets to use:**
- A Section/Container with a 2-column inner layout (Heading column + Button column); set the column direction to stack on mobile (Elementor free handles this responsively).
- **Heading** widget for the H2 (serif).
- **Button** widget for "Start Your Story" linking to `/consultation` (outline style; gold border/text, fills gold with onyx text on hover).
- The original button has a subtle "magnetic" cursor-follow effect (`Magnetic` wrapper) — **not available in free Elementor**; safe to omit (static button) or approximate with a simple hover transition, which the free Button widget supports.
- **Divider** or top-border styling for the hairline rule.

**Images used:** none.

**Style notes:** Section background **onyx**, top border **ivory/10**. H2 **serif**, light, **ivory**, tight line-height. Button: **gold** 1px border, **gold** text, ~0.72rem uppercase, wide tracking (~0.2em), padding ~px-8/py-4; hover = **gold** background with **onyx** text, 300ms color transition.

---

### Site chrome (rendered but shared, not unique to this page)
- **AtelierNav** — fixed site header/navigation at the top (`app/atelier/components/AtelierNav.tsx`).
- **AtelierFooter** — site footer at the bottom (`app/atelier/components/AtelierFooter.tsx`).
- **IntroVeil (variant="dark")** — a one-time dark page-load reveal animation overlaying the page on entry. In Elementor free, omit or approximate with a simple section entrance animation; it carries no copy.

These should be built once as a global Header/Footer template and reused across pages rather than rebuilt per-page.

---


## Financing Page (/financing)

A dark, editorial single-column landing page selling "Smile Now, Pay Later" dental financing. Background is onyx/ink (near-black), text is ivory (off-white), accents are gold/champagne, and all headings use a serif typeface. Below, each section is documented top to bottom exactly as rendered.

> **Global page styling**
> - Page background: `onyx` (near-black); default text: `ivory` (off-white).
> - Heading font: **serif**, light weight (font-light). Body font: sans-serif.
> - Accent color: **gold** (used for eyebrows, icons, hover states, button border). A lighter warm tone, **champagne**, is used for the hero eyebrow.
> - Sections alternate between `onyx` and `ink` backgrounds (both very dark; ink is the slightly different dark used for hero + partners section). Thin hairline dividers use ivory at ~10–15% opacity.
> - There is a site-wide nav (AtelierNav) above and footer (AtelierFooter) below `<main>` — out of scope for this page spec, build them as a global Elementor header/footer template.

---

### Section 1 — Hero (PageHero component)
**Purpose:** Full-bleed intro banner establishing the page promise over a darkened background photo.

**Verbatim copy:**
- Eyebrow: `Smile Now, Pay Later`
- H1: `A world-class smile shouldn't wait.`
- Intro paragraph: `Flexible financing and monthly payment plans make life-changing dentistry accessible — so you can begin today and pay over time.`

**Layout:**
- Single column, content vertically bottom-aligned within a tall hero (min-height ≈ 60% of viewport height). Generous top padding (so content clears the fixed nav) and bottom padding.
- Background image fills the whole section at ~40% opacity, with a dark gradient overlay on top (darkest at bottom, fading upward) so text stays legible.
- Content max-width is constrained (centered container, padded left/right). H1 is very large (scales up to ~7xl on desktop); intro sits below it, narrower width.
- Eyebrow renders as: a small uppercase label preceded by a short horizontal rule/line (a thin dash mark to the left of the text). No number prefix here.
- Mobile: same single-column stack; H1 reduces to ~5xl, padding reduces. Stacks naturally, no special behavior.

**Free Elementor widgets to use:**
- Build the section with a Section/Container that has the image set as **Background Image** with a dark overlay (Elementor free supports background overlay + opacity natively — set image opacity via overlay, and add a gradient overlay: solid dark at bottom → transparent at top).
- **Heading** widget for the H1.
- For the eyebrow (small uppercase label + leading dash): use a **Heading** or **Text Editor** styled small/uppercase with letter-spacing; the short dash line can be a left **border**/pseudo element or an inline **Divider**. Simplest free approach: a Heading with letter-spacing and a small Divider widget placed inline/above, or just prefix with an em-dash character.
- **Text Editor** widget for the intro paragraph.
- Use min-height on the container to mimic the ~60vh tall hero; align content to bottom (column vertical align: end).

**Images used:**
- `/stock/financing-hero.jpg` (alt: "Reviewing a panoramic X-ray and dental implant model with a patient in the Teeth by Trev studio")

**Style notes:**
- Background: `ink` base with image at ~40% opacity + bottom-up dark gradient overlay (`from-ink via-ink/70 to-ink/60`).
- Eyebrow text color: `champagne`, uppercase, wide letter-spacing.
- H1: serif, light, `ivory`, tight line-height.
- Intro: `ivory` at ~75% opacity, relaxed line-height, slightly larger on desktop.

---

### Section 2 — Benefits ("The Promise")
**Purpose:** Three reassuring value props framing financing as accessible.

**Verbatim copy:**
- Eyebrow: `01 — The Promise`
- H2: `Transformation, within reach.`
- Three benefit cards (icon + title + body):
  1. Title: `Plans from $0 down` — Body: `Begin your transformation today with low monthly payments tailored to your budget — no large upfront cost.`
  2. Title: `Apply in minutes` — Body: `A simple, soft credit check gets you an answer fast — without affecting your score or interrupting your day.`
  3. Title: `Care that fits your life` — Body: `Stretch your investment across comfortable terms so the smile you deserve never has to wait for the perfect moment.`

**Layout:**
- Heading block at top (eyebrow + H2), constrained to a narrower max-width.
- Below, a **3-column grid** of benefit items (equal columns). Each item has a thin top hairline border, an icon above, then the title, then the body text.
- Generous vertical section padding (large top/bottom whitespace).
- Mobile: the 3 columns collapse to a **single stacked column** (the 3-col grid only applies at the small breakpoint and up; below that they stack 1-per-row).

**Free Elementor widgets to use:**
- **Heading** for the eyebrow (small uppercase) and the H2 (large serif).
- For the three cards, the cleanest free option is an **Icon Box** widget × 3 placed in a 3-column inner section/columns layout — Icon Box gives icon + heading + description in one widget. Add a **top border** on each column to reproduce the hairline rule.
- Alternatively use three columns each containing: **Icon** widget + **Heading** + **Text Editor**, with a top **Divider** or column top-border.
- Icons are custom thin-line SVGs (a card/credit-card shape, a clock, and a heart). Elementor free ships Font Awesome icons — closest free matches: credit card (`fa-credit-card` / regular), clock (`fa-clock`), heart (`fa-heart`). For exact fidelity, upload the SVGs as **custom SVG icons** (Icon widget supports SVG upload) so the thin gold line style is preserved.

**Images used:**
- None (icons are inline SVG, not /public images). Optionally re-supply the three SVGs as uploaded icon assets.

**Style notes:**
- Section background: `onyx`.
- Eyebrow: gold at ~70% opacity, uppercase, very wide letter-spacing, tiny size.
- H2: serif, light, `ivory`, ~4xl–5xl.
- Icons: `gold`, thin stroke (~1.25px), ~32px.
- Card titles: serif, light, `ivory`, ~2xl.
- Card body: `ivory` at ~60% opacity, relaxed line-height.
- Card top border: `ivory` at ~15% opacity (hairline).

---

### Section 3 — Financing Partners ("Our Partners")
**Purpose:** Showcase the four lending partners with descriptions and outbound apply links.

**Verbatim copy:**
- Eyebrow: `02 — Our Partners`
- H2: `Trusted financing partners.`
- Intro paragraph: `We work with the most respected names in healthcare financing. Apply with any of them in minutes — most use a soft credit check that won't affect your score.`
- Four partner cards. Each card shows a small meta label, the partner name, a body paragraph, and a link that reads "Apply with {name} →":
  1. Meta: `Most widely accepted` — Name: `CareCredit` — Body: `The healthcare credit card accepted at practices nationwide, with special promotional financing on qualifying treatment.` — Link text: `Apply with CareCredit →` — URL: `https://www.carecredit.com/go/276SNV/`
  2. Meta: `For elective care` — Name: `Alphaeon Credit` — Body: `A dedicated credit card for cosmetic and elective care, offering flexible monthly plans and promotional offers.` — Link text: `Apply with Alphaeon Credit →` — URL: `https://goalphaeon.com/apply?src=cling`
  3. Meta: `Fast, soft-check approval` — Name: `Cherry` — Body: `Paperless approval in minutes with a soft credit check and flexible monthly payments — many patients qualify for 0% APR.` — Link text: `Apply with Cherry →` — URL: `https://pay.withcherry.com/trevor-jamal-thomas-dds-inc?utm_source=practice&m=51934`
  4. Meta: `For larger plans` — Name: `Proceed Finance` — Body: `Built for comprehensive and full-mouth cases, with longer terms and higher approval amounts than standard cards.` — Link text: `Apply with Proceed Finance →` — URL: `https://www.proceedfinance.com/application/create?referrer=37783-13017-4FDA`
- Closing fine-print line (below the grid): `Not sure which fits? Dr. Trev's team will match you to the right plan during your consultation.`

**Layout:**
- Heading block at top (eyebrow + H2 + intro paragraph), constrained to a narrower max-width.
- Below, a **2-column grid** of partner cards (2 across; 4 cards = 2 rows). Each card is a full-height bordered box, contents stacked vertically: meta label (top), partner name, body paragraph (flex-grows to push the link down), then the "Apply with…" link with a right-arrow pinned at the bottom. Whole card is a clickable link opening in a new tab.
- Small closing fine-print paragraph below the grid, left-aligned.
- Mobile: 2-col grid collapses to a **single column** (cards stack one per row).

**Free Elementor widgets to use:**
- **Heading** for eyebrow + H2; **Text Editor** for the intro paragraph and the closing fine-print line.
- For the four cards: use a 2-column layout (inner section / columns or container grid) where **each column/container is itself a Link** (Elementor free lets you set a container's Link, and apply a background + border + hover border color). Inside each: **Heading** (meta label, small uppercase) + **Heading** (partner name, serif) + **Text Editor** (body) + **Button** or text **Heading** for "Apply with {name} →".
- Set link `target=_blank` + `nofollow`/noopener on each.
- **Hover effect:** the card border changes to gold on hover and the apply-link arrow slides right. Elementor **free** can do the border-color hover (container Border hover state) natively. The arrow slide-on-hover is a small free CSS touch — add a custom CSS class or use Happy Addons (free) for the arrow translate; a static arrow is an acceptable fallback (just keep the `→` character).

**Images used:**
- None. (Partner logos are not used — names are set as serif text. If desired, the developer could add partner logos, but the source page uses text only.)

**Style notes:**
- Section background: `ink`; top hairline border in `ivory` at ~10%.
- Card: very subtle white fill (`white` at ~2% opacity) with a `ivory`/~12% border; on hover border becomes `gold` at ~50%.
- Meta label: `gold` ~70% opacity, uppercase, wide tracking, tiny.
- Partner name: serif, light, `ivory`, ~3xl.
- Body: `ivory` ~60%.
- Apply link: `ivory` ~70% uppercase tracked, turns `gold` on hover.
- Closing fine-print: `ivory` ~40%, tiny uppercase, wide tracking.

---

### Section 4 — FAQ ("Questions")
**Purpose:** Answer the four most common financing questions.

**Verbatim copy:**
- Eyebrow: `03 — Questions`
- H2: `The details, answered.`
- Four Q&A pairs:
  1. Q: `Will checking my options affect my credit?` — A: `No. Pre-qualification uses a soft credit check that has no impact on your credit score. You'll see your options before committing to anything.`
  2. Q: `What financing partners do you work with?` — A: `We partner with CareCredit, Alphaeon, Cherry, and Proceed Finance — leading healthcare lenders offering plans with low and no-interest promotional periods. During your consultation we'll match you to the right fit.`
  3. Q: `Can I combine financing with insurance?` — A: `Yes. Where applicable, we apply your benefits first and finance the remaining balance — so you only ever pay over time for what's left.`
  4. Q: `How long are the payment terms?` — A: `Terms range from a few months to several years depending on the plan and treatment. We'll walk you through options that keep your monthly payment comfortable.`

**Layout:**
- **2-column layout on desktop:** left column (~narrower) holds the eyebrow + H2 heading block; right column (~wider) holds the FAQ list. Large gap between columns.
- The FAQ list is a vertical stack with hairline dividers **between** items and a hairline border top + bottom of the whole list. Each item shows the question (serif heading) with the answer below it. Note: these are **always-open** (not accordion/collapsible) — both Q and A are shown statically.
- Mobile: collapses to **single column** — heading block on top, FAQ list below.

**Free Elementor widgets to use:**
- Two-column container/section. Left: **Heading** (eyebrow) + **Heading** (H2). Right: the FAQ list.
- Because the questions are shown **expanded by default** (not interactive accordions), the simplest faithful build is repeated **Heading** (question) + **Text Editor** (answer) pairs separated by **Divider** widgets, wrapped with top/bottom borders. Do **not** use a collapsing accordion if you want to match the rendered (always-open) behavior.
- (Optional) Elementor free's **Accordion**/Toggle widget could be used if interactive collapse is acceptable to the client, but it changes behavior from the source.

**Images used:**
- None.

**Style notes:**
- Section background: `onyx`; top hairline border `ivory` ~10%.
- Eyebrow: `gold` ~70%, uppercase, wide tracking.
- H2: serif, light, `ivory`, ~4xl–5xl.
- Question: serif, light, `ivory`, ~2xl.
- Answer: `ivory` ~60%, relaxed line-height, constrained width.
- Dividers/borders: `ivory` ~12% opacity (hairlines).

---

### Section 5 — Closing CTA
**Purpose:** Final call-to-action driving to the consultation page.

**Verbatim copy:**
- H2: `Let's find a plan that fits your life.`
- Button text: `Explore Financing Options` — links to `/consultation` (internal page).

**Layout:**
- Desktop: **horizontal row** — large serif headline on the left, button on the right, space-between, vertically centered.
- Mobile/tablet: **stacks vertically** (headline on top, button below, left-aligned), with a gap between.
- Generous vertical padding (slightly less than the other sections).

**Free Elementor widgets to use:**
- A two-column row (or flex container) with the **Heading** widget on the left and the **Button** widget on the right; set column vertical alignment to center and horizontal to space-between. On mobile set the columns to stack and left-align.
- **Button** widget linking to `/consultation`.
- **Hover effect:** button is an outlined (transparent) style with gold border + gold text that fills gold with onyx text on hover — fully doable with Elementor free Button normal/hover states.
- The source wraps the button in a "Magnetic" cursor-follow effect (button subtly moves toward the cursor). Elementor **free cannot** do magnetic cursor-follow natively — acceptable free workaround: skip it (static button) or add a small custom-CSS/JS snippet via an **HTML** widget. A static button is the recommended fallback.

**Images used:**
- None.

**Style notes:**
- Section background: `onyx`; top hairline border `ivory` ~10%.
- H2: serif, light, `ivory`, ~4xl–5xl, constrained max-width.
- Button: outline style — `gold` border + `gold` text, transparent fill, uppercase, wide letter-spacing, tiny font, generous padding; on hover fill `gold` with `onyx` text. Smooth color transition.

---

### Design system token reference (apply globally in Elementor → Site Settings → Global Colors/Fonts)
- **onyx** — primary near-black page background.
- **ink** — secondary dark background (hero + partners section); very close to onyx.
- **ivory** — off-white primary text; also used at reduced opacities (75/60/40/15/12/10%) for secondary text and hairline borders.
- **gold** — primary accent (eyebrows, icons, link/button hover, button border).
- **champagne** — lighter warm accent, used only for the hero eyebrow.
- **Serif** heading font (light weight) for all H1/H2/H3 and partner/FAQ titles; **sans-serif** for body, eyebrows, labels, and buttons (uppercase + wide letter-spacing on labels/buttons).

Note on animations: every section uses a "Reveal" on-scroll fade/slide-in (staggered by ~90–120ms per item). Elementor **free** supports entrance **Motion Effects / Entrance Animations** (fade-in-up) per widget/column with animation delay — use those to approximate the staggered reveal. Source file: `/Users/faran/TBT/app/financing/page.tsx`; hero component: `/Users/faran/TBT/app/components/PageHero.tsx`.

---


## Contact Page (/contact)

> Route: `/contact` · Page background: **onyx** with **ivory** text. The form widget itself (the `InquiryForm` component inside the form section) is documented separately — this spec covers the page wrapper, hero, and the surrounding chrome (nav, footer, intro veil) exactly as rendered, top to bottom.

---

### 0. Intro Veil (one-time entry animation)

**Purpose:** A full-screen branded curtain that covers the page on first visit, fades the logo in, then slides up to reveal the page. Shown only once per browser session (and skipped entirely for users who prefer reduced motion).

- **Verbatim copy:** none (logo image only). Logo `alt`: `Teeth by Trev — Dental Atelier`
- **Layout:** Fixed full-screen overlay (`bg-onyx`, dark variant), logo centered with a thin gold rule below it. Animates: fade/rise in → slides up out of view → removed from DOM. Total runtime ~2 seconds.
- **Free Elementor widgets:** Elementor Free cannot reproduce a session-gated, slide-up preloader natively. **Simplest approach: omit it** — it is decorative and non-essential to a Contact page. If the client insists, use a free page-preloader plugin (e.g. the free "Elementor Addon Elements" or "Premium Addons Lite" preloader) showing the logo, or a small custom **HTML widget** with CSS keyframes. Treat as optional.
- **Images used:** `/brand/tbt-atelier-logo.png`
- **Style notes:** onyx background, gold (`bg-gold`) divider line, logo ~h-14 mobile / h-20 desktop.

---

### 1. Header / Navigation (AtelierNav — global, fixed)

**Purpose:** Fixed top navigation with logo, a "Book" button, and a hamburger that opens a full-screen overlay menu.

- **Verbatim copy:**
  - Logo `alt`: `Teeth by Trev — Dental Atelier`
  - Logo link `aria-label`: `Teeth by Trev — home`
  - Desktop button: **Book**
  - Hamburger toggle label: **Menu** (becomes **Close** when open)
  - Overlay menu items, each with a zero-padded index `01`–`06`:
    - `01` **Home**
    - `02` **About**
    - `03` **Services**
    - `04` **Gallery**
    - `05` **Financing**
    - `06` **Contact**
  - Overlay CTA button: **Book a Consultation →**
- **Layout:** Fixed bar, full width, `max-w-[1600px]` inner. Left: logo. Right: "Book" outline button (hidden on mobile, `sm:block`) + hamburger toggle. On scroll past 32px, the bar shrinks (less vertical padding) and gains a translucent onyx backdrop with blur and a bottom hairline border. Clicking the hamburger opens a **full-screen onyx overlay**: vertically centered list of the six links (serif, large — `text-4xl` mobile / `text-6xl` desktop) each prefixed by a small gold index number, with the "Book a Consultation →" outline button below. Body scroll locks while open.
- **Free Elementor widgets:**
  - Use the theme/site header (or Elementor's free **Nav Menu** + **Image** logo + **Button** widgets) for the bar.
  - The shrink-on-scroll + translucent backdrop is a sticky-header effect; Elementor Free's section "sticky" effect is a **Pro** feature. Free workaround: use a **theme** that supports a sticky/transparent header (most free themes like Hello + Astra/OceanWP do), or a small custom **HTML/CSS** sticky header.
  - The full-screen overlay hamburger menu with large serif items + index numbers is not a native free Elementor widget. Free workaround: use the free **"ElementsKit Lite"** Header/Nav (offcanvas) module, or the theme's mobile menu, and style link items to include numbering via CSS counters. As a static fallback, a standard horizontal **Nav Menu** is acceptable.
- **Images used:** `/brand/tbt-atelier-logo.png`
- **Style notes:** onyx bar; ivory text/icons; gold (`text-gold`, `border-gold`) for the "Book" button and overlay CTA (hover fills gold with onyx text); index numbers `gold/70`; uppercase, wide letter-spacing (tracking ~0.24–0.28em) on button and toggle text; serif (font-serif), light weight on the large overlay link labels.

---

### 2. Page Hero (PageHero component)

**Purpose:** Full-bleed intro banner that frames the contact page with an eyebrow, large serif headline, and one-line invitation.

- **Verbatim copy:**
  - Eyebrow: **Begin**
  - H1 (headline): **Start your smile journey.**
  - Intro paragraph: **Fill out the form below and Dr. Trev will personally review your inquiry.**
  - (Background image `alt`: `The Teeth by Trev reception — a black marble wordmark wall, marble desk, and a city skyline view`)
- **Layout:** Single full-width section, min height ~60vh. A background photo fills the section at **40% opacity**, overlaid with a top-to-bottom dark gradient (from `ink` up through `ink/70` → `ink/60`) so text stays legible. Content is bottom-aligned within a `max-w-7xl` container, generous top padding (clears the fixed nav). Stacked vertically: eyebrow → H1 → intro. Headline `max-w-4xl`, intro `max-w-xl`. Scales up at sm/lg breakpoints (H1 `text-5xl` → `sm:text-6xl` → `lg:text-7xl`). No layout change needed on mobile beyond the responsive text/padding sizes.
- **Eyebrow detail:** rendered as a small label — a short horizontal rule (`h-px w-8`, current color at 50% opacity) followed by the word "Begin." (No index number on this hero.)
- **Free Elementor widgets:**
  - Build as a section/container with a **background image** + a background **overlay** (color overlay with gradient) — both available in Elementor Free's section background settings. Set background image opacity via the overlay/opacity control.
  - **Heading** widget for the H1 (`Start your smile journey.`).
  - **Heading** or **Text Editor** (small, styled) for the eyebrow `Begin`, with a preceding **Divider** (short, left-aligned) or an inline `—` to mimic the rule. Alternatively an **Icon List**/HTML for the rule+label combo.
  - **Text Editor** for the intro paragraph.
  - Bottom-align content using the column/container vertical-align = "End" setting (free).
- **Images used:** `/stock/contact-hero.jpg`
- **Style notes:** background base `ink`; dark `ink` gradient overlay; eyebrow color **champagne** (`text-champagne`), uppercase wide-tracked; H1 in **serif**, light weight, **ivory**; intro in ivory at ~75% opacity (`text-ivory/75`).

---

### 3. Inquiry Form Section

**Purpose:** Hosts the contact/inquiry form and a small "Questions?" contact-line beneath it. (The form fields/steps are documented separately — only the section wrapper and the trailing contact line are spec'd here.)

- **Verbatim copy (trailing contact line, below the form):**
  - `Questions? Text 424-394-6159 · DM @dr.trevthomas`
    - "Text" links to phone: `tel:+14243946159` (link text **424-394-6159**)
    - "DM" links to Instagram: `https://www.instagram.com/dr.trevthomas/` (link text **@dr.trevthomas**, opens in new tab)
- **Layout:** onyx section with large vertical padding (`py-24` / `lg:py-32`). Centered content column, `max-w-3xl`. The form sits at the top of the column (it animates in via a fade/rise "Reveal" on scroll). Below the form, separated by a top hairline border (`border-ivory/10`) with padding above it, a centered single-line caption (`max-w-2xl`) holds the "Questions?" contact text.
- **Free Elementor widgets:**
  - Section/container = onyx background, padded.
  - Form: see the separate form spec. (Note: Elementor's Form widget is **Pro**; the form spec covers the free alternative — e.g. a free plugin like "Forminator," "WPForms Lite," or "Contact Form 7" embedded via Shortcode/HTML widget.)
  - **Divider** widget for the hairline rule above the caption.
  - **Text Editor** (centered, small, uppercase) for the "Questions? Text … · DM …" line, with inline links to `tel:+14243946159` and the Instagram URL.
  - The scroll-triggered fade/rise "Reveal" on the form is an entrance animation — Elementor Free supports basic **entrance motion effects** (e.g. "Fade In Up") on widgets/columns, so apply that to approximate it.
- **Images used:** none.
- **Style notes:** onyx background; caption is very small (`~0.72rem`), uppercase, wide letter-spacing (~0.2em), ivory at ~45% opacity; links ivory at ~70% opacity with **gold** hover (`hover:text-gold`); hairline border ivory at 10% opacity.

---

### 4. Footer (AtelierFooter — global)

**Purpose:** Site footer with brand mark, tagline, address/phone, social links, mirrored nav, and legal/locations line.

- **Verbatim copy:**
  - Logo `alt`: `Teeth by Trev — Dental Atelier`
  - Tagline: **An atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas, DDS.**
  - Address (each line):
    - `436 N Bedford Dr #300`
    - `Beverly Hills, CA 90210`
    - Phone link: **424-394-6159** (`tel:+14243946159`)
  - Social icon links (all open in new tab, `aria-label` = the label):
    - **Instagram** → `https://www.instagram.com/dr.trevthomas/`
    - **Facebook** → `https://www.facebook.com/dr.trevthomas/`
    - **TikTok** → `https://www.tiktok.com/@dr.trevthomas`
    - **LinkedIn** → `https://www.linkedin.com/in/drtrev/`
  - Footer nav links: **Home** (/), **About** (/about), **Services** (/services), **Gallery** (/gallery), **Financing** (/financing), **Contact** (/contact)
  - Copyright: **© {current year} Teeth by Trev. All rights reserved.** (the year is generated dynamically — e.g. `© 2026 Teeth by Trev. All rights reserved.`)
  - Locations line: **Beverly Hills · New York · Atlanta · Houston · Washington D.C. · Tampa · Memphis**
- **Layout:** onyx footer with a top hairline border, padded (`py-16`), inner `max-w-[1600px]`. Top block is two-column on desktop (`lg:flex-row`, bottom-aligned, space-between), stacked on mobile:
  - **Left column:** logo → tagline (`max-w-xs`) → address block → row of four circular social icon buttons.
  - **Right column:** vertical list of the six nav links (right-aligned on desktop, `lg:items-end`).
  - **Bottom bar:** separated by another hairline top border; copyright on the left, locations string on the right (row on `sm`, stacked on mobile).
- **Free Elementor widgets:**
  - **Image** widget for the logo.
  - **Text Editor** for the tagline.
  - **Text Editor** (or **Icon List**) for the address; phone as a `tel:` link.
  - **Social Icons** widget (free) for the four socials — set to circular/outline style. (TikTok icon may need the free icon set or a custom SVG via **HTML** widget if not in the default library.)
  - **Nav Menu** widget (or **Icon List** of links) for the mirrored footer nav.
  - **Divider** widgets for the two hairline borders.
  - **Text Editor** for the copyright and locations lines. (Dynamic year is a Pro/dynamic-tag feature; in free, either hardcode the year or use a tiny **HTML/Shortcode** snippet to output the current year.)
- **Images used:** `/brand/tbt-atelier-logo.png`
- **Style notes:** onyx background; ivory text at low opacities (tagline/address/nav ~`ivory/45`, bottom bar ~`ivory/35`); gold hover on all links and on social icon hover (border + icon turn gold); social icons are 36px circles with a faint ivory border (`border-ivory/15`); footer nav + bottom-bar text are very small, uppercase, wide letter-spacing (~0.26em); tagline/address are small serif-neutral sans at relaxed line-height. Hairline borders ivory at 10% opacity.

---

### Design-system reference (tokens used on this page)

- **onyx** — primary page/section/footer/nav background (near-black).
- **ink** — hero background base + hero gradient overlay color (deep dark).
- **ivory** — primary text color (off-white); used at varying opacities (45%, 35%, 70%, 75%, 10% for borders).
- **gold** — accent: buttons, link hover, icon hover, eyebrow rule, intro-veil divider.
- **champagne** — hero eyebrow text color.
- **font-serif** — display/headings (hero H1, large overlay menu links): light weight, large.
- **font-sans** (default) — body, labels, eyebrows, nav/footer micro-text: uppercase with wide letter-spacing for labels/eyebrows.

### Image inventory (all `/public` paths used on this page)

- `/stock/contact-hero.jpg` — hero background
- `/brand/tbt-atelier-logo.png` — used in the intro veil, header logo, and footer logo

### Notes / interactions Elementor Free can't fully match

- Intro-veil one-time slide-up preloader (Section 0) — omit or approximate with a plugin/custom HTML.
- Shrink-on-scroll + translucent/blurred sticky header (Section 1) — sticky header is Elementor **Pro**; rely on theme sticky header or custom CSS.
- Full-screen overlay hamburger menu with large serif items + gold index numbers (Section 1) — use free add-on (ElementsKit Lite) or theme mobile menu; static horizontal nav is an acceptable fallback.
- Scroll "Reveal" fade/rise on the form (Section 3) — approximate with Elementor Free's built-in entrance motion effect ("Fade In Up").

---

# Dynamic features

---

## Inquiry Form → Airtable (free Elementor)

This spec rebuilds the existing 4-step Next.js inquiry form (`app/contact/InquiryForm.tsx`) as a WordPress page using **free Elementor** for layout plus a **free form plugin** embedded via shortcode/block. The Elementor Form widget is **Pro-only**, so we do not use it. Recommended free plugin: **WPForms Lite** (simplest, native file upload, easy webhook via free add-ons) — with **Contact Form 7 (CF7)** as the alternative where true multi-step is required.

The form must capture the same data and write a single record to the Airtable **"Leads"** table, mapping each field to the exact column names from `app/api/inquiry/route.ts`.

---

### 1. Form fields

Field labels, input types, required flags, and verbatim option lists are taken from `InquiryForm.tsx`. The Airtable column is the `fields` key from the route's mapping object.

| Form field label | Input type | Required? | Options (verbatim) | Airtable column |
|---|---|---|---|---|
| First Name | Single-line text | Yes | — | (combined → `Caller Name`) |
| Last Name | Single-line text | Yes | — | (combined → `Caller Name`) |
| Phone Number | Phone / tel | Yes | — | `Phone Number` |
| Email Address | Email | Yes | — | `Email` |
| Social Media Handle(s) | Single-line text | Yes | — | `Social` |
| Which city would you like to be seen in? | Dropdown (select) | Yes | Beverly Hills, CA · New York, NY · Atlanta, GA · Houston, TX · Washington, D.C. · Tampa, FL · Memphis, TN · Other — I am flexible | `City` |
| Services interested in | Checkboxes (multi-select) | No | Implants · Veneers · Whitening · Crowns · Cleaning · Extraction · Full Smile Makeover | `Services` (comma-joined) |
| Tell us about your goals and concerns | Paragraph / textarea | Yes | — | `Treatment Interest` |
| Estimated budget | Radio (single-select) | No | Under $2K · $2K – $5K · $5K – $10K · $10K – $20K · $20K – $40K · $40K+ | `Budget` |
| Would you like financing options? | Radio (single-select) | No | Yes, I'd like financing options *(value: Yes)* · No, paying out of pocket *(value: No)* | `Financing` |
| Photos of your teeth | File upload (multiple) | No | Accept image/* (JPG, PNG, HEIC); max 10MB each | `Photos` (URL field) |
| Reserve a private video consultation with Dr. Trev — $250, credited 100% toward your treatment. | Single checkbox | No | Checked → `Yes`, unchecked → `No` | `Video Consult` |
| How did you hear about us? | Dropdown (select) | No | Instagram DM · Instagram Comment · Facebook · Referred by a friend or patient · Found on the website · Other | `How did you hear` |
| *(hidden / constant)* | Hidden field | — | Always `Website` | `Source` |

**Notes on mapping**
- **Caller Name**: the original concatenates First + Last with a space. In WPForms/CF7, add both name fields, then build `Caller Name` in the webhook/automation step as `{First Name} {Last Name}` (or use a Name field with First/Last sub-fields).
- **Services**: stored as a single comma-separated string (e.g. `Implants, Veneers`), matching `services.join(", ")`. Use a checkbox field and join the selected values in the automation.
- **Financing**: store the short value (`Yes` / `No`), not the long label, to match the route. Use radio option values `Yes` and `No` with the long text as the display label.
- **Video Consult**: convert the boolean checkbox to the literal strings `Yes` / `No` in the automation step.
- **Source**: not a visible field — set as a constant `Website` (a WPForms hidden field, or hard-coded in the automation).
- The original validates email format and requires First, Last, Phone, Social, Email (Step 1) and City, Goals (Step 2). Mark those same fields required in the plugin; add an email-format validation on the Email field.

---

### 2. Multi-step note (honest)

The live site is a **4-step wizard**: **Contact → Your Smile → Investment → Finish**.

- **WPForms Lite does NOT support multi-step** — "Page Break" / multi-page forms are a **WPForms Pro** feature. Do not promise a stepped wizard on the free tier.
- **Recommended free approach — one long single-page form grouped into visual sections.** Use WPForms Lite and add an **HTML / Section Divider** block (free) before each group with the original step headings as sub-headers:
  1. **Contact** — First Name, Last Name, Phone, Email, Social Media Handle(s)
  2. **Your Smile** — City, Services, Goals
  3. **Investment** — Budget, Financing (+ financing-partner links as descriptive text), Photos
  4. **Finish** — $250 video consultation checkbox, How did you hear
  Elementor's free Heading/Divider widgets can frame these sections around the embedded shortcode for the same visual rhythm.
- **If a true stepped wizard is required for free**, use **Contact Form 7 + a free multistep add-on** (e.g. the "CF7 Multi-Step Forms" plugin). This genuinely splits the form into Contact / Your Smile / Investment / Finish pages at no cost, but is more fiddly to style than WPForms and needs its own webhook wiring (see §3). This is the honest tradeoff: WPForms Lite = easier + prettier but single-page; CF7 + add-on = real steps but more setup.

Either way, the embed pattern is the same: build the page layout in **free Elementor**, then drop the form in with its **shortcode** — `[wpforms id="123"]` or `[contact-form-7 id="456"]` — via Elementor's free **Shortcode widget** (or the WordPress Shortcode/CF7 block).

---

### 3. Sending to Airtable from WordPress

The original route POSTs to the Airtable REST API with a token. On WordPress we don't run that server code, so route the submission through a **webhook into Make.com or Zapier (both have free tiers)**, which creates the record in the Airtable base, table **"Leads"**.

**Flow:** WordPress form submit → webhook (POST, JSON or form-encoded) → Make/Zapier scenario → "Airtable → Create a Record" in table **Leads**.

- **WPForms Lite**: native webhooks are Pro, so use the free **"WPForms Webhooks"-style** path via Zapier's WPForms connection, or the free **Uncanny Automator** (has a free Airtable/webhook tier), or a tiny snippet on the `wpforms_process_complete` hook that `wp_remote_post()`s to the Make/Zapier webhook URL.
- **Contact Form 7**: use the free **CF7 to Zapier / CF7 to Webhook** add-on to fire the webhook on submit.
- **Fully free WP→Airtable connector alternative**: a plugin such as **WP Airtable / "Airtable Connector"** can write directly to the base without Make/Zapier — viable if you prefer to skip the automation layer. Either path ends at the same Airtable columns.

**Exact field → Airtable column mapping to configure in the Create-Record step** (left = source form field, right = Airtable column, verbatim from `route.ts`):

| Source (form field) | Airtable column | Transform |
|---|---|---|
| First Name + Last Name | `Caller Name` | join with a space |
| Phone Number | `Phone Number` | — |
| Email Address | `Email` | — |
| Social Media Handle(s) | `Social` | — |
| City | `City` | — |
| Services (checkboxes) | `Services` | comma-join selected values |
| Goals / concerns | `Treatment Interest` | — |
| Budget | `Budget` | — |
| Financing | `Financing` | send `Yes` / `No` |
| Video consult checkbox | `Video Consult` | checked → `Yes`, else `No` |
| How did you hear | `How did you hear` | — |
| *(constant)* | `Source` | always `Website` |
| Uploaded photo URL(s) | `Photos` | public WP Media URL(s) — see §4 |

Airtable's API is forgiving with `typecast: true` (as the original uses), so single-select / text columns accept the string values above as-is. Keep the column names **exactly** as written (including spacing and the lowercase `Photos`, `Email`, etc.).

---

### 4. Photo uploads

The original shrinks photos client-side, stores them on a persistent disk, and writes a gallery URL into Airtable's `Photos` field. On WordPress, lean on the form plugin's file field instead:

- Add a **File Upload field** to the form (WPForms Lite includes file upload; CF7 has `[file]`). Set **Allowed file types** to `jpg, jpeg, png, heic, webp, gif`, **max size 10MB**, and enable **multiple files** (WPForms supports multiple per field; with CF7 add several `[file]` inputs).
- On submit, the plugin stores the uploads in the **WordPress Media Library** (`/wp-content/uploads/...`), which **persists on Managed WordPress hosting** — no separate disk mount needed (this replaces the Next.js `UPLOAD_DIR` / persistent-disk logic).
- The webhook payload includes the **resulting public file URL(s)**. In the Make/Zapier Create-Record step, map those URL(s) into the Airtable **`Photos` (URL)** field. If multiple photos, join the URLs (newline- or comma-separated) into the single `Photos` field, mirroring the original single-gallery-URL behavior.
- Optional client-side downsizing (the original's 1600px / 0.82-quality JPEG step) isn't available for free; instead rely on the plugin's max-size limit and let the host store full-resolution images.

---

### 5. $250 deposit

Do **not** rebuild payments. The site already has the deposit wired through **Square** (the existing checkout link `https://square.link/u/wISlz03Z`, "$250 deposit, credited 100% toward treatment"). On WordPress, reuse the existing **WooCommerce product + Square** that's already configured:

- Keep the **"Reserve a private video consultation — $250, credited 100%"** checkbox on the form (maps to `Video Consult`).
- On the form's **confirmation message** (WPForms "Confirmation" / CF7 "Mail/Thank-you"), show the same success copy ("We Received Your Inquiry…") and, when the consult box is checked, a button linking to the **existing WooCommerce checkout / Square deposit product** — not a new payment integration. Use the existing Square link or the WooCommerce product's "Add to cart / Buy now" URL.
- Remind the visitor (as the original does) to **use the same email** they entered so the booking connects automatically.
- Because free WPForms can't conditionally redirect by Pro logic, the simplest free pattern is: always show the deposit button on the thank-you screen with the note that it's only needed if they opted into the video consultation. This keeps payments on the already-working WooCommerce + Square setup and avoids any new checkout build.

---

Confirmed: `tbt-logo-dark.png`, `tbt-logo-footer.png`, `tbt-logo.png`, `dental-7800675.jpg`, and `dental-8413334.jpg` are unreferenced anywhere in the codebase. The active logo used everywhere is `tbt-atelier-logo.png`.

## Asset Inventory (for the WP Media Library)

### Logo (call-out)

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/brand/tbt-atelier-logo.png` | Site-wide: main Nav (`app/components/Nav.tsx`), Footer (`app/components/Footer.tsx`), Intro veil animation (`app/components/IntroVeil.tsx`), Consultation page (`app/consultation/page.tsx`), Atelier Nav & Footer (`app/atelier/components/AtelierNav.tsx`, `AtelierFooter.tsx`) | **Active primary brand logo.** This is the only logo in use — the canonical mark to import into WP. |
| `public/brand/tbt-logo.png` | — (not referenced) | Legacy/alternate logo. **Unused** — likely safe to skip or archive. |
| `public/brand/tbt-logo-dark.png` | — (not referenced) | Dark-variant logo. **Unused.** |
| `public/brand/tbt-logo-footer.png` | — (not referenced) | Footer-variant logo. **Unused** (footer now uses `tbt-atelier-logo.png`). |

### Brand / texture

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/brand/grain.svg` | Site-wide via `app/globals.css` (`background-image`) | Grain/noise texture overlay applied globally. |

### People

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/people/dr-trev-portrait.png` | About (`app/about/page.tsx`), Home Philosophy section (`app/components/Philosophy.tsx`), Atelier Manifesto (`app/atelier/components/Manifesto.tsx`) | Portrait of Dr. Trev (founder/practitioner bio). |

### Gallery (clinical / case photos)

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/gallery/trev-exam.jpg` | Home Gallery (`app/components/Gallery.tsx`) | Exam scene — gallery feature item. |
| `public/gallery/trev-consult-blue.jpg` | Home Gallery, Gallery page, Services page, Atelier WorkIndex & ServiceList | Consultation (blue) — recurring gallery/service image. |
| `public/gallery/trev-consult-suit.jpg` | Home Gallery (`app/components/Gallery.tsx`) | Consultation (suit) — gallery item. |
| `public/gallery/trev-veneer-craft.jpg` | Home Gallery, Services page (hero + item), Atelier WorkIndex & ServiceList | Veneer craftsmanship — gallery/service hero image. |
| `public/gallery/trev-intraoral-scan.jpg` | Home Gallery, Gallery page, Services page, Atelier WorkIndex & ServiceList | Intraoral scan — gallery/service image. |
| `public/gallery/trev-scan-suite.jpg` | Home Gallery, Gallery page, Services page, Atelier WorkIndex & ServiceList | Scan suite/equipment — gallery/service image. |
| `public/gallery/trev-smile-design.jpg` | Atelier ServiceList (`app/atelier/components/ServiceList.tsx`) | Smile-design — Atelier service image. |

### Stock (heroes, services, before/after, backgrounds)

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/stock/contact-hero.jpg` | Contact page (`app/contact/page.tsx`) | Contact page hero. |
| `public/stock/financing-hero.jpg` | Financing page hero (`app/financing/page.tsx`); also a Gallery page item | Financing hero / gallery image. |
| `public/stock/process.jpg` | About page hero (`app/about/page.tsx`), Home Process section (`app/components/Process.tsx`) | Process/workflow imagery. |
| `public/stock/feature-bg.jpg` | Home FeatureBand (`app/components/FeatureBand.tsx`), Gallery page feature (`app/gallery/page.tsx`) | Full-width feature band background. |
| `public/stock/before-smile.jpg` | Home Gallery, Gallery page (before/after slider) | "Before" image in before/after comparison. |
| `public/stock/after-smile.jpg` | Home Gallery, Gallery page (before/after slider); Atelier ServiceList | "After" image in before/after comparison; also an Atelier service image. |
| `public/stock/service-smile-makeover.jpg` | Home Services (`app/components/Services.tsx`), Services page, Gallery page | Smile-makeover service card. |
| `public/stock/service-veneers.jpg` | Home Services (`app/components/Services.tsx`) | Veneers service card. |
| `public/stock/service-implants.jpg` | Home Services (`app/components/Services.tsx`) | Implants service card. |
| `public/stock/service-full-mouth.jpg` | Home Services (`app/components/Services.tsx`) | Full-mouth service card. |
| `public/stock/dental-7800675.jpg` | — (not referenced) | Unused stock photo. Safe to skip/archive. |
| `public/stock/dental-8413334.jpg` | — (not referenced) | Unused stock photo. Safe to skip/archive. |

### Video poster

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/video/trevor-hero-poster.jpg` | Home Hero (`app/components/Hero.tsx`), Atelier Hero (`app/atelier/components/AtelierHero.tsx`) | Poster frame for the hero background video (`trevor-hero.mp4`). |

### Framework/template SVGs (not used by app code)

| File path | Used on (page/section) | Purpose |
|---|---|---|
| `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` | — (not referenced in `app/`) | Default Next.js starter icons. **Unused** — exclude from the Media Library. |
