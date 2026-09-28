```javascript
"use strict";

(function(){

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const PAYPAL_BASE = "https://paypal.me/SH0PNOVA";

  const STORAGE_KEY = "members_shop_cart";

  // ============================================================
  // PRODUITS
  // ============================================================

  const PRODUCTS = [
    {
      id:"members-1000",
      name:"MEMBERS",
      members:1000,
      price:5.49,
      icon:"👥",
      description:"Pack de 1 000 MEMBERS."
    },
    {
      id:"members-5000",
      name:"MEMBERS PLUS",
      members:5000,
      price:24.99,
      icon:"🔥",
      description:"Pack de 5 000 MEMBERS."
    },
    {
      id:"members-10000",
      name:"MEMBERS PRO",
      members:10000,
      price:44.99,
      icon:"💎",
      description:"Pack de 10 000 MEMBERS."
    },
    {
      id:"members-25000",
      name:"MEMBERS ULTRA",
      members:25000,
      price:99.99,
      icon:"👑",
      description:"Pack de 25 000 MEMBERS."
    }
  ];

  // ============================================================
  // ÉTAT
  // ============================================================

  let cart = [];

  let selectedProduct = null;

  let selectedQuantity = 1;

  let toastTimer = null;

  // ============================================================
  // DOM
  // ============================================================

  function $(id){
    return document.getElementById(id);
  }

  // ============================================================
  // FORMATAGE
  // ============================================================

  function formatNumber(number){
    return new Intl.NumberFormat("fr-FR").format(number);
  }

  function formatPrice(number){
    return new Intl.NumberFormat(
      "fr-FR",
      {
        style:"currency",
        currency:"EUR"
      }
    ).format(number);
  }

  // ============================================================
  // STORAGE
  // ============================================================

  function saveCart(){

    try{

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

    }catch(error){

      console.error(
        "Impossible de sauvegarder le panier :",
        error
      );

    }

  }

  function loadCart(){

    try{

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if(!saved){

        cart = [];

        return;

      }

      const parsed =
        JSON.parse(saved);

      if(Array.isArray(parsed)){

        cart = parsed.filter(item => {

          return item &&
                 typeof item.id === "string" &&
                 typeof item.quantity === "number" &&
                 item.quantity > 0;

        });

      }else{

        cart = [];

      }

    }catch(error){

      console.error(
        "Impossible de charger le panier :",
        error
      );

      cart = [];

    }

  }

  // ============================================================
  // PRODUITS
  // ============================================================

  function getProduct(productId){

    return PRODUCTS.find(
      product => product.id === productId
    );

  }

  function renderProducts(){

    const grid = $("productsGrid");

    if(!grid){

      console.error(
        "productsGrid introuvable."
      );

      return;

    }

    grid.innerHTML = "";

    PRODUCTS.forEach(product => {

      const card =
        document.createElement("article");

      card.className = "product-card";

      card.innerHTML = `
        <div>

          <div class="product-icon">
            ${product.icon}
          </div>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(product.description)}
          </p>

        </div>

        <div class="product-bottom">

          <div class="price">
            ${formatPrice(product.price)}
          </div>

          <button
            class="choose-btn"
            data-product-id="${escapeAttribute(product.id)}"
          >
            Choisir
          </button>

        </div>
      `;

      grid.appendChild(card);

    });

    grid
      .querySelectorAll(".choose-btn")
      .forEach(button => {

        button.addEventListener(
          "click",
          function(){

            openQuantity(
              this.dataset.productId
            );

          }
        );

      });

  }

  // ============================================================
  // SÉCURITÉ AFFICHAGE
  // ============================================================

  function escapeHTML(value){

    return String(value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");

  }

  function escapeAttribute(value){

    return String(value)
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");

  }

  // ============================================================
  // OVERLAY
  // ============================================================

  function openOverlay(){

    const overlay = $("overlay");

    if(overlay){

      overlay.classList.add("active");

    }

  }

  function closeOverlay(){

    const overlay = $("overlay");

    if(overlay){

      overlay.classList.remove("active");

    }

  }

  // ============================================================
  // DRAWER QUANTITÉ
  // ============================================================

  function openQuantity(productId){

    const product =
      getProduct(productId);

    if(!product){

      return;

    }

    selectedProduct = product;

    selectedQuantity = 1;

    const name =
      $("quantityProductName");

    const price =
      $("quantityProductPrice");

    const drawer =
      $("quantityDrawer");

    if(name){

      name.textContent =
        product.name;

    }

    if(price){

      price.textContent =
        `${formatPrice(product.price)} / unité`;

    }

    updateQuantityDisplay();

    if(drawer){

      drawer.classList.add("active");

    }

    openOverlay();

  }

  function closeQuantity(){

    const drawer =
      $("quantityDrawer");

    if(drawer){

      drawer.classList.remove("active");

    }

    if(!$("cartDrawer")?.classList.contains("active")){

      closeOverlay();

    }

  }

  function updateQuantityDisplay(){

    if(!selectedProduct){

      return;

    }

    const quantity =
      $("quantityValue");

    const summaryQuantity =
      $("summaryQuantity");

    const summaryMembers =
      $("summaryMembers");

    const summaryPrice =
      $("summaryPrice");

    if(quantity){

      quantity.textContent =
        selectedQuantity;

    }

    if(summaryQuantity){

      summaryQuantity.textContent =
        formatNumber(selectedQuantity);

    }

    if(summaryMembers){

      summaryMembers.textContent =
        formatNumber(
          selectedProduct.members *
          selectedQuantity
        );

    }

    if(summaryPrice){

      summaryPrice.textContent =
        formatPrice(
          selectedProduct.price *
          selectedQuantity
        );

    }

  }

  // ============================================================
  // PANIER
  // ============================================================

  function addToCart(){

    if(!selectedProduct){

      return;

    }

    const existing =
      cart.find(
        item =>
          item.id === selectedProduct.id
      );

    if(existing){

      existing.quantity +=
        selectedQuantity;

    }else{

      cart.push({

        id:selectedProduct.id,

        quantity:selectedQuantity

      });

    }

    saveCart();

    renderCart();

    updateCartCount();

    closeQuantity();

    showToast(
      `${selectedProduct.name} ajouté au panier.`
    );

  }

  function removeFromCart(productId){

    cart =
      cart.filter(
        item =>
          item.id !== productId
      );

    saveCart();

    renderCart();

    updateCartCount();

  }

  function changeCartQuantity(
    productId,
    change
  ){

    const item =
      cart.find(
        entry =>
          entry.id === productId
      );

    if(!item){

      return;

    }

    item.quantity += change;

    if(item.quantity <= 0){

      removeFromCart(productId);

      return;

    }

    saveCart();

    renderCart();

    updateCartCount();

  }

  function getCartQuantity(){

    return cart.reduce(
      (total,item) =>
        total + item.quantity,
      0
    );

  }

  function getCartMembers(){

    return cart.reduce(
      (total,item) => {

        const product =
          getProduct(item.id);

        if(!product){

          return total;

        }

        return total +
          product.members *
          item.quantity;

      },
      0
    );

  }

  function getCartTotal(){

    return cart.reduce(
      (total,item) => {

        const product =
          getProduct(item.id);

        if(!product){

          return total;

        }

        return total +
          product.price *
          item.quantity;

      },
      0
    );

  }

  function updateCartCount(){

    const counter =
      $("cartCount");

    if(counter){

      counter.textContent =
        getCartQuantity();

    }

  }

  // ============================================================
  // AFFICHAGE PANIER
  // ============================================================

  function renderCart(){

    const content =
      $("cartContent");

    if(!content){

      return;

    }

    if(cart.length === 0){

      content.innerHTML = `
        <div class="empty">
          <div style="font-size:42px;margin-bottom:15px;">
            🛒
          </div>

          <div>
            Ton panier est vide.
          </div>
        </div>
      `;

      return;

    }

    let html = "";

    cart.forEach(item => {

      const product =
        getProduct(item.id);

      if(!product){

        return;

      }

      const total =
        product.price *
        item.quantity;

      html += `
        <div class="cart-item">

          <div>

            <h3>
              ${escapeHTML(product.name)}
            </h3>

            <p>
              ${formatNumber(product.members)}
              MEMBERS ×
              ${item.quantity}
            </p>

            <p>
              ${formatPrice(product.price)}
              / unité
            </p>

          </div>

          <div class="cart-item-right">

            <strong>
              ${formatPrice(total)}
            </strong>

            <div>

              <button
                class="remove-item"
                data-action="minus"
                data-id="${escapeAttribute(product.id)}"
              >
                −
              </button>

              <span style="margin:0 8px;">
                ${item.quantity}
              </span>

              <button
                class="remove-item"
                data-action="plus"
                data-id="${escapeAttribute(product.id)}"
              >
                +
              </button>

            </div>

            <div>
              <button
                class="remove-item"
                data-action="remove"
                data-id="${escapeAttribute(product.id)}"
              >
                Supprimer
              </button>
            </div>

          </div>

        </div>
      `;

    });

    html += `
      <div class="cart-total">
        <span>Total</span>
        <span>${formatPrice(getCartTotal())}</span>
      </div>

      <div style="
        margin-top:10px;
        color:#9b93a5;
        font-size:13px;
      ">
        ${formatNumber(getCartMembers())} MEMBERS au total
      </div>

      <div class="discord-form">

        <h3>
          🎮 Informations Discord
        </h3>

        <div class="field">

          <label for="discordUsername">
            Pseudo Discord
          </label>

          <input
            id="discordUsername"
            type="text"
            maxlength="100"
            placeholder="Ton pseudo Discord"
            autocomplete="off"
          >

        </div>

        <div class="field">

          <label for="discordServer">
            Serveur Discord
          </label>

          <input
            id="discordServer"
            type="text"
            maxlength="150"
            placeholder="Nom de ton serveur"
            autocomplete="off"
          >

        </div>

        <button
          id="checkoutButton"
          class="primary-btn"
        >
          💳 Commander avec PayPal
        </button>

      </div>
    `;

    content.innerHTML = html;

    content
      .querySelectorAll("[data-action]")
      .forEach(button => {

        button.addEventListener(
          "click",
          function(){

            const action =
              this.dataset.action;

            const id =
              this.dataset.id;

            if(action === "minus"){

              changeCartQuantity(
                id,
                -1
              );

            }

            if(action === "plus"){

              changeCartQuantity(
                id,
                1
              );

            }

            if(action === "remove"){

              removeFromCart(id);

            }

          }
        );

      });

    const checkoutButton =
      $("checkoutButton");

    if(checkoutButton){

      checkoutButton.addEventListener(
        "click",
        checkout
      );

    }

  }

  // ============================================================
  // DRAWER PANIER
  // ============================================================

  function openCart(){

    const drawer =
      $("cartDrawer");

    if(drawer){

      drawer.classList.add("active");

    }

    renderCart();

    openOverlay();

  }

  function closeCart(){

    const drawer =
      $("cartDrawer");

    if(drawer){

      drawer.classList.remove("active");

    }

    if(!$("quantityDrawer")?.classList.contains("active")){

      closeOverlay();

    }

  }

  // ============================================================
  // DISCORD WEBHOOK
  // ============================================================

  async function sendDiscordOrder(
    discordUsername,
    discordServer
  ){

    const webhook =
      typeof WEBHOOK_URL !== "undefined"
        ? WEBHOOK_URL
        : "";

    if(
      !webhook ||
      webhook === "TON_WEBHOOK_ICI"
    ){

      console.warn(
        "WEBHOOK_URL n'est pas configuré."
      );

      return false;

    }

    const productsText =
      cart
        .map(item => {

          const product =
            getProduct(item.id);

          if(!product){

            return "";

          }

          const members =
            product.members *
            item.quantity;

          const total =
            product.price *
            item.quantity;

          return [
            `**${product.name}**`,
            `Quantité : ${item.quantity}`,
            `MEMBERS : ${formatNumber(members)}`,
            `Prix : ${formatPrice(total)}`
          ].join("\n");

        })
        .filter(Boolean)
        .join("\n\n");

    const message =
      typeof WEBHOOK_BOT_MESSAGE !== "undefined"
        ? WEBHOOK_BOT_MESSAGE
        : "🛒 Nouvelle commande reçue sur MEMBERS SHOP !";

    const payload = {

      content:message,

      embeds:[
        {

          title:
            "🛒 NOUVELLE COMMANDE • MEMBERS SHOP",

          description:
            "Une nouvelle commande a été initiée.",

          color:10129263,

          fields:[

            {
              name:"👤 Pseudo Discord",
              value:
                discordUsername ||
                "Non renseigné",
              inline:true
            },

            {
              name:"🏠 Serveur Discord",
              value:
                discordServer ||
                "Non renseigné",
              inline:true
            },

            {
              name:"📦 Produits",
              value:
                productsText ||
                "Aucun produit"
            },

            {
              name:"👥 Total MEMBERS",
              value:
                formatNumber(
                  getCartMembers()
                ),
              inline:true
            },

            {
              name:"💰 Total",
              value:
                formatPrice(
                  getCartTotal()
                ),
              inline:true
            },

            {
              name:"💳 Paiement",
              value:"PayPal",
              inline:true
            },

            {
              name:"📌 Statut",
              value:"Paiement à finaliser",
              inline:true
            }

          ],

          footer:{
            text:
              "MEMBERS SHOP • Notification automatique"
          },

          timestamp:
            new Date().toISOString()

        }
      ]

    };

    try{

      const response =
        await fetch(
          webhook,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      if(!response.ok){

        console.error(
          "Erreur webhook Discord :",
          response.status
        );

        return false;

      }

      return true;

    }catch(error){

      console.error(
        "Impossible d'envoyer le webhook :",
        error
      );

      return false;

    }

  }

  // ============================================================
  // CHECKOUT PAYPAL
  // ============================================================

  async function checkout(){

    if(cart.length === 0){

      showToast(
        "Ton panier est vide."
      );

      return;

    }

    const usernameInput =
      $("discordUsername");

    const serverInput =
      $("discordServer");

    const discordUsername =
      usernameInput
        ? usernameInput.value.trim()
        : "";

    const discordServer =
      serverInput
        ? serverInput.value.trim()
        : "";

    if(!discordUsername){

      showToast(
        "Entre ton pseudo Discord."
      );

      if(usernameInput){

        usernameInput.focus();

      }

      return;

    }

    if(!discordServer){

      showToast(
        "Entre ton serveur Discord."
      );

      if(serverInput){

        serverInput.focus();

      }

      return;

    }

    const total =
      getCartTotal();

    if(!Number.isFinite(total) || total <= 0){

      showToast(
        "Montant de commande invalide."
      );

      return;

    }

    const rounded =
      Math.round(
        total * 100
      ) / 100;

    const webhookSent =
      await sendDiscordOrder(
        discordUsername,
        discordServer
      );

    if(!webhookSent){

      showToast(
        "Impossible d'envoyer la commande. Vérifie le webhook."
      );

      return;

    }

    const paypalUrl =
      PAYPAL_BASE +
      "/" +
      rounded.toFixed(2);

    window.location.href =
      paypalUrl;

  }

  // ============================================================
  // TOAST
  // ============================================================

  function showToast(message){

    const toast =
      $("toast");

    if(!toast){

      return;

    }

    toast.textContent =
      message;

    toast.classList.add("active");

    clearTimeout(toastTimer);

    toastTimer =
      setTimeout(
        () => {

          toast.classList.remove(
            "active"
          );

        },
        2800
      );

  }

  // ============================================================
  // ÉVÉNEMENTS
  // ============================================================

  function setupEvents(){

    const openCartButton =
      $("openCart");

    if(openCartButton){

      openCartButton.addEventListener(
        "click",
        openCart
      );

    }

    const closeCartButton =
      $("closeCart");

    if(closeCartButton){

      closeCartButton.addEventListener(
        "click",
        closeCart
      );

    }

    const closeQuantityButton =
      $("closeQuantity");

    if(closeQuantityButton){

      closeQuantityButton.addEventListener(
        "click",
        closeQuantity
      );

    }

    const overlay =
      $("overlay");

    if(overlay){

      overlay.addEventListener(
        "click",
        function(){

          closeCart();
          closeQuantity();

        }
      );

    }

    const minusButton =
      $("minusButton");

    if(minusButton){

      minusButton.addEventListener(
        "click",
        function(){

          if(selectedQuantity > 1){

            selectedQuantity--;

            updateQuantityDisplay();

          }

        }
      );

    }

    const plusButton =
      $("plusButton");

    if(plusButton){

      plusButton.addEventListener(
        "click",
        function(){

          if(selectedQuantity < 999){

            selectedQuantity++;

            updateQuantityDisplay();

          }

        }
      );

    }

    const addCartButton =
      $("addCartButton");

    if(addCartButton){

      addCartButton.addEventListener(
        "click",
        addToCart
      );

    }

    const scrollProducts =
      $("scrollProducts");

    if(scrollProducts){

      scrollProducts.addEventListener(
        "click",
        function(){

          const section =
            $("productsSection");

          if(section){

            section.scrollIntoView({
              behavior:"smooth"
            });

          }

        }
      );

    }

    document.addEventListener(
      "keydown",
      function(event){

        if(event.key === "Escape"){

          closeCart();
          closeQuantity();

        }

      }
    );

  }

  // ============================================================
  // INITIALISATION
  // ============================================================

  function init(){

    loadCart();

    renderProducts();

    renderCart();

    updateCartCount();

    setupEvents();

    console.log(
      "MEMBERS SHOP chargé correctement."
    );

  }

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }else{

    init();

  }

})();
```
