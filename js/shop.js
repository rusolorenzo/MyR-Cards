/* Tienda M&R Cards — carrito + checkout (Mercado Pago opcional) */
(() => {
  function logShop(...a) { try { console.debug('[SHOP]', ...a); } catch { } }

  const MP_PUBLIC_KEY = "REEMPLAZA_CON_TU_PUBLIC_KEY"; // ej: "TEST-1234abcd..."
  const HAVE_MP = typeof window.MercadoPago !== "undefined" && MP_PUBLIC_KEY && MP_PUBLIC_KEY !== "REEMPLAZA_CON_TU_PUBLIC_KEY";

  // Lee productos desde el DOM si existen (data-product, data-price)
  function parseDOMProducts() {
    const nodes = document.querySelectorAll("[data-product][data-price]");
    return Array.from(nodes).map(node => {
      const id = node.getAttribute("data-product");
      const price = parseInt(node.getAttribute("data-price"), 10) || 0;
      const imgEl = node.querySelector("img");
      const titleEl = node.querySelector(".card-title");
      return {
        id,
        name: titleEl ? titleEl.textContent.trim() : id,
        price,
        img: imgEl ? imgEl.getAttribute("src") : ""
      };
    });
  }


  /* Catálogo base — tomé tus 4 ítems visibles en Sobres.html y les puse precios de muestra */
  const PRODUCTS = [
    {
      id: "sobre-gtx-1",
      name: "Sobre M&R Cards Special Surf GTX",
      price: 5999,
      img: "../img/Diseño de carta _M&R MDQ_.png"
    },
    {
      id: "sobre-gtx-2",
      name: "Sobre M&R Cards Special Surf GTX (Edición 2)",
      price: 5999,
      img: "../img/img-sobres.png"
    },
    {
      id: "sobre-gtx-3",
      name: "Sobre M&R Cards Special Surf GTX (Frente)",
      price: 5999,
      img: "../img/sobres-frente.png"
    },
    {
      id: "sobre-gtx-4",
      name: "Carta Combate — Surf Arena",
      price: 3499,
      img: "../img/carta-pelea.png"
    }
  ];

  /* Estado */
  let cart = loadCart();

  /* Utils */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
  const fmt = (n) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });

  function saveCart() { localStorage.setItem("mr_cart", JSON.stringify(cart)); }
  function loadCart() { try { return JSON.parse(localStorage.getItem("mr_cart")) || []; } catch { return []; } }
  function cartCount() { return cart.reduce((a, i) => a + i.qty, 0); }
  function cartSubtotal() { return cart.reduce((a, i) => a + i.qty * i.price, 0); }

  function addToCart(product, qty = 1) {
    const i = cart.findIndex(x => x.id === product.id);
    if (i >= 0) cart[i].qty += qty;
    else cart.push({ ...product, qty });
    renderCart();
    saveCart();
  }
  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart(); saveCart();
  }
  function setQty(id, qty) {
    const it = cart.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty | 0);
    renderCart(); saveCart();
  }
  function clearCart() {
    cart = []; renderCart(); saveCart();
  }

  /* Render de productos */
  function renderGrid() {
    const grid = $("#product-grid");
    const domProducts = parseDOMProducts();
    if (domProducts && domProducts.length) { return; }
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card product h-100 shadow-sm">
          <img src="${p.img}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${p.name}</h5>
            <div class="mb-3"><span class="price">${fmt(p.price)}</span></div>
            <div class="mt-auto d-flex gap-2">
              <button class="btn-add flex-fill" data-id="${p.id}"><i class="fa-solid fa-plus me-1"></i>Agregar</button>
              <button class="btn btn-outline-light" data-id="${p.id}" data-buy-now>Comprar</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  /* Render de carrito */
  function renderCart() {
    $("#cart-badge").textContent = cartCount();
    $("#cart-subtotal").textContent = fmt(cartSubtotal());
    $("#cart-summary").textContent = cartCount() ? `${cartCount()} ítem(s) — ${fmt(cartSubtotal())}` : "Carrito vacío";

    const list = $("#cart-list");
    if (!cart.length) {
      list.innerHTML = `<li class="list-group-item d-flex align-items-center justify-content-between">
        <span>Tu carrito está vacío.</span>
      </li>`;
      return;
    }

    list.innerHTML = cart.map(it => `
      <li class="list-group-item">
        <div class="d-flex align-items-center gap-3">
          <img src="${it.img}" class="mini-thumb" alt="${it.name}">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <strong>${it.name}</strong>
              <span>${fmt(it.price * it.qty)}</span>
            </div>
            <div class="d-flex align-items-center gap-2 mt-1">
              <button class="btn btn-sm btn-outline-light qty-step" data-dec="${it.id}">−</button>
              <input class="form-control form-control-sm text-center" style="width:3.5rem" value="${it.qty}" data-qty="${it.id}"/>
              <button class="btn btn-sm btn-outline-light qty-step" data-inc="${it.id}">+</button>
              <button class="btn btn-sm btn-link text-danger ms-auto" data-remove="${it.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </div>
      </li>
    `).join("");
  }

  /* Comprar ahora */
  function buyNow(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    clearCart();
    addToCart(p, 1);
    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance($("#offcanvasCart"));
    offcanvas.show();
  }

  /* Checkout */
  function startCheckout() {
    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }
    // Podés pasar el total como número (ARS) o en centavos si preferís
    const amount = cartSubtotal(); // total en ARS (número)
    // Si pago.html está dentro de /pages/:
    window.location.href = `pago.html?amount=${encodeURIComponent(amount)}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btnCheckout = document.getElementById("btn-checkout");
    if (btnCheckout) {
      btnCheckout.addEventListener("click", (e) => {
        e.preventDefault();
        startCheckout();
      });
    }
  });


  /* Listeners */
  document.addEventListener("click", (ev) => {
    const tClick = ev.target; logShop('click', tClick?.className || tClick?.nodeName);
    const t = ev.target;
    // agregar
    if (t.closest(".btn-add")) {
      const id = t.closest(".btn-add").dataset.id;
      const p = PRODUCTS.find(x => x.id === id);
      if (p) { addToCart(p, 1); }
    }
    // comprar ahora
    if (t.closest("[data-buy-now]")) {
      buyNow(t.closest("[data-buy-now]").dataset.id);
    }
    // qty +/-
    if (t.closest("[data-inc]")) {
      const id = t.closest("[data-inc]").dataset.inc;
      const it = cart.find(i => i.id === id);
      if (it) { setQty(id, it.qty + 1); }
    }
    if (t.closest("[data-dec]")) {
      const id = t.closest("[data-dec]").dataset.dec;
      const it = cart.find(i => i.id === id);
      if (it) { setQty(id, Math.max(1, it.qty - 1)); }
    }
    // remove
    if (t.closest("[data-remove]")) {
      removeFromCart(t.closest("[data-remove]").dataset.remove);
    }
  });

  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.matches("[data-qty]")) {
      const id = el.getAttribute("data-qty");
      const val = parseInt(el.value || "1", 10);
      setQty(id, isNaN(val) ? 1 : val);
    }
  });


  /* Init */
  renderGrid();
  renderCart();
})();

document.addEventListener("pointerdown", (ev) => {
  const t = ev.target;
  if (t.closest(".btn-add")) {
    const id = t.closest(".btn-add").dataset.id;
    const p = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(x => x.id === id) : null;
    if (p) { addToCart(p, 1); }
  }
  if (t.closest("[data-buy-now]")) {
    buyNow(t.closest("[data-buy-now]").dataset.id);
  }
});
const searchInput = document.getElementById('searchInput');
const seriesFilter = document.getElementById('seriesFilter');
const productCards = document.querySelectorAll('#product-grid .card.product');

function filterProducts() {
  const query = searchInput.value.toLowerCase();
  const series = seriesFilter.value;

  productCards.forEach(card => {
    const title = card.querySelector('.card-title').innerText.toLowerCase();
    const matchesSearch = title.includes(query);
    const matchesSeries =
      series === 'all' ||
      card.dataset.product.includes(series) ||
      title.includes(series);

    card.parentElement.style.display =
      matchesSearch && matchesSeries ? 'block' : 'none';
  });
}

searchInput?.addEventListener('input', filterProducts);

// Redirige a la pasarela de pago
document.addEventListener("DOMContentLoaded", () => {
  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", (e) => {
      e.preventDefault();
      const subtotal = document.getElementById("cart-subtotal")?.innerText.replace("$", "").trim();
      window.location.href = `pago.html?total=${encodeURIComponent(subtotal)}`;
    });
  }
});


