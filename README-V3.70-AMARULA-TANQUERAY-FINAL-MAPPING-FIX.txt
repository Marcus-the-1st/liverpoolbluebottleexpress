Liverpool Blue Bottle Liquor Express — V3.70
AMARULA / TANQUERAY FINAL IMAGE MAPPING FIX

Replace/upload these 3 files into the GitHub Pages main folder:
- catalog-data.js
- amarula-cream.png
- tanqueray-flor-de-sevilla.png

Fixes:
- Amarula Cream now uses a dedicated filename: amarula-cream.png
- Tanqueray Flor de Sevilla remains mapped to tanqueray-flor-de-sevilla.png
- This avoids the previous Amarula filename collision/wrong-image issue.
- No prices, product names, layout, cart, specials logic, or unrelated products were changed.

The old special-amarula.png file is intentionally no longer referenced by the catalogue. It can remain in GitHub if deletion is inconvenient; the site will not load it for Amarula.
