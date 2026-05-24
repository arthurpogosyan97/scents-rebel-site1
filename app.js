const products = [
  {
    id: "orange-cinnamon",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "цитрус",
    mood: "уют",
    price: 950,
    burn: "35 ч",
    notes: "Сочный апельсин, теплая корица и мягкое сияние для уютного вечера.",
    popular: 10,
    image: "images/orange-cinnamon-candle.png",
    art: "linear-gradient(145deg, #f5c06a, #171713)",
    vessel: "#171713",
  },
  {
    id: "coconut-chocolate",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "гурманские",
    mood: "уют",
    price: 899,
    burn: "35 ч",
    notes: "Нежный кокос, темный шоколад и мягкое тепло домашнего десерта.",
    popular: 9,
    image: "images/coconut-chocolate-candle.png",
    art: "linear-gradient(145deg, #eee5da, #211712)",
    vessel: "#171713",
  },
  {
    id: "peony",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "цветочные",
    mood: "нежность",
    price: 1100,
    burn: "35 ч",
    notes: "Свежий пион, мягкие лепестки и чистый цветочный шлейф.",
    popular: 8,
    image: "images/peony-candle.png",
    art: "linear-gradient(145deg, #ffd4df, #171713)",
    vessel: "#171713",
  },
  {
    id: "prosecco",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "игристые",
    mood: "праздник",
    price: 1410,
    burn: "35 ч",
    notes: "Легкий prosecco, белый виноград и искристое настроение вечера.",
    popular: 8,
    image: "images/prosecco-candle.png",
    art: "linear-gradient(145deg, #f0ddae, #171713)",
    vessel: "#171713",
  },
  {
    id: "yuzu",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "цитрус",
    mood: "энергия",
    price: 1099,
    burn: "35 ч",
    notes: "Яркий юзу, свежая цедра и чистый бодрящий акцент.",
    popular: 9,
    image: "images/yuzu-candle.png",
    art: "linear-gradient(145deg, #f2d96b, #171713)",
    vessel: "#171713",
  },
  {
    id: "sandalwood",
    name: "Ароматическая свеча SCENTS REBEL",
    family: "древесные",
    mood: "спокойствие",
    price: 1399,
    burn: "35 ч",
    notes: "Теплый сандал, сухая древесина и глубокий спокойный шлейф.",
    popular: 8,
    image: "images/sandalwood-candle.png",
    art: "linear-gradient(145deg, #c99559, #171713)",
    vessel: "#171713",
  },
];

