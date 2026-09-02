Liverpool Blue Bottle Liquor Express — V3.13

V3.13 adds a dedicated Shop page and a dedicated Current Specials page using one shared catalogue data source.

Shop page: shop.html
Specials page: specials.html
Shared catalogue/pricing/special logic: catalog-data.js + catalog.js
Cart/order engine: script.js

Normal/base prices remain the master prices. Add a specialPrice and optional specialStart/specialEnd for a product in catalog-data.js to make it appear on the Specials page and show the crossed-out base price, special price and calculated percentage off.

Product images are intentionally placeholders until approved packshots are supplied.


V3.21 — PAGE-LEVEL SPECIALS CAMPAIGN
Specials are now controlled by one campaign date range in catalog-data.js (window.LBB_SPECIALS_CAMPAIGN), not by individual product dates. Products only need normalPrice and specialPrice. A specials batch is active only inside the campaign window; when it expires, the Specials page clears and Shop products return to normal pricing. For the next batch, update the single campaignStart/campaignEnd values and enable the campaign. The website cannot reliably infer a GitHub upload/commit date from a static page, so the batch date is stamped once when the specials batch is prepared.

V3.22 TEST: Specials campaign is enabled for 1 September 2026 through 15 September 2026. 15 supplied product images are source-derived crops from the user-provided specials composite and are used only for this test.
