```javascript
"use strict";

/* ============================================================
   NOVASHOP
   MEMBERS STORE
   ============================================================ */


/* ============================================================
   CONFIG
   ============================================================ */

const PAYPAL_USERNAME = "SH0PNOVA";

const MEMBER_PRICE = 5.49;
const MEMBER_AMOUNT = 1000;

const CART_KEY = "novashop_members_cart";


/* ============================================================
   DOM
   ============================================================ */

const productModal = document.getElementById("productModal");
const cartModal = document.getElementById("cartModal");

const quantityInput = document.getElementById("quantity");
const productTotal = document.getElementById("productTotal");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

const toast = document.getElementById("toast");


/* ============================================================
   CART
   ============================================================ */

let cart = loadCart();


/* ============================================================
   FORMAT PRICE
   ============================================================ */

function formatPrice(value) {

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value);

}


/* ============================================================
   QUANTITY
   ============================================================ */

function normalizeQuantity(value) {

  let number = Number(value);

  if (!Number.isFinite(number)) {
    number = 1;
  }

  number = Math.floor(number);

  if (number < 1) {
    number = 1;
  }

  if (number > 1000) {
    number = 1000;
  }

  return number;

}


function getPrice(quantity) {

  return quantity * MEMBER_PRICE;

}


function getMemberCount(quantity) {

  return quantity * MEMBER_AMOUNT;

}


/* ============================================================
   TOAST
   ============================================================ */

let toastTimer = null;

function showToast(message) {

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2400);

}


/* ============================================================
   STORAGE
   ============================================================ */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(CART_KEY);

    if (!saved) {
      return [];
    }

    const data =
      JSON.parse(saved);

    if (!Array.isArray(data)) {
      return [];
    }

    return data;

  } catch (error) {

    console.error(
      "Erreur chargement panier :",
      error
    );

    return [];

  }

}


function saveCart() {

  try {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(
      "Erreur sauvegarde panier :",
      error
    );

  }

}


/* ============================================================
   MODALS
   ============================================================ */

function openModal(modal) {

  if (!modal) {
    return;
  }

  modal.classList.add("active");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

}


function closeModal(modal) {

  if (!modal) {
    return;
  }

  modal.classList.remove("active");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  const anotherOpen =
    productModal.classList.contains("active") ||
    cartModal.classList.contains("active");

  if (!anotherOpen) {
    document.body.style.overflow = "";
  }

}


function openProduct() {

  quantityInput.value = 1;

  updateProductPrice();

  openModal(productModal);

}


function openCart() {

  renderCart();

  openModal(cartModal);

}


/* ============================================================
   PRODUCT PRICE
   ============================================================ */

function updateProductPrice() {

  const quantity =
    normalizeQuantity(
      quantityInput.value
    );

  quantityInput.value = quantity;

  const total =
    getPrice(quantity);

  productTotal.textContent =
    formatPrice(total);

}


/* ============================================================
   QUANTITY BUTTONS
   ============================================================ */

document
  .getElementById("quantityMinus")
  .addEventListener(
    "click",
    () => {

      const current =
        normalizeQuantity(
          quantityInput.value
        );

      quantityInput.value =
        Math.max(
          1,
          current - 1
        );

      updateProductPrice();

    }
  );


document
  .getElementById("quantityPlus")
  .addEventListener(
    "click",
    () => {

      const current =
        normalizeQuantity(
          quantityInput.value
        );

      quantityInput.value =
        Math.min(
          1000,
          current + 1
        );

      updateProductPrice();

    }
  );


quantityInput.addEventListener(
  "input",
  updateProductPrice
);


/* ============================================================
   ADD MEMBERS TO CART
   ============================================================ */

function addMembers(quantity) {

  quantity =
    normalizeQuantity(quantity);


  const existing =
    cart.find(
      item => item.id === "members"
    );


  if (existing) {

    existing.quantity =
      Math.min(
        1000,
        existing.quantity + quantity
      );

  } else {

    cart.push({

      id: "members",

      name: "MEMBERS",

      quantity: quantity,

      unitPrice: MEMBER_PRICE

    });

  }


  saveCart();

  updateCartCount();

  showToast(
    `${getMemberCount(quantity).toLocaleString("fr-FR")} MEMBERS ajoutés au panier`
  );

}


/* ============================================================
   ADD TO CART BUTTON
   ============================================================ */

document
  .getElementById("addToCart")
  .addEventListener(
    "click",
    () => {

      const quantity =
        normalizeQuantity(
          quantityInput.value
        );

      addMembers(quantity);

      closeModal(productModal);

    }
  );


/* ============================================================
   RENDER CART
   ============================================================ */

function renderCart() {

  if (!cartItems) {
    return;
  }


  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-cart">
        <div style="font-size:32px;margin-bottom:10px;">
          🛒
        </div>

        Ton panier est vide.
        <br>
        Ajoute ton premier pack MEMBERS.
      </div>
    `;

    cartTotal.textContent =
      formatPrice(0);

    return;

  }


  cartItems.innerHTML = "";

  let total = 0;


  cart.forEach(
    (item, index) => {

      const quantity =
        normalizeQuantity(
          item.quantity
        );

      const itemTotal =
        quantity * item.unitPrice;

      const members =
        getMemberCount(quantity);

      total += itemTotal;


      const element =
        document.createElement("div");

      element.className =
        "cart-item";


      element.innerHTML = `

        <div class="cart-item-icon">
          ✦
        </div>

        <div class="cart-item-info">

          <strong>
            MEMBERS
          </strong>

          <span>
            ${members.toLocaleString("fr-FR")}
            MEMBERS
            ·
            ${formatPrice(itemTotal)}
          </span>

        </div>

        <button
          class="remove-button"
          type="button"
          data-index="${index}"
        >
          Supprimer
        </button>

      `;


      cartItems.appendChild(element);

    }
  );


  cartTotal.textContent =
    formatPrice(total);


  const removeButtons =
    cartItems.querySelectorAll(
      ".remove-button"
    );


  removeButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          removeCartItem(index);

        }
      );

    }
  );

}


