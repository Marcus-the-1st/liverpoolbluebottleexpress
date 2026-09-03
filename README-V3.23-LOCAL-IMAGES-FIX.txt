LIVERPOOL BLUE BOTTLE LIQUOR EXPRESS
V3.23 LOCAL PRODUCT IMAGE FIX

This build starts from the uploaded current repository ZIP.

The specials page now uses local product PNG files in:
specials-images/

The 13 exact name-matched bottle images in this build were cropped directly
from the user's supplied 14-bottle catalogue image. No AI generation,
replacement product search, label recreation, recolouring, or bottle-shape
alteration was used.

The current catalogue contains 15 specials. Two catalogue products do not
have an exact bottle match in the supplied collage (Russian Bear and Tant
Sannie Se Melktert), so they were intentionally NOT assigned an unrelated
bottle image.

The huge embedded base64 specials-images-data.js dependency has been removed.
catalog.js now uses the normal local image path from catalog-data.js.

Important:
Upload/replace the entire contents of this package in the GitHub repository,
including the specials-images folder. Do not upload only the HTML/JS files.

Extra extracted asset: specials-images/white-river.png (present in the supplied collage but not currently assigned to a special in catalog-data.js).
