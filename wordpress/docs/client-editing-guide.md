# Editing the Teeth by Trev website

The website uses the free Elementor plugin with custom Teeth by Trev sections.
Text, pictures, links and gallery cards are stored in WordPress. Publishing a
content edit does not require Git, a developer, or a deployment.

## Change page text

1. Log in to WordPress and open **Pages**.
2. Find the page and click **Edit with Elementor**.
3. Click the section you want to edit, or select its name in **Structure**.
4. Open **Text** in the left panel and change the wording.
5. Click **Publish** and open the website to check it.

The design is preserved by the custom section. Some styled headings have separate
fields for each line or highlighted phrase. The labels identify the current copy.

## Change a picture or video

1. Select the section in Elementor and open **Pictures and video**.
2. Click the picture, then choose an existing item from **Media Library** or
   use **Upload files**.
3. Update the image description in the **Text** panel when needed.
4. Click **Publish**. Use Elementor's desktop, tablet and mobile previews to
   check the crop. Similar image proportions give the most predictable result.

Existing pictures remain bundled with the theme as defaults. Replacement pictures
are normal WordPress Media Library attachments. Visitor smile uploads are separate
from these public website pictures and do not enter the Media Library.

## Add, remove or reorder gallery cards

Edit **Gallery**, select the **Cases** section and open **Gallery cards**.
Each row contains its picture, title, caption and image description. Use **Add
Item**, the duplicate icon, the remove icon, or drag rows to change their order.
Publish when finished. The before/after comparison pictures are edited separately
in that section's **Pictures and video** panel.

## Header, footer and contact details

Administrators can open **Tools → TBT Page Editor** and use the **Site Header**
or **Site Footer** editing links. Text, pictures, navigation labels and destinations,
social links and footer contact information have Elementor controls. Page-specific
contact details, such as those on Home, are edited on the corresponding page.

The header/footer documents work with Elementor Free; no Pro licence is required.
The fixed number of navigation entries belongs to the approved header layout.
Adding a new navigation entry or changing the underlying section structure requires
a layout update. Existing labels and links can be edited without code.

## Undo a change

Use Elementor **History** to undo an editing action or return to a saved revision.
Preview before publishing. A WordPress database backup includes the saved page
content; a Git checkout alone does not contain subsequent client content edits.

## Forms

The Contact and Reserve sections embed the existing TBT Core forms. Their surrounding
headings and copy are editable. Required fields, Airtable mapping and payment logic
remain in TBT Core and need developer changes and testing. Do not replace them with
a generic Elementor form: doing so would bypass the existing data handling.

## Add a new page

Create a WordPress page, choose the **TBT Editable Page** page template, then
open **Edit with Elementor**. You can use standard Elementor widgets or existing
Teeth by Trev sections. New layouts need a desktop and mobile review. The exact
replica guarantee applies to the supplied page layouts, not arbitrary new designs.

## Developer setup and recovery

Install the Teeth by Trev theme 0.3.1 and Elementor 4.2.4 (tested; requires
WordPress 6.8 or newer). Activate Elementor, then open **Tools → TBT Page Editor**.
The ordinary **Prepare editable pages** action skips existing Elementor layouts.
For the existing staging site, use **Archive older layouts and prepare replica**
to preserve the older stored layouts and seed the current approved replica.

Only the ten named replica pages plus two global documents are eligible. Conversion
never runs during theme/plugin updates and never overwrites a completed conversion.
Before conversion, the original post content and Elementor metadata are stored in
`_tbt_before_elementor`. `tbt_editor_restore_page($id)` restores an exact page backup
for an authorized administrator and archives the current editor state first.
Remove the `tbt_editor_header`/`tbt_editor_footer` options to return global areas
to the original PHP fallbacks. Database and theme backups should be retained together.

The original PHP templates remain as fallbacks. Legacy unrelated pages are not
automatically switched to the new rendering path. Client changes live in Elementor
document settings and revisions; the versioned JSON file contains approved layout
markup and initial values only. Do not regenerate it to deploy client edits.

Prepared replica pages use the theme's approved typography and colors, not the
older Elementor Site Settings style kit. That kit remains unchanged for unrelated
pages. Edit content through the section controls; global design changes require
a reviewed theme update.
