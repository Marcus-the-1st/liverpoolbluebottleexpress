# Liverpool Blue Bottle Liquor Express — Website Master Rules

> **Permanent project operating rules.**
>
> The current GitHub `main` branch is the source of truth. These rules document the working system established for this website and must be followed for future changes.

## 1. Core principle

**You ask → I change exactly that → I leave everything else alone.**

Every requested change must be limited to the requested scope. Do not make unrelated improvements, refactors, clean-ups, redesigns, product removals, catalogue restructuring, CSS changes, or other changes unless specifically requested.

## 2. Source of truth / version control

- Repository: `Marcus-the-1st/liverpoolbluebottleexpress`
- Branch: `main`
- GitHub Pages is the live hosting method.
- Work from the **current `main` state**.
- **Never roll back** the website to an older commit, old ZIP, or historical version unless explicitly instructed.
- Never treat an old downloaded ZIP as the current website source of truth.
- Before making a change, verify the current repository state when repository access is available.
- Preserve all existing working functionality.

## 3. Product/catalogue rules

- `catalog-data.js` is the catalogue source of truth.
- The cart uses `window.LBB_CATALOG`.
- Do not create duplicate catalogue sources or hardcoded product copies.
- When the user provides a list of products, normally **ADD or UPDATE** those products; do not replace the existing catalogue.
- **Never remove a product unless the user explicitly asks for its removal.**
- Never invent products, product variants, prices, sizes, packaging, names, IDs, categories, or other product details.
- Match product names, IDs, sizes, categories, and image filenames against the **current** catalogue rather than guessing from an old list.
- Do not change prices, IDs, categories, special dates, or other catalogue data when the task is only image preparation.
- Existing special/campaign data must remain unchanged unless specifically requested.

## 4. Current category architecture

- Six-pack Cans: categoryId `six-packs`
- Six-Packs of NRB: categoryId `six-pack-nrb`
- Keep these categories separate.
- Do not move a product between them unless explicitly requested.
- Wine architecture/categories must be preserved; do not introduce obsolete `wine-5l` architecture.

## 5. Image preparation — permanent standard

Every new website product image must follow this standard unless the user explicitly requests otherwise:

- **800 × 1000 PNG**
- **Pure black background: #000000**
- Product approximately **68–72% of canvas height (680–720 px)**
- Target standard is approximately **700 px product height**
- Bottom of the actual product, excluding any reflection, approximately **10–14% from the bottom** (roughly 100–140 px clearance)
- Product horizontally centred
- Natural proportions
- Never stretch, squash, distort, or artificially widen/narrow a product
- Entire product and label must remain visible
- No cropping of the product
- Preserve the supplied product artwork faithfully
- A soft reflection is allowed only when it does not interfere with the height/baseline standard
- Use the exact kebab-case filename already used in the current catalogue, or the exact filename explicitly agreed for the new product

### Important scale rule

The goal is **consistent visual sizing**, not forcing every physically different product into identical width.

Different bottles, cans, cartons, and packs have different natural geometry. Scale proportionally and allow their natural widths to differ.

## 6. Image workflow — do not mix stages

### Stage 1 — Image preparation
- Prepare only the images the user supplies or specifically flags.
- Do not touch GitHub, `catalog-data.js`, HTML, CSS, cart logic, prices, or unrelated products during image preparation.
- Match supplied images to current catalogue products before naming the finished files.

### Stage 2 — Deliver
- Deliver the finished PNGs, normally as a ZIP when there are multiple images.
- Do not upload them to GitHub on the user's behalf unless explicitly requested and supported.
- Do not make catalogue changes at this stage.

### Stage 3 — User uploads
The user uploads the finished files to GitHub and confirms:

**“Uploaded – files are on main.”**

### Stage 4 — Catalogue verification
- Verify the uploaded files exist on current `main`.
- Check the relevant entries in `catalog-data.js`.
- Fix only incorrect image paths if necessary.
- Do not change prices, product IDs, categories, CSS, HTML, cart behaviour, or other unrelated content.
- Show the exact change/diff when a catalogue path must be changed.
- If paths are already correct, make no catalogue commit.

