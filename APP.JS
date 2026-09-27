```javascript
// ============================================================
// NOVASHOP
// MEMBERS STORE
// ============================================================

"use strict";


// ============================================================
// CONFIGURATION
// ============================================================

const PAYPAL_USERNAME = "SH0PNOVA";

const MEMBER_UNIT_PRICE = 5.49;
const MEMBER_UNIT_SIZE = 1000;

const CART_STORAGE_KEY = "novashop_members_cart";


// ============================================================
// DOM
// ============================================================

const $ = (selector) => document.querySelector(selector);

const productModal = $("#productModal");
const cartModal = $("#cartModal");

const quantityInput = $("#quantity");
const productTotal = $("#productTotal");

const cartItems = $("#cartItems");
const cartTotal = $("#cartTotal");
const cartCount = $("#cartCount");

const toastElement = $("#toast");


// ============================================================
// CART
// ============================================================

let cart = loadCart();


// ============================================================
// UTILITAIRES
// ============================================================

function formatPrice(value) {

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value);

}


function normalizeQuantity(value) {

  let quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    quantity = 1;
  }

  quantity = Math.floor(quantity);

  if (quantity < 1) {
    quantity = 1;
  }

  if (quantity > 1000) {
    quantity = 1000;
  }

  return quantity;

}


function getMembersPrice(quantity) {

  return quantity * MEMBER_UNIT_PRICE;

}


function getMembersAmount(quantity) {

  return quantity * MEMBER_UNIT_SIZE;

}


function showToast(message) {

  if (!toastElement) {
    return;
  }

  toastElement.textContent = message;
  toastElement.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {

    toastElement.classList.remove("show");

  }, 2500);

}


// ============================================================
// LOCAL STORAGE
// ============================================================

function loadCart() {

  try {

    const saved = localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;

  } catch (error) {

    console.error(
      "Impossible de charger le panier :",
      error
    );

    return [];

  }

}


function saveCart() {

  try {

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(
      "Impossible de sauvegarder le panier :",
      error
    );

  }

}


// ============================================================
// MODALS
// ============================================================

function openModal(modal) {

  if (!modal) {
    return;
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

}


function closeModal(modal) {

  if (!modal) {
    return;
  }

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  if (
    !productModal.classList.contains("active") &&
    !cartModal.classList.contains("active")
  ) {

    document.body.style.overflow = "";

  }

}


function openProductModal() {

  quantityInput.value = 1;

  updateProductTotal();

  openModal(productModal);

}


function openCartModal() {

  renderCart();

  openModal(cartModal);

}


// ============================================================
// QUANTITY
// ============================================================

function updateProductTotal() {

  const quantity = normalizeQuantity(
    quantityInput.value
  );

  quantityInput.value = quantity;

  const total = getMembersPrice(quantity);

  productTotal.textContent = formatPrice(total);

}


$("#minus").addEventListener("click", () => {

  const current = normalizeQuantity(
    quantityInput.value
  );

  quantityInput.value = Math.max(
    1,
    current - 1
  );

  updateProductTotal();

});


$("#plus").addEventListener("click", () => {

  const current = normalizeQuantity(
    quantityInput.value
  );

  quantityInput.value = Math.min(
    1000,
    current + 1
  );

  updateProductTotal();

});


quantityInput.addEventListener("input", () => {

  updateProductTotal();

});


// ============================================================
// ADD TO CART
// ============================================================

function addMembersToCart(quantity) {

  quantity = normalizeQuantity(quantity);

  const existing = cart.find(
    item => item.productId === "members"
  );

  if (existing) {

    existing.quantity += quantity;

    if (existing.quantity > 1000) {
      existing.quantity = 1000;
    }

  } else {

    cart.push({

      productId: "members",

      name: "MEMBERS",

      quantity: quantity,

      unitPrice: MEMBER_UNIT_PRICE

    });

  }

  saveCart();
  updateCartUI();

  showToast(
    `${getMembersAmount(quantity).toLocaleString("fr-FR")} MEMBERS ajoutés au panier.`
  );

}


$("#addToCart").addEventListener(
  "click",
  () => {

    const quantity = normalizeQuantity(
      quantityInput.value
    );

    addMembersToCart(quantity);

    closeModal(productModal);

  }
);


// ============================================================
// CART RENDER
// ============================================================

function renderCart() {

  if (!cartItems) {
    return;
  }

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty">
        🛒 Ton panier est vide.
        <br>
        Ajoute des MEMBERS pour commencer.
      </div>
    `;

    cartTotal.textContent = formatPrice(0);

    return;

  }


  cartItems.innerHTML = "";

  let total = 0;


  cart.forEach((item, index) => {

    const itemTotal =
      item.quantity * item.unitPrice;

    const membersAmount =
      getMembersAmount(item.quantity);

    total += itemTotal;


    const element =
      document.createElement("div");

    element.className = "cart-item";

    element.innerHTML = `

      <div class="cart-item-icon">
        ✦
      </div>

      <div class="cart-item-info">

        <strong>
          ${escapeHtml(item.name)}
        </strong>

        <span>
          ${membersAmount.toLocaleString("fr-FR")}
          MEMBERS
          •
          ${formatPrice(itemTotal)}
        </span>

      </div>

      <button
        class="remove"
        type="button"
        data-index="${index}"
      >
        Supprimer
      </button>

    `;


    cartItems.appendChild(element);

  });


  cartTotal.textContent =
    formatPrice(total);


  document
    .querySelectorAll(".remove")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          removeCartItem(index);

        }
      );

    });

}


