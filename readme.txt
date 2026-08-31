Liverpool Blue Bottle Liquor Express — V3.13

V3.13 adds a dedicated Shop page and a dedicated Current Specials page using one shared catalogue data source.

Shop page: shop.html
Specials page: specials.html
Shared catalogue/pricing/special logic: catalog-data.js + catalog.js
Cart/order engine: script.js

Normal/base prices remain the master prices. Add a specialPrice and optional specialStart/specialEnd for a product in catalog-data.js to make it appear on the Specials page and show the crossed-out base price, special price and calculated percentage off.

Product images are intentionally placeholders until approved packshots are supplied.
