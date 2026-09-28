```javascript
"use strict";

(function(){

    /* =====================================================
       CONFIG
    ===================================================== */

    const PRODUCT = {
        id: "members-1k",
        name: "MEMBERS",
        members: 1000,
        price: 5.49
    };

    const STORAGE_KEY =
        "novashop_members_cart";

    const PAYPAL_BASE =
        "https://paypal.me/SH0PNOVA";

    let quantity = 1;
    let cart = [];
    let toastTimer = null;


    /* =====================================================
       DOM
    ===================================================== */

    function $(id){
        return document.getElementById(id);
    }


    /* =====================================================
       FORMAT
    ===================================================== */

    function formatPrice(value){

        const number = Number(value);

        if(!Number.isFinite(number)){
            return "0,00 €";
        }

        return number
            .toFixed(2)
            .replace(".", ",") + " €";
    }


    function formatNumber(value){

        const number = Number(value);

        if(!Number.isFinite(number)){
            return "0";
        }

        return number.toLocaleString("fr-FR");
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function toast(message){

        const element = $("toast");

        if(!element){
            return;
        }

        element.textContent = message;
        element.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(
            function(){
                element.classList.remove("show");
            },
            2500
        );
    }


    /* =====================================================
       QUANTITY
    ===================================================== */

    function clampQuantity(value){

        let number =
            parseInt(value,10);

        if(!Number.isFinite(number)){
            number = 1;
        }

        return Math.max(
            1,
            Math.min(999,number)
        );
    }


    function updateQuantity(){

        quantity =
            clampQuantity(quantity);

        const value =
            $("quantityValue");

        const summaryQuantity =
            $("summaryQuantity");

        const summaryMembers =
            $("summaryMembers");

        const summaryPrice =
            $("summaryPrice");

        if(value){
            value.textContent =
                String(quantity);
        }

        if(summaryQuantity){
            summaryQuantity.textContent =
                String(quantity);
        }

        if(summaryMembers){
            summaryMembers.textContent =
                formatNumber(
                    PRODUCT.members *
                    quantity
                );
        }

        if(summaryPrice){
            summaryPrice.textContent =
                formatPrice(
                    PRODUCT.price *
                    quantity
                );
        }
    }


    function increaseQuantity(){

        quantity =
            clampQuantity(
                quantity + 1
            );

        updateQuantity();
    }


    function decreaseQuantity(){

        quantity =
            clampQuantity(
                quantity - 1
            );

        updateQuantity();
    }


    /* =====================================================
       CART
    ===================================================== */

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
                    .filter(
                        item =>
                            item &&
                            typeof item === "object"
                    )
                    .map(
                        item => ({
                            id:
                                String(
                                    item.id ||
                                    PRODUCT.id
                                ),

                            name:
                                String(
                                    item.name ||
                                    PRODUCT.name
                                ),

                            quantity:
                                clampQuantity(
                                    item.quantity
                                ),

                            members:
                                Number(
                                    item.members ||
                                    PRODUCT.members
                                ),

                            price:
                                Number(
                                    item.price ||
                                    PRODUCT.price
                                )
                        })
                    );

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


    function getCartCount(){

        return cart.reduce(
            (total,item) =>
                total +
                Number(item.quantity || 0),
            0
        );
    }


    function getCartTotal(){

        return cart.reduce(
            (total,item) =>
                total +
                Number(item.quantity || 0) *
                Number(item.price || 0),
            0
        );
    }


    function updateCartCount(){

        const element =
            $("cartCount");

        if(element){
            element.textContent =
                String(
                    getCartCount()
                );
        }
    }


    /* =====================================================
       DRAWERS
    ===================================================== */

    function setOverlay(active){

        const overlay =
            $("drawerOverlay");

        if(!overlay){
            return;
        }

        overlay.classList.toggle(
            "active",
            active
        );

        overlay.setAttribute(
            "aria-hidden",
            active ? "false" : "true"
        );
    }


    function closeDrawers(){

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if(quantityDrawer){
            quantityDrawer.classList.remove(
                "open"
            );
        }

        if(cartDrawer){
            cartDrawer.classList.remove(
                "open"
            );
        }

        setOverlay(false);

        document.body.style.overflow =
            "";
    }


    function openQuantity(){

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if(!quantityDrawer){
            return;
        }

        if(cartDrawer){
            cartDrawer.classList.remove(
                "open"
            );
        }

        quantityDrawer.classList.add(
            "open"
        );

        quantityDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        setOverlay(true);

        document.body.style.overflow =
            "hidden";

        updateQuantity();
    }


    function openCart(){

        const cartDrawer =
            $("cartDrawer");

        const quantityDrawer =
            $("quantityDrawer");

        if(!cartDrawer){
            return;
        }

        renderCart();

        if(quantityDrawer){
            quantityDrawer.classList.remove(
                "open"
            );
        }

        cartDrawer.classList.add(
            "open"
        );

        cartDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        setOverlay(true);

        document.body.style.overflow =
            "hidden";
    }


    /* =====================================================
       ADD CART
    ===================================================== */

    function addToCart(){

        quantity =
            clampQuantity(quantity);

        const existing =
            cart.find(
                item =>
                    item.id === PRODUCT.id
            );

        if(existing){

            existing.quantity =
                clampQuantity(
                    Number(
                        existing.quantity
                    ) +
                    quantity
                );

        }else{

            cart.push({

                id:
                    PRODUCT.id,

                name:
                    PRODUCT.name,

                quantity:
                    quantity,

                members:
                    PRODUCT.members,

                price:
                    PRODUCT.price
            });
        }

        saveCart();

        updateCartCount();

        renderCart();

        toast(
            quantity +
            (
                quantity > 1
                    ? " packs"
                    : " pack"
            ) +
            " ajouté" +
            (
                quantity > 1
                    ? "s"
                    : ""
            ) +
            " au panier."
        );

        setTimeout(
            openCart,
            100
        );
    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function removeCartItem(id){

        cart =
            cart.filter(
                item =>
                    item.id !== id
            );

        saveCart();

        updateCartCount();

        renderCart();

        toast(
            "Produit retiré du panier."
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderCart(){

        const container =
            $("cartContent");

        if(!container){
            return;
        }

        if(cart.length === 0){

            container.innerHTML = `
                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <p>
                        Ton panier est vide.
                    </p>

                    <button
                        class="btn btn-purple"
                        id="emptyChooseButton"
                        type="button"
                        style="margin-top:20px;"
                    >
                        Choisir un pack
                    </button>

                </div>
            `;

            return;
        }

        let html = "";

        cart.forEach(
            function(item){

                const itemQuantity =
                    Number(
                        item.quantity
                    );

                const total =
                    itemQuantity *
                    Number(item.price);

                html += `
                    <div class="cart-item">

                        <div class="cart-item-top">

                            <div>

                                <div class="cart-item-name">
                                    ${item.name}
                                </div>

                                <div class="cart-item-members">

                                    ${formatNumber(
                                        Number(item.members) *
                                        itemQuantity
                                    )}

                                    MEMBERS

                                    • Quantité :
                                    ${itemQuantity}

                                </div>

                            </div>

                            <div class="cart-item-price">
                                ${formatPrice(total)}
                            </div>

                        </div>

                        <button
                            class="cart-item-remove"
                            type="button"
                            data-remove-id="${item.id}"
                        >
                            Supprimer
                        </button>

                    </div>
                `;
            }
        );

        html += `
            <div class="cart-total">

                <div class="cart-total-row">

                    <span>
                        Total
                    </span>

                    <strong class="cart-total-price">
                        ${formatPrice(
                            getCartTotal()
                        )}
                    </strong>

                </div>

                <button
                    class="paypal-button"
                    id="paypalButton"
                    type="button"
                >
                    Continuer avec PayPal
                </button>

            </div>
        `;

        container.innerHTML =
            html;
    }


    /* =====================================================
       DISCORD SERVER
    ===================================================== */

    async function notifyServer(){

        try{

            const response =
                await fetch(
                    "/api/order",
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:JSON.stringify({

                            product:
                                PRODUCT.name,

                            quantity:
                                getCartCount(),

                            members:
                                getCartCount() *
                                PRODUCT.members,

                            total:
                                Number(
                                    getCartTotal()
                                        .toFixed(2)
                                )

                        })
                    }
                );

            if(!response.ok){

                console.warn(
                    "Le serveur Discord n'a pas accepté la commande."
                );
            }

        }catch(error){

            console.warn(
                "Notification serveur impossible :",
                error
            );
        }
    }


    /* =====================================================
       PAYPAL
    ===================================================== */

    async function checkoutPayPal(){

        if(cart.length === 0){

            toast(
                "Ton panier est vide."
            );

            return;
        }

        const total =
            getCartTotal();

        if(
            !Number.isFinite(total) ||
            total <= 0
        ){

            toast(
                "Montant invalide."
            );

            return;
        }

        /*
        Envoie l'événement au serveur.
        Le webhook Discord reste secret.
        */

        await notifyServer();

        const amount =
            total.toFixed(2);

        const url =
            PAYPAL_BASE +
            "/" +
            amount;

        window.location.assign(
            url
        );
    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function bind(id,handler){

        const button =
            $(id);

        if(!button){
            console.error(
                "Bouton introuvable :",
                id
            );
            return;
        }

        button.onclick =
            function(event){

                event.preventDefault();
                event.stopPropagation();

                handler();
            };
    }


    function setupButtons(){

        bind(
            "chooseButton",
            openQuantity
        );

        bind(
            "heroChooseButton",
            openQuantity
        );

        bind(
            "cardChooseButton",
            openQuantity
        );

        bind(
            "heroCartButton",
            openCart
        );

        bind(
            "heroCartButton2",
            openCart
        );

        bind(
            "closeQuantity",
            closeDrawers
        );

        bind(
            "closeCart",
            closeDrawers
        );

        bind(
            "minusButton",
            decreaseQuantity
        );

        bind(
            "plusButton",
            increaseQuantity
        );

        bind(
            "addCartButton",
            addToCart
        );
    }


    /* =====================================================
       DYNAMIC BUTTONS
    ===================================================== */

    function setupDynamicButtons(){

        document.addEventListener(
            "click",
            function(event){

                const target =
                    event.target;

                if(
                    !(target instanceof Element)
                ){
                    return;
                }

                const button =
                    target.closest(
                        "button"
                    );

                if(!button){
                    return;
                }

                if(
                    button.id ===
                    "emptyChooseButton"
                ){

                    event.preventDefault();

                    openQuantity();

                    return;
                }

                if(
                    button.id ===
                    "paypalButton"
                ){

                    event.preventDefault();

                    checkoutPayPal();

                    return;
                }

                if(
                    button.hasAttribute(
                        "data-remove-id"
                    )
                ){

                    event.preventDefault();

                    const id =
                        button.getAttribute(
                            "data-remove-id"
                        );

                    if(id){
                        removeCartItem(id);
                    }
                }
            }
        );
    }


    /* =====================================================
       OVERLAY / ESC
    ===================================================== */

    function setupOverlay(){

        const overlay =
            $("drawerOverlay");

        if(overlay){

            overlay.onclick =
                function(){

                    closeDrawers();

                };
        }
    }


    function setupKeyboard(){

        document.addEventListener(
            "keydown",
            function(event){

                if(
                    event.key ===
                    "Escape"
                ){

                    closeDrawers();
                }
            }
        );
    }


    /* =====================================================
       STARS
    ===================================================== */

    function createStars(){

        const space =
            $("space");

        if(!space){
            return;
        }

        for(
            let i = 0;
            i < 160;
            i++
        ){

            const star =
                document.createElement(
                    "div"
                );

            star.className =
                "star";

            const size =
                Math.random() * 2 + 1;

            star.style.width =
                size + "px";

            star.style.height =
                size + "px";

            star.style.left =
                Math.random() * 100 +
                "%";

            star.style.top =
                Math.random() * 100 +
                "%";

            star.style.animationDelay =
                Math.random() * 3 +
                "s";

            space.appendChild(
                star
            );
        }
    }


    /* =====================================================
       DEBRIS
    ===================================================== */

    function createDebris(){

        const container =
            $("debris");

        if(!container){
            return;
        }

        for(
            let i = 0;
            i < 500;
            i++
        ){

            const piece =
                document.createElement(
                    "div"
                );

            piece.className =
                "debris-piece";

            const angle =
                Math.random() *
                Math.PI * 2;

            const distance =
                100 +
                Math.random() * 650;

            const x =
                Math.cos(angle) *
                distance;

            const y =
                Math.sin(angle) *
                distance;

            const duration =
                1.2 +
                Math.random() *
                1.4;

            const delay =
                Math.random() *
                .25;

            const rotate =
                Math.random() *
                1600 -
                800;

            piece.style.setProperty(
                "--x",
                x + "px"
            );

            piece.style.setProperty(
                "--y",
                y + "px"
            );

            piece.style.setProperty(
                "--duration",
                duration + "s"
            );

            piece.style.setProperty(
                "--delay",
                delay + "s"
            );

            piece.style.setProperty(
                "--rotate",
                rotate + "deg"
            );

            container.appendChild(
                piece
            );
        }
    }


    /* =====================================================
       INTRO ANIMATION
    ===================================================== */

    function runIntro(){

        const intro =
            $("intro");

        const loadingText =
            $("loadingText");

        const loadingFill =
            $("loadingFill");

        const ball =
            $("ball");

        const impact =
            $("impact");

        const site =
            $("site");

        const trash =
            $("trash");


        if(!intro || !site){
            return;
        }


        /*
        1. CHARGEMENT DU SITE
        */

        setTimeout(
            function(){

                if(loadingText){

                    loadingText.innerHTML =
                        "CHARGEMENT DU PRODUIT<span class=\"loading-dots\">...</span>";
                }

                if(loadingFill){
                    loadingFill.style.width =
                        "38%";
                }

            },
            900
        );


        /*
        2. PRODUIT
        */

        setTimeout(
            function(){

                if(loadingText){

                    loadingText.innerHTML =
                        "CHARGEMENT DU PANIER<span class=\"loading-dots\">...</span>";
                }

                if(loadingFill){
                    loadingFill.style.width =
                        "67%";
                }

            },
            1700
        );


        /*
        3. FIN CHARGEMENT
        */

        setTimeout(
            function(){

                if(loadingText){

                    loadingText.innerHTML =
                        "CHARGEMENT TERMINÉ";
                }

                if(loadingFill){
                    loadingFill.style.width =
                        "100%";
                }

            },
            2500
        );


        /*
        4. BALLE
        */

        setTimeout(
            function(){

                if(ball){

                    ball.classList.add(
                        "fly"
                    );
                }

            },
            3200
        );


        /*
        5. IMPACT
        */

        setTimeout(
            function(){

                if(impact){

                    impact.classList.add(
                        "active"
                    );
                }

                intro.classList.add(
                    "explode"
                );

            },
            4300
        );


        /*
        6. ÉCRAN QUI SE PENCHE
        */

        setTimeout(
            function(){

                intro.classList.add(
                    "tilt"
                );

            },
            5100
        );


        /*
        7. POUBELLE
        */

        setTimeout(
            function(){

                intro.classList.add(
                    "trash-visible"
                );

            },
            5400
        );


        /*
        8. POUBELLE OUVERTE
        */

        setTimeout(
            function(){

                intro.classList.add(
                    "trash-open"
                );

            },
            6100
        );


        /*
        9. MORCEAUX -> POUBELLE
        */

        setTimeout(
            function(){

                const pieces =
                    document.querySelectorAll(
                        ".debris-piece"
                    );

                pieces.forEach(
                    function(piece){

                        piece.style.setProperty(
                            "--x",
                            (
                                (Math.random() * 80) -
                                40
                            ) + "px"
                        );

                        piece.style.setProperty(
                            "--y",
                            (
                                250 +
                                Math.random() * 350
                            ) + "px"
                        );
                    }
                );

            },
            6250
        );


        /*
        10. SITE NORMAL
        */

        setTimeout(
            function(){

                site.classList.add(
                    "visible"
                );

            },
            7000
        );


        /*
        11. INTRO DISPARAÎT
        */

        setTimeout(
            function(){

                intro.classList.add(
                    "finished"
                );

            },
            7700
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init(){

        loadCart();

        updateQuantity();

        updateCartCount();

        renderCart();

        createStars();

        createDebris();

        setupButtons();

        setupDynamicButtons();

        setupOverlay();

        setupKeyboard();

        runIntro();

        window.NOVA_MEMBERS = {

            product:PRODUCT,

            openQuantity:openQuantity,

            openCart:openCart,

            close:closeDrawers,

            addToCart:addToCart,

            increaseQuantity:increaseQuantity,

            decreaseQuantity:decreaseQuantity,

            checkout:checkoutPayPal

        };

        console.log(
            "NOVA MEMBERS chargé."
        );
    }


    /* =====================================================
       START
    ===================================================== */

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {once:true}
        );

    }else{

        init();
    }

})();
```
