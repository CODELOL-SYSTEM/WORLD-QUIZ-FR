```javascript
"use strict";

(function(){

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const PAYPAL_BASE =
    "https://paypal.me/SH0PNOVA";

  const STORAGE_KEY =
    "members_shop_cart";


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

    return new Intl.NumberFormat(
      "fr-FR"
    ).format(number);

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
  // ID COMMANDE
  // ============================================================

  function generateOrderId(){

    const now =
      new Date();

    const date =
      now
        .toISOString()
        .replace(
          /[-:TZ.]/g,
          ""
        )
        .slice(
          0,
          14
        );

    const random =
      Math.random()
        .toString(36)
        .substring(
          2,
          8
        )
        .toUpperCase();

    return (
      "MS-" +
      date +
      "-" +
      random
    );

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
        "Erreur sauvegarde panier :",
        error
      );

    }

  }


  function loadCart(){

    try{

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if(!saved){

        cart = [];

        return;

      }


      const parsed =
        JSON.parse(
          saved
        );


      if(Array.isArray(parsed)){

        cart =
          parsed.filter(
            item => {

              return (
                item &&
                typeof item.id === "string" &&
                typeof item.quantity === "number" &&
                Number.isFinite(item.quantity) &&
                item.quantity > 0
              );

            }
          );

      }else{

        cart = [];

      }

    }catch(error){

      console.error(
        "Erreur chargement panier :",
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
      product =>
        product.id === productId
    );

  }


  function renderProducts(){

    const grid =
      $("productsGrid");


    if(!grid){

      console.error(
        "productsGrid introuvable."
      );

      return;

    }


    grid.innerHTML = "";


    PRODUCTS.forEach(
      product => {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "product-card";


        card.innerHTML = `

          <div>

            <div class="product-icon">
              ${product.icon}
            </div>


            <h3>
              ${escapeHTML(
                product.name
              )}
            </h3>


            <p>
              ${escapeHTML(
                product.description
              )}
            </p>


            <div class="product-members">
              👥 ${formatNumber(
                product.members
              )} MEMBERS
            </div>

          </div>


          <div class="product-bottom">

            <div class="price">
              ${formatPrice(
                product.price
              )}
            </div>


            <button
              class="choose-btn"
              type="button"
              data-product-id="${escapeAttribute(
                product.id
              )}"
            >
              Choisir
            </button>

          </div>

        `;


        grid.appendChild(
          card
        );

      }
    );


    grid
      .querySelectorAll(
        ".choose-btn"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function(){

              openQuantity(
                this.dataset.productId
              );

            }
          );

        }
      );

  }


  // ============================================================
  // SÉCURITÉ AFFICHAGE
  // ============================================================

  function escapeHTML(value){

    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  function escapeAttribute(value){

    return String(value)

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  // ============================================================
  // OVERLAY
  // ============================================================

  function openOverlay(){

    const overlay =
      $("overlay");


    if(overlay){

      overlay.classList.add(
        "active"
      );

    }

  }


  function closeOverlay(){

    const overlay =
      $("overlay");


    if(overlay){

      overlay.classList.remove(
        "active"
      );

    }

  }


  // ============================================================
  // QUANTITÉ
  // ============================================================

  function openQuantity(
    productId
  ){

    const product =
      getProduct(
        productId
      );


    if(!product){

      return;

    }


    selectedProduct =
      product;

    selectedQuantity =
      1;


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
        `${formatPrice(
          product.price
        )} / unité`;

    }


    updateQuantityDisplay();


    if(drawer){

      drawer.classList.add(
        "active"
      );

    }


    openOverlay();

  }


  function closeQuantity(){

    const drawer =
      $("quantityDrawer");


    if(drawer){

      drawer.classList.remove(
        "active"
      );

    }


    const cartDrawer =
      $("cartDrawer");


    if(
      !cartDrawer ||
      !cartDrawer.classList.contains(
        "active"
      )
    ){

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
        formatNumber(
          selectedQuantity
        );

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
          item.id ===
          selectedProduct.id
      );


    if(existing){

      existing.quantity +=
        selectedQuantity;

    }else{

      cart.push({

        id:
          selectedProduct.id,

        quantity:
          selectedQuantity

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


  function removeFromCart(
    productId
  ){

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


    item.quantity +=
      change;


    if(item.quantity <= 0){

      removeFromCart(
        productId
      );

      return;

    }


    saveCart();

    renderCart();

    updateCartCount();

  }


  function getCartQuantity(){

    return cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  }


  function getCartMembers(){

    return cart.reduce(
      (
        total,
        item
      ) => {

        const product =
          getProduct(
            item.id
          );


        if(!product){

          return total;

        }


        return (
          total +
          product.members *
          item.quantity
        );

      },
      0
    );

  }


  function getCartTotal(){

    return cart.reduce(
      (
        total,
        item
      ) => {

        const product =
          getProduct(
            item.id
          );


        if(!product){

          return total;

        }


        return (
          total +
          product.price *
          item.quantity
        );

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
  // PANIER
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

          <div
            style="
              font-size:44px;
              margin-bottom:15px;
            "
          >
            🛒
          </div>


          <strong>
            Ton panier est vide.
          </strong>


          <p
            style="
              margin-top:8px;
            "
          >
            Ajoute un pack pour commencer.
          </p>

        </div>

      `;

      return;

    }


    let html = "";


    cart.forEach(
      item => {

        const product =
          getProduct(
            item.id
          );


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
                ${escapeHTML(
                  product.name
                )}
              </h3>


              <p>
                ${formatNumber(
                  product.members
                )}
                MEMBERS ×
                ${item.quantity}
              </p>


              <p>
                ${formatPrice(
                  product.price
                )}
                / unité
              </p>

            </div>


            <div class="cart-item-right">

              <strong>
                ${formatPrice(
                  total
                )}
              </strong>


              <div>

                <button
                  class="remove-item"
                  type="button"
                  data-action="minus"
                  data-id="${escapeAttribute(
                    product.id
                  )}"
                >
                  −
                </button>


                <span
                  style="
                    margin:0 8px;
                  "
                >
                  ${item.quantity}
                </span>


                <button
                  class="remove-item"
                  type="button"
                  data-action="plus"
                  data-id="${escapeAttribute(
                    product.id
                  )}"
                >
                  +
                </button>

              </div>


              <button
                class="remove-item"
                type="button"
                data-action="remove"
                data-id="${escapeAttribute(
                  product.id
                )}"
              >
                Supprimer
              </button>

            </div>

          </div>

        `;

      }
    );


    html += `

      <div class="cart-total">

        <span>
          Total
        </span>

        <span>
          ${formatPrice(
            getCartTotal()
          )}
        </span>

      </div>


      <div class="members-total">

        👥
        ${formatNumber(
          getCartMembers()
        )}
        MEMBERS au total

      </div>


      <div class="discord-form">

        <h3>
          🎮 Informations Discord
        </h3>


        <p class="discord-description">

          Renseigne les informations qui permettront
          d'identifier ta commande sur Discord.

        </p>


        <div class="field">

          <label
            for="discordUsername"
          >
            Pseudo Discord
          </label>


          <input
            id="discordUsername"
            type="text"
            maxlength="100"
            placeholder="Ex : Alex"
            autocomplete="off"
          >

        </div>


        <div class="field">

          <label
            for="discordServer"
          >
            Serveur Discord
          </label>


          <input
            id="discordServer"
            type="text"
            maxlength="150"
            placeholder="Ex : Mon serveur"
            autocomplete="off"
          >

        </div>


        <button
          id="checkoutButton"
          class="primary-btn"
          type="button"
        >
          💳 Commander avec PayPal
        </button>

      </div>

    `;


    content.innerHTML =
      html;


    // ==========================================================
    // ACTIONS
    // ==========================================================

    content
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function(){

              const action =
                this.dataset.action;

              const id =
                this.dataset.id;


              if(
                action === "minus"
              ){

                changeCartQuantity(
                  id,
                  -1
                );

              }


              if(
                action === "plus"
              ){

                changeCartQuantity(
                  id,
                  1
                );

              }


              if(
                action === "remove"
              ){

                removeFromCart(
                  id
                );

              }

            }
          );

        }
      );


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

      drawer.classList.add(
        "active"
      );

    }


    renderCart();

    openOverlay();

  }


  function closeCart(){

    const drawer =
      $("cartDrawer");


    if(drawer){

      drawer.classList.remove(
        "active"
      );

    }


    const quantityDrawer =
      $("quantityDrawer");


    if(
      !quantityDrawer ||
      !quantityDrawer.classList.contains(
        "active"
      )
    ){

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
        ? String(
            WEBHOOK_URL
          ).trim()
        : "";


    if(
      !webhook ||
      webhook ===
        "https://discord.com/api/webhooks/1554159540147196074/7-OTjKnXep7B7zzlGuQTtcyHdH4bFeyGgEPfr0wnvlK1YH8U30kNKt60H26jrcDcrx3e"
    ){

      console.error(
        "WEBHOOK_URL non configuré."
      );

      return false;

    }


    const username =
      String(
        discordUsername || ""
      ).trim();


    const server =
      String(
        discordServer || ""
      ).trim();


    if(!username){

      return false;

    }


    if(!server){

      return false;

    }


    // ==========================================================
    // COMMANDE
    // ==========================================================

    const orderId =
      generateOrderId();


    const totalMembers =
      getCartMembers();


    const totalPrice =
      getCartTotal();


    // ==========================================================
    // PRODUITS
    // ==========================================================

    const productsText =
      cart
        .map(
          item => {

            const product =
              getProduct(
                item.id
              );


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

              `MEMBERS : ${formatNumber(
                members
              )}`,

              `Prix : ${formatPrice(
                total
              )}`

            ].join("\n");

          }
        )
        .filter(Boolean)
        .join("\n\n");


    // ==========================================================
    // DATE
    // ==========================================================

    const orderDate =
      new Date();


    const formattedDate =
      orderDate.toLocaleString(
        "fr-FR",
        {
          dateStyle:"short",
          timeStyle:"medium"
        }
      );


    // ==========================================================
    // MESSAGE PRINCIPAL
    // ==========================================================

    const baseMessage =
      typeof WEBHOOK_BOT_MESSAGE !==
      "undefined"

        ? String(
            WEBHOOK_BOT_MESSAGE
          )

        : "🛒 Nouvelle commande reçue sur MEMBERS SHOP !";


    const contentMessage = [

      baseMessage,

      "",

      `👤 **Utilisateur :** ${username}`,

      `🏠 **Serveur :** ${server}`,

      `🆔 **Commande :** ${orderId}`,

      `💰 **Prix :** ${formatPrice(
        totalPrice
      )}`,

      `👥 **MEMBERS :** ${formatNumber(
        totalMembers
      )}`

    ].join("\n");


    // ==========================================================
    // PAYLOAD
    // ==========================================================

    const payload = {

      username:
        "MEMBERS SHOP",

      content:
        contentMessage,


      allowed_mentions:{
        parse:[]
      },


      embeds:[

        {

          title:
            "🛒 NOUVELLE COMMANDE",


          description:
            "Une nouvelle commande vient d'être créée sur MEMBERS SHOP.",


          color:
            10129263,


          fields:[

            {
              name:
                "👤 Utilisateur",

              value:
                username,

              inline:
                true
            },


            {
              name:
                "🏠 Serveur Discord",

              value:
                server,

              inline:
                true
            },


            {
              name:
                "🆔 ID commande",

              value:
                orderId,

              inline:
                true
            },


            {
              name:
                "📦 Produits",

              value:
                productsText ||
                "Aucun produit",

              inline:
                false
            },


            {
              name:
                "👥 Nombre de MEMBERS",

              value:
                formatNumber(
                  totalMembers
                ),

              inline:
                true
            },


            {
              name:
                "💰 Prix total",

              value:
                formatPrice(
                  totalPrice
                ),

              inline:
                true
            },


            {
              name:
                "💳 Paiement",

              value:
                "PayPal",

              inline:
                true
            },


            {
              name:
                "📌 Statut",

              value:
                "Paiement à finaliser",

              inline:
                true
            },


            {
              name:
                "🕐 Date",

              value:
                formattedDate,

              inline:
                false
            }

          ],


          footer:{
            text:
              "MEMBERS SHOP • Commande automatique"
          },


          timestamp:
            orderDate.toISOString()

        }

      ]

    };


    // ==========================================================
    // ENVOI
    // ==========================================================

    try{

      console.log(
        "Envoi webhook..."
      );


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
              JSON.stringify(
                payload
              )
          }
        );


      if(!response.ok){

        const errorText =
          await response
            .text()
            .catch(
              () => ""
            );


        console.error(
          "Discord webhook error:",
          response.status,
          errorText
        );


        return false;

      }


      console.log(
        "Commande envoyée."
      );


      return true;

    }catch(error){

      console.error(
        "Erreur réseau webhook :",
        error
      );


      return false;

    }

  }


  // ============================================================
  // CHECKOUT
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
        ? String(
            usernameInput.value
          ).trim()
        : "";


    const discordServer =
      serverInput
        ? String(
            serverInput.value
          ).trim()
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


    if(
      !Number.isFinite(total) ||
      total <= 0
    ){

      showToast(
        "Montant invalide."
      );

      return;

    }


    const rounded =
      Math.round(
        total * 100
      ) / 100;


    const button =
      $("checkoutButton");


    if(button){

      button.disabled =
        true;

      button.textContent =
        "⏳ Envoi de la commande...";

    }


    showToast(
      "Envoi de la commande..."
    );


    // ==========================================================
    // WEBHOOK
    // ==========================================================

    const webhookSent =
      await sendDiscordOrder(
        discordUsername,
        discordServer
      );


    if(!webhookSent){

      if(button){

        button.disabled =
          false;

        button.textContent =
          "💳 Commander avec PayPal";

      }


      showToast(
        "Erreur lors de l'envoi Discord."
      );


      return;

    }


    // ==========================================================
    // PAYPAL
    // ==========================================================

    const paypalUrl =
      PAYPAL_BASE +
      "/" +
      rounded.toFixed(2);


    showToast(
      "Commande enregistrée. Redirection PayPal..."
    );


    setTimeout(
      function(){

        window.location.href =
          paypalUrl;

      },
      500
    );

  }


  // ============================================================
  // TOAST
  // ============================================================

  function showToast(
    message
  ){

    const toast =
      $("toast");


    if(!toast){

      return;

    }


    toast.textContent =
      message;


    toast.classList.add(
      "active"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      setTimeout(
        function(){

          toast.classList.remove(
            "active"
          );

        },
        3000
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

          if(
            selectedQuantity > 1
          ){

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

          if(
            selectedQuantity < 999
          ){

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

        if(
          event.key ===
          "Escape"
        ){

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
      "MEMBERS SHOP PRO chargé."
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
