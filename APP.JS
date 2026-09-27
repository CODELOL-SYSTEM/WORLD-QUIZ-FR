```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const PAYPAL_USERNAME = "SH0PNOVA";
  const MEMBER_PRICE = 5.49;
  const STORAGE_KEY = "novashop_members_cart";

  let quantity = 1;
  let cart = [];

  /* =======================================================
     DOM
  ======================================================= */

  const pageLoader = document.getElementById("pageLoader");
  const stars = document.getElementById("stars");

  const chooseMembersBtn =
    document.getElementById("chooseMembersBtn");

  const heroCartBtn =
    document.getElementById("heroCartBtn");

  const quantityDrawer =
    document.getElementById("quantityDrawer");

  const cartDrawer =
    document.getElementById("cartDrawer");

  const drawerOverlay =
    document.getElementById("drawerOverlay");

  const closeQuantityBtn =
    document.getElementById("closeQuantityBtn");

  const closeCartBtn =
    document.getElementById("closeCartBtn");

  const decreaseBtn =
    document.getElementById("decreaseBtn");

  const increaseBtn =
    document.getElementById("increaseBtn");

  const quantityValue =
    document.getElementById("quantityValue");

  const memberAmountLabel =
    document.getElementById("memberAmountLabel");

  const quantityTotal =
    document.getElementById("quantityTotal");

  const addToCartBtn =
    document.getElementById("addToCartBtn");

  const cartItems =
    document.getElementById("cartItems");

  const cartCount =
    document.getElementById("cartCount");

  const cartTotal =
    document.getElementById("cartTotal");

  const paypalBtn =
    document.getElementById("paypalBtn");

  const toast =
    document.getElementById("toast");

  /* =======================================================
     VERIFICATION
  ======================================================= */

  const requiredElements = [
    pageLoader,
    chooseMembersBtn,
    heroCartBtn,
    quantityDrawer,
    cartDrawer,
    drawerOverlay,
    closeQuantityBtn,
    closeCartBtn,
    decreaseBtn,
    increaseBtn,
    quantityValue,
    memberAmountLabel,
    quantityTotal,
    addToCartBtn,
    cartItems,
    cartCount,
    cartTotal,
    paypalBtn,
    toast
  ];

  if (requiredElements.some(element => !element)) {
    console.error(
      "NOVASHOP : un ou plusieurs éléments HTML sont introuvables."
    );
    return;
  }

  /* =======================================================
     UTILITAIRES
  ======================================================= */

  function formatPrice(value) {
    return Number(value).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " €";
  }

  function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  function loadCart() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        cart = [];
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        cart = [];
        return;
      }

      cart = parsed
        .filter(item =>
          item &&
          item.product === "MEMBERS" &&
          Number.isFinite(Number(item.quantity))
        )
        .map(item => ({
          product: "MEMBERS",
          quantity: Math.max(
            1,
            Math.floor(Number(item.quantity))
          )
        }));

    } catch (error) {

      console.error(
        "Impossible de charger le panier :",
        error
      );

      cart = [];
    }
  }

  function saveCart() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

    } catch (error) {

      console.error(
        "Impossible de sauvegarder le panier :",
        error
      );
    }
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function normalizeQuantity() {

    quantity = Math.max(
      1,
      Math.min(
        1000,
        Math.floor(Number(quantity) || 1)
      )
    );
  }

  function updateQuantityUI() {

    normalizeQuantity();

    quantityValue.textContent =
      quantity;

    memberAmountLabel.textContent =
      `${quantity}K MEMBERS`;

    quantityTotal.textContent =
      formatPrice(quantity * MEMBER_PRICE);
  }

  /* =======================================================
     DRAWERS
  ======================================================= */

  function closeDrawers() {

    quantityDrawer.classList.remove("open");
    cartDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");

    document.body.style.overflow = "";
  }

  function openQuantityDrawer() {

    closeDrawers();

    updateQuantityUI();

    quantityDrawer.classList.add("open");
    drawerOverlay.classList.add("open");

    document.body.style.overflow = "hidden";
  }

  function openCartDrawer() {

    closeDrawers();

    renderCart();

    cartDrawer.classList.add("open");
    drawerOverlay.classList.add("open");

    document.body.style.overflow = "hidden";
  }

  /* =======================================================
     CHOOSE BUTTON
  ======================================================= */

  chooseMembersBtn.addEventListener(
    "click",
    () => {

      quantity = 1;

      openQuantityDrawer();

    }
  );

  /* =======================================================
     CLOSE BUTTONS
  ======================================================= */

  closeQuantityBtn.addEventListener(
    "click",
    closeDrawers
  );

  closeCartBtn.addEventListener(
    "click",
    closeDrawers
  );

  drawerOverlay.addEventListener(
    "click",
    closeDrawers
  );

  /* =======================================================
     QUANTITY BUTTONS
  ======================================================= */

  decreaseBtn.addEventListener(
    "click",
    () => {

      if (quantity > 1) {
        quantity--;
        updateQuantityUI();
      }

    }
  );

  increaseBtn.addEventListener(
    "click",
    () => {

      if (quantity < 1000) {
        quantity++;
        updateQuantityUI();
      } else {
        showToast(
          "Quantité maximale atteinte."
        );
      }

    }
  );

  /* =======================================================
     ADD TO CART
  ======================================================= */

  addToCartBtn.addEventListener(
    "click",
    () => {

      normalizeQuantity();

      const existing =
        cart.find(
          item => item.product === "MEMBERS"
        );

      if (existing) {

        existing.quantity += quantity;

      } else {

        cart.push({
          product: "MEMBERS",
          quantity: quantity
        });

      }

      saveCart();
      updateCartCount();

      addToCartBtn.textContent =
        "✓ Ajouté au panier";

      setTimeout(() => {

        addToCartBtn.textContent =
          "🛒 Ajouter au panier";

      }, 900);

      showToast(
        `${quantity}K MEMBERS ajouté${quantity > 1 ? "s" : ""} au panier.`
      );

      setTimeout(() => {

        openCartDrawer();

      }, 250);

    }
  );

  /* =======================================================
     CART
  ======================================================= */

  function getTotalQuantity() {

    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );
  }

  function getCartTotal() {

    return cart.reduce(
      (total, item) =>
        total +
        Number(item.quantity) * MEMBER_PRICE,
      0
    );
  }

  function updateCartCount() {

    cartCount.textContent =
      getTotalQuantity();

  }

  function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

      cartItems.innerHTML = `
        <div class="empty">
          <div class="emptyIcon">🛒</div>
          Ton panier est vide.
        </div>
      `;

      cartTotal.textContent =
        "0,00 €";

      paypalBtn.disabled = true;

      return;
    }

    cart.forEach((item, index) => {

      const total =
        Number(item.quantity) * MEMBER_PRICE;

      const element =
        document.createElement("div");

      element.className = "cartItem";

      element.innerHTML = `
        <div>
          <div class="cartItemName">
            MEMBERS
          </div>

          <div class="cartItemInfo">
            ${item.quantity}K MEMBERS
          </div>

          <button
            type="button"
            class="remove"
            data-index="${index}"
          >
            Supprimer
          </button>
        </div>

        <div class="cartItemPrice">
          ${formatPrice(total)}
        </div>
      `;

      cartItems.appendChild(element);

    });

    cartTotal.textContent =
      formatPrice(getCartTotal());

    paypalBtn.disabled = false;

    const removeButtons =
      cartItems.querySelectorAll(".remove");

    removeButtons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          if (
            !Number.isInteger(index) ||
            !cart[index]
          ) {
            return;
          }

          cart.splice(index, 1);

          saveCart();
          updateCartCount();
          renderCart();

          showToast(
            "Produit retiré du panier."
          );

        }
      );

    });

  }

  heroCartBtn.addEventListener(
    "click",
    openCartDrawer
  );

  /* =======================================================
     PAYPAL
  ======================================================= */

  paypalBtn.addEventListener(
    "click",
    () => {

      const total =
        getCartTotal();

      if (total <= 0) {

        showToast(
          "Ton panier est vide."
        );

        return;
      }

      const amount =
        total.toFixed(2);

      const paypalUrl =
        `https://paypal.me/${PAYPAL_USERNAME}/${amount}`;

      /*
       * Navigation directe pour éviter
       * les blocages de popup du navigateur.
       */

      window.location.href =
        paypalUrl;

    }
  );

  /* =======================================================
     ESC
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeDrawers();
      }

    }
  );

  /* =======================================================
     STARS
  ======================================================= */

  function createStars() {

    if (!stars) {
      return;
    }

    const amount =
      window.innerWidth < 600
        ? 55
        : 100;

    const fragment =
      document.createDocumentFragment();

    for (let i = 0; i < amount; i++) {

      const star =
        document.createElement("span");

      star.className = "star";

      star.style.left =
        `${Math.random() * 100}%`;

      star.style.top =
        `${Math.random() * 100}%`;

      star.style.animationDelay =
        `${Math.random() * 4}s`;

      star.style.animationDuration =
        `${2 + Math.random() * 4}s`;

      fragment.appendChild(star);
    }

    stars.appendChild(fragment);
  }

  /* =======================================================
     STARTUP
  ======================================================= */

  loadCart();
  updateCartCount();
  updateQuantityUI();
  createStars();

  /*
   * Petit délai volontaire pour que
   * l'animation de chargement soit visible.
   */

  setTimeout(() => {

    pageLoader.classList.add("hide");

  }, 1200);

});
```
