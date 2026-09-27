```javascript
"use strict";

/* ============================================================
   NOVASHOP MEMBERS
============================================================ */

const PRODUCT = {
  id: "members-1k",
  name: "MEMBERS",
  members: 1000,
  price: 5.49
};

const PAYPAL = "SH0PNOVA";

let quantity = 1;
let cart = [];

/* ============================================================
   DOM
============================================================ */

const chooseButton = document.getElementById("chooseButton");
const heroCartButton = document.getElementById("heroCartButton");
const cartButton = document.getElementById("cartButton");

const quantityDrawer = document.getElementById("quantityDrawer");
const cartDrawer = document.getElementById("cartDrawer");

const overlay = document.getElementById("overlay");

const closeQuantity = document.getElementById("closeQuantity");
const closeCart = document.getElementById("closeCart");

const minus = document.getElementById("minus");
const plus = document.getElementById("plus");

const quantityValue = document.getElementById("quantityValue");
const totalPrice = document.getElementById("totalPrice");

const addButton = document.getElementById("addButton");

const cartNumber = document.getElementById("cartNumber");
const cartContent = document.getElementById("cartContent");

const toast = document.getElementById("toast");

/* ============================================================
   LOCAL STORAGE
============================================================ */

function loadCart(){

  try{

    const saved =
      localStorage.getItem(
        "novashop_members_cart"
      );

    if(!saved){

      cart = [];
      return;
    }

    const parsed =
      JSON.parse(saved);

    if(Array.isArray(parsed)){

      cart = parsed;

    }else{

      cart = [];
    }

  }catch(error){

    console.error(
      "Erreur panier :",
      error
    );

    cart = [];
  }
}


function saveCart(){

  try{

    localStorage.setItem(
      "novashop_members_cart",
      JSON.stringify(cart)
    );

  }catch(error){

    console.error(
      "Erreur sauvegarde :",
      error
    );
  }
}

/* ============================================================
   PRIX
============================================================ */

function price(value){

  return Number(value)
    .toFixed(2)
    .replace(".", ",") + " €";
}

/* ============================================================
   TOAST
============================================================ */

let toastTimer;

function showToast(message){

  if(!toast){
    return;
  }

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(function(){

      toast.classList.remove("show");

    },2200);
}

/* ============================================================
   DRAWERS
============================================================ */

function openDrawer(drawer){

  if(!drawer){
    return;
  }

  quantityDrawer.classList.remove("open");
  cartDrawer.classList.remove("open");

  overlay.classList.add("open");

  drawer.classList.add("open");
}


function closeDrawers(){

  quantityDrawer.classList.remove("open");
  cartDrawer.classList.remove("open");

  overlay.classList.remove("open");
}

/* ============================================================
   QUANTITÉ
============================================================ */

function updateQuantity(){

  quantityValue.textContent =
    quantity;

  totalPrice.textContent =
    price(
      quantity *
      PRODUCT.price
    );
}


function increase(){

  quantity++;

  updateQuantity();
}


function decrease(){

  if(quantity <= 1){
    return;
  }

  quantity--;

  updateQuantity();
}

/* ============================================================
   SELECTEUR
============================================================ */

function openQuantity(){

  updateQuantity();

  openDrawer(
    quantityDrawer
  );
}

/* ============================================================
   AJOUTER AU PANIER
============================================================ */

function addToCart(){

  const existing =
    cart.find(function(item){

      return item.id === PRODUCT.id;

    });

  if(existing){

    existing.quantity +=
      quantity;

  }else{

    cart.push({

      id:PRODUCT.id,

      name:PRODUCT.name,

      members:PRODUCT.members,

      price:PRODUCT.price,

      quantity:quantity

    });
  }

  saveCart();

  updateCartNumber();

  showToast(
    quantity +
    " × 1K MEMBERS ajouté au panier"
  );

  closeDrawers();

  setTimeout(function(){

    openCart();

  },350);
}

/* ============================================================
   TOTAL PANIER
============================================================ */

function cartQuantity(){

  return cart.reduce(
    function(total,item){

      return total +
        Number(item.quantity || 0);

    },
    0
  );
}


function cartTotal(){

  return cart.reduce(
    function(total,item){

      return total +
        Number(item.quantity || 0) *
        Number(item.price || 0);

    },
    0
  );
}


function updateCartNumber(){

  cartNumber.textContent =
    cartQuantity();
}

/* ============================================================
   SECURISER HTML
============================================================ */

function escapeHTML(value){

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

/* ============================================================
   AFFICHER PANIER
============================================================ */

function renderCart(){

  if(!cartContent){
    return;
  }

  if(cart.length === 0){

    cartContent.innerHTML = `

      <div class="empty">

        <div>

          <div class="emptyIcon">
            🛒
          </div>

          <h3>
            Panier vide
          </h3>

          <p style="margin-top:8px;">
            Aucun pack MEMBERS.
          </p>

          <button
            class="primary"
            id="emptyChoose"
            style="margin-top:20px;"
          >
            ✦ Choisir un pack
          </button>

        </div>

      </div>

    `;

    const emptyChoose =
      document.getElementById(
        "emptyChoose"
      );

    if(emptyChoose){

      emptyChoose.addEventListener(
        "click",
        function(){

          closeDrawers();

          setTimeout(
            openQuantity,
            250
          );

        }
      );
    }

    return;
  }

  let html = "";

  cart.forEach(
    function(item,index){

      const itemTotal =
        Number(item.quantity) *
        Number(item.price);

      const totalMembers =
        Number(item.quantity) *
        Number(item.members);

      html += `

        <div class="cartItem">

          <div class="cartIcon">
            ϟ
          </div>

          <div class="cartInfo">

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <span>
              ${item.quantity} × 1K MEMBERS
            </span>

            <span>
              ${totalMembers.toLocaleString("fr-FR")}
              MEMBERS
            </span>

            <span style="color:#c18bff;">
              ${price(itemTotal)}
            </span>

          </div>

          <button
            class="remove"
            data-index="${index}"
          >
            ×
          </button>

        </div>

      `;
    }
  );

  html += `

    <div class="total">

      <div class="totalLine">

        <span class="totalLabel">
          Total
        </span>

        <span class="totalPrice">
          ${price(cartTotal())}
        </span>

      </div>

      <button
        class="paypal"
        id="paypalButton"
      >
        PayPal · Payer maintenant
      </button>

      <p style="
        margin-top:12px;
        text-align:center;
        color:#756a7d;
        font-size:11px;
      ">
        Redirection vers PayPal pour le paiement.
      </p>

    </div>

  `;

  cartContent.innerHTML =
    html;

  document
    .querySelectorAll(".remove")
    .forEach(
      function(button){

        button.addEventListener(
          "click",
          function(){

            const index =
              Number(
                button.dataset.index
              );

            removeItem(index);

          }
        );
      }
    );

  const paypalButton =
    document.getElementById(
      "paypalButton"
    );

  if(paypalButton){

    paypalButton.addEventListener(
      "click",
      checkout
    );
  }
}

/* ============================================================
   SUPPRIMER
============================================================ */

function removeItem(index){

  if(
    index < 0 ||
    index >= cart.length
  ){
    return;
  }

  cart.splice(
    index,
    1
  );

  saveCart();

  updateCartNumber();

  renderCart();

  showToast(
    "Article supprimé"
  );
}

/* ============================================================
   OUVRIR PANIER
============================================================ */

function openCart(){

  renderCart();

  openDrawer(
    cartDrawer
  );
}

/* ============================================================
   PAYPAL
============================================================ */

function checkout(){

  if(cart.length === 0){

    showToast(
      "Le panier est vide."
    );

    return;
  }

  const total =
    cartTotal();

  if(
    !Number.isFinite(total) ||
    total <= 0
  ){

    showToast(
      "Montant invalide."
    );

    return;
  }

  const amount =
    total.toFixed(2);

  const url =
    "https://paypal.me/" +
    PAYPAL +
    "/" +
    amount;

  showToast(
    "Redirection vers PayPal..."
  );

  setTimeout(
    function(){

      window.location.href =
        url;

    },
    700
  );
}

/* ============================================================
   EVENEMENTS
============================================================ */

if(chooseButton){

  chooseButton.addEventListener(
    "click",
    openQuantity
  );
}


if(heroCartButton){

  heroCartButton.addEventListener(
    "click",
    openCart
  );
}


if(cartButton){

  cartButton.addEventListener(
    "click",
    openCart
  );
}


if(closeQuantity){

  closeQuantity.addEventListener(
    "click",
    closeDrawers
  );
}


if(closeCart){

  closeCart.addEventListener(
    "click",
    closeDrawers
  );
}


if(overlay){

  overlay.addEventListener(
    "click",
    closeDrawers
  );
}


if(minus){

  minus.addEventListener(
    "click",
    decrease
  );
}


if(plus){

  plus.addEventListener(
    "click",
    increase
  );
}


if(addButton){

  addButton.addEventListener(
    "click",
    addToCart
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

/* ============================================================
   INITIALISATION
============================================================ */

loadCart();

updateCartNumber();

updateQuantity();

renderCart();

console.log(
  "NOVASHOP MEMBERS : OK"
);
```
