```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
 VERSION CORRIGÉE
============================================================
*/

(function () {

    /*
    ========================================================
    CONFIG
    ========================================================
    */

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

    /*
    ========================================================
    DOM HELPER
    ========================================================
    */

    function $(selector) {

        return document.querySelector(
            selector
        );

    }

    function $all(selector) {

        return document.querySelectorAll(
            selector
        );

    }

    function exists(element) {

        return (
            element !== null &&
            element !== undefined
        );

    }

    /*
    ========================================================
    ELEMENTS
    ========================================================
    */

    let quantityDrawer;
    let cartDrawer;
    let drawerOverlay;
    let quantityValue;
    let summaryQuantity;
    let summaryMembers;
    let summaryPrice;
    let cartContent;
    let cartCount;
    let toastElement;

    /*
    ========================================================
    REFRESH DOM
    ========================================================
    */

    function refreshElements() {

        quantityDrawer =
            $("#quantityDrawer");

        cartDrawer =
            $("#cartDrawer");

        drawerOverlay =
            $("#drawerOverlay");

        quantityValue =
            $("#quantityValue");

        summaryQuantity =
            $("#summaryQuantity");

        summaryMembers =
            $("#summaryMembers");

        summaryPrice =
            $("#summaryPrice");

        cartContent =
            $("#cartContent");

        cartCount =
            $("#cartCount");

        toastElement =
            $("#toast");

    }

    /*
    ========================================================
    PRICE
    ========================================================
    */

    function formatPrice(value) {

        return Number(value)
            .toFixed(2)
            .replace(".", ",") +
            " €";

    }

    /*
    ========================================================
    NUMBER
    ========================================================
    */

    function formatNumber(value) {

        return Number(value)
            .toLocaleString("fr-FR");

    }

    /*
    ========================================================
    ESCAPE HTML
    ========================================================
    */

    function escapeHTML(value) {

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

    /*
    ========================================================
    TOAST
    ========================================================
    */

    function toast(message) {

        if (!exists(toastElement)) {
            return;
        }

        toastElement.textContent =
            String(message);

        toastElement.classList.add(
            "show"
        );

        if (toastTimer !== null) {

            clearTimeout(
                toastTimer
            );

        }

        toastTimer =
            setTimeout(
                function () {

                    if (exists(toastElement)) {

                        toastElement.classList.remove(
                            "show"
                        );

                    }

                },
                2500
            );

    }

    /*
    ========================================================
    LOAD CART
    ========================================================
    */

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
                parsed.filter(
                    function (item) {

                        return (
                            item &&
                            typeof item === "object" &&
                            typeof item.id === "string"
                        );

                    }
                ).map(
                    function (item) {

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

                    }
                );

        } catch (error) {

            console.warn(
                "NOVA MEMBERS : erreur de chargement du panier.",
                error
            );

            cart = [];

        }

    }

    /*
    ========================================================
    SAVE CART
    ========================================================
    */

    function saveCart() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cart)
            );

        } catch (error) {

            console.warn(
                "NOVA MEMBERS : impossible de sauvegarder le panier.",
                error
            );

        }

    }

    /*
    ========================================================
    QUANTITY
    ========================================================
    */

    function clampQuantity(value) {

        let number =
            parseInt(
                value,
                10
            );

        if (!Number.isFinite(number)) {
            number = 1;
        }

        number =
            Math.max(
                1,
                number
            );

        number =
            Math.min(
                999,
                number
            );

        return number;

    }

    /*
    ========================================================
    UPDATE QUANTITY
    ========================================================
    */

    function updateQuantityUI() {

        quantity =
            clampQuantity(
                quantity
            );

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

    /*
    ========================================================
    PLUS
    ========================================================
    */

    function increaseQuantity() {

        quantity =
            clampQuantity(
                quantity + 1
            );

        updateQuantityUI();

    }

    /*
    ========================================================
    MINUS
    ========================================================
    */

    function decreaseQuantity() {

        quantity =
            clampQuantity(
                quantity - 1
            );

        updateQuantityUI();

    }

    /*
    ========================================================
    DRAWER STATE
    ========================================================
    */

    function setOverlay(active) {

        if (!exists(drawerOverlay)) {
            return;
        }

        if (active) {

            drawerOverlay.classList.add(
                "active"
            );

            drawerOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

        } else {

            drawerOverlay.classList.remove(
                "active"
            );

            drawerOverlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }

    /*
    ========================================================
    CLOSE ALL DRAWERS
    ========================================================
    */

    function closeDrawers() {

        refreshElements();

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

    /*
    ========================================================
    OPEN QUANTITY
    ========================================================
    */

    function openQuantity() {

        refreshElements();

        if (!exists(quantityDrawer)) {

            console.error(
                "NOVA MEMBERS : #quantityDrawer introuvable."
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

    /*
    ========================================================
    OPEN CART
    ========================================================
    */

    function openCart() {

        refreshElements();

        if (!exists(cartDrawer)) {

            console.error(
                "NOVA MEMBERS : #cartDrawer introuvable."
            );

            return;

        }

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

        renderCart();

    }

    /*
    ========================================================
    ADD CART
    ========================================================
    */

    function addToCart() {

        quantity =
            clampQuantity(
                quantity
            );

        const existing =
            cart.find(
                function (item) {

                    return (
                        item.id ===
                        PRODUCT.id
                    );

                }
            );

        if (existing) {

            existing.quantity =
                clampQuantity(
                    Number(
                        existing.quantity
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

        toast(
            quantity +
            " pack" +
            (
                quantity > 1
                    ? "s"
                    : ""
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
            200
        );

    }

    /*
    ========================================================
    CART COUNT
    ========================================================
    */

    function getCartCount() {

        return cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );

    }

    function updateCartCount() {

        refreshElements();

        if (!exists(cartCount)) {
            return;
        }

        cartCount.textContent =
            String(
                getCartCount()
            );

    }

    /*
    ========================================================
    CART TOTAL
    ========================================================
    */

    function getCartTotal() {

        return cart.reduce(
            function (
                total,
                item
            ) {

                const itemQuantity =
                    Number(
                        item.quantity || 0
                    );

                const itemPrice =
                    Number(
                        item.price || 0
                    );

                return (
                    total +
                    itemQuantity *
                    itemPrice
                );

            },
            0
        );

    }

    /*
    ========================================================
    REMOVE CART ITEM
    ========================================================
    */

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

    /*
    ========================================================
    RENDER CART
    ========================================================
    */

    function renderCart() {

        refreshElements();

        if (!exists(cartContent)) {
            return;
        }

        if (cart.length === 0) {

            cartContent.innerHTML = `
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
                        style="margin-top:20px;">

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
                                        "MEMBERS"
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

                                ${formatPrice(
                                    total
                                )}

                            </div>

                        </div>

                        <button
                            class="cart-item-remove"
                            type="button"
                            data-remove-id="${escapeHTML(
                                item.id
                            )}">

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

                        ${formatPrice(
                            total
                        )}

                    </strong>

                </div>

                <button
                    class="paypal-button"
                    id="paypalButton"
                    type="button">

                    Continuer avec PayPal

                </button>

            </div>
        `;

        cartContent.innerHTML =
            html;

    }

    /*
    ========================================================
    PAYPAL
    ========================================================
    */

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

        window.location.href =
            url;

    }

    /*
    ========================================================
    DIRECT BIND
    ========================================================
    */

    function bind(
        selector,
        callback
    ) {

        const element =
            $(selector);

        if (!exists(element)) {
            return;
        }

        if (
            element.dataset.novaBound ===
            "true"
        ) {
            return;
        }

        element.dataset.novaBound =
            "true";

        element.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                callback();

            }
        );

    }

    /*
    ========================================================
    IMPORTANT :
    CLICK DELEGATION
    ========================================================
    */

    function setupGlobalButtonHandler() {

        if (
            document.body.dataset
                .novaGlobalHandler ===
            "true"
        ) {
            return;
        }

        document.body.dataset
            .novaGlobalHandler =
            "true";

        document.addEventListener(
            "click",
            function (event) {

                const target =
                    event.target;

                if (
                    !(target instanceof
                    Element)
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

                const id =
                    button.id;

                /*
                ============================================
                CHOISIR
                ============================================
                */

                if (
                    id ===
                        "chooseButton" ||
                    id ===
                        "heroChooseButton" ||
                    id ===
                        "cardChooseButton" ||
                    id ===
                        "emptyChooseButton"
                ) {

                    event.preventDefault();

                    openQuantity();

                    return;

                }

                /*
                ============================================
                PANIER
                ============================================
                */

                if (
                    id ===
                        "heroCartButton" ||
                    id ===
                        "heroCartButton2"
                ) {

                    event.preventDefault();

                    openCart();

                    return;

                }

                /*
                ============================================
                FERMER
                ============================================
                */

                if (
                    id ===
                        "closeQuantity" ||
                    id ===
                        "closeCart"
                ) {

                    event.preventDefault();

                    closeDrawers();

                    return;

                }

                /*
                ============================================
                PLUS
                ============================================
                */

                if (
                    id ===
                    "plusButton"
                ) {

                    event.preventDefault();

                    increaseQuantity();

                    return;

                }

                /*
                ============================================
                MOINS
                ============================================
                */

                if (
                    id ===
                    "minusButton"
                ) {

                    event.preventDefault();

                    decreaseQuantity();

                    return;

                }

                /*
                ============================================
                AJOUT PANIER
                ============================================
                */

                if (
                    id ===
                    "addCartButton"
                ) {

                    event.preventDefault();

                    addToCart();

                    return;

                }

                /*
                ============================================
                PAYPAL
                ============================================
                */

                if (
                    id ===
                    "paypalButton"
                ) {

                    event.preventDefault();

                    checkoutPayPal();

                    return;

                }

                /*
                ============================================
                SUPPRESSION
                ============================================
                */

                if (
                    button.hasAttribute(
                        "data-remove-id"
                    )
                ) {

                    event.preventDefault();

                    const removeId =
                        button.getAttribute(
                            "data-remove-id"
                        );

                    if (removeId) {

                        removeCartItem(
                            removeId
                        );

                    }

                }

            },
            false
        );

    }

    /*
    ========================================================
    DIRECT EVENTS
    ========================================================
    */

    function bindStaticButtons() {

        bind(
            "#chooseButton",
            openQuantity
        );

        bind(
            "#heroChooseButton",
            openQuantity
        );

        bind(
            "#cardChooseButton",
            openQuantity
        );

        bind(
            "#heroCartButton",
            openCart
        );

        bind(
            "#heroCartButton2",
            openCart
        );

        bind(
            "#closeQuantity",
            closeDrawers
        );

        bind(
            "#closeCart",
            closeDrawers
        );

        bind(
            "#minusButton",
            decreaseQuantity
        );

        bind(
            "#plusButton",
            increaseQuantity
        );

        bind(
            "#addCartButton",
            addToCart
        );

    }

    /*
    ========================================================
    OVERLAY
    ========================================================
    */

    function bindOverlay() {

        refreshElements();

        if (!exists(drawerOverlay)) {
            return;
        }

        if (
            drawerOverlay.dataset
                .novaOverlayBound ===
            "true"
        ) {
            return;
        }

        drawerOverlay.dataset
            .novaOverlayBound =
            "true";

        drawerOverlay.addEventListener(
            "click",
            function () {

                closeDrawers();

            }
        );

    }

    /*
    ========================================================
    KEYBOARD
    ========================================================
    */

    function keyboardEvents() {

        if (
            document.body.dataset
                .novaKeyboardBound ===
            "true"
        ) {
            return;
        }

        document.body.dataset
            .novaKeyboardBound =
            "true";

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

    /*
    ========================================================
    STARS
    ========================================================
    */

    function createStars() {

        const space =
            $("#space");

        if (!exists(space)) {
            return;
        }

        if (
            space.dataset
                .starsCreated ===
            "true"
        ) {
            return;
        }

        space.dataset
            .starsCreated =
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

    /*
    ========================================================
    CONSTELLATIONS
    ========================================================
    */

    function createConstellations() {

        const space =
            $("#space");

        if (!exists(space)) {
            return;
        }

        if (
            space.dataset
                .constellationsCreated ===
            "true"
        ) {
            return;
        }

        space.dataset
            .constellationsCreated =
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

    /*
    ========================================================
    LOADER PARTICLES
    ========================================================
    */

    function createLoaderParticles() {

        const container =
            $("#loaderParticles");

        if (!exists(container)) {
            return;
        }

        if (
            container.dataset
                .created ===
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

    /*
    ========================================================
    EMBERS
    ========================================================
    */

    function createEmbers() {

        const container =
            $("#embers");

        if (!exists(container)) {
            return;
        }

        if (
            container.dataset
                .created ===
            "true"
        ) {
            return;
        }

        container.dataset.created =
            "true";

        for (
            let i = 0;
            i < 90;
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

            ember.style.animationDelay =
                Math.random() * 2 +
                "s";

            ember.style.animationDuration =
                1.2 +
                Math.random() * 2 +
                "s";

            const size =
                2 +
                Math.random() * 4;

            ember.style.width =
                size + "px";

            ember.style.height =
                size * 2 +
                "px";

            container.appendChild(
                ember
            );

        }

    }

    /*
    ========================================================
    INIT
    ========================================================
    */

    function init() {

        refreshElements();

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

        /*
        IMPORTANT :
        Le gestionnaire global est installé en premier.
        Les boutons dynamiques du panier fonctionneront
        également.
        */

        setupGlobalButtonHandler();

        bindStaticButtons();

        bindOverlay();

        keyboardEvents();

        createStars();

        createLoaderParticles();

        createEmbers();

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
            "NOVA MEMBERS : APP.JS chargé correctement."
        );

    }

    /*
    ========================================================
    START
    ========================================================
    */

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
