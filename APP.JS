```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
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

    /*
    ========================================================
    ELEMENTS
    ========================================================
    */

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
    EXISTS
    ========================================================
    */

    function exists(element) {

        return (
            element !== null &&
            element !== undefined
        );

    }

    /*
    ========================================================
    PRICE
    ========================================================
    */

    function formatPrice(value) {

        return Number(value)
            .toFixed(2)
            .replace(".", ",") + " €";

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
    HTML ESCAPE
    ========================================================
    */

    function escapeHTML(value) {

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

        toastElement.classList.add(
            "show"
        );

        if (toastTimer) {

            clearTimeout(
                toastTimer
            );

        }

        toastTimer =
            setTimeout(
                function () {

                    toastElement.classList.remove(
                        "show"
                    );

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
                            typeof item ===
                            "object"
                        );

                    }
                );

        } catch (error) {

            console.warn(
                "Erreur panier :",
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
                "Impossible de sauvegarder.",
                error
            );

        }

    }

    /*
    ========================================================
    QUANTITY CLAMP
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
    CLOSE DRAWERS
    ========================================================
    */

    function closeDrawers() {

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

        document.body.style.overflow =
            "";

    }

    /*
    ========================================================
    OPEN QUANTITY
    ========================================================
    */

    function openQuantity() {

        closeDrawers();

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

    /*
    ========================================================
    OPEN CART
    ========================================================
    */

    function openCart() {

        closeDrawers();

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
                    ) + quantity
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
            250
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
    REMOVE
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
                        style="
                            margin-top:20px;
                        ">

                        Choisir un pack

                    </button>

                </div>
            `;

            const button =
                $("#emptyChooseButton");

            if (exists(button)) {

                button.addEventListener(
                    "click",
                    openQuantity
                );

            }

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

                                <div
                                    class="cart-item-name">

                                    ${escapeHTML(
                                        item.name ||
                                        "MEMBERS"
                                    )}

                                </div>

                                <div
                                    class="cart-item-members">

                                    ${formatNumber(
                                        itemMembers *
                                        itemQuantity
                                    )}

                                    MEMBERS

                                    • Quantité :
                                    ${itemQuantity}

                                </div>

                            </div>

                            <div
                                class="cart-item-price">

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

                    <strong
                        class="cart-total-price">

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

        bindCartActions();

    }

    /*
    ========================================================
    CART ACTIONS
    ========================================================
    */

    function bindCartActions() {

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
    BUTTON HELPER
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
    STARS
    ========================================================
    */

    function createStars() {

        const space =
            $("#space");

        if (!exists(space)) {
            return;
        }

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
    KEYBOARD
    ========================================================
    */

    function keyboardEvents() {

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
    INITIALISATION
    ========================================================
    */

    function init() {

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

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

        if (exists(drawerOverlay)) {

            drawerOverlay.addEventListener(
                "click",
                closeDrawers
            );

        }

        createStars();

        createLoaderParticles();

        createEmbers();

        keyboardEvents();

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
                }

        };

        console.log(
            "NOVA MEMBERS : APP.JS chargé."
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
