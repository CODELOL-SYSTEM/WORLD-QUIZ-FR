```javascript
"use strict";

/*
============================================================
 NOVA MEMBERS
 APP.JS
 VERSION FINALE
 PANIER + QUANTITE + LOADER + ANIMATIONS
============================================================
*/

(function () {

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

    function $(id) {
        return document.getElementById(id);
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

        const element = $("toast");

        if (!element) {
            return;
        }

        element.textContent =
            String(message);

        element.classList.add("show");

        if (toastTimer !== null) {
            clearTimeout(toastTimer);
        }

        toastTimer = setTimeout(function () {

            element.classList.remove("show");

        }, 2500);
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

        const quantityValue =
            $("quantityValue");

        const summaryQuantity =
            $("summaryQuantity");

        const summaryMembers =
            $("summaryMembers");

        const summaryPrice =
            $("summaryPrice");

        if (quantityValue) {

            quantityValue.textContent =
                String(quantity);
        }

        if (summaryQuantity) {

            summaryQuantity.textContent =
                String(quantity);
        }

        if (summaryMembers) {

            summaryMembers.textContent =
                formatNumber(
                    PRODUCT.members *
                    quantity
                );
        }

        if (summaryPrice) {

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

        toast(
            "Quantité : " +
            quantity
        );
    }

    function decreaseQuantity() {

        quantity =
            clampQuantity(
                quantity - 1
            );

        updateQuantityUI();

        toast(
            "Quantité : " +
            quantity
        );
    }

    /*
    ========================================================
    CART STORAGE
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

            return true;

        } catch (error) {

            console.error(
                "NOVA MEMBERS : impossible de sauvegarder.",
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
                    Number(
                        item.quantity || 0
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

        if (!element) {
            return;
        }

        element.textContent =
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
            function (total, item) {

                const itemQuantity =
                    Number(
                        item.quantity || 0
                    );

                const itemPrice =
                    Number(
                        item.price || 0
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

    /*
    ========================================================
    OVERLAY
    ========================================================
    */

    function setOverlay(active) {

        const overlay =
            $("drawerOverlay");

        if (!overlay) {
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

    /*
    ========================================================
    DRAWERS
    ========================================================
    */

    function closeDrawers() {

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if (quantityDrawer) {

            quantityDrawer.classList.remove(
                "open"
            );

            quantityDrawer.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        if (cartDrawer) {

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

        if (!quantityDrawer) {

            console.error(
                "NOVA MEMBERS : quantityDrawer introuvable."
            );

            return;
        }

        if (cartDrawer) {

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

        if (!cartDrawer) {

            console.error(
                "NOVA MEMBERS : cartDrawer introuvable."
            );

            return;
        }

        /*
        IMPORTANT :
        on ne recharge PAS localStorage ici.
        Le panier actuel en mémoire est la source
        utilisée après un ajout.
        */

        updateCartCount();

        renderCart();

        if (quantityDrawer) {

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

        const saved =
            saveCart();

        updateCartCount();

        renderCart();

        if (!saved) {

            toast(
                "Erreur de sauvegarde du panier."
            );

            return;
        }

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

        setTimeout(function () {

            openCart();

        }, 180);
    }

    /*
    ========================================================
    REMOVE
    ========================================================
    */

    function removeCartItem(id) {

        if (!id) {
            return;
        }

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
    RENDER CART
    ========================================================
    */

    function renderCart() {

        const cartContent =
            $("cartContent");

        if (!cartContent) {
            return;
        }

        updateCartCount();

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
                        style="margin-top:20px;"
                    >
                        Choisir un pack
                    </button>

                </div>
            `;

            bindDynamicCartButtons();

            return;
        }

        let html = "";

        cart.forEach(function (item) {

            const itemQuantity =
                clampQuantity(
                    item.quantity
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
                        data-remove-id="${escapeHTML(item.id)}"
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

        cartContent.innerHTML =
            html;

        bindDynamicCartButtons();
    }

    /*
    ========================================================
    DYNAMIC CART BUTTONS
    ========================================================
    */

    function bindDynamicCartButtons() {

        const emptyChoose =
            $("emptyChooseButton");

        if (emptyChoose) {

            emptyChoose.onclick =
                function (event) {

                    event.preventDefault();

                    openQuantity();
                };
        }

        const paypalButton =
            $("paypalButton");

        if (paypalButton) {

            paypalButton.onclick =
                function (event) {

                    event.preventDefault();

                    checkoutPayPal();
                };
        }

        const removeButtons =
            document.querySelectorAll(
                "[data-remove-id]"
            );

        removeButtons.forEach(
            function (button) {

                button.onclick =
                    function (event) {

                        event.preventDefault();

                        const id =
                            button.getAttribute(
                                "data-remove-id"
                            );

                        removeCartItem(id);
                    };
            }
        );
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
    STATIC BUTTONS
    ========================================================
    */

    function bindButton(id, callback) {

        const button =
            $(id);

        if (!button) {

            console.error(
                "NOVA MEMBERS : bouton introuvable #" +
                id
            );

            return;
        }

        /*
        Supprime une ancienne fonction éventuelle.
        */

        button.onclick = null;

        button.onclick =
            function (event) {

                event.preventDefault();

                callback();
            };
    }

    function setupButtons() {

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

    /*
    ========================================================
    OVERLAY
    ========================================================
    */

    function setupOverlay() {

        const overlay =
            $("drawerOverlay");

        if (!overlay) {
            return;
        }

        overlay.onclick =
            function () {

                closeDrawers();
            };
    }

    /*
    ========================================================
    KEYBOARD
    ========================================================
    */

    function setupKeyboard() {

        document.onkeydown =
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeDrawers();
                }
            };
    }

    /*
    ========================================================
    STARS
    ========================================================
    */

    function createStars() {

        const space =
            $("space");

        if (!space) {
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

        const space =
            $("space");

        if (!space) {
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
            $("loaderParticles");

        if (!container) {
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

    /*
    ========================================================
    EMBERS
    ========================================================
    */

    function createEmbers() {

        const container =
            $("embers");

        if (!container) {
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

            ember.style.setProperty(
                "--drift",
                (
                    Math.random() * 100 -
                    50
                ) + "px"
            );

            container.appendChild(
                ember
            );
        }
    }

    /*
    ========================================================
    LOADER
    ========================================================
    */

    function startLoader() {

        const loader =
            $("loader");

        const fire =
            $("fireTransition");

        if (!loader) {
            return;
        }

        /*
        3 secondes avant la transition.
        */

        setTimeout(
            function () {

                if (fire) {

                    fire.classList.add(
                        "active"
                    );
                }

                loader.classList.add(
                    "hidden"
                );

                setTimeout(
                    function () {

                        if (fire) {

                            fire.classList.remove(
                                "active"
                            );
                        }

                    },
                    1800
                );

            },
            3000
        );
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

        /*
        Charge le panier UNE SEULE FOIS
        au démarrage.
        */

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

        setupButtons();

        setupOverlay();

        setupKeyboard();

        createStars();

        createLoaderParticles();

        createEmbers();

        startLoader();

        /*
        API globale utile si besoin.
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
