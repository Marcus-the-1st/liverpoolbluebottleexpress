/* Liverpool Blue Bottle — V3.18 category preview / View All system */
(() => {
  const catalog = Array.isArray(window.LBB_CATALOG) ? window.LBB_CATALOG : [];
  const root = document.getElementById("catalogRoot");
  if (!root) return;

  const money = n => `R${Number(n || 0).toFixed(2)}`;

  // V3.21 — Specials are controlled by ONE page-level campaign, not by
  // individual product dates. This keeps the catalogue simple and lets an
  // entire specials batch expire together.
  const SA_OFFSET = "+02:00";
  const dateBoundary = (value, endOfDay = false) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return new Date(`${raw}T${endOfDay ? "23:59:59.999" : "00:00:00"}${SA_OFFSET}`);
    }
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const campaign = window.LBB_SPECIALS_CAMPAIGN || {};
  const campaignStart = dateBoundary(campaign.campaignStart, false);
  const campaignEnd = dateBoundary(campaign.campaignEnd, true);
  const campaignActive = Boolean(campaign.enabled) &&
    Boolean(campaignStart) && Boolean(campaignEnd) &&
    new Date() >= campaignStart && new Date() <= campaignEnd;

  const activeSpecial = p => {
    const price = Number(p.specialPrice);
    if (!campaignActive || !Number.isFinite(price) || price <= 0 || price >= Number(p.normalPrice)) return false;
    return true;
  };

  const campaignLabel = () => {
    if (!campaignActive) return "";
    const start = campaignStart.toLocaleDateString("en-ZA", {day:"numeric", month:"long", timeZone:"Africa/Johannesburg"});
    const end = campaignEnd.toLocaleDateString("en-ZA", {day:"numeric", month:"long", timeZone:"Africa/Johannesburg"});
    return `Current specials: ${start} – ${end}`;
  };

  const esc = v => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
  const mode = document.body.dataset.page || "shop";
  const params = new URLSearchParams(window.location.search);
  const selectedCategoryId = params.get("category");
  const categoryPage = mode === "category";
  const categorySpecials = params.get("specials") === "1";
  const baseItems = (mode === "specials" || (categoryPage && categorySpecials)) ? catalog.filter(activeSpecial) : catalog;
  const selectedCategory = selectedCategoryId ? catalog.find(p => p.categoryId === selectedCategoryId) : null;
  const items = selectedCategory ? baseItems.filter(p => p.categoryId === selectedCategoryId) : baseItems;

  const categories = [];
  items.forEach(p => {
    if (!categories.some(c => c.id === p.categoryId)) categories.push({id:p.categoryId,name:p.category,emoji:p.emoji});
  });

  root.innerHTML = `
    ${selectedCategory ? `<div class="category-return"><a class="category-return-link" href="${categoryPage ? "shop.html" : (mode === "specials" ? "specials.html" : "shop.html")}#shop">← Back to ${categoryPage ? "Shop" : (mode === "specials" ? "Specials" : "Shop")}</a></div>` : `
    <div class="category-nav" id="categoryNav">
      <div class="category-strip" id="categories" aria-label="Product categories">
        ${categories.map(c => `<a href="#${esc(c.id)}">${esc(c.name)}</a>`).join("")}
      </div>
    </div>`}
    ${categories.map(c => {
      const categoryItems = items.filter(p => p.categoryId === c.id);
      const hasViewAll = !selectedCategory && categoryItems.length > 5;
      const previewItems = hasViewAll ? categoryItems.slice(0, 5) : categoryItems;
      return `
      <div class="category" id="${esc(c.id)}" data-category-id="${esc(c.id)}">
        <div class="category-title"><span aria-hidden="true">${esc(c.emoji)}</span><h3>${esc(c.name)}</h3>${hasViewAll ? `<a class="category-view-all" href="category.html?category=${encodeURIComponent(c.id)}${mode === "specials" ? "&specials=1" : ""}#shop" aria-label="View all ${esc(c.name)}">View All <span class="view-all-arrow" aria-hidden="true">→</span></a>` : ""}</div>
        <div class="product-grid" tabindex="0" role="region" aria-label="${esc(c.name)} products">
          ${previewItems.map(p => {
            const special = activeSpecial(p);
            const discount = special ? Math.round(((p.normalPrice - p.specialPrice) / p.normalPrice) * 100) : 0;
            const image = p.image ? `<img class="product-image" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="product-initial">${esc(p.initial)}</span>`;
            return `<article class="product-card" data-product-id="${esc(p.id)}" data-product-name="${esc(p.name)}" data-category="${esc(p.category)}" data-size="${esc(p.size)}" data-normal-price="${p.normalPrice.toFixed(2)}" data-special-price="${special ? p.specialPrice.toFixed(2) : ""}" data-special-start="${esc(p.specialStart || "")}" data-special-end="${esc(p.specialEnd || "")}">
              <div class="product-placeholder product-media">${image}</div>
              <div class="product-info">
                <h4>${esc(p.name)}</h4><p>${esc(p.size)}</p>
                <div class="product-price">
                  ${special ? `<span class="base-price struck">${money(p.normalPrice)}</span><strong class="current-price">${money(p.specialPrice)}</strong>` : `<strong class="current-price">${money(p.normalPrice)}</strong>`}
                </div>
                ${special ? `<div class="special-meta"><span class="special-badge">ON SPECIAL</span><span class="discount-badge">${discount}% OFF</span></div>` : ""}
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>
    `;
    }).join("")}
  `;

  const heading = root.closest(".catalog-section")?.querySelector(".section-heading h1");
  const subtitle = root.closest(".catalog-section")?.querySelector(".section-heading .specials-subtitle");
  if (selectedCategory && heading) heading.textContent = selectedCategory.category;
  if (selectedCategory && subtitle) subtitle.textContent = categorySpecials ? `Browse current ${selectedCategory.category} specials.` : `Browse the full ${selectedCategory.category} collection.`;

  if (mode === "specials") {
    if (subtitle) subtitle.textContent = campaignActive ? campaignLabel() : "No active specials campaign right now.";
    const empty = document.getElementById("noSpecials");
    if (empty) empty.hidden = items.length !== 0;
    if (!items.length) root.querySelectorAll(".category-nav, .category").forEach(el => el.remove());
  }

  // V3.18 — category previews show at most five products.
  // View All opens a clean category-filtered Shop view instead of expanding
  // a long list inside the main catalogue. Navigation and styling are original LBB UI.

  // V3.21 — Refresh around the campaign boundary so an offer cannot remain
  // visible after its page-level campaign expires.
  let scheduleTimer = null;
  if (campaignEnd) {
    const ms = campaignEnd.getTime() - Date.now() + 1000;
    if (ms > 0) scheduleTimer = setTimeout(() => window.location.reload(), Math.min(ms, 2147483647));
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) window.location.reload();
  });
})();