/* ============================================================
   REMOVE CART ITEM
   ============================================================ */

function removeCartItem(index) {

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= cart.length
  ) {
    return;
  }


  cart.splice(index, 1);

  saveCart();

  updateCartCount();

  renderCart();

  showToast(
    "Produit retiré du panier"
  );

}


/* ============================================================
   CART COUNT
   ============================================================ */

function updateCartCount() {

  let count = 0;


  cart.forEach(
    item => {

      count +=
        normalizeQuantity(
          item.quantity
        );

    }
  );


  cartCount.textContent =
    count;

}


/* ============================================================
   PAYPAL URL
   ============================================================ */

function createPayPalUrl(amount) {

  const cleanAmount =
    Number(amount)
      .toFixed(2);


  return (
    "https://paypal.me/" +
    PAYPAL_USERNAME +
    "/" +
    cleanAmount
  );

}


/* ============================================================
   OPEN PAYPAL
   ============================================================ */

function openPayPal(amount) {

  amount =
    Number(amount);


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showToast(
      "Montant invalide"
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


/* ============================================================
   DIRECT PAYPAL
   ============================================================ */

document
  .getElementById("directPayPal")
  .addEventListener(
    "click",
    () => {

      const quantity =
        normalizeQuantity(
          quantityInput.value
        );

      const total =
        getPrice(quantity);

      openPayPal(total);

    }
  );


/* ============================================================
   CART PAYPAL
   ============================================================ */

document
  .getElementById("checkoutPayPal")
  .addEventListener(
    "click",
    () => {

      if (cart.length === 0) {

        showToast(
          "Ton panier est vide"
        );

        return;

      }


      let total = 0;


      cart.forEach(
        item => {

          total +=
            normalizeQuantity(
              item.quantity
            ) *
            Number(
              item.unitPrice
            );

        }
      );


      openPayPal(total);

    }
  );


/* ============================================================
   OPEN / CLOSE
   ============================================================ */

document
  .getElementById("chooseMembers")
  .addEventListener(
    "click",
    openProduct
  );


document
  .getElementById("openCart")
  .addEventListener(
    "click",
    openCart
  );


document
  .getElementById("closeProduct")
  .addEventListener(
    "click",
    () => {
      closeModal(productModal);
    }
  );


document
  .getElementById("closeCart")
  .addEventListener(
    "click",
    () => {
      closeModal(cartModal);
    }
  );


/* ============================================================
   CLICK OUTSIDE
   ============================================================ */

productModal.addEventListener(
  "click",
  event => {

    if (
      event.target === productModal
    ) {

      closeModal(productModal);

    }

  }
);


cartModal.addEventListener(
  "click",
  event => {

    if (
      event.target === cartModal
    ) {

      closeModal(cartModal);

    }

  }
);


/* ============================================================
   ESCAPE
   ============================================================ */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }

    closeModal(productModal);
    closeModal(cartModal);

  }
);


/* ============================================================
   STARS
   ============================================================ */

