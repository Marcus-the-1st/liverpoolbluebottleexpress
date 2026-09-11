Liverpool Blue Bottle Liquor Express — V3.78
CLEANED CURRENT WEBSITE BUILD

This ZIP is the cleaned full website build based on the latest supplied V3.77 website.

CURRENT SITE
- Shop: shop.html
- Current Specials: specials.html
- Category pages: category.html
- Shared catalogue/product pricing/image mapping: catalog-data.js
- Specials rendering: catalog.js
- Cart/order engine: script.js

CURRENT SPECIALS CAMPAIGN
- Active campaign: 1 September – 15 September 2026
- Campaign dates are controlled in catalog-data.js through LBB_SPECIALS_CAMPAIGN.

PRODUCT IMAGE STANDARD
- Supplied product images are treated as the exact source of truth.
- Product identity, label, proportions, crop, positioning and image-to-product mapping must be checked before implementation.
- Product images should keep the complete product visible with enough surrounding space to prevent clipping in the website cards.
- Current standardized bottle/packshot assets are generally prepared at 800 × 1000 PNG; naturally square assets such as the 4th Street 5L boxes are retained in their original square composition so the product is not distorted.
- No legacy/unused product-image files are referenced by the current catalogue.

JOSE CUERVO
- Jose Cuervo Especial Silver: 750ml, R285.00
- Jose Cuervo Especial Reposado: 750ml, R285.00
- These are separate products with separate images.

CLEANUP
- Historical version README files have been removed.
- Duplicate/obsolete README files have been removed.
- Old extraction/spacing preview images have been removed.
- Unreferenced legacy product-image files have been removed.
- One current README is intentionally kept for the live build.

IMPORTANT
This is a full cleaned website build. Upload the website files from this ZIP to the GitHub Pages repository, replacing the existing matching files.
