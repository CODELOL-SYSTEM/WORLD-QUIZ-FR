```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     CONFIGURATION
  ========================================================= */

  const PAYPAL_USERNAME = "SH0PNOVA";

  const MEMBER_PRICE = 5.49;

  const STORAGE_KEY = "novashop_members_cart";

  const MAX_QUANTITY = 1000;

  let quantity = 1;

  let cart = [];

  let toastTimer = null;

  /* =========================================================
     ELEMENTS
  ========================================================= */

  const pageLoader =
    document.getElementById("pageLoader");

  const loaderProgressBar =
    document.getElementById("loaderProgressBar");

  const loaderPercent =
    document.getElementById("loaderPercent");

  const loaderText =
    document.getElementById("loaderText");

  const fireTransition =
    document.getElementById("fireTransition");

  const site =
    document.getElementById("site");

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

  const cartSubtitle =
    document.getElementById("cartSubtitle");

  const paypalBtn =
    document.getElementById("paypalBtn");

  const actionLoading =
    document.getElementById("actionLoading");

  const actionLoadingText =
    document.getElementById("actionLoadingText");

  const toast =
    document.getElementById("toast");


  /* =========================================================
     VERIFICATION
  ========================================================= */

  const requiredElements = [
    pageLoader,
    loaderProgressBar,
    loaderPercent,
    loaderText,
    fireTransition,
    site,
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
    cartSubtitle,
    paypalBtn,
    actionLoading,
    actionLoadingText,
    toast
  ];

  if (requiredElements.some((element) => !element)) {

    console.error(
      "NOVASHOP : un élément HTML est introuvable."
    );

    return;
  }


  /* =========================================================
     UTILITAIRES
  ========================================================= */

  function formatPrice(value) {

    return Number(value).toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ) + " €";
  }


  function getTotalMembers() {

    return quantity * 1000;
  }


  function getCartTotal() {

    return cart.reduce(
      (total, item) => {
        return total + (item.quantity * MEMBER_PRICE);
      },
      0
    );
  }


  function getCartQuantity() {

    return cart.reduce(
      (total, item) => {
        return total + item.quantity;
      },
      0
    );
  }


  function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

      toast.classList.remove("show");

    }, 2400);
  }


  /* =========================================================
     LOCAL STORAGE
  ========================================================= */

  function loadCart() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

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

      cart = parsed
        .filter(
          item =>
            item &&
            item.id === "members" &&
            Number.isFinite(Number(item.quantity))
        )
        .map(item => ({
          id: "members",
          name: "1K MEMBERS",
          quantity: Math.max(
            1,
            Math.floor(Number(item.quantity))
          ),
          unitPrice: MEMBER_PRICE
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


  /* =========================================================
     LOADING PRINCIPAL 3 SECONDES
  ========================================================= */

  function startMainLoading() {

    const duration = 3000;

    const start =
      performance.now();

    const loadingMessages = [
      "Chargement du produit",
      "Préparation de MEMBERS",
      "Initialisation de NOVASHOP",
      "Sécurisation de la session",
      "Presque prêt"
    ];


    function updateLoading(now) {

      const elapsed =
        now - start;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );

      const percentage =
        Math.floor(progress * 100);

      loaderProgressBar.style.width =
        `${percentage}%`;

      loaderPercent.textContent =
        `${percentage}%`;

      const index =
        Math.min(
          loadingMessages.length - 1,
          Math.floor(
            progress *
            loadingMessages.length
          )
        );

      loaderText.textContent =
        loadingMessages[index];


      if (progress < 1) {

        requestAnimationFrame(
          updateLoading
        );

        return;
      }


      finishMainLoading();
    }


    requestAnimationFrame(
      updateLoading
    );
  }


  /* =========================================================
     FLAMME + CENDRES
  ========================================================= */

  function finishMainLoading() {

    fireTransition.classList.add("active");

    createAsh();

    setTimeout(() => {

      fireTransition.classList.add(
        "ashMode"
      );

    }, 850);


    setTimeout(() => {

      site.classList.add("visible");

    }, 1250);


    setTimeout(() => {

      pageLoader.classList.add("hide");

    }, 1350);


    setTimeout(() => {

      fireTransition.classList.remove(
        "active"
      );

      fireTransition.classList.remove(
        "ashMode"
      );

    }, 3000);
  }


  function createAsh() {

    fireTransition
      .querySelectorAll(".ash")
      .forEach(
        element => element.remove()
      );


    for (let i = 0; i < 90; i++) {

      const particle =
        document.createElement("span");

      particle.className = "ash";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.top =
        `${20 + Math.random() * 45}%`;

      particle.style.setProperty(
        "--x",
        `${(Math.random() - 0.5) * 350}px`
      );

      particle.style.setProperty(
        "--y",
        `${120 + Math.random() * 500}px`
      );

      particle.style.animationDelay =
        `${Math.random() * 0.8}s`;

      particle.style.width =
        `${2 + Math.random() * 6}px`;

      particle.style.height =
        particle.style.width;

      fireTransition.appendChild(
        particle
      );
    }
  }


  /* =========================================================
     DRAWERS
  ========================================================= */

  function closeDrawers() {

    quantityDrawer.classList.remove("open");

    cartDrawer.classList.remove("open");

    drawerOverlay.classList.remove("open");

    quantityDrawer.setAttribute(
      "aria-hidden",
      "true"
    );

    cartDrawer.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";
  }


  function openQuantityDrawer() {

    cartDrawer.classList.remove("open");

    quantityDrawer.classList.add("open");

    drawerOverlay.classList.add("open");

    quantityDrawer.setAttribute(
      "aria-hidden",
      "false"
    );

    cartDrawer.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "hidden";

    updateQuantityUI();
  }


  function openCartDrawer() {

    quantityDrawer.classList.remove("open");

    cartDrawer.classList.add("open");

    drawerOverlay.classList.add("open");

    quantityDrawer.setAttribute(
      "aria-hidden",
      "true"
    );

    cartDrawer.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";

    renderCart();
  }


  /* =========================================================
     QUANTITE
  ========================================================= */

  function normalizeQuantity() {

    quantity =
      Math.max(
        1,
        Math.min(
          MAX_QUANTITY,
          Math.floor(Number(quantity) || 1)
        )
      );
  }


  function updateQuantityUI() {

    normalizeQuantity();

    quantityValue.textContent =
      quantity.toLocaleString("fr-FR");

    memberAmountLabel.textContent =
      `${(quantity * 1000).toLocaleString("fr-FR")} MEMBERS`;

    quantityTotal.textContent =
      formatPrice(
        quantity * MEMBER_PRICE
      );

    decreaseBtn.disabled =
      quantity <= 1;

    increaseBtn.disabled =
      quantity >= MAX_QUANTITY;

    decreaseBtn.style.opacity =
      quantity <= 1 ? ".35" : "1";

    increaseBtn.style.opacity =
      quantity >= MAX_QUANTITY ? ".35" : "1";
  }


  decreaseBtn.addEventListener(
    "click",
    () => {

      if (quantity <= 1) {
        return;
      }

      quantity--;

      updateQuantityUI();
    }
  );


  increaseBtn.addEventListener(
    "click",
    () => {

      if (quantity >= MAX_QUANTITY) {

        showToast(
          "La quantité maximale est atteinte."
        );

        return;
      }

      quantity++;

      updateQuantityUI();
    }
  );


  /* =========================================================
     OUVERTURE CHOIX
  ========================================================= */

  chooseMembersBtn.addEventListener(
    "click",
    () => {

      openQuantityDrawer();

    }
  );


  closeQuantityBtn.addEventListener(
    "click",
    () => {

      closeDrawers();

    }
  );


  closeCartBtn.addEventListener(
    "click",
    () => {

      closeDrawers();

    }
  );


  drawerOverlay.addEventListener(
    "click",
    () => {

      closeDrawers();

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeDrawers();

      }

    }
  );


  /* =========================================================
     AJOUT AU PANIER
     CHARGEMENT EXACTEMENT 1 SEC
  ========================================================= */

  addToCartBtn.addEventListener(
    "click",
    async () => {

      normalizeQuantity();

      actionLoadingText.textContent =
        "Ajout du produit…";

      actionLoading.classList.add(
        "active"
      );

      addToCartBtn.disabled = true;


      await wait(1000);


      const existing =
        cart.find(
          item =>
            item.id === "members"
        );


      if (existing) {

        existing.quantity += quantity;

      } else {

        cart.push({
          id: "members",
          name: "1K MEMBERS",
          quantity: quantity,
          unitPrice: MEMBER_PRICE
        });

      }


      saveCart();

      updateCartCount();

      addToCartBtn.disabled = false;

      actionLoading.classList.remove(
        "active"
      );

      closeDrawers();

      showToast(
        `${quantity.toLocaleString("fr-FR")} pack${quantity > 1 ? "s" : ""} ajouté${quantity > 1 ? "s" : ""} au panier.`
      );


      setTimeout(() => {

        openCartDrawer();

      }, 250);
    }
  );


  /* =========================================================
     PANIER
  ========================================================= */

  heroCartBtn.addEventListener(
    "click",
    async () => {

      openCartDrawer();

      /*
       * Si panier vide :
       * affichage du chargement pendant 1 seconde.
       */

      if (cart.length === 0) {

        actionLoadingText.textContent =
          "Chargement des produits…";

        actionLoading.classList.add(
          "active"
        );

        cartItems.innerHTML = "";

        await wait(1000);

        actionLoading.classList.remove(
          "active"
        );

        renderCart();

        return;
      }

      renderCart();
    }
  );


  function renderCart() {

    updateCartCount();

    const total =
      getCartTotal();

    const totalQuantity =
      getCartQuantity();


    cartSubtitle.textContent =
      totalQuantity === 0
        ? "0 produit"
        : `${totalQuantity.toLocaleString("fr-FR")} pack${totalQuantity > 1 ? "s" : ""}`;


    cartTotal.textContent =
      formatPrice(total);


    paypalBtn.disabled =
      cart.length === 0 ||
      total <= 0;


    if (cart.length === 0) {

      cartItems.innerHTML = `
        <div class="emptyCart">
          <div class="emptyIcon">🛒</div>
          <strong>Votre panier est vide</strong>
          <span>
            Ajoutez une quantité de MEMBERS
            pour commencer votre commande.
          </span>
        </div>
      `;

      return;
    }


    cartItems.innerHTML =
      cart.map(
        (item, index) => {

          const members =
            item.quantity * 1000;

          const itemTotal =
            item.quantity *
            MEMBER_PRICE;

          return `
            <div
              class="cartItem"
              style="animation-delay:${index * 70}ms"
            >

              <div class="cartItemInfo">

                <small>MEMBERS</small>

                <strong>
                  ${members.toLocaleString("fr-FR")} MEMBERS
                </strong>

                <span>
                  ${item.quantity.toLocaleString("fr-FR")} pack${item.quantity > 1 ? "s" : ""}
                  · ${formatPrice(MEMBER_PRICE)} / 1K
                </span>

              </div>

              <div class="cartItemRight">

                <div class="cartItemPrice">
                  ${formatPrice(itemTotal)}
                </div>

                <button
                  type="button"
                  class="removeButton"
                  data-index="${index}"
                >
                  Supprimer
                </button>

              </div>

            </div>
          `;
        }
      ).join("");


    cartItems
      .querySelectorAll(".removeButton")
      .forEach(
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


  function removeCartItem(index) {

    if (
      index < 0 ||
      index >= cart.length
    ) {
      return;
    }

    cart.splice(index, 1);

    saveCart();

    renderCart();

    showToast(
      "Produit retiré du panier."
    );
  }


  function updateCartCount() {

    const count =
      getCartQuantity();

    cartCount.textContent =
      count > 999
        ? "999+"
        : count.toLocaleString("fr-FR");
  }


  /* =========================================================
     PAYPAL
  ========================================================= */

  paypalBtn.addEventListener(
    "click",
    () => {

      const total =
        getCartTotal();


      if (
        cart.length === 0 ||
        total <= 0
      ) {

        showToast(
          "Votre panier est vide."
        );

        return;
      }


      const amount =
        total.toFixed(2);


      const paypalUrl =
        `https://paypal.me/${PAYPAL_USERNAME}/${amount}`;


      /*
       * Navigation directe :
       * fonctionne même si le navigateur bloque
       * les ouvertures de nouvelles fenêtres.
       */

      window.location.href =
        paypalUrl;
    }
  );


  /* =========================================================
     ETOILES
  ========================================================= */

  function createStars() {

    const amount =
      window.innerWidth < 600
        ? 70
        : 130;


    stars.innerHTML = "";


    for (let i = 0; i < amount; i++) {

      const star =
        document.createElement("span");

      star.className = "star";

      star.style.left =
        `${Math.random() * 100}%`;

      star.style.top =
        `${Math.random() * 100}%`;

      star.style.setProperty(
        "--duration",
        `${2 + Math.random() * 5}s`
      );

      star.style.animationDelay =
        `${Math.random() * 5}s`;

      star.style.opacity =
        `${0.1 + Math.random() * 0.45}`;

      stars.appendChild(star);
    }
  }


  /* =========================================================
     ATTENTE
  ========================================================= */

  function wait(milliseconds) {

    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          milliseconds
        )
    );
  }


  /* =========================================================
     RESIZE
  ========================================================= */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(
        () => {

          createStars();

        },
        200
      );
    }
  );


  /* =========================================================
     INITIALISATION
  ========================================================= */

  loadCart();

  updateCartCount();

  updateQuantityUI();

  createStars();

  startMainLoading();

});
```
