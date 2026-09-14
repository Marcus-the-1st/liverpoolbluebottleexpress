/* Liverpool Blue Bottle Liquor Express — V3 */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const backTop = document.getElementById("backTop");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const updateScrollUI = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
    if (backTop) backTop.style.display = window.scrollY > 500 ? "grid" : "none";
  };
  window.addEventListener("scroll", updateScrollUI, {passive:true});
  updateScrollUI();

  const closeMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = !mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("click", e => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
    });
  }

  if (backTop) {
    backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.08});

  document.querySelectorAll(".category, .visit-card, .section-heading").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});


/* ================================================================
   V3.37 — CATALOGUE-WIDE IMAGE + SPECIAL BADGE SYNC
   The master catalogue is the source of truth for product images,
   special pricing and special badges on the normal Shop/category
   pages as well as the dedicated Current Specials page.
   ================================================================ */
(() => {
  const money = n => `R${Number(n || 0).toFixed(2)}`;
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const dateBoundary = (value, endOfDay = false) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return new Date(`${raw}T${endOfDay ? "23:59:59.999" : "00:00:00"}+02:00`);
    }
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const campaignActive = () => {
    const c = window.LBB_SPECIALS_CAMPAIGN || {};
    const start = dateBoundary(c.campaignStart, false);
    const end = dateBoundary(c.campaignEnd, true);
    return Boolean(c.enabled && start && end && Date.now() >= start.getTime() && Date.now() <= end.getTime());
  };
  const isSpecial = product => {
    if (!campaignActive()) return false;
    const special = Number(product.specialPrice);
    const normal = Number(product.normalPrice);
    if (!Number.isFinite(special) || special <= 0) return false;
    return product.specialOnly === true || special < normal;
  };
  const apply = () => {
    const catalog = Array.isArray(window.LBB_CATALOG) ? window.LBB_CATALOG : [];
    if (!catalog.length) return;
    const byId = new Map(catalog.filter(Boolean).map(p => [p.id, p]));

    document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
      const product = byId.get(card.dataset.productId);
      if (!product) return;

      const special = isSpecial(product);
      const normal = Number(product.normalPrice || 0);
      const specialPrice = Number(product.specialPrice);
      const activePrice = special ? specialPrice : normal;

      card.dataset.normalPrice = normal.toFixed(2);
      card.dataset.specialPrice = Number.isFinite(specialPrice) && specialPrice > 0 ? specialPrice.toFixed(2) : '';
      card.dataset.specialOnly = product.specialOnly === true ? 'true' : 'false';

      // Use the same local product image everywhere it exists.
      const media = card.querySelector('.product-media');
      if (media && product.image) {
        const current = media.querySelector('img.product-image');
        if (!current || current.getAttribute('src') !== product.image) {
          media.innerHTML = `<img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
        }
        media.classList.remove('product-placeholder');
      }

      // Normal Shop/category cards also advertise a live special.
      const price = card.querySelector('.product-price');
      if (price && document.body.dataset.page !== 'specials') {
        if (product.priceTbc) {
          price.innerHTML = `<strong class="current-price price-tbc">Price in store</strong>`;
        } else if (special && specialPrice < normal) {
          price.innerHTML = `<span class="base-price struck">${money(normal)}</span><strong class="current-price">${money(specialPrice)}</strong>`;
        } else {
          price.innerHTML = `<strong class="current-price">${money(activePrice)}</strong>`;
        }
      }

      if (document.body.dataset.page !== 'specials') {
        let meta = card.querySelector('.special-meta');
        if (!meta) {
          meta = document.createElement('div');
          meta.className = 'special-meta is-empty';
          const info = card.querySelector('.product-info');
          const control = info?.querySelector('.cart-product-control');
          if (control) info.insertBefore(meta, control); else info?.appendChild(meta);
        }

        if (special) {
          const discount = specialPrice < normal ? Math.round((normal - specialPrice) / normal * 100) : 0;
          meta.innerHTML = `<span class="special-badge">ON SPECIAL</span>${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}`;
          meta.hidden = false;
          meta.classList.remove('is-empty');
          meta.removeAttribute('aria-hidden');
        } else {
          // Always reserve the same badge row on non-special cards.
          meta.innerHTML = '';
          meta.hidden = false;
          meta.classList.add('is-empty');
          meta.setAttribute('aria-hidden', 'true');
        }
      }
    });
  };

  document.addEventListener('DOMContentLoaded', apply);
})();


/* V3.1 carousel accessibility: native touch scrolling remains primary. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-grid").forEach((row) => {
    row.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();

      const amount = Math.max(220, row.clientWidth * 0.8);

      row.scrollBy({
        left: event.key === "ArrowRight" ? amount : -amount,
        behavior: "smooth"
      });
    });
  });
});


/* ================================================================
   V3.9 — SHOPPING CART / WHATSAPP ORDER ENGINE
   Product editing remains simple: change each product card's
   data-product-name, data-size, data-normal-price and optional
   data-special-price / data-special-start / data-special-end.
   ================================================================ */
(() => {
  const STORAGE_KEY = "lbb_cart_v39";
  const CART_TTL = 24 * 60 * 60 * 1000;
  const WHATSAPP_NUMBER = "27692900442";

  const cart = new Map();
  let cartScrollY = 0;
  const $ = (id) => document.getElementById(id);
  const money = (n) => `R${Number(n || 0).toFixed(2)}`;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  const bottleSvg = (plus=false) => `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"/>${plus ? '<path class="plus" d="M12 11v6M9 14h6"/>' : ''}</svg>`;

  // V3.21 — Cart pricing follows the same PAGE-LEVEL specials campaign as
  // the catalogue. Individual products do not need their own date fields.
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

  const getCampaignActive = () => {
    const c = window.LBB_SPECIALS_CAMPAIGN || {};
    const start = dateBoundary(c.campaignStart, false);
    const end = dateBoundary(c.campaignEnd, true);
    const now = new Date();
    return Boolean(c.enabled && start && end && now >= start && now <= end);
  };

  const getActivePrice = (normalPrice, specialPrice, specialOnly = false) => {
    const normal = Number(normalPrice || 0);
    const special = Number(specialPrice);
    if (!getCampaignActive() || !Number.isFinite(special) || special <= 0) return normal;
    if (specialOnly === true) return special;
    return special < normal ? special : normal;
  };

  const getCartPrice = (item) => getActivePrice(item.normalPrice, item.specialPrice, item.specialOnly);

  const getCartLine = (item) => ({
    ...item,
    activePrice: getCartPrice(item)
  });

  const saveCart = () => {
    const payload = {
      savedAt: Date.now(),
      items: Array.from(cart.values())
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch(e) {}
  };

  const loadCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items) || Date.now() - Number(data.savedAt || 0) > CART_TTL) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      data.items.forEach(item => {
        if (!item?.id) return;
        cart.set(item.id, item);
      });
    } catch(e) {}
  };

  const totalItems = () => Array.from(cart.values()).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const totals = () => {
    let subtotal = 0;
    let total = 0;
    cart.forEach(item => {
      const qty = Number(item.quantity || 0);
      const normal = Number(item.normalPrice || 0);
      const active = getCartPrice(item);
      subtotal += normal * qty;
      total += active * qty;
    });
    return { subtotal, discount: Math.max(0, subtotal - total), total };
  };

  const syncCartCount = () => {
    const count = totalItems();
    const el = $("cartCount");
    if (el) el.textContent = String(count);
    const badge = $("cartBottleBadge");
    if (badge) badge.hidden = count === 0;
  };

  const renderCart = () => {
    const itemsEl = $("cartItems");
    const emptyEl = $("cartEmpty");
    const summaryEl = $("cartSummary");
    const formEl = $("orderForm");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";
    cart.forEach(item => {
      const line = getCartLine(item);
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `<div class="cart-item-main"><strong>${escapeHtml(line.name)}</strong><span>${escapeHtml(line.size || "")}</span></div><div class="cart-item-side"><strong>${money(line.activePrice)}</strong><div class="cart-qty"><button type="button" data-cart-dec="${escapeHtml(line.id)}">−</button><span>${line.quantity}</span><button type="button" data-cart-inc="${escapeHtml(line.id)}">+</button></div></div>`;
      itemsEl.appendChild(row);
    });

    const hasItems = cart.size > 0;
    if (emptyEl) emptyEl.hidden = hasItems;
    if (summaryEl) summaryEl.hidden = !hasItems;
    if (formEl) formEl.hidden = !hasItems;

    const t = totals();
    const subtotalEl = $("cartSubtotal");
    const discountEl = $("cartDiscount");
    const totalEl = $("cartTotal");
    if (subtotalEl) subtotalEl.textContent = money(t.subtotal);
    if (discountEl) discountEl.textContent = `–${money(t.discount)}`;
    if (totalEl) totalEl.textContent = money(t.total);
    const clear = $("clearCartButton");
    if (clear) clear.hidden = !hasItems;
  };

  const openCart = () => {
    const drawer = $("cartDrawer");
    const overlay = $("cartOverlay");
    const button = $("cartButton");
    if (!drawer) return;
    cartScrollY = window.scrollY;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    if (button) button.setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open");
  };

  const closeCart = () => {
    const drawer = $("cartDrawer");
    const overlay = $("cartOverlay");
    const button = $("cartButton");
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    window.scrollTo({top:cartScrollY, behavior:"instant"});
  };

  const add = (productId) => {
    const card = document.querySelector(`.product-card[data-product-id="${CSS.escape(productId)}"]`);
    if (!card) return;
    const existing = cart.get(productId);
    const product = {
      id: productId,
      name: card.dataset.productName || "Product",
      size: card.dataset.size || "",
      normalPrice: Number(card.dataset.normalPrice || 0),
      specialPrice: Number(card.dataset.specialPrice || 0),
      specialOnly: card.dataset.specialOnly === "true",
      quantity: existing ? Number(existing.quantity || 0) + 1 : 1
    };
    cart.set(productId, product);
    saveCart();
    syncCartCount();
    renderCart();
  };

  const changeQty = (id, delta) => {
    const item = cart.get(id);
    if (!item) return;
    item.quantity = Math.max(0, Number(item.quantity || 0) + delta);
    if (item.quantity === 0) cart.delete(id);
    saveCart();
    syncCartCount();
    renderCart();
  };

  document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-cart-add]");
    if (addButton) add(addButton.dataset.cartAdd);

    const inc = event.target.closest("[data-cart-inc]");
    if (inc) changeQty(inc.dataset.cartInc, 1);

    const dec = event.target.closest("[data-cart-dec]");
    if (dec) changeQty(dec.dataset.cartDec, -1);

    if (event.target.closest("#cartButton")) openCart();
    if (event.target.closest("#cartClose") || event.target.closest("#cartOverlay")) closeCart();

    if (event.target.closest("#clearCartButton")) {
      cart.clear();
      saveCart();
      syncCartCount();
      renderCart();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    syncCartCount();
    renderCart();
  });
})();
