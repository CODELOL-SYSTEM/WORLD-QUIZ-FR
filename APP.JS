```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
 Version robuste
============================================================
*/

(function () {

    /*
    ========================================================
    CONFIGURATION
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

    /*
    ========================================================
    DOM
    ========================================================
    */

    const $ = function (selector) {
        return document.querySelector(selector);
    };

    const loader = $("#loader");

    const site = $("#site");

    const quantityDrawer =
        $("#quantityDrawer");

    const cartDrawer =
        $("#cartDrawer");

    const drawerOverlay =
        $("#drawerOverlay");

    const quantityValue =
        $("#quantityValue");

    const summaryQuantity =
        $("#summaryQuantity");

    const summaryMembers =
        $("#summaryMembers");

    const summaryPrice =
        $("#summaryPrice");

    const cartContent =
        $("#cartContent");

    const cartCount =
        $("#cartCount");

    const toastElement =
        $("#toast");

    /*
    ========================================================
    SAFE ELEMENT CHECK
    ========================================================
    */

    function exists(element) {

        return element !== null &&
               element !== undefined;

    }

    /*
    ========================================================
    FORMAT PRICE
    ========================================================
    */

    function formatPrice(value) {

        return Number(value)
            .toFixed(2)
            .replace(".", ",") + " €";

    }

    /*
    ========================================================
    FORMAT NUMBER
    ========================================================
    */

    function formatNumber(value) {

        return Number(value)
            .toLocaleString("fr-FR");

    }

    /*
    ========================================================
    TOAST
    ========================================================
    */

    let toastTimer = null;

    function toast(message) {

        if (!exists(toastElement)) {
            return;
        }

        toastElement.textContent =
            String(message);

        toastElement.classList.add("show");

        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(function () {

            toastElement.classList.remove("show");

        }, 2600);

    }

    /*
    ========================================================
    LOCAL STORAGE
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

            cart = parsed.filter(function (item) {

                return item &&
                       typeof item === "object";

            });

        } catch (error) {

            console.warn(
                "Impossible de charger le panier.",
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

            console.warn(
                "Impossible de sauvegarder le panier.",
                error
            );

        }

    }

    /*
    ========================================================
    DRAWERS
    ========================================================
    */

    function closeAllDrawers() {

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

        if (exists(drawerOverlay)) {

            drawerOverlay.classList.remove(
                "active"
            );

            drawerOverlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }

        document.body.style.overflow = "";

    }

    function openQuantityDrawer() {

        closeAllDrawers();

        if (!exists(quantityDrawer)) {
            return;
        }

        quantityDrawer.classList.add(
            "open"
        );

        quantityDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        if (exists(drawerOverlay)) {

            drawerOverlay.classList.add(
                "active"
            );

            drawerOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        document.body.style.overflow =
            "hidden";

        updateQuantityUI();

    }

    function openCartDrawer() {

        closeAllDrawers();

        if (!exists(cartDrawer)) {
            return;
        }

        cartDrawer.classList.add(
            "open"
        );

        cartDrawer.setAttribute(
            "aria-hidden",
            "false"
        );

        if (exists(drawerOverlay)) {

            drawerOverlay.classList.add(
                "active"
            );

            drawerOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        document.body.style.overflow =
            "hidden";

        renderCart();

    }

    /*
    ========================================================
    QUANTITY
    ========================================================
    */

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
    ADD TO CART
    ========================================================
    */

    function addToCart() {

        quantity =
            clampQuantity(quantity);

        const existing =
            cart.find(function (item) {

                return item.id === PRODUCT.id;

            });

        if (existing) {

            existing.quantity =
                clampQuantity(
                    Number(existing.quantity) +
                    quantity
                );

        } else {

            cart.push({

                id: PRODUCT.id,

                name: PRODUCT.name,

                quantity: quantity,

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
            (quantity > 1 ? "s" : "") +
            " ajouté" +
            (quantity > 1 ? "s" : "") +
            " au panier."
        );

        setTimeout(function () {

            openCartDrawer();

        }, 250);

    }

    /*
    ========================================================
    REMOVE CART ITEM
    ========================================================
    */

    function removeCartItem(id) {

        cart =
            cart.filter(function (item) {

                return item.id !== id;

            });

        saveCart();

        updateCartCount();

        renderCart();

        toast(
            "Produit retiré du panier."
        );

    }

    /*
    ========================================================
    CART COUNT
    ========================================================
    */

    function getCartCount() {

        return cart.reduce(
            function (total, item) {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );

    }

    function updateCartCount() {

        if (!exists(cartCount)) {
            return;
        }

        cartCount.textContent =
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
                    Number(item.quantity || 0);

                const itemPrice =
                    Number(item.price || 0);

                return total +
                    itemQuantity *
                    itemPrice;

            },
            0
        );

    }

    /*
    ========================================================
    RENDER CART
    ========================================================
    */

    function renderCart() {

        if (!exists(cartContent)) {
            return;
        }

        if (!cart.length) {

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

            const emptyButton =
                $("#emptyChooseButton");

            if (exists(emptyButton)) {

                emptyButton.addEventListener(
                    "click",
                    function () {

                        openQuantityDrawer();

                    }
                );

            }

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
                                    item.name || "MEMBERS"
                                )}
                            </div>

                            <div class="cart-item-members">
                                ${formatNumber(
                                    itemMembers *
                                    itemQuantity
                                )} MEMBERS
                                •
                                Quantité :
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
                        )}">
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
                    type="button">
                    Continuer avec PayPal
                </button>

            </div>
        `;

        cartContent.innerHTML =
            html;

        bindCartButtons();

    }

    /*
    ========================================================
    ESCAPE HTML
    ========================================================
    */

    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    /*
    ========================================================
    CART BUTTONS
    ========================================================
    */

    function bindCartButtons() {

        const removeButtons =
            document.querySelectorAll(
                "[data-remove-id]"
            );

        removeButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            button.getAttribute(
                                "data-remove-id"
                            );

                        removeCartItem(id);

                    }
                );

            }
        );

        const paypalButton =
            $("#paypalButton");

        if (exists(paypalButton)) {

            paypalButton.addEventListener(
                "click",
                checkoutPayPal
            );

        }

    }

    /*
    ========================================================
    PAYPAL
    ========================================================
    */

    function checkoutPayPal() {

        const total =
            getCartTotal();

        if (!cart.length) {

            toast(
                "Ton panier est vide."
            );

            return;

        }

        if (!(total > 0)) {

            toast(
                "Le montant du panier est invalide."
            );

            return;

        }

        /*
        PayPal.me utilise le montant directement
        dans l'URL.
        Exemple :
        https://paypal.me/SH0PNOVA/5.49
        */

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
    BUTTON EVENTS
    ========================================================
    */

    function bindButton(
        selector,
        callback
    ) {

        const element =
            $(selector);

        if (!exists(element)) {
            return;
        }

        element.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                callback();

            }
        );

    }

    /*
    ========================================================
    INITIALISATION
    ========================================================
    */

    function init() {

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

        bindButton(
            "#chooseButton",
            openQuantityDrawer
        );

        bindButton(
            "#heroChooseButton",
            openQuantityDrawer
        );

        bindButton(
            "#cardChooseButton",
            openQuantityDrawer
        );

        bindButton(
            "#heroCartButton",
            openCartDrawer
        );

        bindButton(
            "#heroCartButton2",
            openCartDrawer
        );

        bindButton(
            "#closeQuantity",
            closeAllDrawers
        );

        bindButton(
            "#closeCart",
            closeAllDrawers
        );

        bindButton(
            "#minusButton",
            decreaseQuantity
        );

        bindButton(
            "#plusButton",
            increaseQuantity
        );

        bindButton(
            "#addCartButton",
            addToCart
        );

        if (exists(drawerOverlay)) {

            drawerOverlay.addEventListener(
                "click",
                closeAllDrawers
            );

        }

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    closeAllDrawers();

                }

            }
        );

        createStars();

        createLoaderParticles();

        createEmbers();

        console.log(
            "NOVA MEMBERS : APP.JS chargé correctement."
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

        const fragment =
            document.createDocumentFragment();

        for (
            let index = 0;
            index < 130;
            index++
        ) {

            const star =
                document.createElement("div");

            star.className =
                "star";

            star.style.left =
                Math.random() * 100 + "%";

            star.style.top =
                Math.random() * 100 + "%";

            const size =
                Math.random() * 2 + 1;

            star.style.width =
                size + "px";

            star.style.height =
                size + "px";

            star.style.animationDelay =
                Math.random() * 3 + "s";

            fragment.appendChild(
                star
            );

        }

        space.appendChild(
            fragment
        );

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

        const points = [
            [18,18],
            [22,14],
            [27,19],
            [31,12],
            [77,18],
            [82,24],
            [88,16],
            [84,32],
            [11,67],
            [17,61],
            [24,70],
            [29,64]
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

        for (
            let index = 0;
            index < 40;
            index++
        ) {

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

            container.appendChild(
                particle
            );

        }

    }

    /*
    ========================================================
    FIRE EMBERS
    ========================================================
    */

    function createEmbers() {

        const container =
            $("#embers");

        if (!exists(container)) {
            return;
        }

        for (
            let index = 0;
            index < 75;
            index++
        ) {

            const ember =
                document.createElement("div");

            ember.className =
                "ember";

            ember.style.left =
                Math.random() * 100 + "%";

            ember.style.animationDelay =
                Math.random() * 1.7 + "s";

            ember.style.animationDuration =
                1.2 +
                Math.random() * 1.7 +
                "s";

            const size =
                2 +
                Math.random() * 5;

            ember.style.width =
                size + "px";

            ember.style.height =
                size * 2 + "px";

            container.appendChild(
                ember
            );

        }

    }

    /*
    ========================================================
    PUBLIC API
    ========================================================
    */

    window.NOVA_MEMBERS = {

        product: PRODUCT,

        getCart: function () {

            return cart.slice();

        },

        getQuantity: function () {

            return quantity;

        },

        openQuantity: openQuantityDrawer,

        openCart: openCartDrawer,

        closeDrawers: closeAllDrawers,

        addToCart: addToCart,

        checkout: checkoutPayPal

    };

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
