
(() => {
  // ------- Utilities -------
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const fmt = (n) => `€${n.toFixed(2)}`;

  // Generate a tiny inline SVG "dish art" (no external images)
  function dishSVG(kind, hueA = 25, hueB = 10) {
    // Kind influences shapes; hues tint the gradients for variety
    const shapes =
      kind === ..
    : kind === 'Desserts' ? ..
    : kind === 'Starters' ? ..
    : /* Mains */  

    const svg 
  
    width="104" height="88" role="img" aria-label="${kind} illustration">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stop-color="hsl(${hueA} 90% 65%)"/>
          <stop offset="1" stop-color="hsl(${hueB} 90% 55%)"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="rgba(255,255,255,.7)"/>
          <stop offset="1" stop-color="rgba(255,255,255,.1)"/>
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="88" height="68" rx="14" ry="14" fill="rgba(255,255,255,.07)" />
      ${shapes}
      <circle cx="90" cy="18" r="4" fill="white" opacity=".65"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // ------- Data (handcrafted; prices in EUR) -------
  const MENU = [
    {  },
  ].map(item => ({
    ...item,
    img: dishSVG(item.category, Math.floor(Math.random()*60)+10, Math.floor(Math.random()*40)+5)
  }));

  // ------- State -------
  const state = {
    category: 'All',
    search: '',
    filters: new Set(), // vegan, vegetarian, gluten-free, spicy
    sort: 'popular',
    cart: new Map(), // id -> {item, qty}
  };

  // ------- DOM references -------
  const grid = $('#menuGrid');
  const search = $('#search');
  const chips = $$('.chip');
  const fVegan = $('#fVegan');
  const fVeg = $('#fVeg');
  const fGF = $('#fGF');
  const fSpicy = $('#fSpicy');
  const sortSel = $('#sort');

  const cartPanel = $('#cartPanel');
  const toggleCartBtn = $('#toggleCart');
  const cartCount = $('#cartCount');
  const cartItems = $('#cartItems');
  const cartSubtotal = $('#cartSubtotal');
  const cartTax = $('#cartTax');
  const cartTotal = $('#cartTotal');
  const clearCartBtn = $('#clearCart');
  const checkoutBtn = $('#checkout');
  const printBtn = $('#print');
  const live = $('#live');

  // ------- Render helpers -------
  function applyFilters(items) {
    let out = items.slice();

    // category
    if (state.category !== 'All') {
      out = out.filter(i => i.category === state.category);
    }

    // search
    if (state.search.trim() !== '') {
      const q = state.search.toLowerCase();
      out = out.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.tags.some(t => t.includes(q))
      );
    }

    // dietary (AND of selected tags)
    const tags = Array.from(state.filters);
    if (tags.length) {
      out = out.filter(i => tags.every(t => i.tags.includes(t)));
    }

    // sort
    switch (state.sort) {
      case 'price-asc': out.sort((a,b)=> a.price - b.price); break;
      case 'price-desc': out.sort((a,b)=> b.price - a.price); break;
      case 'az': out.sort((a,b)=> a.name.localeCompare(b.name)); break;
      default: out.sort((a,b)=> b.popularity - a.popularity);
    }

    return out;
  }

  function card(item) {
    const li = document.createElement('article');
    li.className = 'card';
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <div class="thumb" aria-hidden="true">
        <span class="badge-price">${fmt(item.price)}</span>
        <img src="${item.img}" alt="${item.category} icon" loading="lazy">
      </div>
      <div class="content">
        <div class="title">${item.name}</div>
        <div class="desc">${item.desc}</div>
        <div class="tags">${item.tags.map(t => 
            `<span class="tag">${labelize(t)}</span>`).join('')}</div>
      </div>
      <div class="card-footer">
        <span class="tag">${item.category}</span>
        <button class="btn primary add" 
        data-id="${item.id}" aria-label="Add ${item.name} to cart">Add to cart</button>
      </div>
    `;
    return li;
  }

  function labelize(tag) {
    switch (tag) {
      case 'vegan': return 'Vegan';
      case 'vegetarian': return 'Vegetarian';
      case 'gluten-free': return 'Gluten-free';
      case 'spicy': return 'Spicy';
      default: return tag;
    }
  }

  function renderGrid() {
    grid.innerHTML = '';
    const items = applyFilters(MENU);
    if (!items.length) {
      grid.innerHTML = 
      `<div class="desc" style="opacity:.9">No items match your filters.</div>`;
      return;
    }
    for (const it of items) grid.appendChild(card(it));
    // bind add buttons
    $$('.add', grid).forEach(btn => btn.addEventListener('click', onAdd));
  }

  // ------- Cart -------
  function onAdd(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const item = MENU.find(i => i.id === id);
    const cur = state.cart.get(id);
    state.cart.set(id, { item, qty: (cur?.qty || 0) + 1 });
    announce(`${item.name} added to cart`);
    renderCart();
  }

  function changeQty(id, delta) {
    const entry = state.cart.get(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) state.cart.delete(id);
    renderCart();
  }

  function renderCart() {
    // items
    cartItems.innerHTML = '';
    let subtotal = 0;
    for (const [id, { item, qty }] of state.cart) {
      subtotal += item.price * qty;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        
      `;
      cartItems.appendChild(li);
    }
    const tax = subtotal * 0.07;
    const total = subtotal + tax;

    cartSubtotal.textContent = fmt(subtotal);
    cartTax.textContent = fmt(tax);
    cartTotal.textContent = fmt(total);
    cartCount.textContent = String([...state.cart.values()].reduce((a, e) => a + e.qty, 0));

    // qty buttons
    $$('.qty button', cartItems).forEach(b => {
      b.addEventListener('click', () => changeQty(b.getAttribute('data-id'), 
      parseInt(b.getAttribute('data-d'), 10)));
    });

    // persist (localStorage is built-in & free)
    try {
      const obj = Array.from(state.cart.entries()).map(([id, v]) => ({ id, qty: v.qty }));
      localStorage.setItem('aurora-cart', JSON.stringify(obj));
    } catch { /* ignore */ }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem('aurora-cart');
      if (!raw) return;
      const arr = JSON.parse(raw);
      for (const { id, qty } of arr) {
        const item = MENU.find(i => i.id === id);
        if (item) state.cart.set(id, { item, qty });
      }
    } catch { /* ignore */ }
  }

  function announce(msg) {
    // For screen readers
    const el = document.getElementById('live');
    el.textContent = msg;
  }

  // ------- Events -------
  search.addEventListener('input', () => { state.search = search.value; renderGrid(); });

  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => { c.classList.remove('active'); 
        c.setAttribute('aria-pressed', 'false'); });
    ch.classList.add('active'); ch.setAttribute('aria-pressed', 'true');
    state.category = ch.dataset.cat;
    renderGrid();
  }));

  [ [fVegan,'vegan'], [fVeg,'vegetarian'], 
  [fGF,'gluten-free'], [fSpicy,'spicy'] ].forEach(([el, tag]) => {
    el.addEventListener('change', () => {
      if (el.checked) state.filters.add(tag); else state.filters.delete(tag);
      renderGrid();
    });
  });

  sortSel.addEventListener('change', () => { state.sort = sortSel.value; renderGrid(); });

  toggleCartBtn.addEventListener('click', () => {
    const hidden = cartPanel.classList.toggle('hidden');
    toggleCartBtn.setAttribute('aria-expanded', String(!hidden));
  });

  clearCartBtn.addEventListener('click', () => {
    state.cart.clear(); renderCart(); announce('Cart cleared');
  });

  checkoutBtn.addEventListener('click', () => {
    alert('Demo only: this project is fully offline with no payments.\nThanks for trying Aurora Bistro!');
  });

  printBtn.addEventListener('click', () => window.print());

  // ------- Init -------
  loadCart();
  renderGrid();
  renderCart();
})();
