```javascript
"use strict";

/*
==============================================================
 NOVA SHOP
 MEMBERS STORE
==============================================================
*/

document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================================
     CONFIG
  ========================================================== */

  const PAYPAL_USERNAME = "SH0PNOVA";

  const MEMBER_PRICE = 5.49;
  const MEMBER_AMOUNT = 1000;

  const CART_KEY = "novashop_members_cart";


  /* ==========================================================
     DOM
  ========================================================== */

  const chooseMembers =
    document.getElementById("chooseMembers");

  const openCartButton =
    document.getElementById("openCart");

  const closeProduct =
    document.getElementById("closeProduct");

  const closeCart =
    document.getElementById("closeCart");

  const quantityMinus =
    document.getElementById("quantityMinus");

  const quantityPlus =
    document.getElementById("quantityPlus");

  const quantityInput =
    document.getElementById("quantity");

  const addToCart =
    document.getElementById("addToCart");

  const directPayPal =
    document.getElementById("directPayPal");

  const checkoutPayPal =
    document.getElementById("checkoutPayPal");

  const productModal =
    document.getElementById("productModal");

  const cartModal =
    document.getElementById("cartModal");

  const productTotal =
    document.getElementById("productTotal");

  const cartItems =
    document.getElementById("cartItems");

  const cartTotal =
    document.getElementById("cartTotal");

  const cartCount =
    document.getElementById("cartCount");

  const toast =
    document.getElementById("toast");


  /* ==========================================================
     VERIFICATION DOM
  ========================================================== */

  const requiredElements = [
    chooseMembers,
    openCartButton,
    closeProduct,
    closeCart,
    quantityMinus,
    quantityPlus,
    quantityInput,
    addToCart,
    directPayPal,
    checkoutPayPal,
    productModal,
    cartModal,
    productTotal,
    cartItems,
    cartTotal,
    cartCount,
    toast
  ];

  const missingElements =
    requiredElements.filter(
      element => !element
    );

  if (missingElements.length > 0) {

    console.error(
      "NovaShop : éléments HTML manquants.",
      missingElements
    );

    return;
  }


  /* ==========================================================
     CART
  ========================================================== */

  let cart = loadCart();


  /* ==========================================================
     PRICE
  ========================================================== */

  function formatPrice(value) {

    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR"
      }
    ).format(value);

  }


  function normalizeQuantity(value) {

    let number =
      Number(value);

    if (!Number.isFinite(number)) {
      number = 1;
    }

    number =
      Math.floor(number);

    if (number < 1) {
      number = 1;
    }

    if (number > 1000) {
      number = 1000;
    }

    return number;

  }


  function getPrice(quantity) {

    return (
      normalizeQuantity(quantity) *
      MEMBER_PRICE
    );

  }


  function getMembers(quantity) {

    return (
      normalizeQuantity(quantity) *
      MEMBER_AMOUNT
    );

  }


  /* ==========================================================
     STORAGE
  ========================================================== */

  function loadCart() {

    try {

      const saved =
        localStorage.getItem(
          CART_KEY
        );

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
        "Impossible de charger le panier :",
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
        "Impossible de sauvegarder le panier :",
        error
      );

    }

  }


  /* ==========================================================
     TOAST
  ========================================================== */

  let toastTimeout;

  function showToast(message) {

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toastTimeout
    );

    toastTimeout =
      setTimeout(
        function () {

          toast.classList.remove(
            "show"
          );

        },
        2300
      );

  }


  /* ==========================================================
     MODAL
  ========================================================== */

  function openModal(modal) {

    if (!modal) {
      return;
    }

    modal.classList.add(
      "active"
    );

    document.body.style.overflow =
      "hidden";

  }


  function closeModal(modal) {

    if (!modal) {
      return;
    }

    modal.classList.remove(
      "active"
    );

    if (
      !productModal.classList.contains(
        "active"
      ) &&
      !cartModal.classList.contains(
        "active"
      )
    ) {

      document.body.style.overflow =
        "";

    }

  }


  /* ==========================================================
     PRODUCT MODAL
  ========================================================== */

  function openProductModal() {

    quantityInput.value = 1;

    updateProductTotal();

    openModal(
      productModal
    );

  }


  function updateProductTotal() {

    const quantity =
      normalizeQuantity(
        quantityInput.value
      );

    quantityInput.value =
      quantity;

    productTotal.textContent =
      formatPrice(
        getPrice(quantity)
      );

  }


  /* ==========================================================
     CHOOSE BUTTON
  ========================================================== */

  chooseMembers.addEventListener(
    "click",
    function () {

      openProductModal();

    }
  );


  /* ==========================================================
     QUANTITY MINUS
  ========================================================== */

  quantityMinus.addEventListener(
    "click",
    function () {

      const current =
        normalizeQuantity(
          quantityInput.value
        );

      quantityInput.value =
        Math.max(
          1,
          current - 1
        );

      updateProductTotal();

    }
  );


  /* ==========================================================
     QUANTITY PLUS
  ========================================================== */

  quantityPlus.addEventListener(
    "click",
    function () {

      const current =
        normalizeQuantity(
          quantityInput.value
        );

      quantityInput.value =
        Math.min(
          1000,
          current + 1
        );

      updateProductTotal();

    }
  );


  /* ==========================================================
     QUANTITY INPUT
  ========================================================== */

  quantityInput.addEventListener(
    "input",
    function () {

      updateProductTotal();

    }
  );


  /* ==========================================================
     ADD TO CART
  ========================================================== */

  addToCart.addEventListener(
    "click",
    function () {

      const quantity =
        normalizeQuantity(
          quantityInput.value
        );


      const existing =
        cart.find(
          function (item) {

            return (
              item.id === "members"
            );

          }
        );


      if (existing) {

        existing.quantity =
          Math.min(
            1000,
            normalizeQuantity(
              existing.quantity
            ) + quantity
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

      closeModal(
        productModal
      );

      showToast(
        getMembers(quantity)
          .toLocaleString("fr-FR") +
        " MEMBERS ajoutés au panier"
      );

    }
  );


  /* ==========================================================
     OPEN CART
  ========================================================== */

  openCartButton.addEventListener(
    "click",
    function () {

      renderCart();

      openModal(
        cartModal
      );

    }
  );


  /* ==========================================================
     RENDER CART
  ========================================================== */

  function renderCart() {

    cartItems.innerHTML =
      "";


    if (cart.length === 0) {

      cartItems.innerHTML = `
        <div class="empty-cart">
          <div style="font-size:34px;margin-bottom:12px;">
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


    let total = 0;


    cart.forEach(
      function (item, index) {

        const quantity =
          normalizeQuantity(
            item.quantity
          );

        const unitPrice =
          Number(
            item.unitPrice
          ) || MEMBER_PRICE;

        const itemTotal =
          quantity * unitPrice;

        const members =
          getMembers(quantity);

        total +=
          itemTotal;


        const itemElement =
          document.createElement(
            "div"
          );

        itemElement.className =
          "cart-item";


        itemElement.innerHTML = `

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
            type="button"
            class="remove-button"
            data-index="${index}"
          >
            Supprimer
          </button>

        `;


        cartItems.appendChild(
          itemElement
        );

      }
    );


    cartTotal.textContent =
      formatPrice(total);


    const removeButtons =
      cartItems.querySelectorAll(
        ".remove-button"
      );


    removeButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            const index =
              Number(
                button.dataset.index
              );

            if (
              Number.isInteger(index) &&
              index >= 0 &&
              index < cart.length
            ) {

              cart.splice(
                index,
                1
              );

              saveCart();

              updateCartCount();

              renderCart();

              showToast(
                "Produit retiré du panier"
              );

            }

          }
        );

      }
    );

  }


  /* ==========================================================
     CART COUNT
  ========================================================== */

  function updateCartCount() {

    let count = 0;


    cart.forEach(
      function (item) {

        count +=
          normalizeQuantity(
            item.quantity
          );

      }
    );


    cartCount.textContent =
      count;

  }


  /* ==========================================================
     CLOSE PRODUCT
  ========================================================== */

  closeProduct.addEventListener(
    "click",
    function () {

      closeModal(
        productModal
      );

    }
  );


  /* ==========================================================
     CLOSE CART
  ========================================================== */

  closeCart.addEventListener(
    "click",
    function () {

      closeModal(
        cartModal
      );

    }
  );


  /* ==========================================================
     CLICK OUTSIDE
  ========================================================== */

  productModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        productModal
      ) {

        closeModal(
          productModal
        );

      }

    }
  );


  cartModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        cartModal
      ) {

        closeModal(
          cartModal
        );

      }

    }
  );


  /* ==========================================================
     ESCAPE
  ========================================================== */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeModal(
          productModal
        );

        closeModal(
          cartModal
        );

      }

    }
  );


  /* ==========================================================
     PAYPAL
  ========================================================== */

  function openPayPal(amount) {

    const cleanAmount =
      Number(amount);


    if (
      !Number.isFinite(
        cleanAmount
      ) ||
      cleanAmount <= 0
    ) {

      showToast(
        "Montant invalide"
      );

      return;

    }


    const amountString =
      cleanAmount.toFixed(2);


    const paypalUrl =
      "https://paypal.me/" +
      PAYPAL_USERNAME +
      "/" +
      amountString;


    window.open(
      paypalUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }


  /* ==========================================================
     DIRECT PAYPAL
  ========================================================== */

  directPayPal.addEventListener(
    "click",
    function () {

      const quantity =
        normalizeQuantity(
          quantityInput.value
        );

      const total =
        getPrice(quantity);

      openPayPal(
        total
      );

    }
  );


  /* ==========================================================
     CART PAYPAL
  ========================================================== */

  checkoutPayPal.addEventListener(
    "click",
    function () {

      if (
        cart.length === 0
      ) {

        showToast(
          "Ton panier est vide"
        );

        return;

      }


      let total = 0;


      cart.forEach(
        function (item) {

          const quantity =
            normalizeQuantity(
              item.quantity
            );

          const unitPrice =
            Number(
              item.unitPrice
            ) || MEMBER_PRICE;

          total +=
            quantity * unitPrice;

        }
      );


      openPayPal(
        total
      );

    }
  );


  /* ==========================================================
     STARS
  ========================================================== */

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
        ? 80
        : 170;


    for (
      let i = 0;
      i < amount;
      i++
    ) {

      const star =
        document.createElement(
          "div"
        );

      star.className =
        "star";


      const size =
        Math.random() > .92
          ? 3
          : Math.random() > .7
            ? 2
            : 1;


      star.style.width =
        size + "px";

      star.style.height =
        size + "px";


      star.style.left =
        Math.random() * 100 + "%";

      star.style.top =
        Math.random() * 100 + "%";


      star.style.setProperty(
        "--duration",
        5 + Math.random() * 9 + "s"
      );

      star.style.setProperty(
        "--blink",
        1.5 + Math.random() * 4 + "s"
      );

      star.style.setProperty(
        "--move-x",
        -20 + Math.random() * 40 + "px"
      );

      star.style.setProperty(
        "--move-y",
        -20 + Math.random() * 40 + "px"
      );


      star.style.animationDelay =
        Math.random() * 7 + "s";


      container.appendChild(
        star
      );

    }

  }


  /* ==========================================================
     CONSTELLATIONS
  ========================================================== */

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
        left: "7%",
        top: "16%",
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
      }

    ];


    patterns.forEach(
      function (pattern) {

        const constellation =
          document.createElement(
            "div"
          );

        constellation.className =
          "constellation";

        constellation.style.left =
          pattern.left;

        constellation.style.top =
          pattern.top;


        pattern.points.forEach(
          function (point) {

            const element =
              document.createElement(
                "span"
              );

            element.className =
              "point";

            element.style.left =
              point[0] + "px";

            element.style.top =
              point[1] + "px";

            constellation.appendChild(
              element
            );

          }
        );


        pattern.lines.forEach(
          function (connection) {

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
              document.createElement(
                "span"
              );

            line.className =
              "line";

            line.style.left =
              start[0] + "px";

            line.style.top =
              start[1] + "px";

            line.style.width =
              length + "px";

            line.style.transform =
              "rotate(" +
              angle +
              "deg)";


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


  /* ==========================================================
     LIGHTNINGS
  ========================================================== */

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
        ? 4
        : 8;


    for (
      let i = 0;
      i < amount;
      i++
    ) {

      const lightning =
        document.createElement(
          "div"
        );

      lightning.className =
        "lightning";


      lightning.style.left =
        Math.random() * 100 + "%";

      lightning.style.top =
        Math.random() * 100 + "%";


      lightning.style.transform =
        "rotate(" +
        (-35 + Math.random() * 70) +
        "deg)";


      lightning.style.animationDelay =
        Math.random() * 7 + "s";


      container.appendChild(
        lightning
      );

    }

  }


  /* ==========================================================
     MOUSE PARALLAX
  ========================================================== */

  window.addEventListener(
    "mousemove",
    function (event) {

      const mouseX =
        (
          event.clientX /
          window.innerWidth -
          .5
        ) * 2;


      const mouseY =
        (
          event.clientY /
          window.innerHeight -
          .5
        ) * 2;


      const constellations =
        document.querySelectorAll(
          ".constellation"
        );


      constellations.forEach(
        function (element, index) {

          const strength =
            4 + index * 2;


          element.style.marginLeft =
            mouseX *
            strength +
            "px";


          element.style.marginTop =
            mouseY *
            strength +
            "px";

        }
      );

    }
  );


  /* ==========================================================
     START
  ========================================================== */

  createStars();

  createConstellations();

  createLightnings();

  updateCartCount();

  renderCart();

  updateProductTotal();


  console.log(
    "NOVA SHOP : système chargé correctement."
  );

});
```