function removeCartItem(index) {

  if (
    index < 0 ||
    index >= cart.length
  ) {
    return;
  }

  cart.splice(index, 1);

  saveCart();

  updateCartUI();

  renderCart();

  showToast(
    "Produit retiré du panier."
  );

}


// ============================================================
// CART UI
// ============================================================

function updateCartUI() {

  if (!cartCount) {
    return;
  }

  let totalItems = 0;

  cart.forEach(item => {

    totalItems += item.quantity;

  });

  cartCount.textContent = totalItems;

}


// ============================================================
// PAYPAL
// ============================================================

function createPayPalUrl(amount) {

  const safeAmount =
    Number(amount).toFixed(2);

  return (
    "https://paypal.me/" +
    PAYPAL_USERNAME +
    "/" +
    safeAmount
  );

}


function openPayPal(amount) {

  if (!Number.isFinite(amount) || amount <= 0) {

    showToast(
      "Montant invalide."
    );

    return;

  }


  const url =
    createPayPalUrl(amount);


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


// ============================================================
// DIRECT PAYPAL
// ============================================================

$("#directPayPal").addEventListener(
  "click",
  () => {

    const quantity =
      normalizeQuantity(
        quantityInput.value
      );

    const amount =
      getMembersPrice(quantity);

    openPayPal(amount);

  }
);


// ============================================================
// CART PAYPAL
// ============================================================

$("#checkoutPayPal").addEventListener(
  "click",
  () => {

    if (cart.length === 0) {

      showToast(
        "Ton panier est vide."
      );

      return;

    }


    let total = 0;

    cart.forEach(item => {

      total +=
        item.quantity *
        item.unitPrice;

    });


    openPayPal(total);

  }
);


// ============================================================
// BUTTONS
// ============================================================

$("#buyMembers").addEventListener(
  "click",
  openProductModal
);


$("#openCart").addEventListener(
  "click",
  openCartModal
);


$("#closeProduct").addEventListener(
  "click",
  () => {

    closeModal(productModal);

  }
);


$("#closeCart").addEventListener(
  "click",
  () => {

    closeModal(cartModal);

  }
);


// ============================================================
// CLICK OUTSIDE MODAL
// ============================================================

productModal.addEventListener(
  "click",
  event => {

    if (event.target === productModal) {

      closeModal(productModal);

    }

  }
);


cartModal.addEventListener(
  "click",
  event => {

    if (event.target === cartModal) {

      closeModal(cartModal);

    }

  }
);


// ============================================================
// ESCAPE
// ============================================================

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }

    closeModal(productModal);
    closeModal(cartModal);

  }
);


// ============================================================
// SECURITY / HTML ESCAPE
// ============================================================

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================================
// SPACE BACKGROUND
// ============================================================

function createSpace() {

  const space = document.querySelector("#space");

  if (!space) {
    return;
  }


  // ÉTOILES

  for (let i = 0; i < 150; i++) {

    const star =
      document.createElement("div");

    star.className = "star";

    star.style.left =
      Math.random() * 100 + "%";

    star.style.top =
      Math.random() * 100 + "%";

    star.style.animationDelay =
      Math.random() * 4 + "s";

    star.style.animationDuration =
      1.5 + Math.random() * 3 + "s";

    space.appendChild(star);

  }


  // ÉCLAIRS

  for (let i = 0; i < 12; i++) {

    const bolt =
      document.createElement("div");

    bolt.className = "bolt";

    bolt.style.left =
      Math.random() * 100 + "%";

    bolt.style.top =
      Math.random() * 100 + "%";

    bolt.style.animationDelay =
      Math.random() * 5 + "s";

    space.appendChild(bolt);

  }


  // CONSTELLATIONS

  for (let i = 0; i < 8; i++) {

    const constellation =
      document.createElement("div");

    constellation.className =
      "constellation";

    constellation.style.left =
      Math.random() * 100 + "%";

    constellation.style.top =
      Math.random() * 100 + "%";

    constellation.style.animationDelay =
      Math.random() * 5 + "s";

    space.appendChild(
      constellation
    );

  }

}


// ============================================================
// INIT
// ============================================================

createSpace();

updateCartUI();

renderCart();

updateProductTotal();

console.log(
  "NovaShop Members Store chargé."
);
```
