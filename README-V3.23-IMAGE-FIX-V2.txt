V3.23 IMAGE FIX V2

Root cause addressed:
The Specials renderer was requesting product files from a nested
specials-images/ folder. On the live GitHub Pages site those paths were
returning 404s, producing the broken-image icon and alt text.

This build:
- moves the verified supplied product PNGs to the repository root;
- updates catalog-data.js to use those exact local PNGs;
- removes the old giant base64 image payloads from specials.html;
- uses eager loading for the product images;
- replaces unavailable product JPG references with a local placeholder so
  the browser never shows a broken-image icon.

The 14 product images are direct crops from the catalogue image supplied by
the user. They were not AI-generated or retouched.

IMPORTANT:
Upload ALL files in this package to the GitHub repository root.
There is intentionally no specials-images/ folder in this version.