function createStars() {

  const container =
    document.getElementById(
      "stars"
    );

  if (!container) {
    return;
  }


  const amount =
    window.innerWidth < 700
      ? 90
      : 180;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const star =
      document.createElement("div");

    star.className =
      "star";


    const size =
      Math.random() > .92
        ? 3
        : Math.random() > .7
          ? 2
          : 1;


    star.style.width =
      `${size}px`;

    star.style.height =
      `${size}px`;


    star.style.left =
      `${Math.random() * 100}%`;

    star.style.top =
      `${Math.random() * 100}%`;


    star.style.setProperty(
      "--duration",
      `${5 + Math.random() * 9}s`
    );

    star.style.setProperty(
      "--blink",
      `${1.5 + Math.random() * 4}s`
    );

    star.style.setProperty(
      "--move-x",
      `${-20 + Math.random() * 40}px`
    );

    star.style.setProperty(
      "--move-y",
      `${-20 + Math.random() * 40}px`
    );


    star.style.animationDelay =
      `${Math.random() * 7}s`;


    container.appendChild(star);

  }

}


/* ============================================================
   CONSTELLATIONS
   ============================================================ */

function createConstellations() {

  const container =
    document.getElementById(
      "constellations"
    );

  if (!container) {
    return;
  }


  const patterns = [

    {
      left: "8%",
      top: "17%",
      points: [
        [15, 25],
        [75, 10],
        [125, 55],
        [165, 35],
        [105, 105]
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4]
      ]
    },

    {
      left: "72%",
      top: "21%",
      points: [
        [25, 80],
        [70, 30],
        [120, 70],
        [165, 20],
        [145, 115]
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4]
      ]
    },

    {
      left: "17%",
      top: "67%",
      points: [
        [10, 45],
        [55, 10],
        [105, 45],
        [145, 90],
        [70, 120]
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 4]
      ]
    }

  ];


  patterns.forEach(
    (pattern, patternIndex) => {

      const constellation =
        document.createElement("div");

      constellation.className =
        "constellation";

      constellation.style.left =
        pattern.left;

      constellation.style.top =
        pattern.top;

      constellation.style.animationDelay =
        `${patternIndex * 1.7}s`;


      pattern.points.forEach(
        point => {

          const element =
            document.createElement("span");

          element.className =
            "point";

          element.style.left =
            `${point[0]}px`;

          element.style.top =
            `${point[1]}px`;

          constellation.appendChild(
            element
          );

        }
      );


      pattern.lines.forEach(
        connection => {

          const start =
            pattern.points[
              connection[0]
            ];

          const end =
            pattern.points[
              connection[1]
            ];


          const dx =
            end[0] - start[0];

          const dy =
            end[1] - start[1];


          const length =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          const angle =
            Math.atan2(
              dy,
              dx
            ) *
            180 /
            Math.PI;


          const line =
            document.createElement("span");

          line.className =
            "line";

          line.style.left =
            `${start[0]}px`;

          line.style.top =
            `${start[1]}px`;

          line.style.width =
            `${length}px`;

          line.style.transform =
            `rotate(${angle}deg)`;


          constellation.appendChild(
            line
          );

        }
      );


      container.appendChild(
        constellation
      );

    }
  );

}


/* ============================================================
   LIGHTNING
   ============================================================ */

function createLightnings() {

  const container =
    document.getElementById(
      "lightnings"
    );

  if (!container) {
    return;
  }


  const amount =
    window.innerWidth < 700
      ? 5
      : 9;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const lightning =
      document.createElement("div");

    lightning.className =
      "lightning";


    lightning.style.left =
      `${Math.random() * 100}%`;

    lightning.style.top =
      `${Math.random() * 100}%`;


    lightning.style.setProperty(
      "--rotation",
      `${-35 + Math.random() * 70}deg`
    );


    lightning.style.animationDelay =
      `${Math.random() * 7}s`;


    container.appendChild(
      lightning
    );

  }

}


/* ============================================================
   PARALLAX BACKGROUND
   ============================================================ */

let mouseX = 0;
let mouseY = 0;

window.addEventListener(
  "mousemove",
  event => {

    mouseX =
      (event.clientX /
        window.innerWidth -
        .5) *
      2;

    mouseY =
      (event.clientY /
        window.innerHeight -
        .5) *
      2;


    const constellations =
      document.querySelectorAll(
        ".constellation"
      );


    constellations.forEach(
      (element, index) => {

        const strength =
          4 + (index * 2);

        element.style.marginLeft =
          `${mouseX * strength}px`;

        element.style.marginTop =
          `${mouseY * strength}px`;

      }
    );

  }
);


/* ============================================================
   INITIALISATION
   ============================================================ */

createStars();

createConstellations();

createLightnings();

updateCartCount();

renderCart();

updateProductPrice();


console.log(
  "✦ NovaShop Members Store ready."
);
```
