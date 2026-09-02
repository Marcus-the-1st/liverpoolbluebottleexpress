Liverpool Blue Bottle Liquor Express — V3.23 FIXED SPECIALS TEST

IMPORTANT:
- The main/go-ahead foundation is preserved from the working V3.18/V3.21 build.
- This is a Specials test only. Do not treat the failed V3.23 package as the master.
- Shop All Products uses the complete master catalogue again.
- Specials uses the page-level campaign: 1 September – 15 September 2026.
- 15 specials have their own local image assets under specials-images/.
- Individual supplied product images are used where available; extracted test assets are used only where an individual source was not available.

FIX:
The previous test accidentally replaced the full master catalogue with a 15-item specials-only catalogue and changed catalog rendering so Shop filtered everything through the specials campaign. That caused Shop All Products to appear empty. This package restores the master catalogue and uses the existing mode-aware catalog renderer.

Image assets present: 15/15.
