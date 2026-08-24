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
