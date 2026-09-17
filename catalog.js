(() => {
  const root = document.getElementById("catalogRoot");
  if (!root) return;

  const rawCatalog = Array.isArray(window.LBB_CATALOG) ? window.LBB_CATALOG : [];
  const legacyWineIds = new Set([
    "4th-street-natural-sweet-red-5l",
    "4th-street-natural-sweet-ros-5l",
    "4th-street-natural-sweet-white-5l",
    "4th-street-sweet-late-harvest-5l"
  ]);
  const catalog = rawCatalog.map(p => {
    if (!p) return p;
    if (legacyWineIds.has(p.id)) return {...p, category: "Wines", categoryId: "wine"};
    if (p.id === "robertson-chapel-red-1-5l") return {...p, image: "robertson-chapel-red-1.5l.jpg"};
    if (p.id === "robertson-chapel-natural-sweet-red-1-5l") return {...p, image: "robertson-chapel-sweet-red-1.5l.jpg"};
    return p;
  });
  const mode = document.body.dataset.page || "shop";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, x => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[x]));
  const money = n => `R${Number(n || 0).toFixed(2)}`;

  // ---------- SPECIALS PAGE ----------
  if (mode === "specials") {
    const c = window.LBB_SPECIALS_CAMPAIGN || {};
    const start = new Date(`${c.campaignStart}T00:00:00+02:00`);
    const end = new Date(`${c.campaignEnd}T23:59:59.999+02:00`);
    const active = Boolean(c.enabled) && Date.now() >= start.getTime() && Date.now() <= end.getTime();
    const items = active
      ? catalog.filter(p => Number(p.specialPrice) > 0 &&
          (p.specialOnly === true || Number(p.specialPrice) < Number(p.normalPrice)))
      : [];
    const groups = [];
    items.forEach(p => {
      let g = groups.find(x => x.id === p.categoryId);
      if (!g) {
        g = { id: p.categoryId, name: p.category, emoji: p.emoji, items: [] };
        groups.push(g);
      }
      g.items.push(p);
    });
    root.innerHTML = groups.map(g => `
      <div class="category" id="${esc(g.id)}">
        <div class="category-title">
          <span aria-hidden="true">${esc(g.emoji)}</span>
          <h3>${esc(g.name)}</h3>
        </div>
        <div class="product-grid specials-product-grid">
          ${g.items.map(p => {
            const d = Math.round((p.normalPrice - p.specialPrice) / p.normalPrice * 100);
            const priceHtml = p.specialOnly
              ? `<strong class="current-price">${money(p.specialPrice)}</strong>`
              : `<span class="base-price struck">${money(p.normalPrice)}</span><strong class="current-price">${money(p.specialPrice)}</strong>`;
            const metaHtml = p.specialOnly
              ? `<span class="special-badge">ON SPECIAL</span>`
              : `<span class="special-badge">ON SPECIAL</span><span class="discount-badge">${d}% OFF</span>`;
            return `<article class="product-card"
              data-product-id="${esc(p.id)}"
              data-product-name="${esc(p.name)}"
              data-category="${esc(p.category)}"
              data-size="${esc(p.size)}"
              data-normal-price="${Number(p.normalPrice).toFixed(2)}"
              data-special-price="${Number(p.specialPrice).toFixed(2)}"
              data-special-only="${p.specialOnly === true ? "true" : "false"}">
              <div class="product-placeholder product-media">
                <img class="product-image" src="${esc(p.image || "special-product-image-pending.png")}" alt="${esc(p.name)}" loading="lazy">
              </div>
              <div class="product-info">
                <h4>${esc(p.name)}</h4>
                <p>${esc(p.size)}</p>
                <div class="product-price">${priceHtml}</div>
                <div class="special-meta">${metaHtml}</div>
                <div class="cart-product-control">
                  <button class="add-to-cart-button" type="button" data-cart-add="${esc(p.id)}">
                    <span class="bottle-plus-icon"><svg viewBox="0 0 24 24"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"></path><path class="plus" d="M12 11v6M9 14h6"></path></svg></span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>`).join("");
    const empty = document.getElementById("noSpecials");
    if (empty) empty.hidden = items.length !== 0;
    if (!active || !items.length) root.innerHTML = "";
    if (active) {
      const label = document.querySelector(".specials-subtitle");
      if (label) label.textContent = `Current specials: ${start.toLocaleDateString("en-ZA", { day: "numeric", month: "long", timeZone: "Africa/Johannesburg" })} – ${end.toLocaleDateString("en-ZA", { day: "numeric", month: "long", timeZone: "Africa/Johannesburg" })}`;
    }
    const ms = end.getTime() - Date.now() + 1000;
    if (ms > 0) setTimeout(() => location.reload(), Math.min(ms, 2147483647));
    return;
  }

  // ---------- SHOP PAGE (dynamic rebuild so we never have broken static HTML again) ----------
  if (mode === "shop" || !mode) {
    const order = [
      "wine", "whisky", "brandy", "rum", "vodka", "tequila", "gin",
      "liqueurs", "sparkling", "cognac", "six-packs", "fortified-wine",
      "ready-to-drink", "whiskey-liqueurs"
    ];

    const groupsMap = new Map();
    catalog.forEach(p => {
      if (!p || !p.categoryId) return;
      if (!groupsMap.has(p.categoryId)) {
        groupsMap.set(p.categoryId, {
          id: p.categoryId,
          name: p.category || p.categoryId,
          emoji: p.emoji || "🍷",
          items: []
        });
      }
      groupsMap.get(p.categoryId).items.push(p);
    });

    const groups = [];
    order.forEach(id => {
      if (groupsMap.has(id)) {
        groups.push(groupsMap.get(id));
        groupsMap.delete(id);
      }
    });
    groupsMap.forEach(g => groups.push(g));

    const navHtml = `
      <div class="category-nav" id="categoryNav">
        <div class="category-strip" id="categories">
          ${groups.map(g => `<a href="#${esc(g.id)}">${esc(g.name)}</a>`).join("")}
        </div>
      </div>`;

    const PREVIEW = 4;
    const sections = groups.map(g => {
      const preview = g.items.slice(0, PREVIEW);
      const hasMore = g.items.length > PREVIEW;
      const viewAll = hasMore
        ? `<a class="view-all-link" href="category.html?category=${esc(g.id)}">VIEW ALL →</a>`
        : "";

      return `
        <div class="category" data-category-id="${esc(g.id)}" id="${esc(g.id)}">
          <div class="category-title">
            <span aria-hidden="true">${esc(g.emoji)}</span>
            <h3>${esc(g.name)}</h3>
            ${viewAll}
          </div>
          <div class="product-grid">
            ${preview.map(p => `
              <article class="product-card"
                data-product-id="${esc(p.id)}"
                data-product-name="${esc(p.name)}"
                data-category="${esc(p.category)}"
                data-size="${esc(p.size)}"
                data-normal-price="${Number(p.normalPrice || 0).toFixed(2)}"
                data-special-price="${p.specialPrice == null ? "" : Number(p.specialPrice).toFixed(2)}"
                data-special-only="${p.specialOnly === true ? "true" : "false"}"
                data-price-tbc="${p.priceTbc === true ? "true" : "false"}">
                <div class="product-placeholder product-media">
                  ${p.image
                    ? `<img class="product-image" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
                    : `<span class="product-initial">${esc(p.initial || "")}</span>`}
                </div>
                <div class="product-info">
                  <h4>${esc(p.name)}</h4>
                  <p>${esc(p.size)}</p>
                  <div class="product-price">
                    <strong class="current-price">${p.priceTbc ? "Price in store" : money(p.normalPrice)}</strong>
                  </div>
                  <div class="special-meta is-empty" aria-hidden="true"></div>
                  <div class="cart-product-control">
                    <button class="add-to-cart-button" type="button" data-cart-add="${esc(p.id)}">
                      <span class="bottle-plus-icon"><svg viewBox="0 0 24 24"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"></path><path class="plus" d="M12 11v6M9 14h6"></path></svg></span>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>
        </div>`;
    }).join("");

    root.innerHTML = navHtml + sections;

    if (typeof window.syncProductImages === "function") {
      window.syncProductImages();
    }
    document.dispatchEvent(new Event("catalog-rebuilt"));
  }
})();