const state = {
  family: "all",
  mood: "all",
  search: "",
  maxPrice: 4200,
  favoritesOnly: false,
  sort: "popular",
  cart: JSON.parse(localStorage.getItem("aromaCart") || "{}"),
  favorites: new Set(JSON.parse(localStorage.getItem("aromaFavorites") || "[]")),
  builder: [],
  discountRate: 0,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const formatPrice = (value) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

const els = {
  products: $("[data-products]"),
  resultCount: $("[data-result-count]"),
  familyFilters: $("[data-family-filters]"),
  moodFilters: $("[data-mood-filters]"),
  search: $("[data-search]"),
  price: $("[data-price]"),
  priceValue: $("[data-price-value]"),
  favoritesOnly: $("[data-favorites-only]"),
  sort: $("[data-sort]"),
  reset: $("[data-reset]"),
  cart: $("[data-cart]"),
  cartItems: $("[data-cart-items]"),
  cartCount: $("[data-cart-count]"),
  subtotal: $("[data-subtotal]"),
  discount: $("[data-discount]"),
  delivery: $("[data-delivery]"),
  total: $("[data-total]"),
  promo: $("[data-promo]"),
  promoNote: $("[data-promo-note]"),
  welcomePromo: $("[data-welcome-promo]"),
  operatorHelp: $("[data-operator-help]"),
  toast: $("[data-toast]"),
  modal: $("[data-modal]"),
  slots: $("[data-builder-slots]"),
  builderTotal: $("[data-builder-total]"),
};

function uniqueValues(key) {
  const values = [...new Set(products.map((product) => product[key]))];
  return values.length ? ["all", ...values] : ["all"];
}

function labelValue(value) {
  return value === "all" ? "Все" : value[0].toUpperCase() + value.slice(1);
}

function renderChips(container, key, activeValue) {
  container.innerHTML = uniqueValues(key)
    .map(
      (value) => `
        <button class="chip ${value === activeValue ? "is-active" : ""}" type="button" data-filter="${key}" data-value="${value}">
          ${labelValue(value)}
        </button>
      `,
    )
    .join("");
}

function filteredProducts() {
  const query = state.search.trim().toLowerCase();
  return products
    .filter((product) => state.family === "all" || product.family === state.family)
    .filter((product) => state.mood === "all" || product.mood === state.mood)
    .filter((product) => product.price <= state.maxPrice)
    .filter((product) => !state.favoritesOnly || state.favorites.has(product.id))
    .filter((product) => {
      if (!query) return true;
      return [product.name, product.family, product.mood, product.notes].join(" ").toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (state.sort === "price-asc") return a.price - b.price;
      if (state.sort === "price-desc") return b.price - a.price;
      return b.popular - a.popular;
    });
}

function renderProducts() {
  const list = filteredProducts();
  els.resultCount.textContent = `${list.length} ${list.length === 1 ? "товар" : "товаров"}`;
  els.products.innerHTML = list.length
    ? list.map(renderProductCard).join("")
    : `<div class="empty-state">Каталог пока пустой. Скоро добавим первые свечи SCENTS REBEL.</div>`;
}

function renderProductCard(product) {
  const favorite = state.favorites.has(product.id) ? "♥" : "♡";
  const media = product.image
    ? `<img class="product-image" src="${product.image}" alt="${product.name}" />`
    : `<div class="candle-shape"></div>`;
  return `
    <article class="product-card">
      <div class="product-art ${product.image ? "has-image" : ""}" style="--art-bg: ${product.art}; --vessel: ${product.vessel}">
        ${media}
        <button class="favorite-button" type="button" data-favorite="${product.id}" aria-label="Добавить в избранное">${favorite}</button>
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.family}</span>
          <span>${product.burn}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.notes}</p>
        <div class="product-actions">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-button" type="button" data-add="${product.id}">В корзину</button>
        </div>
      </div>
    </article>
  `;
}

function saveState() {
  localStorage.setItem("aromaCart", JSON.stringify(state.cart));
  localStorage.setItem("aromaFavorites", JSON.stringify([...state.favorites]));
}

function addToCart(id, quantity = 1) {
  state.cart[id] = (state.cart[id] || 0) + quantity;
  saveState();
  renderCart();
  showToast("Добавлено в корзину");
}

function setCartQuantity(id, quantity) {
  if (quantity <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = quantity;
  }
  saveState();
  renderCart();
}

function cartLines() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ ...products.find((product) => product.id === id), quantity }))
    .filter((item) => item.id);
}

function cartSummary() {
  const lines = cartLines();
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * state.discountRate);
  const delivery = subtotal === 0 || subtotal >= 7000 ? 0 : 450;
  return {
    lines,
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
    promo: state.discountRate ? "AROMA10" : "",
  };
}

function renderCart() {
  const { lines, subtotal, discount, delivery, total } = cartSummary();
  const count = lines.reduce((sum, item) => sum + item.quantity, 0);

  els.cartCount.textContent = count;
  els.subtotal.textContent = formatPrice(subtotal);
  els.discount.textContent = discount ? `−${formatPrice(discount)}` : "0 ₽";
  els.delivery.textContent = delivery ? formatPrice(delivery) : "0 ₽";
  els.total.textContent = formatPrice(total);
  els.cartItems.innerHTML = lines.length
    ? lines.map(renderCartItem).join("")
    : `<div class="empty-state">Корзина пустая. Самое время выбрать аромат.</div>`;
}

