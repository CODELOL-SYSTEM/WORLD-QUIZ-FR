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
      id:"members-1k",
      name:"MEMBERS",
      description:"Pack de 1 000 MEMBERS.",
      members:1000,
      price:5.49,
      icon:"👥"
    },

    {
      id:"members-5k",
      name:"MEMBERS PLUS",
      description:"Pack de 5 000 MEMBERS.",
      members:5000,
      price:24.99,
      icon:"⚡"
    },

    {
      id:"members-10k",
      name:"MEMBERS PRO",
      description:"Pack de 10 000 MEMBERS.",
      members:10000,
      price:44.99,
      icon:"🔥"
    },

    {
      id:"members-25k",
      name:"MEMBERS ULTRA",
      description:"Pack de 25 000 MEMBERS.",
      members:25000,
      price:99.99,
      icon:"💎"
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

  const $ = id =>
    document.getElementById(id);


  const productsGrid =
    $("productsGrid");

  const cartCount =
    $("cartCount");

  const overlay =
    $("overlay");

  const quantityDrawer =
    $("quantityDrawer");

  const cartDrawer =
    $("cartDrawer");

  const quantityProductName =
    $("quantityProductName");

  const quantityProductPrice =
    $("quantityProductPrice");

  const quantityValue =
    $("quantityValue");

  const summaryQuantity =
    $("summaryQuantity");

  const summaryMembers =
    $("summaryMembers");

  const summaryPrice =
    $("summaryPrice");

  const cartContent =
    $("cartContent");

  const toastElement =
    $("toast");


  // ============================================================
  // FORMAT
  // ============================================================

  function formatPrice(value){

    return value.toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    ) + " €";

  }


  function formatNumber(value){

    return value.toLocaleString(
      "fr-FR"
    );

  }


  // ============================================================
  // TOAST
  // ============================================================

  function toast(message){

    clearTimeout(toastTimer);

    toastElement.textContent =
      message;

    toastElement.classList.add(
      "show"
    );

    toastTimer =
      setTimeout(function(){

        toastElement.classList.remove(
          "show"
        );

      },2500);

  }


  // ============================================================
  // STOCKAGE
  // ============================================================

  function saveCart(){

    try{

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

    }catch(error){

      console.error(
        "Erreur sauvegarde panier:",
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
        parsed.filter(function(item){

          return (
            item &&
            typeof item.id === "string" &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0
          );

        });

    }catch(error){

      cart = [];

      console.error(
        "Erreur chargement panier:",
        error
      );

    }

  }


  // ============================================================
  // PRODUITS
  // ============================================================

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
          document.createElement(
            "article"
          );


        article.className =
          "product";


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
              data-product="${escapeHTML(product.id)}"
            >
              Choisir
            </button>

            <button
              class="addDirect"
              data-direct="${escapeHTML(product.id)}"
              title="Ajouter au panier"
            >
              +
            </button>

          </div>

        `;


        productsGrid.appendChild(
          article
        );

      }
    );


    document
      .querySelectorAll("[data-product]")
      .forEach(
        function(button){

          button.addEventListener(
            "click",
            function(){

              const product =
                getProduct(
                  button.dataset.product
                );


              if(product){

                openQuantity(
                  product
                );

              }

            }
          );

        }
      );


    document
      .querySelectorAll("[data-direct]")
      .forEach(
        function(button){

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

        }
      );

  }


  // ============================================================
  // QUANTITE
  // ============================================================

  function openQuantity(product){

    selectedProduct =
      product;

    selectedQuantity =
      1;

    updateQuantityUI();

    quantityDrawer.classList.add(
      "active"
    );

    overlay.classList.add(
      "active"
    );

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
      ) +
      " / pack";


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


  // ============================================================
  // PANIER
  // ============================================================

  function addToCart(
    product,
    quantity
  ){

    const existing =
      cart.find(
        function(item){

          return item.id === product.id;

        }
      );


    if(existing){

      existing.quantity +=
        quantity;

    }else{

      cart.push({

        id:product.id,

        quantity:quantity

      });

    }


    saveCart();

    updateCartCount();

    renderCart();

  }


  function removeFromCart(id){

    cart =
      cart.filter(
        function(item){

          return item.id !== id;

        }
      );


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
      cart.find(
        function(entry){

          return entry.id === id;

        }
      );


    if(!item){
      return;
    }


    item.quantity +=
      amount;


    if(item.quantity <= 0){

      removeFromCart(id);

      return;

    }


    if(item.quantity > 9999){

      item.quantity =
        9999;

    }


    saveCart();

    updateCartCount();

    renderCart();

  }


  function getCartDetailed(){

    return cart
      .map(
        function(item){

          const product =
            getProduct(item.id);


          if(!product){

            return null;

          }


          return {

            product:product,

            quantity:item.quantity,

            subtotal:
              product.price *
              item.quantity

          };

        }
      )
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


  // ============================================================
  // AFFICHAGE PANIER
  // ============================================================

  function renderCart(){

    const items =
      getCartDetailed();


    if(items.length === 0){

      cartContent.innerHTML = `

        <div class="empty">

          🛒<br><br>

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
                data-remove="${escapeHTML(
                  item.product.id
                )}"
              >
                🗑️ Supprimer
              </button>


              <div style="display:flex;gap:6px;">

                <button
                  class="closeButton"
                  style="width:34px;height:34px;"
                  data-minus="${escapeHTML(
                    item.product.id
                  )}"
                >
                  −
                </button>

                <button
                  class="closeButton"
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


    html +=
      "</div>";


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
      >
        💳 Payer avec PayPal
      </button>

    `;


    cartContent.innerHTML =
      html;


    document
      .querySelectorAll("[data-remove]")
      .forEach(
        function(button){

          button.addEventListener(
            "click",
            function(){

              removeFromCart(
                button.dataset.remove
              );

            }
          );

        }
      );


    document
      .querySelectorAll("[data-minus]")
      .forEach(
        function(button){

          button.addEventListener(
            "click",
            function(){

              changeCartQuantity(
                button.dataset.minus,
                -1
              );

            }
          );

        }
      );


    document
      .querySelectorAll("[data-plus]")
      .forEach(
        function(button){

          button.addEventListener(
            "click",
            function(){

              changeCartQuantity(
                button.dataset.plus,
                1
              );

            }
          );

        }
      );


    const paypalButton =
      $("paypalCheckout");


    if(paypalButton){

      paypalButton.addEventListener(
        "click",
        checkoutPayPal
      );

    }

  }


  // ============================================================
  // OUVERTURE / FERMETURE
  // ============================================================

  function openCart(){

    renderCart();

    cartDrawer.classList.add(
      "active"
    );

    overlay.classList.add(
      "active"
    );

  }


  function closeDrawers(){

    quantityDrawer.classList.remove(
      "active"
    );

    cartDrawer.classList.remove(
      "active"
    );

    overlay.classList.remove(
      "active"
    );

  }


  // ============================================================
  // DISCORD WEBHOOK
  // ============================================================

  async function sendDiscordOrder(){

    if(
      typeof WEBHOOK_URL === "undefined" ||
      !WEBHOOK_URL ||
      WEBHOOK_URL === "TON_WEBHOOK_ICI"
    ){

      console.warn(
        "WEBHOOK_URL n'est pas configuré."
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
        .map(
          function(item){

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

          }
        )
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

      embeds:[

        {

          title:
            "🛒 NOUVELLE COMMANDE • MEMBERS SHOP",

          description:
            "Une nouvelle commande vient d'être initiée.",

          color:
            9463807,

          fields:[

            {
              name:"📦 Produits",
              value:
                productsText ||
                "Aucun",
              inline:false
            },

            {
              name:"👥 MEMBERS",
              value:
                formatNumber(
                  totalMembers
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
              name:"📧 Email",
              value:
                email,
              inline:false
            },

            {
              name:"💳 Paiement",
              value:
                "PayPal",
              inline:true
            },

            {
              name:"📊 Statut",
              value:
                "Paiement à finaliser",
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
          WEBHOOK_URL,
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

        console.error(
          "Discord webhook HTTP:",
          response.status
        );

        return false;

      }


      return true;

    }catch(error){

      console.error(
        "Erreur webhook Discord:",
        error
      );

      return false;

    }

  }


  // ============================================================
  // CHECKOUT PAYPAL
  // ============================================================

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


    const rounded =
      Number(
        total.toFixed(2)
      );


    if(
      !Number.isFinite(rounded) ||
      rounded <= 0
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
      rounded.toFixed(2);


    setTimeout(
      function(){

        window.location.href =
          paypalUrl;

      },
      350
    );

  }


  // ============================================================
  // SECURITE AFFICHAGE
  // ============================================================

  function escapeHTML(value){

    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  // ============================================================
  // EVENTS
  // ============================================================

  $("openCart").addEventListener(
    "click",
    openCart
  );


  $("closeCart").addEventListener(
    "click",
    closeDrawers
  );


  $("closeQuantity").addEventListener(
    "click",
    closeDrawers
  );


  overlay.addEventListener(
    "click",
    closeDrawers
  );


  $("minusButton").addEventListener(
    "click",
    decreaseQuantity
  );


  $("plusButton").addEventListener(
    "click",
    increaseQuantity
  );


  $("addCartButton").addEventListener(
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


  $("scrollProducts").addEventListener(
    "click",
    function(){

      $("productsSection").scrollIntoView({
        behavior:"smooth"
      });

    }
  );


  document.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Escape"){

        closeDrawers();

      }

    }
  );


  // ============================================================
  // INITIALISATION
  // ============================================================

  loadCart();

  renderProducts();

  renderCart();

  updateCartCount();

})();
```