## 7. Absolute image bans

- **Never re-edit or re-process an image after the user has uploaded the finished website version.**
- Never use CSS height hacks to compensate for incorrectly prepared images.
- Never use product-specific `transform: scale()` rules to fix image sizing.
- Never force all products to have identical physical scale when their real shapes differ.
- Never change `style-base.css` or `product-card-fix.css` as an image workaround unless the user explicitly asks for a CSS change.
- Never invent or substitute a product image for a supplied product.
- Never silently replace an uploaded image with an AI-generated or generic product image.

## 8. Website/CSS protection

- Preserve the existing card layout and responsive behaviour.
- Do not introduce product-specific CSS scaling as a shortcut.
- Do not modify CSS merely because a newly supplied image was incorrectly prepared; fix the image asset itself according to the permanent image standard.
- If a genuine structural CSS problem is reported, isolate it and change only the necessary CSS.

## 9. Filename and product matching

Before preparing an image:

1. Check the current `catalog-data.js`.
2. Identify the exact product entry.
3. Confirm its current ID, category, size, and image filename.
4. Use that exact filename where appropriate.
5. Pay particular attention to product variants and sizes.

**Example:** If the supplied Savanna image is the **330ml** product, it must be matched to the current **Savanna Dry 330ml** catalogue entry and not to another Savanna size.

Never infer a filename solely from the uploaded file's human-readable name when the current catalogue provides a definitive filename.

## 10. Cart and ordering protection

- Preserve the existing cart system unless the user explicitly requests a cart change.
- Do not create a second product data source for cart calculations.
- Cart behaviour, localStorage, expiry, totals, order tickets, WhatsApp preparation, customer fields, and collection workflow must remain intact unless specifically requested.

## 11. Special prices and campaigns

- Base/normal prices remain the product foundation.
- Special pricing must use the existing catalogue structure.
- Do not invent special dates or overwrite existing campaign dates unless explicitly requested.
- Do not alter special pricing while performing an unrelated image task.

## 12. Troubleshooting rule

When something looks wrong:

1. Identify the actual root cause.
2. Do not immediately add a workaround.
3. Prefer correcting the underlying asset/data that is wrong.
4. Do not damage working parts to fix an isolated problem.
5. Verify the current repository before changing anything.
6. If evidence is insufficient, ask rather than guess.

## 13. Verification rule

After a change:

- Verify only the requested change and the files directly affected.
- Confirm unrelated files were not changed.
- Do not claim live visual/browser verification unless it was actually performed.
- If GitHub Pages/browser verification is unavailable, state that accurately.
- Never pretend that a visual result was checked when it was not.

## 14. No rollback / no accidental cleanup

Do not:
- restore an old website version,
- replace current files with an old ZIP,
- remove products because they are not in a newly supplied list,
- remove images because they are not part of the current task,
- rename products without instruction,
- “clean up” unrelated catalogue entries,
- change working CSS because a new asset needs preparation.

## 15. Current known website facts

- GitHub Pages is the hosting method.
- The current website uses `window.LBB_CATALOG`.
- `catalog-data.js` is the catalogue source of truth.
- Six-pack Cans and Six-Packs of NRB are separate categories.
- Product images use the permanent 800×1000 black-background standard described above.
- The website's current working card layout must be preserved.
- Existing products and uploaded images are considered protected unless the user explicitly asks for a change.

## 16. Decision rule when instructions conflict

Use this order:

1. The user's explicit current request.
2. These permanent project master rules.
3. The current GitHub `main` state.
4. Existing working website behaviour.
5. Ask before making an assumption when the conflict cannot be safely resolved.

## 17. Final master rule

**Protect the working website. Make the requested change. Do not make unrelated changes.**

If a task can be completed without touching another file, product, image, catalogue entry, CSS rule, or feature, leave it untouched.
