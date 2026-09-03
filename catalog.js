(() => {
  const root=document.getElementById("catalogRoot");
  if(!root) return;
  const mode=document.body.dataset.page || "shop";
  if(mode!=="specials") return;
  const catalog=Array.isArray(window.LBB_CATALOG)?window.LBB_CATALOG:[];
  const c=window.LBB_SPECIALS_CAMPAIGN||{};
  const start=new Date(`${c.campaignStart}T00:00:00+02:00`);
  const end=new Date(`${c.campaignEnd}T23:59:59.999+02:00`);
  const active=Boolean(c.enabled)&&Date.now()>=start.getTime()&&Date.now()<=end.getTime();
  const esc=v=>String(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[x]));
  const money=n=>`R${Number(n).toFixed(2)}`;
  const imageSrc=p=>window.LBB_SPECIAL_IMAGE_DATA?.[p]||p;
  const items=active?catalog.filter(p=>Number(p.specialPrice)>0&&Number(p.specialPrice)<Number(p.normalPrice)):[];
  const groups=[];
  items.forEach(p=>{let g=groups.find(x=>x.id===p.categoryId);if(!g){g={id:p.categoryId,name:p.category,emoji:p.emoji,items:[]};groups.push(g)}g.items.push(p)});
  root.innerHTML=groups.map(g=>`<div class="category" id="${esc(g.id)}"><div class="category-title"><span aria-hidden="true">${esc(g.emoji)}</span><h3>${esc(g.name)}</h3></div><div class="product-grid specials-product-grid">${g.items.map(p=>{const d=Math.round((p.normalPrice-p.specialPrice)/p.normalPrice*100);return `<article class="product-card" data-product-id="${esc(p.id)}" data-product-name="${esc(p.name)}" data-category="${esc(p.category)}" data-size="${esc(p.size)}" data-normal-price="${p.normalPrice.toFixed(2)}" data-special-price="${p.specialPrice.toFixed(2)}"><div class="product-placeholder product-media"><img class="product-image" src="${esc(imageSrc(p.image))}" alt="${esc(p.name)}" loading="lazy"></div><div class="product-info"><h4>${esc(p.name)}</h4><p>${esc(p.size)}</p><div class="product-price"><span class="base-price struck">${money(p.normalPrice)}</span><strong class="current-price">${money(p.specialPrice)}</strong></div><div class="special-meta"><span class="special-badge">ON SPECIAL</span><span class="discount-badge">${d}% OFF</span></div><div class="cart-product-control"><button class="add-to-cart-button" type="button" data-cart-add="${esc(p.id)}"><span class="bottle-plus-icon"><svg viewBox="0 0 24 24"><path class="bottle" d="M9 3h6v4l1 2v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V3Z"></path><path class="plus" d="M12 11v6M9 14h6"></path></svg></span><span>Add to Cart</span></button></div></div></article>`}).join("")}</div></div>`).join("");
  const empty=document.getElementById("noSpecials");
  if(empty) empty.hidden=items.length!==0;
  if(!active || !items.length) root.innerHTML="";
  if(active){const label=document.querySelector(".specials-subtitle");if(label)label.textContent=`Current specials: ${start.toLocaleDateString("en-ZA",{day:"numeric",month:"long",timeZone:"Africa/Johannesburg"})} – ${end.toLocaleDateString("en-ZA",{day:"numeric",month:"long",timeZone:"Africa/Johannesburg"})}`;}
  const ms=end.getTime()-Date.now()+1000;if(ms>0)setTimeout(()=>location.reload(),Math.min(ms,2147483647));
})();