function renderCartItem(item) {
  return `
    <div class="cart-item">
      <div class="cart-thumb" style="--art-bg: ${item.art}">
        ${item.image ? `<img src="${item.image}" alt="" />` : ""}
      </div>
      <div>
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)} · ${item.burn}</p>
      </div>
      <div class="qty">
        <button type="button" data-dec="${item.id}" aria-label="Уменьшить">−</button>
        <strong>${item.quantity}</strong>
        <button type="button" data-inc="${item.id}" aria-label="Увеличить">+</button>
      </div>
    </div>
  `;
}

function renderBuilder() {
  const slots = [0, 1, 2].map((index) => {
    const product = products.find((item) => item.id === state.builder[index]);
    return product
      ? `<button class="slot is-filled" type="button" data-remove-slot="${index}">${product.name}<br>${formatPrice(product.price)}</button>`
      : `<div class="slot">Добавьте свечу из каталога</div>`;
  });
  const total = state.builder.reduce((sum, id) => {
    const product = products.find((item) => item.id === id);
    return sum + (product ? product.price : 0);
  }, 0);
  els.slots.innerHTML = slots.join("");
  els.builderTotal.textContent = formatPrice(total ? Math.round(total * 0.9) : 0);
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  saveState();
  renderProducts();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
}

function openCart() {
  els.cart.classList.add("is-open");
  els.cart.setAttribute("aria-hidden", "false");
}

function closeCart() {
  els.cart.classList.remove("is-open");
  els.cart.setAttribute("aria-hidden", "true");
}

function showWelcomePromo() {
  setTimeout(() => {
    els.welcomePromo.classList.add("is-visible");
    playNoticeSound();
    clearTimeout(showWelcomePromo.timer);
    showWelcomePromo.timer = setTimeout(() => {
      hideWelcomePromo();
      showOperatorHelp();
    }, 10000);
  }, 700);
}

function hideWelcomePromo() {
  clearTimeout(showWelcomePromo.timer);
  els.welcomePromo.classList.add("is-hiding");
  els.welcomePromo.classList.remove("is-visible");
  setTimeout(() => els.welcomePromo.classList.remove("is-hiding"), 220);
}

function showOperatorHelp() {
  if (els.operatorHelp.classList.contains("is-visible")) return;
  els.operatorHelp.classList.add("is-visible");
  playNoticeSound(620, 0.08);
}

function hideOperatorHelp() {
  els.operatorHelp.classList.add("is-hiding");
  els.operatorHelp.classList.remove("is-visible");
  setTimeout(() => els.operatorHelp.classList.remove("is-hiding"), 220);
}

function playNoticeSound(frequency = 520, volume = 0.06) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.34);
  } catch {
    // Some browsers block sound before the first user interaction.
  }
}

function applyFirstOrderPromo() {
  els.promo.value = "AROMA10";
  state.discountRate = 0.1;
  els.promoNote.textContent = "Промокод AROMA10 применен.";
  renderCart();
  openCart();
  hideWelcomePromo();
  showToast("Промокод AROMA10 добавлен");
}

async function sendOrderToTelegram(form) {
  const data = new FormData(form);
  const payload = {
    customer: {
      name: data.get("name"),
      phone: data.get("phone"),
      address: data.get("address"),
    },
    order: cartSummary(),
  };

  const response = await fetch("/api/order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Не удалось отправить заказ");
  }
}

