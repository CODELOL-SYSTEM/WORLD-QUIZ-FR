```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
 VERSION FINALE
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
    let initialized = false;

    /*
    ========================================================
    DOM
    ========================================================
    */

    function $(selector) {
        return document.querySelector(selector);
    }

    function exists(element) {
        return element !== null &&
               element !== undefined;
    }

    function refreshElements() {

        return {
            quantityDrawer: $("#quantityDrawer"),
            cartDrawer: $("#cartDrawer"),
            drawerOverlay: $("#drawerOverlay"),
            quantityValue: $("#quantityValue"),
            summaryQuantity: $("#summaryQuantity"),
            summaryMembers: $("#summaryMembers"),
            summaryPrice: $("#summaryPrice"),
            cartContent: $("#cartContent"),
            cartCount: $("#cartCount"),
            toast: $("#toast")
        };

    }

    /*
    ========================================================
    FORMAT
    ========================================================
    */

    function formatPrice(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0,00 €";
        }

        return number
            .toFixed(2)
            .replace(".", ",") + " €";

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

    /*
    ========================================================
    TOAST
    ========================================================
    */

    function toast(message) {

        const elements = refreshElements();

        if (!exists(elements.toast)) {
            return;
        }

        elements.toast.textContent = String(message);

        elements.toast.classList.add("show");

        if (toastTimer !== null) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(function () {

            if (exists(elements.toast)) {
                elements.toast.classList.remove("show");
            }

        }, 2500);

    }

    /*
    ========================================================
    QUANTITY
    ========================================================
    */

    function clampQuantity(value) {

        let number = parseInt(value, 10);

        if (!Number.isFinite(number)) {
            number = 1;
        }

        number = Math.max(1, number);
        number = Math.min(999, number);

        return number;

    }

    function updateQuantityUI() {

        quantity = clampQuantity(quantity);

        const elements = refreshElements();

        if (exists(elements.quantityValue)) {

            elements.quantityValue.textContent =
                String(quantity);

        }

        if (exists(elements.summaryQuantity)) {

            elements.summaryQuantity.textContent =
                String(quantity);

        }

        if (exists(elements.summaryMembers)) {

            elements.summaryMembers.textContent =
                formatNumber(
                    PRODUCT.members * quantity
                );

        }

        if (exists(elements.summaryPrice)) {

            elements.summaryPrice.textContent =
                formatPrice(
                    PRODUCT.price * quantity
                );

        }

    }

    function increaseQuantity() {

        quantity =
            clampQuantity(quantity + 1);

        updateQuantityUI();

    }

    function decreaseQuantity() {

        quantity =
            clampQuantity(quantity - 1);

        updateQuantityUI();

    }

    /*
    ========================================================
    LOAD CART
    ========================================================
    */

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
                "NOVA MEMBERS : erreur de lecture du panier.",
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

            return true;

        } catch (error) {

            console.error(
                "NOVA MEMBERS : erreur de sauvegarde.",
                error
            );

            return false;

        }

    }

    /*
    ========================================================
    CART COUNT
    ========================================================
    */

    function getCartCount() {

        return cart.reduce(
            function (total, item) {

                const itemQuantity =
                    Number(item.quantity);

                if (
                    !Number.isFinite(
                        itemQuantity
                    )
                ) {
                    return total;
                }

                return total + itemQuantity;

            },
            0
        );

    }

    function updateCartCount() {

        const elements = refreshElements();

        if (!exists(elements.cartCount)) {
            return;
        }

        elements.cartCount.textContent =
            String(getCartCount());

    }

    /*
    ========================================================
    CART TOTAL
    ========================================================
    */

    function getCartTotal() {

        return cart.reduce(
            function (total, item) {

                const itemQuantity =
                    Number(item.quantity);

                const itemPrice =
                    Number(item.price);

                if (
                    !Number.isFinite(itemQuantity) ||
                    !Number.isFinite(itemPrice)
                ) {
                    return total;
                }

                return total +
                    itemQuantity *
                    itemPrice;

            },
            0
        );

    }

    /*
    ========================================================
    DRAWERS
    ========================================================
    */

    function setOverlay(active) {

        const elements = refreshElements();

        if (!exists(elements.drawerOverlay)) {
            return;
        }

        if (active) {

            elements.drawerOverlay.classList.add(
                "active"
            );

            elements.drawerOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

        } else {

            elements.drawerOverlay.classList.remove(
                "active"
            );

            elements.drawerOverlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }

    function closeDrawers() {

        const elements = refreshElements();

        if (exists(elements.quantityDrawer)) {

            elements.quantityDrawer.classList.remove(
                "open"
            );

            elements.quantityDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        if (exists(elements.cartDrawer)) {

            elements.cartDrawer.classList.remove(
                "open"
            );

            elements.cartDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        setOverlay(false);

        document.body.style.overflow = "";

    }

    function openQuantity() {

        const elements = refreshElements();

        if (!exists(elements.quantityDrawer)) {

            console.error(
                "NOVA MEMBERS : quantityDrawer introuvable."
            );

            return;

        }

        if (exists(elements.cartDrawer)) {

            elements.cartDrawer.classList.remove(
                "open"
            );

            elements.cartDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        elements.quantityDrawer.classList.add(
            "open"
        );

        elements.quantityDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        setOverlay(true);

        document.body.style.overflow = "hidden";

        updateQuantityUI();

    }

    function openCart() {

        const elements = refreshElements();

        if (!exists(elements.cartDrawer)) {

            console.error(
                "NOVA MEMBERS : cartDrawer introuvable."
            );

            return;

        }

        /*
        Recharge toujours les données avant
        d'afficher le panier.
        */

        loadCart();

        updateCartCount();

        renderCart();

        if (exists(elements.quantityDrawer)) {

            elements.quantityDrawer.classList.remove(
                "open"
            );

            elements.quantityDrawer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        elements.cartDrawer.classList.add(
            "open"
        );

        elements.cartDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        setOverlay(true);

        document.body.style.overflow = "hidden";

    }

    /*
    ========================================================
    ADD TO CART
    ========================================================
    */

    function addToCart() {

        quantity =
            clampQuantity(quantity);

        /*
        Recharge le panier juste avant l'ajout.
        */

        loadCart();

        let existing =
            cart.find(function (item) {

                return item.id === PRODUCT.id;

            });

        if (existing) {

            existing.quantity =
                clampQuantity(
                    Number(existing.quantity || 0) +
                    quantity
                );

            existing.name =
                PRODUCT.name;

            existing.members =
                PRODUCT.members;

            existing.price =
                PRODUCT.price;

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

        /*
        Sauvegarde.
        */

        saveCart();

        /*
        Recharge immédiatement pour vérifier
        que la donnée est bien présente.
        */

        loadCart();

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

        /*
        Ouvre le panier.
        */

        setTimeout(function () {

            openCart();

        }, 150);

    }

    /*
    ========================================================
    REMOVE
    ========================================================
    */

    function removeCartItem(id) {

        loadCart();

        cart =
            cart.filter(function (item) {

                return item.id !== id;

            });

        saveCart();

        loadCart();

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

        const elements = refreshElements();

        if (!exists(elements.cartContent)) {
            return;
        }

        if (cart.length === 0) {

            elements.cartContent.innerHTML = `
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

        cart.forEach(function (item) {

            const itemQuantity =
                Number(item.quantity || 0);

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

        });

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

        elements.cartContent.innerHTML =
            html;

    }

    /*
    ========================================================
    PAYPAL
    ========================================================
    */

    function checkoutPayPal() {

        loadCart();

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
    CLICK HANDLER UNIQUE
    ========================================================
    */

    function setupClickHandler() {

        if (
            document.documentElement.dataset
                .novaClickHandler === "true"
        ) {
            return;
        }

        document.documentElement.dataset
            .novaClickHandler = "true";

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
                    target.closest("button");

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
                    id === "chooseButton" ||
                    id === "heroChooseButton" ||
                    id === "cardChooseButton" ||
                    id === "emptyChooseButton"
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
                    id === "heroCartButton" ||
                    id === "heroCartButton2"
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
                    id === "closeQuantity" ||
                    id === "closeCart"
                ) {

                    event.preventDefault();

                    closeDrawers();

                    return;

                }

                /*
                ============================================
                MOINS
                ============================================
                */

                if (id === "minusButton") {

                    event.preventDefault();

                    decreaseQuantity();

                    return;

                }

                /*
                ============================================
                PLUS
                ============================================
                */

                if (id === "plusButton") {

                    event.preventDefault();

                    increaseQuantity();

                    return;

                }

                /*
                ============================================
                AJOUTER AU PANIER
                ============================================
                */

                if (id === "addCartButton") {

                    event.preventDefault();

                    addToCart();

                    return;

                }

                /*
                ============================================
                PAYPAL
                ============================================
                */

                if (id === "paypalButton") {

                    event.preventDefault();

                    checkoutPayPal();

                    return;

                }

                /*
                ============================================
                SUPPRIMER
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
    OVERLAY
    ========================================================
    */

    function setupOverlay() {

        const elements = refreshElements();

        if (!exists(elements.drawerOverlay)) {
            return;
        }

        if (
            elements.drawerOverlay.dataset
                .novaBound === "true"
        ) {
            return;
        }

        elements.drawerOverlay.dataset
            .novaBound = "true";

        elements.drawerOverlay.addEventListener(
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

    function setupKeyboard() {

        if (
            document.documentElement.dataset
                .novaKeyboard === "true"
        ) {
            return;
        }

        document.documentElement.dataset
            .novaKeyboard = "true";

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {
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

        const space = $("#space");

        if (!exists(space)) {
            return;
        }

        if (
            space.dataset.starsCreated === "true"
        ) {
            return;
        }

        space.dataset.starsCreated = "true";

        for (let i = 0; i < 150; i++) {

            const star =
                document.createElement("div");

            star.className = "star";

            const size =
                Math.random() * 2 + 1;

            star.style.width =
                size + "px";

            star.style.height =
                size + "px";

            star.style.left =
                Math.random() * 100 + "%";

            star.style.top =
                Math.random() * 100 + "%";

            star.style.animationDelay =
                Math.random() * 3 + "s";

            star.style.animationDuration =
                1.5 +
                Math.random() * 3 +
                "s";

            space.appendChild(star);

        }

        createConstellations();

    }

    /*
    ========================================================
    CONSTELLATIONS
    ========================================================
    */

    function createConstellations() {

        const space = $("#space");

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

        points.forEach(function (point) {

            const element =
                document.createElement("div");

            element.className =
                "constellation";

            element.style.left =
                point[0] + "%";

            element.style.top =
                point[1] + "%";

            space.appendChild(element);

        });

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
            container.dataset.created === "true"
        ) {
            return;
        }

        container.dataset.created = "true";

        for (let i = 0; i < 45; i++) {

            const particle =
                document.createElement("div");

            particle.className =
                "loader-particle";

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.animationDelay =
                Math.random() * 4 + "s";

            particle.style.animationDuration =
                3 +
                Math.random() * 4 +
                "s";

            container.appendChild(particle);

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
            container.dataset.created === "true"
        ) {
            return;
        }

        container.dataset.created = "true";

        for (let i = 0; i < 90; i++) {

            const ember =
                document.createElement("div");

            ember.className = "ember";

            ember.style.left =
                Math.random() * 100 + "%";

            ember.style.animationDelay =
                Math.random() * 2 + "s";

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
                size * 2 + "px";

            ember.style.setProperty(
                "--drift",
                (
                    Math.random() * 100 -
                    50
                ) + "px"
            );

            container.appendChild(ember);

        }

    }

    /*
    ========================================================
    INIT
    ========================================================
    */

    function init() {

        if (initialized) {
            return;
        }

        initialized = true;

        refreshElements();

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

        setupClickHandler();

        setupOverlay();

        setupKeyboard();

        createStars();

        createLoaderParticles();

        createEmbers();

        window.NOVA_MEMBERS = {

            product: PRODUCT,

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

                    loadCart();

                    return cart.slice();

                },

            getQuantity:
                function () {

                    return quantity;

                },

            setQuantity:
                function (value) {

                    quantity =
                        clampQuantity(value);

                    updateQuantityUI();

                }

        };

        console.log(
            "NOVA MEMBERS : APP.JS chargé. Panier actif."
        );

    }

    /*
    ========================================================
    START
    ========================================================
    */

    if (
        document.readyState === "loading"
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
