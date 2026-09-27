```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     CONFIG
  ======================================================= */

  const PAYPAL_USERNAME = "SH0PNOVA";
  const MEMBER_PRICE = 5.49;
  const STORAGE_KEY = "novashop_members_cart";

  let quantity = 1;
  let cart = [];

  /* =======================================================
     DOM
  ======================================================= */

  const pageLoader =
    document.getElementById("pageLoader");

  const site =
    document.getElementById("site");

  const loaderText =
    document.getElementById("loaderText");

  const loaderPercent =
    document.getElementById("loaderPercent");

  const stars =
    document.getElementById("stars");

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
     CHECK
  ======================================================= */

  const required = [
    pageLoader,
    site,
    loaderText,
    loaderPercent,
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

  if (
    required.some(
      element => !element
    )
  ) {

    console.error(
      "NOVASHOP : élément HTML manquant."
    );

    return;
  }

  /* =======================================================
     PRICE
  ======================================================= */

  function formatPrice(value) {

    return Number(value).toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    ) + " €";

  }

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer =
      setTimeout(() => {

        toast.classList.remove("show");

      }, 2600);

  }

  /* =======================================================
     LOADING 3 SECONDES
  ======================================================= */

  function startLoading() {

    const start =
      performance.now();

    const duration =
      3000;

    const texts = [
      "Chargement du produit",
      "Préparation de NOVASHOP",
      "Initialisation",
      "Presque prêt"
    ];

    let lastText = -1;

    function animateLoading(now) {

      const elapsed =
        now - start;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );

      const percent =
        Math.floor(progress * 100);

      loaderPercent.textContent =
        `${percent}%`;

      const textIndex =
        Math.min(
          Math.floor(progress * texts.length),
          texts.length - 1
        );

      if (
        textIndex !== lastText
      ) {

        loaderText.textContent =
          texts[textIndex];

        lastText =
          textIndex;
      }

      if (progress < 1) {

        requestAnimationFrame(
          animateLoading
        );

      } else {

        finishLoading();

      }

    }

    requestAnimationFrame(
      animateLoading
    );

  }

  function finishLoading() {

    site.classList.add("visible");

    pageLoader.classList.add("hide");

    setTimeout(() => {

      pageLoader.remove();

    }, 900);

  }

  /* =======================================================
     STORAGE
  ======================================================= */

  function loadCart() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {

        cart = [];

        return;
      }

      const parsed =
        JSON.parse(saved);

      if (!Array.isArray(parsed)) {

        cart = [];

        return;
      }

      cart =
        parsed
          .filter(
            item =>
              item &&
              item.product === "MEMBERS" &&
              Number.isFinite(
                Number(item.quantity)
              )
          )
          .map(item => ({
            product:"MEMBERS",
            quantity:Math.max(
              1,
              Math.floor(
                Number(item.quantity)
              )
            )
          }));

    } catch (error) {

      console.error(
        "Erreur panier :",
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
        "Erreur sauvegarde panier :",
        error
      );

    }

  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function normalizeQuantity() {

    quantity =
      Math.max(
        1,
        Math.min(
          1000,
          Math.floor(
            Number(quantity) || 1
          )
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
      formatPrice(
        quantity * MEMBER_PRICE
      );

  }

  /* =======================================================
     DRAWERS
  ======================================================= */

  function closeDrawers() {

    quantityDrawer.classList.remove(
      "open"
    );

    cartDrawer.classList.remove(
      "open"
    );

    drawerOverlay.classList.remove(
      "open"
    );

    document.body.style.overflow =
      "";

  }

  function openQuantityDrawer() {

    closeDrawers();

    updateQuantityUI();

    quantityDrawer.classList.add(
      "open"
    );

    drawerOverlay.classList.add(
      "open"
    );

    document.body.style.overflow =
      "hidden";

  }

  function openCartDrawer() {

    closeDrawers();

    renderCart();

    cartDrawer.classList.add(
      "open"
    );

    drawerOverlay.classList.add(
      "open"
    );

    document.body.style.overflow =
      "hidden";

  }

  /* =======================================================
     CHOOSE
  ======================================================= */

  chooseMembersBtn.addEventListener(
    "click",
    () => {

      quantity = 1;

      openQuantityDrawer();

    }
  );

  /* =======================================================
     CLOSE
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
     QUANTITY -
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

  /* =======================================================
     QUANTITY +
  ======================================================= */

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
     ADD CART
  ======================================================= */

  addToCartBtn.addEventListener(
    "click",
    () => {

      normalizeQuantity();

      const existing =
        cart.find(
          item =>
            item.product === "MEMBERS"
        );

      if (existing) {

        existing.quantity +=
          quantity;

      } else {

        cart.push({
          product:"MEMBERS",
          quantity:quantity
        });

      }

      saveCart();

      updateCartCount();

      addToCartBtn.classList.add(
        "added"
      );

      addToCartBtn.textContent =
        "✓ Ajouté au panier";

      showToast(
        `${quantity}K MEMBERS ajouté au panier.`
      );

      setTimeout(() => {

        addToCartBtn.classList.remove(
          "added"
        );

        addToCartBtn.textContent =
          "🛒 Ajouter au panier";

      }, 900);

      setTimeout(() => {

        openCartDrawer();

      }, 350);

    }
  );

  /* =======================================================
     CART
  ======================================================= */

  function getTotalQuantity() {

    return cart.reduce(
      (total,item) =>
        total + Number(item.quantity),
      0
    );

  }

  function getCartTotal() {

    return cart.reduce(
      (total,item) =>
        total +
        Number(item.quantity) *
        MEMBER_PRICE,
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

      paypalBtn.disabled =
        true;

      return;
    }

    cart.forEach(
      (item,index) => {

        const total =
          Number(item.quantity) *
          MEMBER_PRICE;

        const element =
          document.createElement(
            "div"
          );

        element.className =
          "cartItem";

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

        cartItems.appendChild(
          element
        );

      }
    );

    cartTotal.textContent =
      formatPrice(
        getCartTotal()
      );

    paypalBtn.disabled =
      false;

    cartItems
      .querySelectorAll(".remove")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );

            if (
              !Number.isInteger(index) ||
              !cart[index]
            ) {
              return;
            }

            cart.splice(
              index,
              1
            );

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

  /* =======================================================
     OPEN CART
  ======================================================= */

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

      const url =
        `https://paypal.me/${PAYPAL_USERNAME}/${amount}`;

      window.location.href =
        url;

    }
  );

  /* =======================================================
     ESC
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

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
        : 110;

    const fragment =
      document.createDocumentFragment();

    for (
      let i = 0;
      i < amount;
      i++
    ) {

      const star =
        document.createElement(
          "span"
        );

      star.className =
        "star";

      star.style.left =
        `${Math.random() * 100}%`;

      star.style.top =
        `${Math.random() * 100}%`;

      star.style.animationDelay =
        `${Math.random() * 4}s`;

      star.style.animationDuration =
        `${2 + Math.random() * 4}s`;

      fragment.appendChild(
        star
      );

    }

    stars.appendChild(
      fragment
    );

  }

  /* =======================================================
     INIT
  ======================================================= */

  loadCart();

  updateCartCount();

  updateQuantityUI();

  createStars();

  startLoading();

});
```
