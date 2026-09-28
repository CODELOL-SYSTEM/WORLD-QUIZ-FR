```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
 VERSION COMPLETE CORRIGEE
============================================================
*/

(function () {

    /* ========================================================
       CONFIG
    ======================================================== */

    const PRODUCT = {
        id: "members-1k",
        name: "MEMBERS",
        members: 1000,
        price: 5.49
    };

    const PAYPAL_BASE =
        "https://paypal.me/SH0PNOVA";

    const STORAGE_KEY =
        "novashop_members_cart";

    let quantity = 1;
    let cart = [];
    let toastTimer = null;
    let initialized = false;


    /* ========================================================
       DOM
    ======================================================== */

    function $(id) {

        return document.getElementById(id);

    }


    function exists(element) {

        return (
            element !== null &&
            element !== undefined
        );

    }


    /* ========================================================
       FORMAT
    ======================================================== */

    function formatPrice(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0,00 €";
        }

        return (
            number
                .toFixed(2)
                .replace(".", ",") +
            " €"
        );

    }


    function formatNumber(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return number.toLocaleString("fr-FR");

    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ========================================================
       TOAST
    ======================================================== */

    function toast(message) {

        const element = $("toast");

        if (!exists(element)) {
            return;
        }

        element.textContent =
            String(message);

        element.classList.add("show");

        if (toastTimer !== null) {
            clearTimeout(toastTimer);
        }

        toastTimer =
            setTimeout(function () {

                element.classList.remove(
                    "show"
                );

            }, 2500);

    }


    /* ========================================================
       QUANTITY
    ======================================================== */

    function clampQuantity(value) {

        let number =
            parseInt(value, 10);

        if (!Number.isFinite(number)) {
            number = 1;
        }

        number =
            Math.max(1, number);

        number =
            Math.min(999, number);

        return number;

    }


    function updateQuantityUI() {

        quantity =
            clampQuantity(quantity);

        const quantityValue =
            $("quantityValue");

        const summaryQuantity =
            $("summaryQuantity");

        const summaryMembers =
            $("summaryMembers");

        const summaryPrice =
            $("summaryPrice");

        if (exists(quantityValue)) {

            quantityValue.textContent =
                String(quantity);

        }

        if (exists(summaryQuantity)) {

            summaryQuantity.textContent =
                String(quantity);

        }

        if (exists(summaryMembers)) {

            summaryMembers.textContent =
                formatNumber(
                    PRODUCT.members *
                    quantity
                );

        }

        if (exists(summaryPrice)) {

            summaryPrice.textContent =
                formatPrice(
                    PRODUCT.price *
                    quantity
                );

        }

    }


    function increaseQuantity() {

        quantity =
            clampQuantity(
                quantity + 1
            );

        updateQuantityUI();

    }


    function decreaseQuantity() {

        quantity =
            clampQuantity(
                quantity - 1
            );

        updateQuantityUI();

    }


    /* ========================================================
       CART STORAGE
    ======================================================== */

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
                    .filter(function (item) {

                        return (
                            item &&
                            typeof item === "object" &&
                            typeof item.id === "string"
                        );

                    })
                    .map(function (item) {

                        return {

                            id:
                                item.id,

                            name:
                                item.name ||
                                PRODUCT.name,

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

                        };

                    });

        } catch (error) {

            console.error(
                "NOVA MEMBERS : erreur panier.",
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
                "NOVA MEMBERS : sauvegarde impossible.",
                error
            );

        }

    }


    /* ========================================================
       CART COUNT
    ======================================================== */

    function getCartCount() {

        return cart.reduce(
            function (total, item) {

                const itemQuantity =
                    Number(
                        item.quantity
                    );

                if (
                    !Number.isFinite(
                        itemQuantity
                    )
                ) {

                    return total;

                }

                return (
                    total +
                    itemQuantity
                );

            },
            0
        );

    }


    function updateCartCount() {

        const element =
            $("cartCount");

        if (!exists(element)) {
            return;
        }

        element.textContent =
            String(
                getCartCount()
            );

    }


    /* ========================================================
       CART TOTAL
    ======================================================== */

    function getCartTotal() {

        return cart.reduce(
            function (total, item) {

                const itemQuantity =
                    Number(
                        item.quantity
                    );

                const itemPrice =
                    Number(
                        item.price
                    );

                if (
                    !Number.isFinite(
                        itemQuantity
                    ) ||
                    !Number.isFinite(
                        itemPrice
                    )
                ) {

                    return total;

                }

                return (
                    total +
                    itemQuantity *
                    itemPrice
                );

            },
            0
        );

    }


    /* ========================================================
       DRAWERS
    ======================================================== */

    function setOverlay(active) {

        const overlay =
            $("drawerOverlay");

        if (!exists(overlay)) {
            return;
        }

        if (active) {

            overlay.classList.add(
                "active"
            );

            overlay.setAttribute(
                "aria-hidden",
                "false"
            );

        } else {

            overlay.classList.remove(
                "active"
            );

            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }


    function closeDrawers() {

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if (exists(quantityDrawer)) {

            quantityDrawer.classList.remove(
                "open"
            );

            quantityDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        if (exists(cartDrawer)) {

            cartDrawer.classList.remove(
                "open"
            );

            cartDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        setOverlay(false);

        document.body.style.overflow =
            "";

    }


    function openQuantity() {

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if (!exists(quantityDrawer)) {

            console.error(
                "NOVA MEMBERS : quantityDrawer absent."
            );

            return;

        }

        if (exists(cartDrawer)) {

            cartDrawer.classList.remove(
                "open"
            );

            cartDrawer.setAttribute(
                "aria-hidden",
                "true"
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

        updateQuantityUI();

    }


    function openCart() {

        const cartDrawer =
            $("cartDrawer");

        const quantityDrawer =
            $("quantityDrawer");

        if (!exists(cartDrawer)) {

            console.error(
                "NOVA MEMBERS : cartDrawer absent."
            );

            return;

        }

        /*
        IMPORTANT :
        On NE recharge PAS localStorage ici.
        Le tableau "cart" est la source de vérité.
        */

        updateCartCount();

        renderCart();

        if (exists(quantityDrawer)) {

            quantityDrawer.classList.remove(
                "open"
            );

            quantityDrawer.setAttribute(
                "aria-hidden",
                "true"
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


    /* ========================================================
       ADD TO CART
    ======================================================== */

    function addToCart() {

        quantity =
            clampQuantity(
                quantity
            );

        let existing =
            cart.find(function (item) {

                return (
                    item.id ===
                    PRODUCT.id
                );

            });


        if (existing) {

            existing.quantity =
                clampQuantity(
                    Number(
                        existing.quantity || 0
                    ) +
                    quantity
                );

        } else {

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
            function () {

                openCart();

            },
            120
        );

    }


    /* ========================================================
       REMOVE
    ======================================================== */

    function removeCartItem(id) {

        cart =
            cart.filter(
                function (item) {

                    return (
                        item.id !== id
                    );

                }
            );

        saveCart();

        updateCartCount();

        renderCart();

        toast(
            "Produit retiré du panier."
        );

    }


    /* ========================================================
       RENDER CART
    ======================================================== */

    function renderCart() {

        const container =
            $("cartContent");

        if (!exists(container)) {
            return;
        }


        if (cart.length === 0) {

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
            function (item) {

                const itemQuantity =
                    Number(
                        item.quantity || 0
                    );

                const itemMembers =
                    Number(
                        item.members ||
                        PRODUCT.members
                    );

                const itemPrice =
                    Number(
                        item.price ||
                        PRODUCT.price
                    );

                const total =
                    itemQuantity *
                    itemPrice;


                html += `
                    <div class="cart-item">

                        <div class="cart-item-top">

                            <div>

                                <div class="cart-item-name">
                                    ${escapeHTML(
                                        item.name ||
                                        PRODUCT.name
                                    )}
                                </div>

                                <div class="cart-item-members">

                                    ${formatNumber(
                                        itemMembers *
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
                            data-remove-id="${escapeHTML(
                                item.id
                            )}"
                        >
                            Supprimer
                        </button>

                    </div>
                `;

            }
        );


        const total =
            getCartTotal();


        html += `
            <div class="cart-total">

                <div class="cart-total-row">

                    <span>
                        Total
                    </span>

                    <strong class="cart-total-price">
                        ${formatPrice(total)}
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


    /* ========================================================
       PAYPAL
    ======================================================== */

    function checkoutPayPal() {

        if (cart.length === 0) {

            toast(
                "Ton panier est vide."
            );

            return;

        }


        const total =
            getCartTotal();


        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

            toast(
                "Montant invalide."
            );

            return;

        }


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


    /* ========================================================
       STATIC BUTTONS
       DIRECT onclick
       ======================================================== */

    function bindButton(id, handler) {

        const button =
            $(id);

        if (!exists(button)) {

            console.error(
                "NOVA MEMBERS : bouton absent ->",
                id
            );

            return;

        }

        button.onclick =
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                handler();

            };

    }


    function setupStaticButtons() {

        bindButton(
            "chooseButton",
            openQuantity
        );

        bindButton(
            "heroChooseButton",
            openQuantity
        );

        bindButton(
            "cardChooseButton",
            openQuantity
        );

        bindButton(
            "heroCartButton",
            openCart
        );

        bindButton(
            "heroCartButton2",
            openCart
        );

        bindButton(
            "closeQuantity",
            closeDrawers
        );

        bindButton(
            "closeCart",
            closeDrawers
        );

        bindButton(
            "minusButton",
            decreaseQuantity
        );

        bindButton(
            "plusButton",
            increaseQuantity
        );

        bindButton(
            "addCartButton",
            addToCart
        );

    }


    /* ========================================================
       DYNAMIC BUTTONS
    ======================================================== */

    function setupDynamicButtons() {

        document.addEventListener(
            "click",
            function (event) {

                const target =
                    event.target;


                if (
                    !(target instanceof Element)
                ) {

                    return;

                }


                const button =
                    target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                if (
                    button.id ===
                    "emptyChooseButton"
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    openQuantity();

                    return;

                }


                if (
                    button.id ===
                    "paypalButton"
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    checkoutPayPal();

                    return;

                }


                if (
                    button.hasAttribute(
                        "data-remove-id"
                    )
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    const id =
                        button.getAttribute(
                            "data-remove-id"
                        );

                    if (id) {

                        removeCartItem(
                            id
                        );

                    }

                }

            }
        );

    }


    /* ========================================================
       OVERLAY
    ======================================================== */

    function setupOverlay() {

        const overlay =
            $("drawerOverlay");

        if (!exists(overlay)) {
            return;
        }

        overlay.onclick =
            function (event) {

                event.preventDefault();

                closeDrawers();

            };

    }


    /* ========================================================
       KEYBOARD
    ======================================================== */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeDrawers();

                }

            }
        );

    }


    /* ========================================================
       STARS
    ======================================================== */

    function createStars() {

        const space =
            $("space");

        if (!exists(space)) {
            return;
        }

        if (
            space.dataset.starsCreated ===
            "true"
        ) {

            return;

        }

        space.dataset.starsCreated =
            "true";


        for (
            let i = 0;
            i < 150;
            i++
        ) {

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

            star.style.animationDuration =
                1.5 +
                Math.random() * 3 +
                "s";


            space.appendChild(
                star
            );

        }


        createConstellations();

    }


    /* ========================================================
       CONSTELLATIONS
    ======================================================== */

    function createConstellations() {

        const space =
            $("space");

        if (!exists(space)) {
            return;
        }

        if (
            space.dataset.constellationsCreated ===
            "true"
        ) {

            return;

        }


        space.dataset.constellationsCreated =
            "true";


        const points = [

            [18, 18],
            [23, 14],
            [28, 20],
            [33, 13],

            [76, 17],
            [82, 24],
            [88, 16],
            [84, 31],

            [11, 67],
            [17, 61],
            [24, 70],
            [30, 64],

            [62, 73],
            [68, 67],
            [74, 75]

        ];


        points.forEach(
            function (point) {

                const element =
                    document.createElement(
                        "div"
                    );

                element.className =
                    "constellation";

                element.style.left =
                    point[0] + "%";

                element.style.top =
                    point[1] + "%";

                space.appendChild(
                    element
                );

            }
        );

    }


    /* ========================================================
       LOADER PARTICLES
    ======================================================== */

    function createLoaderParticles() {

        const container =
            $("loaderParticles");

        if (!exists(container)) {
            return;
        }


        if (
            container.dataset.created ===
            "true"
        ) {

            return;

        }


        container.dataset.created =
            "true";


        for (
            let i = 0;
            i < 45;
            i++
        ) {

            const particle =
                document.createElement(
                    "div"
                );

            particle.className =
                "loader-particle";


            particle.style.left =
                Math.random() * 100 +
                "%";

            particle.style.animationDelay =
                Math.random() * 4 +
                "s";

            particle.style.animationDuration =
                3 +
                Math.random() * 4 +
                "s";


            container.appendChild(
                particle
            );

        }

    }


    /* ========================================================
       ASH / CENDRES
    ======================================================== */

    function createEmbers() {

        const container =
            $("embers");

        if (!exists(container)) {
            return;
        }


        if (
            container.dataset.created ===
            "true"
        ) {

            return;

        }


        container.dataset.created =
            "true";


        for (
            let i = 0;
            i < 130;
            i++
        ) {

            const ember =
                document.createElement(
                    "div"
                );

            ember.className =
                "ember";


            ember.style.left =
                Math.random() * 100 +
                "%";


            ember.style.bottom =
                (
                    35 +
                    Math.random() * 20
                ) +
                "%";


            const size =
                2 +
                Math.random() * 4;


            ember.style.width =
                size + "px";

            ember.style.height =
                size + "px";


            ember.style.setProperty(
                "--drift",
                (
                    Math.random() * 180 -
                    90
                ) +
                "px"
            );


            ember.style.setProperty(
                "--ash-duration",
                (
                    1.8 +
                    Math.random() * 2
                ) +
                "s"
            );


            ember.style.animationDelay =
                (
                    Math.random() * 1.3
                ) +
                "s";


            container.appendChild(
                ember
            );

        }

    }


    /* ========================================================
       FIRE TRANSITION
    ======================================================== */

    function startFireTransition() {

        const loader =
            $("loader");

        const fire =
            $("fireTransition");

        const site =
            $("site");


        if (
            !exists(loader) ||
            !exists(fire) ||
            !exists(site)
        ) {

            return;

        }


        /*
        Site déjà prêt derrière le loader.
        */

        site.classList.remove(
            "visible"
        );


        /*
        Après 3 secondes :
        NOVA MEMBERS -> feu -> cendres.
        */

        setTimeout(
            function () {

                fire.classList.add(
                    "active"
                );


                loader.classList.add(
                    "hidden"
                );


                /*
                Le site devient visible
                derrière la transition.
                */

                setTimeout(
                    function () {

                        site.classList.add(
                            "visible"
                        );

                    },
                    700
                );


                /*
                Fin de la transition.
                */

                setTimeout(
                    function () {

                        fire.classList.remove(
                            "active"
                        );

                    },
                    3200
                );

            },
            3000
        );

    }


    /* ========================================================
       INIT
    ======================================================== */

    function init() {

        if (initialized) {
            return;
        }

        initialized = true;


        /*
        Charge UNE SEULE FOIS
        le panier au démarrage.
        */

        loadCart();


        quantity = 1;


        updateQuantityUI();

        updateCartCount();

        renderCart();


        /*
        Tous les boutons statiques
        utilisent onclick direct.
        */

        setupStaticButtons();


        /*
        Les boutons créés dynamiquement
        utilisent la délégation.
        */

        setupDynamicButtons();


        setupOverlay();

        setupKeyboard();


        /*
        Effets visuels.
        */

        createStars();

        createLoaderParticles();

        createEmbers();


        /*
        Transition de démarrage.
        */

        startFireTransition();


        /*
        API globale utile pour debug.
        */

        window.NOVA_MEMBERS = {

            product:
                PRODUCT,

            openQuantity:
                openQuantity,

            openCart:
                openCart,

            close:
                closeDrawers,

            addToCart:
                addToCart,

            increaseQuantity:
                increaseQuantity,

            decreaseQuantity:
                decreaseQuantity,

            checkout:
                checkoutPayPal,

            getCart:
                function () {

                    return cart.slice();

                },

            getQuantity:
                function () {

                    return quantity;

                },

            setQuantity:
                function (value) {

                    quantity =
                        clampQuantity(
                            value
                        );

                    updateQuantityUI();

                }

        };


        console.log(
            "NOVA MEMBERS : site chargé."
        );

    }


    /* ========================================================
       START
    ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})();
```
