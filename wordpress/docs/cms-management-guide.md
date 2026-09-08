# Managing menus, reusable content and SEO

These features use **TBT Content Manager 1.1.0** with the **Teeth by Trev 0.4.2**
theme. They do not require Elementor Pro. Elementor still controls page headings,
introductions and layout; repeated content is managed in the screens below.

## Navigation menus

Open **Appearance → Menus** and choose the TBT Primary, Footer or Legal menu.
Add pages or custom links, drag entries to reorder them, and click **Save Menu**.
Under Manage Locations, Primary is the overlay navigation, Footer is the footer
page list, and Legal contains the privacy/terms links. Existing links to WordPress
pages follow their permalinks. Custom external links remain the URL you enter.

Submenus are supported. The overlay scrolls when a longer menu would exceed the
screen. Check mobile navigation after adding entries. The separate Book button
and social icons are still edited in the Elementor header/footer documents.
Menus require an administrator or a role with WordPress menu permissions.

## Services

Open **Services → Add Service**, enter the service name, description, picture,
picture description and highlights (one per line). Set **Order** in Page Attributes;
lower numbers appear first. Publish to add it to the Services page.

Enable **Show this service in Selected Work** for the home page. Home page order
is separate. Optional home title, description and picture preserve the existing
editorial presentation; blank overrides use the main service fields. Existing
home-specific copy is retained during migration, so edit those fields when needed.
Service numbering is automatic unless a custom number label is entered.

## Testimonials

Open **Testimonials → Add Testimonial**. The title is the patient attribution;
enter the quote and treatment subtitle. Set Order and Publish. Use only approved
testimonials and public patient names. Quotes are not invented or imported from
visitor enquiries. A missing title or quote keeps the item in Draft.

## Smile Transformations

Open **Smile Transformations → Add Transformation** and choose:

- **Gallery picture card:** enter title/caption and choose a public picture.
- **Before-and-after comparison:** Public picture is the after image; also choose
  the before image, descriptions, labels and optional comparison instructions.

Set Order and Publish. Multiple comparisons are supported. Missing required
pictures keep new/edited items in Draft with an explanatory notice. Drafts and
trashed items do not appear publicly. Trash is recoverable through WordPress.

Only use pictures approved for public display. The existing gallery also includes
studio/process photographs; migration preserves their captions without relabelling
them as clinical outcomes. Private visitor smile uploads remain separate and are
never copied into these content records or the public Media Library.

## Search titles and sharing previews

Open **Pages → SEO & Sharing**, choose a page, and edit:

- Search title and description.
- Optional separate sharing title and description.
- Sharing picture from the Media Library (1200 × 630 is a useful target).

Click **Save Search & Sharing**. This does not change the visible page heading.
Blank search fields retain the existing page defaults; blank sharing fields use
the search values, and a blank sharing picture uses the existing site image.
The same settings are also available in the normal WordPress page editor.

Staging noindex and the Reserve page's indexing restriction cannot be removed
through this screen. Search engines and social platforms may cache or rewrite
previews. Do not enable a second SEO metadata provider without developer review,
to avoid duplicate tags. Canonicals and indexing policy remain managed centrally.

## Review and recovery

Preview desktop and mobile after editing. Published updates affect the associated
pages automatically; no Git deployment is necessary. Standard WordPress revisions
include the registered content and SEO fields. The Order setting uses WordPress's
native menu_order and is not part of the content-metadata revision guarantee.
Use database/media backups for complete recovery, including navigation menus.

Developer setup is explicit at **Tools → TBT Content Setup**. It captures the
current Elementor source and prior menu assignments before migration. Repeating
completed setup preserves edits. **Use original Elementor content** temporarily
returns the previous display without deleting CMS records; **Enable CMS display**
switches back. The original Elementor fields become fallback data, not a second
live editing source. Follow the in-editor link to the relevant content manager.

The content plugin keeps its records if the theme changes or it is deactivated.
A different theme needs its own presentation integration. Do not replace a
production database with a staging database containing older client content.

## Footer and pre-footer city pop-ups (content manager 1.1.0)

Open **Locations** in the main WordPress menu. Each location is a separate
WordPress record with an administrator-facing title, public city, optional area
and practice name, visit type, address and Google Maps search text. Published
records update both the footer and the homepage pre-footer automatically.

Records with exactly the same City value share one pop-up (for example Manhattan
and Brooklyn under New York). Use the native Order field to change city/location
order. Choose **By appointment** to edit its introductory text, SMS link label,
international SMS number and closing text. Drafts and trashed records are hidden.

The prior Elementor location repeater and old static address/city fields remain
archived for recovery but are no longer displayed. Footer navigation still uses
**Appearance → Menus**. Location edits do not modify enquiry destinations,
private photos or payment settings. Location records are stored by the content
plugin and remain in WordPress if the theme changes.
