// products: completa con los que ya tenés en el catálogo
const PRODUCTS = {
  "sobre-gtx-1": {
    title: "Sobre M&R Cards Special Surf GTX",
    price: 5999,
    images: [
      "../img/Diseño de carta _M&R MDQ_.png",
      "../img/img-sobres.png",
      "../img/sobres-frente.png"
    ],
    description: "Edición especial Surf GTX con cartas premium y acabado brillante."
  },
  "sobre-gtx-2": {
    title: "Sobre M&R Cards Special Surf GTX (Ed. 2)",
    price: 5999,
    images: ["../img/img-sobres.png"],
    description: "Segunda edición con nuevas ilustraciones y rarezas."
  },
  "sobre-gtx-3": {
    title: "Sobre M&R Cards Special Surf GTX (Frente)",
    price: 5999,
    images: ["../img/sobres-frente.png"],
    description: "Versión frontal del sobre con diseño exclusivo."
  },
  "carta-combate-1": {
    title: "Carta Combate — Surf Arena",
    price: 3499,
    images: ["../img/carta-pelea.png"],
    description: "Carta de combate exclusiva de la colección Surf Arena."
  }
};

function qs(sel) { return document.querySelector(sel); }
function fmt(n) { return n.toLocaleString("es-AR"); }

(function init() {
  const el = qs("#product-detail");
  if (!el) return;

  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS[id];
  if (!p) {
    el.innerHTML = `<div class="text-center py-5">
      <h2 class="mb-2">Producto no encontrado</h2>
      <a class="btn btn-outline-light" href="Sobres_tienda.html">Volver al catálogo</a>
    </div>`;
    return;
  }

  // Carrusel con indicadores + autoplay
  const indicators = p.images.map((_, i) =>
    `<button type="button" data-bs-target="#carouselProduct" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>`
  ).join("");

  const slides = p.images.map((src, i) =>
    `<div class="carousel-item ${i === 0 ? 'active' : ''}">
       <img src="${src}" class="d-block w-100 rounded" alt="${p.title}">
     </div>`
  ).join("");

  el.innerHTML = `
    <div class="row g-4 align-items-start">
      <div class="col-md-6">
        <div id="carouselProduct" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3500">
          <div class="carousel-indicators">${indicators}</div>
          <div class="carousel-inner">${slides}</div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselProduct" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselProduct" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
          </button>
        </div>
      </div>

      <div class="col-md-6">
        <h2 class="fw-bold mb-2">${p.title}</h2>
        <p class="text-white-50 mb-3">${p.description}</p>
        <h3 class="text-warning mb-4">$ ${fmt(p.price)}</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-warning fw-bold flex-grow-1" id="buyNow">Pagar con tarjeta</button>
          <a class="btn btn-outline-light" href="Sobres_tienda.html">Volver</a>
        </div>
      </div>
    </div>
  `;

  // Opcional: enganchar con tu carrito si existe addToCart/buyNow global (shop.js)
  const buyBtn = qs("#buyNow");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      // Si está tu lógica global, la usamos:
      if (typeof addToCart === "function") { addToCart({ id, name: p.title, price: p.price, img: p.images[0] }, 1); }
      if (typeof startCheckout === "function") { startCheckout(); }
    });
  }
})();
