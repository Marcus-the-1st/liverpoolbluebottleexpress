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
  const $ = (id) => document.getElementById(id);
  const money = (n) => `R${Number(n || 0).toFixed(2)}`;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  const bottleSvg = (plus=false) => `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"/>${plus ? '<path class="plus" d="M12 11v6M9 14h6"/>' : ''}</svg>`;

  function readProducts() {
    return [...document.querySelectorAll(".product-card")].map((card, index) => {
      const normal = parseFloat(card.dataset.normalPrice || "0");
      const special = parseFloat(card.dataset.specialPrice || "");
      const now = new Date();
      let price = normal;
      if (Number.isFinite(special) && special > 0) {
        const start = card.dataset.specialStart ? new Date(card.dataset.specialStart) : null;
        const end = card.dataset.specialEnd ? new Date(card.dataset.specialEnd) : null;
        if ((!start || now >= start) && (!end || now <= end)) price = special;
      }
      return {
        id: card.dataset.productId || `${(card.dataset.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${index}`,
        name: card.dataset.productName || card.querySelector("h4")?.textContent.trim() || "Product",
        category: card.dataset.category || "",
        size: card.dataset.size || card.querySelector("p")?.textContent.trim() || "",
        normalPrice: normal,
        price,
        discount: Math.max(0, normal - price),
        card
      };
    });
  }

  let products = [];

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({savedAt: Date.now(), items:[...cart.values()].map(({product,...item})=>item)}));
    scheduleExpiry();
  }

  let expiryTimer = null;

  function scheduleExpiry() {
    if (expiryTimer) clearTimeout(expiryTimer);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const remaining = CART_TTL - (Date.now() - Number(saved.savedAt || 0));
      if (remaining <= 0) {
        localStorage.removeItem(STORAGE_KEY);
        cart.clear();
        return;
      }
      expiryTimer = setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY);
        cart.clear();
        renderCart();
      }, remaining);
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
      cart.clear();
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved.savedAt || Date.now() - saved.savedAt > CART_TTL) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      (saved.items || []).forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product && Number(item.qty) > 0) cart.set(product.id, {product, qty:Math.floor(item.qty)});
      });
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function totals() {
    let subtotal = 0, discount = 0, total = 0, count = 0;
    cart.forEach(({product, qty}) => {
      subtotal += product.normalPrice * qty;
      discount += product.discount * qty;
      total += product.price * qty;
      count += qty;
    });
    return {subtotal, discount, total, count};
  }

  function productControl(product) {
    const entry = cart.get(product.id);
    if (!entry) {
      return `<button class="add-to-cart-button" type="button" data-cart-add="${escapeHtml(product.id)}"><span class="bottle-plus-icon">${bottleSvg(true)}</span><span>Add to Cart</span></button>`;
    }
    return `<div class="quantity-stepper" aria-label="Quantity for ${escapeHtml(product.name)}"><button class="qty-button" type="button" data-cart-minus="${escapeHtml(product.id)}" aria-label="Decrease quantity">−</button><span class="qty-bottle">${bottleSvg(false)}</span><span class="qty-value">${entry.qty}</span><button class="qty-button" type="button" data-cart-plus="${escapeHtml(product.id)}" aria-label="Increase quantity">+</button></div>`;
  }

  function renderProductControls() {
    products.forEach(product => {
      const info = product.card.querySelector(".product-info");
      if (!info) return;
      let control = info.querySelector(".cart-product-control");
      if (!control) {
        control = document.createElement("div");
        control.className = "cart-product-control";
        info.appendChild(control);
      }
      control.innerHTML = productControl(product);
    });
  }

  function renderCart() {
    const items = $("cartItems");
    const empty = $("cartEmpty");
    const summary = $("cartSummary");
    const form = $("orderForm");
    const {subtotal, discount, total, count} = totals();

    $("cartCount").textContent = count;
    $("cartButton").classList.toggle("has-items", count > 0);

    if (!cart.size) {
      items.innerHTML = "";
      empty.hidden = false;
      summary.hidden = true;
      form.hidden = true;
    } else {
      empty.hidden = true;
      summary.hidden = false;
      form.hidden = false;
      items.innerHTML = [...cart.values()].map(({product,qty}) => `
        <div class="cart-line">
          <div class="cart-line-icon">${bottleSvg(false)}</div>
          <div class="cart-line-info"><h4>${escapeHtml(product.name)}</h4><p>${escapeHtml(product.size)}</p></div>
          <div><div class="cart-line-price">${money(product.price * qty)}</div>${product.discount > 0 ? `<div class="cart-line-discount">−${money(product.discount * qty)}</div>` : ""}</div>
          <div class="cart-line-controls">
            <div class="mini-stepper"><button type="button" data-cart-minus="${escapeHtml(product.id)}" aria-label="Decrease quantity">−</button><span>${qty}</span><button type="button" data-cart-plus="${escapeHtml(product.id)}" aria-label="Increase quantity">+</button></div>
            <button class="remove-line" type="button" data-cart-remove="${escapeHtml(product.id)}">Remove</button>
          </div>
        </div>`).join("");
      $("cartSubtotal").textContent = money(subtotal);
      $("cartDiscount").textContent = `–${money(discount)}`;
      $("cartTotal").textContent = money(total);
    }
    renderProductControls();
  }

  function changeQty(id, delta) {
    const entry = cart.get(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) cart.delete(id);
    saveCart();
    renderCart();
  }

  function add(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.get(id);
    cart.set(id, {product, qty:(existing?.qty || 0) + 1});
    saveCart();
    renderCart();
  }

  function openCart() {
    $("cartOverlay").hidden = false;
    requestAnimationFrame(() => $("cartOverlay").classList.add("open"));
    $("cartDrawer").classList.add("open");
    $("cartDrawer").setAttribute("aria-hidden","false");
    $("cartButton").setAttribute("aria-expanded","true");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    $("cartDrawer").classList.remove("open");
    $("cartDrawer").setAttribute("aria-hidden","true");
    $("cartButton").setAttribute("aria-expanded","false");
    document.body.classList.remove("cart-open");
    setTimeout(() => { $("cartOverlay").hidden = true; }, 280);
  }

  function makeTicket() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i=0;i<6;i++) code += chars[Math.floor(Math.random()*chars.length)];
    return `LBB-${code}`;
  }

  function dateText() {
    return new Intl.DateTimeFormat("en-ZA", {day:"2-digit", month:"2-digit", year:"numeric"}).format(new Date());
  }

  function buildWhatsAppMessage(ticket, customerName, phone) {
    const {subtotal, discount, total} = totals();
    const lines = [...cart.values()].map(({product,qty}) => `• ${product.name} ${product.size} × ${qty} = ${money(product.price * qty)}`);
    return [
      "🛒 NEW ORDER – Liverpool Blue Bottle Liquor Express",
      "",
      `Ticket: ${ticket}`,
      `Date: ${dateText()}`,
      "",
      "Items:",
      ...lines,
      "",
      `Subtotal: ${money(subtotal)}`,
      `Discount: –${money(discount)}`,
      `Total: ${money(total)}`,
      "",
      "IN-STORE COLLECTION ONLY",
      "Cash on collection – No delivery",
      "",
      `Customer name: ${customerName}`,
      `Phone: ${phone}`
    ].join("\n");
  }

  function showConfirmation(ticket, customerName, phone) {
    const {subtotal, discount, total} = totals();
    const rows = [...cart.values()].map(({product,qty}) => `<div class="confirm-row"><span>${escapeHtml(product.name)} × ${qty}</span><strong>${money(product.price * qty)}</strong></div>`).join("");
    $("confirmationSummary").innerHTML = rows + `<div class="confirm-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="confirm-row"><span>Discount</span><strong>–${money(discount)}</strong></div><div class="confirm-row confirm-total"><span>Total</span><strong>${money(total)}</strong></div><div class="confirm-row"><span>Customer</span><strong>${escapeHtml(customerName)}</strong></div><div class="confirm-row"><span>Phone</span><strong>${escapeHtml(phone)}</strong></div>`;
    $("ticketNumber").textContent = ticket;
    $("orderForm").hidden = true;
    $("cartSummary").hidden = true;
    $("cartItems").innerHTML = "";
    $("cartEmpty").hidden = true;
    $("orderConfirmation").hidden = false;
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-cart-add]");
    if (addButton) { add(addButton.dataset.cartAdd); return; }
    const plus = event.target.closest("[data-cart-plus]");
    if (plus) { changeQty(plus.dataset.cartPlus, 1); return; }
    const minus = event.target.closest("[data-cart-minus]");
    if (minus) { changeQty(minus.dataset.cartMinus, -1); return; }
    const remove = event.target.closest("[data-cart-remove]");
    if (remove) { cart.delete(remove.dataset.cartRemove); saveCart(); renderCart(); }
  });

  document.addEventListener("DOMContentLoaded", () => {
    products = readProducts();
    loadCart();
    scheduleExpiry();
    renderCart();

    $("cartButton")?.addEventListener("click", openCart);
    $("cartClose")?.addEventListener("click", closeCart);
    $("cartOverlay")?.addEventListener("click", closeCart);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

    $("orderForm")?.addEventListener("submit", event => {
      event.preventDefault();
      if (!cart.size) return;
      const name = $("customerName").value.trim();
      const phone = $("customerPhone").value.trim();
      if (!name || !phone) return;
      const ticket = makeTicket();
      const message = buildWhatsAppMessage(ticket, name, phone);
      showConfirmation(ticket, name, phone);
      saveCart();
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    $("newOrderButton")?.addEventListener("click", () => {
      cart.clear();
      localStorage.removeItem(STORAGE_KEY);
      $("orderConfirmation").hidden = true;
      $("customerName").value = "";
      $("customerPhone").value = "";
      renderCart();
    });
  });
})();