function setupScrollReveal() {
  const revealItems = $$(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupScrollJump() {
  const button = $("[data-scroll-jump]");

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-filter]");
    const add = event.target.closest("[data-add]");
    const favorite = event.target.closest("[data-favorite]");
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const removeSlot = event.target.closest("[data-remove-slot]");
    const scrollJump = event.target.closest("[data-scroll-jump]");
    const closeOperator = event.target.closest("[data-close-operator]");
    const whatsappContact = event.target.closest("[data-whatsapp-contact]");

    if (scrollJump) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (closeOperator) {
      hideOperatorHelp();
      return;
    }

    if (whatsappContact) {
      event.preventDefault();
      showToast("Добавьте номер WhatsApp для рабочей ссылки");
      return;
    }

    if (chip) {
      state[chip.dataset.filter] = chip.dataset.value;
      renderChips(els.familyFilters, "family", state.family);
      renderChips(els.moodFilters, "mood", state.mood);
      renderProducts();
    }

    if (add) {
      addToCart(add.dataset.add);
      if (state.builder.length < 3) {
        state.builder.push(add.dataset.add);
        renderBuilder();
      }
    }

    if (favorite) toggleFavorite(favorite.dataset.favorite);
    if (inc) setCartQuantity(inc.dataset.inc, (state.cart[inc.dataset.inc] || 0) + 1);
    if (dec) setCartQuantity(dec.dataset.dec, (state.cart[dec.dataset.dec] || 0) - 1);
    if (removeSlot) {
      state.builder.splice(Number(removeSlot.dataset.removeSlot), 1);
      renderBuilder();
    }
  });

  els.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  els.price.addEventListener("input", (event) => {
    state.maxPrice = Number(event.target.value);
    els.priceValue.textContent = formatPrice(state.maxPrice);
    renderProducts();
  });

  els.favoritesOnly.addEventListener("change", (event) => {
    state.favoritesOnly = event.target.checked;
    renderProducts();
  });

  els.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  els.reset.addEventListener("click", () => {
    state.family = "all";
    state.mood = "all";
    state.search = "";
    state.maxPrice = 4200;
    state.favoritesOnly = false;
    state.sort = "popular";
    els.search.value = "";
    els.price.value = "4200";
    els.favoritesOnly.checked = false;
    els.sort.value = "popular";
    els.priceValue.textContent = formatPrice(4200);
    renderChips(els.familyFilters, "family", state.family);
    renderChips(els.moodFilters, "mood", state.mood);
    renderProducts();
  });

  $("[data-open-cart]").addEventListener("click", openCart);
  $$("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
  $("[data-open-builder]").addEventListener("click", () => $("#sets").scrollIntoView({ behavior: "smooth" }));
  $("[data-close-promo]").addEventListener("click", hideWelcomePromo);
  $("[data-use-promo]").addEventListener("click", applyFirstOrderPromo);

  $("[data-apply-promo]").addEventListener("click", () => {
    const code = els.promo.value.trim().toUpperCase();
    if (code === "AROMA10") {
      state.discountRate = 0.1;
      els.promoNote.textContent = "Промокод AROMA10 применен.";
    } else {
      state.discountRate = 0;
      els.promoNote.textContent = "Попробуйте AROMA10 для скидки 10%.";
    }
    renderCart();
  });

  $("[data-add-set]").addEventListener("click", () => {
    if (state.builder.length < 3) {
      showToast("Для набора выберите три свечи из каталога");
      return;
    }
    state.builder.forEach((id) => addToCart(id));
    state.builder = [];
    renderBuilder();
    openCart();
  });

  $("[data-checkout]").addEventListener("click", () => {
    if (!cartLines().length) {
      showToast("Сначала добавьте свечи в корзину");
      return;
    }
    els.modal.showModal();
  });

  els.modal.addEventListener("close", async () => {
    if (els.modal.returnValue === "confirm") {
      const form = els.modal.querySelector("form");
      try {
        await sendOrderToTelegram(form);
      } catch (error) {
        showToast(error.message);
        return;
      }
      state.cart = {};
      saveState();
      renderCart();
      closeCart();
      form.reset();
      showToast("Заказ принят. Мы скоро свяжемся с вами.");
    }
  });
}

function init() {
  renderChips(els.familyFilters, "family", state.family);
  renderChips(els.moodFilters, "mood", state.mood);
  renderProducts();
  renderCart();
  renderBuilder();
  bindEvents();
  setupScrollReveal();
  setupScrollJump();
  showWelcomePromo();
}

init();
