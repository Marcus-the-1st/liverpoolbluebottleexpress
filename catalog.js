(() => {
  const root=document.getElementById("catalogRoot");

  // Images are now set directly in catalog-data.js (source of truth).
  // No runtime imageMap override needed.
  const catalog = Array.isArray(window.LBB_CATALOG) ? window.LBB_CATALOG : [];

  if(!root) return;
  const mode=document.body.dataset.page || "shop";
  if(mode!=="specials") {
    if (mode === "shop") normalizeShop(root);
    return;
  }

  function normalizeShop(root) {
    // Repair the static Shop DOM without changing product data, prices or
    // the existing cart/order engine. The master catalogue remains the
    // source of truth for product images and specials.
    const nav = root.querySelector("#categories");
    if (nav) {
      nav.querySelectorAll('a[href="#wine-5l"]').forEach(link => link.remove());
    }

    const moveOutOfNestedParent = (node) => {
      if (node && node.parentElement !== root) root.appendChild(node);
      return node;
    };

    const normalizeCategory = (id, label) => {
      let nodes = Array.from(root.querySelectorAll(`.category[data-category-id="${id}"]`));
      if (!nodes.length) return null;

      // If the first matching category is nested inside another category,
      // detach it first so a parent cleanup cannot accidentally delete it.
      let primary = nodes.find(node => node.parentElement === root) || nodes[0];
      primary = moveOutOfNestedParent(primary);

      // Re-query after moving the primary node and remove duplicate wrappers.
      nodes = Array.from(root.querySelectorAll(`.category[data-category-id="${id}"]`));
      nodes.filter(node => node !== primary).forEach(node => node.remove());

      const title = primary.querySelector(":scope > .category-title") || primary.querySelector(".category-title");
      const cards = Array.from(primary.querySelectorAll('.product-card[data-product-id]'))
        .filter(card => (card.dataset.category || "") === label);

      if (!title) return primary;

      const grid = document.createElement("div");
      grid.className = "product-grid";
      cards.forEach(card => grid.appendChild(card));

      primary.replaceChildren(title, grid);
      return primary;
    };

    // Fix Fortified first because the broken markup currently nests it inside
    // the Sparkling section. Detaching it first prevents cross-category loss.
    normalizeCategory("fortified-wine", "Fortified Wine");
    normalizeCategory("sparkling", "Champagne / Sparkling Wine");

    // Move the four 4th Street 5L cards into the single Wines section.
    const wine = root.querySelector('.category[data-category-id="wine"]');
    const oldWine5L = root.querySelector('.category[data-category-id="wine-5l"]');
    if (wine && oldWine5L) {
      const grid = wine.querySelector(":scope > .product-grid");
      if (grid) {
        Array.from(oldWine5L.querySelectorAll('.product-card[data-product-id]')).forEach(card => {
          card.dataset.category = "Wines";
          grid.appendChild(card);
        });
      }
      oldWine5L.remove();
    }

    // Keep one clean category order on Shop while leaving each category's
    // products and existing markup otherwise untouched.
    const order = [
      "wine", "whisky", "brandy", "rum", "vodka", "tequila", "gin",
      "liqueurs", "sparkling", "cognac", "six-packs", "ready-to-drink",
      "fortified-wine"
    ];
    order.forEach(id => {
      const category = root.querySelector(`:scope > .category[data-category-id="${id}"]`);
      if (category) root.appendChild(category);
    });
  }

  const c=window.LBB_SPECIALS_CAMPAIGN||{};
  const start=new Date(`${c.campaignStart}T00:00:00+02:00`);
  const end=new Date(`${c.campaignEnd}T23:59:59.999+02:00`);
  const active=Boolean(c.enabled)&&Date.now()>=start.getTime()&&Date.now()<=end.getTime();
  const esc=v=>String(v).replace(/[&<>\"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[x]));
  const money=n=>`R${Number(n).toFixed(2)}`;
  const items=active?catalog.filter(p=>Number(p.specialPrice)>0&&((p.specialOnly===true)||Number(p.specialPrice)<Number(p.normalPrice))):[];
  const groups=[];
  items.forEach(p=>{let g=groups.find(x=>x.id===p.categoryId);if(!g){g={id:p.categoryId,name:p.category,emoji:p.emoji,items:[]};groups.push(g)}g.items.push(p)});
  root.innerHTML=groups.map(g=>`<div class="category" id="${esc(g.id)}"><div class="category-title"><span aria-hidden="true">${esc(g.emoji)}</span><h3>${esc(g.name)}</h3></div><div class="product-grid specials-product-grid">${g.items.map(p=>{const d=Math.round((p.normalPrice-p.specialPrice)/p.normalPrice*100);const priceHtml=p.specialOnly?`<strong class="current-price">${money(p.specialPrice)}</strong>`:`<span class="base-price struck">${money(p.normalPrice)}</span><strong class="current-price">${money(p.specialPrice)}</strong>`;const metaHtml=p.specialOnly?`<span class="special-badge">ON SPECIAL</span>`:`<span class="special-badge">ON SPECIAL</span><span class="discount-badge">${d}% OFF</span>`;return `<article class="product-card" data-product-id="${esc(p.id)}" data-product-name="${esc(p.name)}" data-category="${esc(p.category)}" data-size="${esc(p.size)}" data-normal-price="${p.normalPrice.toFixed(2)}" data-special-price="${p.specialPrice.toFixed(2)}" data-special-only="${p.specialOnly===true?"true":"false"}"><div class="product-placeholder product-media"><img class="product-image" src="${esc(p.image||"special-product-image-pending.png")}" alt="${esc(p.name)}" loading="lazy"></div><div class="product-info"><h4>${esc(p.name)}</h4><p>${esc(p.size)}</p><div class="product-price">${priceHtml}</div><div class="special-meta">${metaHtml}</div><div class="cart-product-control"><button class="add-to-cart-button" type="button" data-cart-add="${esc(p.id)}"><span class="bottle-plus-icon"><svg viewBox="0 0 24 24"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"></path><path class="plus" d="M12 11v6M9 14h6"></path></svg></span><span>Add to Cart</span></button></div></div></article>`}).join("")}</div></div>`).join("");
  const empty=document.getElementById("noSpecials");
  if(empty) empty.hidden=items.length!==0;
  if(!active || !items.length) root.innerHTML="";
  if(active){const label=document.querySelector(".specials-subtitle");if(label)label.textContent=`Current specials: ${start.toLocaleDateString("en-ZA",{day:"numeric",month:"long",timeZone:"Africa/Johannesburg"})} – ${end.toLocaleDateString("en-ZA",{day:"numeric",month:"long",timeZone:"Africa/Johannesburg"})}`;}
  const ms=end.getTime()-Date.now()+1000;if(ms>0)setTimeout(()=>location.reload(),Math.min(ms,2147483647));
})();
