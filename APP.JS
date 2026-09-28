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
      id: "members-1k",
      name: "MEMBERS",
      description: "Pack de 1 000 MEMBERS.",
      members: 1000,
      price: 5.49,
      icon: "👥"
    },

    {
      id: "members-5k",
      name: "MEMBERS PLUS",
      description: "Pack de 5 000 MEMBERS.",
      members: 5000,
      price: 24.99,
      icon: "⚡"
    },

    {
      id: "members-10k",
      name: "MEMBERS PRO",
      description: "Pack de 10 000 MEMBERS.",
      members: 10000,
      price: 44.99,
      icon: "🔥"
    },

    {
      id: "members-25k",
      name: "MEMBERS ULTRA",
      description: "Pack de 25 000 MEMBERS.",
      members: 25000,
      price: 99.99,
      icon: "💎"
    }

  ];


  // ============================================================
  // VARIABLES
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
  // INITIALISATION DOM
  // ============================================================

  function init(){

    const productsGrid = $("productsGrid");
    const cartCount = $("cartCount");
    const overlay = $("overlay");
    const quantityDrawer = $("quantityDrawer");
    const cartDrawer = $("cartDrawer");
    const quantityProductName = $("quantityProductName");
    const quantityProductPrice = $("quantityProductPrice");
    const quantityValue = $("quantityValue");
    const summaryQuantity = $("summaryQuantity");
    const summaryMembers = $("summaryMembers");
    const summaryPrice = $("summaryPrice");
    const cartContent = $("cartContent");
    const toastElement = $("toast");

    const openCartButton = $("openCart");
    const closeCartButton = $("closeCart");
    const closeQuantityButton = $("closeQuantity");
    const minusButton = $("minusButton");
    const plusButton = $("plusButton");
    const addCartButton = $("addCartButton");
    const scrollProductsButton = $("scrollProducts");
    const productsSection = $("productsSection");


    // ==========================================================
    // VERIFICATION
    // ==========================================================

    const missing = [];

    if(!productsGrid) missing.push("productsGrid");
    if(!cartCount) missing.push("cartCount");
    if(!overlay) missing.push("overlay");
    if(!quantityDrawer) missing.push("quantityDrawer");
    if(!cartDrawer) missing.push("cartDrawer");
    if(!quantityProductName) missing.push("quantityProductName");
    if(!quantityProductPrice) missing.push("quantityProductPrice");
    if(!quantityValue) missing.push("quantityValue");
    if(!summaryQuantity) missing.push("summaryQuantity");
    if(!summaryMembers) missing.push("summaryMembers");
    if(!summaryPrice) missing.push("summaryPrice");
    if(!cartContent) missing.push("cartContent");
    if(!toastElement) missing.push("toast");

    if(missing.length){

      console.error(
        "MEMBERS SHOP : éléments HTML manquants :",
        missing
      );

      return;

    }


    // ==========================================================
    // FORMAT
    // ==========================================================

    function formatPrice(value){

      return Number(value).toLocaleString(
        "fr-FR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ) + " €";

    }


    function formatNumber(value){

      return Number(value).toLocaleString(
        "fr-FR"
      );

    }


    // ==========================================================
    // TOAST
    // ==========================================================

    function toast(message){

      clearTimeout(toastTimer);

      toastElement.textContent = message;

      toastElement.classList.add("show");

      toastTimer = setTimeout(
        function(){

          toastElement.classList.remove("show");

        },
        2500
      );

    }


    // ==========================================================
    // SECURITE HTML
    // ==========================================================

    function escapeHTML(value){

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    }


    // ==========================================================
    // STORAGE
    // ==========================================================

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
          JSON.parse(saved);

        if(!Array.isArray(parsed)){

          cart = [];

          return;

        }

        cart =
          parsed
            .filter(function(item){

              return (
                item &&
                typeof item.id === "string" &&
                Number.isFinite(
                  Number(item.quantity)
                ) &&
                Number(item.quantity) > 0
              );

            })
            .map(function(item){

              return {
                id: item.id,
                quantity: Math.min(
                  9999,
                  Math.floor(
                    Number(item.quantity)
                  )
                )
              };

            });

      }catch(error){

        cart = [];

        console.error(
          "Erreur chargement panier :",
          error
        );

      }

    }


    // ==========================================================
    // PRODUITS
    // ==========================================================

    function getProduct(id){

      return PRODUCTS.find(
        function(product){

          return product.id === id;

        }
      ) || null;

    }


    function renderProducts(){

      productsGrid.innerHTML = "";

      PRODUCTS.forEach(
        function(product,index){

          const article =
            document.createElement("article");

          article.className = "product";

          article.innerHTML = `

            <div class="productTop">

              <div class="productIcon">
                ${product.icon}
              </div>

              <div class="productNumber">
                #${String(index + 1).padStart(2,"0")}
              </div>

            </div>

            <h2>
              ${escapeHTML(product.name)}
            </h2>

            <div class="productDescription">
              ${escapeHTML(product.description)}
            </div>

            <div class="priceRow">

              <div class="price">
                ${formatPrice(product.price)}
              </div>

              <div class="priceSuffix">
                / pack
              </div>

            </div>

            <div class="productActions">

              <button
                class="chooseButton"
                type="button"
                data-product="${escapeHTML(product.id)}"
              >
                Choisir
              </button>

              <button
                class="addDirect"
                type="button"
                data-direct="${escapeHTML(product.id)}"
                title="Ajouter au panier"
              >
                +
              </button>

            </div>

          `;

          productsGrid.appendChild(article);

        }
      );


      productsGrid
        .querySelectorAll("[data-product]")
        .forEach(function(button){

          button.addEventListener(
            "click",
            function(){

              const product =
                getProduct(
                  button.dataset.product
                );

              if(product){

                openQuantity(product);

              }

            }
          );

        });


      productsGrid
        .querySelectorAll("[data-direct]")
        .forEach(function(button){

          button.addEventListener(
            "click",
            function(){

              const product =
                getProduct(
                  button.dataset.direct
                );

              if(product){

                addToCart(
                  product,
                  1
                );

                toast(
                  product.name +
                  " ajouté au panier."
                );

              }

            }
          );

        });

    }


    // ==========================================================
    // QUANTITE
    // ==========================================================

    function openQuantity(product){

      selectedProduct = product;
      selectedQuantity = 1;

      updateQuantityUI();

      quantityDrawer.classList.add("active");
      overlay.classList.add("active");

    }


    function updateQuantityUI(){

      if(!selectedProduct){

        return;

      }

      quantityValue.textContent =
        formatNumber(
          selectedQuantity
        );

      quantityProductName.textContent =
        selectedProduct.name;

      quantityProductPrice.textContent =
        formatPrice(
          selectedProduct.price
        ) + " / pack";

      summaryQuantity.textContent =
        formatNumber(
          selectedQuantity
        );

      summaryMembers.textContent =
        formatNumber(
          selectedProduct.members *
          selectedQuantity
        );

      summaryPrice.textContent =
        formatPrice(
          selectedProduct.price *
          selectedQuantity
        );

    }


    function increaseQuantity(){

      if(selectedQuantity >= 9999){

        toast(
          "Quantité maximale atteinte."
        );

        return;

      }

      selectedQuantity++;

      updateQuantityUI();

    }


    function decreaseQuantity(){

      if(selectedQuantity <= 1){

        return;

      }

      selectedQuantity--;

      updateQuantityUI();

    }


    // ==========================================================
    // PANIER
    // ==========================================================

    function addToCart(
      product,
      quantity
    ){

      if(
        !product ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ){

        return;

      }

      const existing =
        cart.find(function(item){

          return item.id === product.id;

        });


      if(existing){

        existing.quantity =
          Math.min(
            9999,
            existing.quantity + quantity
          );

      }else{

        cart.push({

          id: product.id,

          quantity: Math.min(
            9999,
            Math.floor(quantity)
          )

        });

      }

      saveCart();

      updateCartCount();

      renderCart();

    }


    function removeFromCart(id){

      cart =
        cart.filter(function(item){

          return item.id !== id;

        });


      saveCart();

      updateCartCount();

      renderCart();

      toast(
        "Produit retiré du panier."
      );

    }


    function changeCartQuantity(
      id,
      amount
    ){

      const item =
        cart.find(function(entry){

          return entry.id === id;

        });


      if(!item){

        return;

      }


      item.quantity += amount;


      if(item.quantity <= 0){

        removeFromCart(id);

        return;

      }


      item.quantity =
        Math.min(
          9999,
          item.quantity
        );


      saveCart();

      updateCartCount();

      renderCart();

    }


    function getCartDetailed(){

      return cart
        .map(function(item){

          const product =
            getProduct(item.id);

          if(!product){

            return null;

          }

          return {

            product: product,

            quantity: item.quantity,

            subtotal:
              product.price *
              item.quantity

          };

        })
        .filter(Boolean);

    }


    function getCartTotal(){

      return getCartDetailed()
        .reduce(
          function(total,item){

            return total +
              item.subtotal;

          },
          0
        );

    }


    function getCartQuantity(){

      return cart
        .reduce(
          function(total,item){

            return total +
              item.quantity;

          },
          0
        );

    }


    function updateCartCount(){

      cartCount.textContent =
        formatNumber(
          getCartQuantity()
        );

    }


    // ==========================================================
    // AFFICHAGE PANIER
    // ==========================================================

    function renderCart(){

      const items =
        getCartDetailed();


      if(items.length === 0){

        cartContent.innerHTML = `

          <div class="empty">

            🛒

            <br><br>

            Ton panier est vide.

          </div>

        `;

        return;

      }


      let html =
        '<div class="cartItems">';


      items.forEach(
        function(item){

          html += `

            <div class="cartItem">

              <div class="cartItemTop">

                <div>

                  <div class="cartItemName">
                    ${escapeHTML(
                      item.product.name
                    )}
                  </div>

                  <div class="cartItemQty">
                    ${formatNumber(
                      item.quantity
                    )}
                    ×
                    ${formatPrice(
                      item.product.price
                    )}
                  </div>

                </div>

                <div class="cartItemPrice">
                  ${formatPrice(
                    item.subtotal
                  )}
                </div>

              </div>


              <div class="cartItemBottom">

                <button
                  class="removeButton"
                  type="button"
                  data-remove="${escapeHTML(
                    item.product.id
                  )}"
                >
                  🗑️ Supprimer
                </button>


                <div style="display:flex;gap:6px;">

                  <button
                    class="closeButton"
                    type="button"
                    style="width:34px;height:34px;"
                    data-minus="${escapeHTML(
                      item.product.id
                    )}"
                  >
                    −
                  </button>

                  <button
                    class="closeButton"
                    type="button"
                    style="width:34px;height:34px;"
                    data-plus="${escapeHTML(
                      item.product.id
                    )}"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

          `;

        }
      );


      html += "</div>";


      html += `

        <div class="cartTotal">

          <span>
            Total
          </span>

          <span>
            ${formatPrice(
              getCartTotal()
            )}
          </span>

        </div>


        <input
          class="emailInput"
          id="customerEmail"
          type="email"
          placeholder="Ton adresse email"
          autocomplete="email"
        >


        <button
          class="paypalButton"
          id="paypalCheckout"
          type="button"
        >
          💳 Payer avec PayPal
        </button>

      `;


      cartContent.innerHTML = html;


      cartContent
        .querySelectorAll("[data-remove]")
        .forEach(function(button){

          button.addEventListener(
            "click",
            function(){

              removeFromCart(
                button.dataset.remove
              );

            }
          );

        });


      cartContent
        .querySelectorAll("[data-minus]")
        .forEach(function(button){

          button.addEventListener(
            "click",
            function(){

              changeCartQuantity(
                button.dataset.minus,
                -1
              );

            }
          );

        });


      cartContent
        .querySelectorAll("[data-plus]")
        .forEach(function(button){

          button.addEventListener(
            "click",
            function(){

              changeCartQuantity(
                button.dataset.plus,
                1
              );

            }
          );

        });


      const paypalButton =
        $("paypalCheckout");


      if(paypalButton){

        paypalButton.addEventListener(
          "click",
          checkoutPayPal
        );

      }

    }


    // ==========================================================
    // DRAWERS
    // ==========================================================

    function openCart(){

      renderCart();

      cartDrawer.classList.add("active");
      overlay.classList.add("active");

    }


    function closeDrawers(){

      quantityDrawer.classList.remove("active");
      cartDrawer.classList.remove("active");
      overlay.classList.remove("active");

    }


    // ==========================================================
    // DISCORD WEBHOOK
    // ==========================================================

    async function sendDiscordOrder(){

      if(
        typeof WEBHOOK_URL === "undefined" ||
        !WEBHOOK_URL ||
        WEBHOOK_URL === "TON_WEBHOOK_ICI"
      ){

        console.warn(
          "WEBHOOK_URL non configuré."
        );

        return false;

      }


      const detailed =
        getCartDetailed();


      const emailInput =
        $("customerEmail");


      const email =
        emailInput &&
        emailInput.value.trim()
          ? emailInput.value.trim()
          : "Non renseigné";


      const productsText =
        detailed
          .map(function(item){

            return (
              "• " +
              item.product.name +
              " × " +
              formatNumber(
                item.quantity
              ) +
              " = " +
              formatPrice(
                item.subtotal
              )
            );

          })
          .join("\n");


      const totalMembers =
        detailed.reduce(
          function(total,item){

            return total +
              item.product.members *
              item.quantity;

          },
          0
        );


      const payload = {

        username:
          "MEMBERS SHOP",

        embeds: [

          {

            title:
              "🛒 NOUVELLE COMMANDE • MEMBERS SHOP",

            description:
              "Une nouvelle commande vient d'être initiée.",

            color:
              9463807,

            fields: [

              {

                name: "📦 Produits",

                value:
                  productsText ||
                  "Aucun",

                inline: false

              },

              {

                name: "👥 MEMBERS",

                value:
                  formatNumber(
                    totalMembers
                  ),

                inline: true

              },

              {

                name: "💰 Total",

                value:
                  formatPrice(
                    getCartTotal()
                  ),

                inline: true

              },

              {

                name: "📧 Email",

                value:
                  email,

                inline: false

              },

              {

                name: "💳 Paiement",

                value:
                  "PayPal",

                inline: true

              },

              {

                name: "📊 Statut",

                value:
                  "Paiement à finaliser",

                inline: true

              }

            ],

            footer: {

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
            WEBHOOK_URL,
            {

              method: "POST",

              headers: {

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

          console.error(
            "Discord HTTP :",
            response.status
          );

          return false;

        }


        return true;

      }catch(error){

        console.error(
          "Erreur webhook Discord :",
          error
        );

        return false;

      }

    }


    // ==========================================================
    // CHECKOUT PAYPAL
    // ==========================================================

    async function checkoutPayPal(){

      const detailed =
        getCartDetailed();


      if(detailed.length === 0){

        toast(
          "Ton panier est vide."
        );

        return;

      }


      const total =
        getCartTotal();


      const amount =
        Number(
          total.toFixed(2)
        );


      if(
        !Number.isFinite(amount) ||
        amount <= 0
      ){

        toast(
          "Montant invalide."
        );

        return;

      }


      const emailInput =
        $("customerEmail");


      if(emailInput){

        const email =
          emailInput.value.trim();


        if(
          email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
          )
        ){

          toast(
            "Adresse email invalide."
          );

          emailInput.focus();

          return;

        }

      }


      toast(
        "Commande préparée..."
      );


      await sendDiscordOrder();


      const paypalUrl =
        PAYPAL_BASE +
        "/" +
        amount.toFixed(2);


      setTimeout(
        function(){

          window.location.href =
            paypalUrl;

        },
        350
      );

    }


    // ==========================================================
    // EVENTS
    // ==========================================================

    if(openCartButton){

      openCartButton.addEventListener(
        "click",
        openCart
      );

    }


    if(closeCartButton){

      closeCartButton.addEventListener(
        "click",
        closeDrawers
      );

    }


    if(closeQuantityButton){

      closeQuantityButton.addEventListener(
        "click",
        closeDrawers
      );

    }


    overlay.addEventListener(
      "click",
      closeDrawers
    );


    if(minusButton){

      minusButton.addEventListener(
        "click",
        decreaseQuantity
      );

    }


    if(plusButton){

      plusButton.addEventListener(
        "click",
        increaseQuantity
      );

    }


    if(addCartButton){

      addCartButton.addEventListener(
        "click",
        function(){

          if(!selectedProduct){

            toast(
              "Aucun produit sélectionné."
            );

            return;

          }


          addToCart(
            selectedProduct,
            selectedQuantity
          );


          toast(
            selectedProduct.name +
            " ajouté au panier."
          );


          closeDrawers();

        }
      );

    }


    if(
      scrollProductsButton &&
      productsSection
    ){

      scrollProductsButton.addEventListener(
        "click",
        function(){

          productsSection.scrollIntoView({
            behavior: "smooth"
          });

        }
      );

    }


    document.addEventListener(
      "keydown",
      function(event){

        if(event.key === "Escape"){

          closeDrawers();

        }

      }
    );


    // ==========================================================
    // DEMARRAGE
    // ==========================================================

    loadCart();

    renderProducts();

    renderCart();

    updateCartCount();

    console.log(
      "MEMBERS SHOP chargé correctement."
    );

  }


  // ============================================================
  // LANCEMENT
  // ============================================================

  if(
    document.readyState === "loading"
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
