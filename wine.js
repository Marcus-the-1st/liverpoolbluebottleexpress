(() => {
  const root = document.getElementById("catalogRoot");
  if (!root) return;

  const catalog = Array.isArray(window.LBB_CATALOG) ? window.LBB_CATALOG : [];
  const wineCategoryIds = ["wine-5l", "sparkling", "fortified-wine"];
  const items = catalog.filter(p => wineCategoryIds.includes(p.categoryId));

  const esc = v => String(v).replace(/[&<>"']/g, x => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[x]));
  const money = n => `R${Number(n).toFixed(2)}`;

  const cardPrice = p => p.priceTbc
    ? `<strong class="current-price price-tbc">Price in store</strong>`
    : `<strong class="current-price">${money(p.normalPrice)}</strong>`;

  const groups = [];
  items.forEach(p => {
    let g = groups.find(x => x.id === p.categoryId);
    if (!g) {
      g = { id:p.categoryId, name:p.category, emoji:p.emoji, items:[] };
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
      <div class="product-grid">
        ${g.items.map(p => `
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
              <div class="product-price">${cardPrice(p)}</div>
              <div class="special-meta is-empty" aria-hidden="true"></div>
              <div class="cart-product-control"></div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `).join("");
})();
