```javascript
"use strict";

/*
============================================================
 NOVASHOP • MEMBERS
 APP.JS COMPLET
============================================================
*/

(() => {

  /* ========================================================
     CONFIGURATION
  ======================================================== */

  const CONFIG = {
    productId: "members-1k",
    productName: "MEMBERS",
    membersPerUnit: 1000,
    pricePerUnit: 5.49,

    paypalBase: "https://paypal.me/SH0PNOVA",

    storageKey: "novashop_members_cart",

    loadingDuration: 3000,
    fireDuration: 4200
  };


  /* ========================================================
     DOM
  ======================================================== */

  const $ = (selector) => document.querySelector(selector);

  const loader = $("#loader");
  const loaderProgress = $("#loaderProgress");

  const fireTransition = $("#fireTransition");
  const site = $("#site");

  const drawerOverlay = $("#drawerOverlay");

  const quantityDrawer = $("#quantityDrawer");
  const cartDrawer = $("#cartDrawer");

  const chooseButton = $("#chooseButton");
  const cartButton = $("#cartButton");

  const closeQuantity = $("#closeQuantity");
  const closeCart = $("#closeCart");

  const minusButton = $("#minusButton");
  const plusButton = $("#plusButton");

  const addCartButton = $("#addCartButton");

  const quantityValue = $("#quantityValue");
  const membersPreview = $("#membersPreview");
  const totalPreview = $("#totalPreview");

  const discordUsername = $("#discordUsername");
  const discordServer = $("#discordServer");

  const cartItems = $("#cartItems");
  const cartTotal = $("#cartTotal");
  const cartCount = $("#cartCount");

  const paypalButton = $("#paypalButton");


  /* ========================================================
     ÉTAT
  ======================================================== */

  let quantity = 1;

  let cart = loadCart();


  /* ========================================================
     UTILITAIRES
  ======================================================== */

  function formatPrice(value) {

    return Number(value).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " €";

  }


  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* ========================================================
     ÉTOILES
  ======================================================== */

  function createStars() {

    const space = $("#space");

    if (!space) {
      return;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 130; i++) {

      const star = document.createElement("div");

      star.className = "star";

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      const size = Math.random() * 2 + 1;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.animationDelay =
        `${Math.random() * 3}s`;

      fragment.appendChild(star);
    }

    space.appendChild(fragment);


    for (let i = 0; i < 9; i++) {

      const bolt = document.createElement("div");

      bolt.className = "lightning";

      bolt.style.left =
        `${Math.random() * 100}%`;

      bolt.style.top =
        `${Math.random() * 100}%`;

      bolt.style.height =
        `${120 + Math.random() * 180}px`;

      bolt.style.animationDelay =
        `${Math.random() * 4}s`;

      space.appendChild(bolt);
    }

  }


  /* ========================================================
     LOADING 3 SECONDES
  ======================================================== */

  function startLoading() {

    const startTime = performance.now();

    function animate(currentTime) {

      const elapsed =
        currentTime - startTime;

      const progress =
        Math.min(
          elapsed / CONFIG.loadingDuration,
          1
        );

      if (loaderProgress) {

        loaderProgress.style.width =
          `${progress * 100}%`;

      }

      if (progress < 1) {

        requestAnimationFrame(animate);

      } else {

        finishLoading();

      }

    }

    requestAnimationFrame(animate);

  }


  /* ========================================================
     FIN DU LOADING
  ======================================================== */

  function finishLoading() {

    if (loader) {
      loader.classList.add("hidden");
    }

    setTimeout(() => {

      if (fireTransition) {
        fireTransition.classList.add("active");
      }

    }, 450);


    setTimeout(() => {

      if (fireTransition) {
        fireTransition.style.transition =
          "opacity 1.4s ease, visibility 1.4s ease";

        fireTransition.style.opacity = "0";
      }

    }, CONFIG.fireDuration);


    setTimeout(() => {

      if (fireTransition) {
        fireTransition.classList.remove("active");
        fireTransition.style.opacity = "";
      }

      if (site) {
        site.classList.add("visible");
      }

    }, CONFIG.fireDuration + 1500);

  }


  /* ========================================================
     LOCAL STORAGE
  ======================================================== */

  function loadCart() {

    try {

      const saved =
        localStorage.getItem(CONFIG.storageKey);

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
        CONFIG.storageKey,
        JSON.stringify(cart)
      );

    } catch (error) {

      console.error(
        "Impossible de sauvegarder le panier :",
        error
      );

    }

  }


  /* ========================================================
     DESSINS
  ======================================================== */

  function updateQuantityUI() {

    if (quantityValue) {

      quantityValue.textContent =
        quantity;

    }

    const members =
      quantity * CONFIG.membersPerUnit;

    const total =
      quantity * CONFIG.pricePerUnit;

    if (membersPreview) {

      membersPreview.textContent =
        `${members.toLocaleString("fr-FR")} MEMBERS`;

    }

    if (totalPreview) {

      totalPreview.textContent =
        formatPrice(total);

    }

  }


  function updateCartUI() {

    if (!cartItems) {
      return;
    }

    if (cart.length === 0) {

      cartItems.innerHTML = `
        <div class="emptyCart">
          🛒<br><br>
          Ton panier est vide.
        </div>
      `;

      if (cartTotal) {
        cartTotal.textContent =
          formatPrice(0);
      }

      if (cartCount) {
        cartCount.textContent = "0";
      }

      return;

    }


    let total = 0;
    let count = 0;

    cartItems.innerHTML = cart.map((item, index) => {

      const itemTotal =
        item.quantity * item.price;

      total += itemTotal;
      count += item.quantity;

      return `
        <div class="cartItem">

          <div class="cartItemTop">

            <div class="cartItemName">
              ${escapeHTML(item.name)}
            </div>

            <div class="cartItemPrice">
              ${formatPrice(itemTotal)}
            </div>

          </div>

          <div class="cartItemMeta">
            ${(
              item.quantity *
              item.members
            ).toLocaleString("fr-FR")} MEMBERS
            <br>
            Quantité : ${item.quantity}
            <br>
            Discord : ${escapeHTML(item.discordUsername)}
            <br>
            Serveur : ${escapeHTML(item.discordServer)}
          </div>

          <button
            class="removeButton"
            data-remove-index="${index}"
          >
            Supprimer
          </button>

        </div>
      `;

    }).join("");


    if (cartTotal) {

      cartTotal.textContent =
        formatPrice(total);

    }

    if (cartCount) {

      cartCount.textContent =
        String(count);

    }

  }


  /* ========================================================
     DRAWERS
  ======================================================== */

  function openDrawer(drawer) {

    if (!drawer) {
      return;
    }

    closeDrawers();

    drawerOverlay.classList.add("open");
    drawer.classList.add("open");

  }


  function closeDrawers() {

    if (drawerOverlay) {
      drawerOverlay.classList.remove("open");
    }

    if (quantityDrawer) {
      quantityDrawer.classList.remove("open");
    }

    if (cartDrawer) {
      cartDrawer.classList.remove("open");
    }

  }


  function openQuantityDrawer() {

    openDrawer(quantityDrawer);

    updateQuantityUI();

    setTimeout(() => {

      if (discordUsername) {
        discordUsername.focus();
      }

    }, 300);

  }


  function openCartDrawer() {

    updateCartUI();

    openDrawer(cartDrawer);

  }


  /* ========================================================
     QUANTITÉ
  ======================================================== */

  function decreaseQuantity() {

    if (quantity <= 1) {
      return;
    }

    quantity--;

    updateQuantityUI();

  }


  function increaseQuantity() {

    if (quantity >= 9999) {
      return;
    }

    quantity++;

    updateQuantityUI();

  }


  /* ========================================================
     VALIDATION DISCORD
  ======================================================== */

  function validateDiscordFields() {

    const username =
      discordUsername
        ? discordUsername.value.trim()
        : "";

    const server =
      discordServer
        ? discordServer.value.trim()
        : "";


    if (!username) {

      alert(
        "Entre ton pseudo Discord."
      );

      if (discordUsername) {
        discordUsername.focus();
      }

      return null;

    }


    if (!server) {

      alert(
        "Entre le nom de ton serveur Discord."
      );

      if (discordServer) {
        discordServer.focus();
      }

      return null;

    }


    if (username.length < 2) {

      alert(
        "Ton pseudo Discord est trop court."
      );

      return null;

    }


    if (server.length < 2) {

      alert(
        "Le nom du serveur est trop court."
      );

      return null;

    }


    return {
      username,
      server
    };

  }


  /* ========================================================
     AJOUT PANIER
  ======================================================== */

  function addToCart() {

    const discord =
      validateDiscordFields();

    if (!discord) {
      return;
    }


    const item = {

      id: CONFIG.productId,

      name: CONFIG.productName,

      quantity,

      members:
        CONFIG.membersPerUnit,

      price:
        CONFIG.pricePerUnit,

      discordUsername:
        discord.username,

      discordServer:
        discord.server

    };


    cart.push(item);

    saveCart();

    updateCartUI();

    closeDrawers();


    setTimeout(() => {

      openCartDrawer();

    }, 300);

  }


  /* ========================================================
     SUPPRESSION PANIER
  ======================================================== */

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

  }


  /* ========================================================
     TOTAL
  ======================================================== */

  function getCartTotal() {

    return cart.reduce(
      (sum, item) =>
        sum +
        (
          item.quantity *
          item.price
        ),
      0
    );

  }


  /* ========================================================
     PAYPAL
  ======================================================== */

  function checkoutPayPal() {

    if (cart.length === 0) {

      alert(
        "Ton panier est vide."
      );

      return;

    }


    const total =
      getCartTotal();


    if (!Number.isFinite(total) || total <= 0) {

      alert(
        "Le montant du panier est invalide."
      );

      return;

    }


    const amount =
      total.toFixed(2);


    const paypalUrl =
      `${CONFIG.paypalBase}/${amount}`;


    window.location.href =
      paypalUrl;

  }


  /* ========================================================
     EVENTS
  ======================================================== */

  function setupEvents() {


    if (chooseButton) {

      chooseButton.addEventListener(
        "click",
        openQuantityDrawer
      );

    }


    if (cartButton) {

      cartButton.addEventListener(
        "click",
        openCartDrawer
      );

    }


    if (closeQuantity) {

      closeQuantity.addEventListener(
        "click",
        closeDrawers
      );

    }


    if (closeCart) {

      closeCart.addEventListener(
        "click",
        closeDrawers
      );

    }


    if (drawerOverlay) {

      drawerOverlay.addEventListener(
        "click",
        closeDrawers
      );

    }


    if (minusButton) {

      minusButton.addEventListener(
        "click",
        decreaseQuantity
      );

    }


    if (plusButton) {

      plusButton.addEventListener(
        "click",
        increaseQuantity
      );

    }


    if (addCartButton) {

      addCartButton.addEventListener(
        "click",
        addToCart
      );

    }


    if (paypalButton) {

      paypalButton.addEventListener(
        "click",
        checkoutPayPal
      );

    }


    if (cartItems) {

      cartItems.addEventListener(
        "click",
        (event) => {

          const button =
            event.target.closest(
              "[data-remove-index]"
            );

          if (!button) {
            return;
          }

          const index =
            Number(
              button.dataset.removeIndex
            );

          removeCartItem(index);

        }
      );

    }


    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Escape") {
          closeDrawers();
        }

      }
    );


    [discordUsername, discordServer]
      .forEach((input) => {

        if (!input) {
          return;
        }

        input.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key === "Enter"
            ) {

              event.preventDefault();

              addToCart();

            }

          }
        );

      });

  }


  /* ========================================================
     INITIALISATION
  ======================================================== */

  function init() {

    createStars();

    updateQuantityUI();

    updateCartUI();

    setupEvents();

    startLoading();

    console.log(
      "NOVASHOP MEMBERS chargé."
    );

  }


  /* ========================================================
     DÉMARRAGE
  ======================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
```
