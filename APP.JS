```javascript
"use strict";

(function () {

    /* =====================================================
       ⚠️ WEBHOOK DISCORD
       =====================================================

       COLLE TON NOUVEAU WEBHOOK ENTRE LES GUILLEMETS :

       const DISCORD_WEBHOOK_URL =
           "COLLE TON WEBHOOK ICI";

       ===================================================== */

    const DISCORD_WEBHOOK_URL =
        "https://discord.com/api/webhooks/1554159540147196074/7-OTjKnXep7B7zzlGuQTtcyHdH4bFeyGgEPfr0wnvlK1YH8U30kNKt60H26jrcDcrx3e";


    /* =====================================================
       CONFIGURATION
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

    function $(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       FORMATAGE
    ===================================================== */

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


    /* =====================================================
       TOAST
    ===================================================== */

    function toast(message) {

        const element = $("toast");

        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            element.classList.remove("show");

        }, 2500);
    }


    /* =====================================================
       QUANTITÉ
    ===================================================== */

    function clampQuantity(value) {

        let number =
            parseInt(value, 10);

        if (!Number.isFinite(number)) {
            number = 1;
        }

        return Math.max(
            1,
            Math.min(999, number)
        );
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
    }


    function decreaseQuantity() {

        quantity =
            clampQuantity(
                quantity - 1
            );

        updateQuantityUI();
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

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

                        return item &&
                            typeof item ===
                            "object";

                    })
                    .map(function (item) {

                        return {

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
                        };
                    });

        } catch (error) {

            console.error(
                "Erreur chargement panier :",
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
                "Erreur sauvegarde panier :",
                error
            );
        }
    }


    /* =====================================================
       CALCUL PANIER
    ===================================================== */

    function getCartCount() {

        return cart.reduce(
            function (total, item) {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );
    }


    function getCartTotal() {

        return cart.reduce(
            function (total, item) {

                return total +
                    Number(item.quantity || 0) *
                    Number(item.price || 0);

            },
            0
        );
    }


    function updateCartCount() {

        const element =
            $("cartCount");

        if (element) {

            element.textContent =
                String(
                    getCartCount()
                );
        }
    }


    /* =====================================================
       DRAWERS
    ===================================================== */

    function setOverlay(active) {

        const overlay =
            $("drawerOverlay");

        if (!overlay) {
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

        document.body.style.overflow = "";
    }


    function openQuantity() {

        const quantityDrawer =
            $("quantityDrawer");

        const cartDrawer =
            $("cartDrawer");

        if (!quantityDrawer) {
            return;
        }

        if (cartDrawer) {

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

        updateQuantityUI();
    }


    function openCart() {

        const cartDrawer =
            $("cartDrawer");

        const quantityDrawer =
            $("quantityDrawer");

        if (!cartDrawer) {
            return;
        }

        renderCart();

        if (quantityDrawer) {

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
       AJOUT PANIER
    ===================================================== */

    function addToCart() {

        quantity =
            clampQuantity(quantity);

        const existing =
            cart.find(function (item) {

                return item.id ===
                    PRODUCT.id;

            });

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

        renderCart();

        toast(
            quantity +
            (
                quantity > 1
                    ? " packs ajoutés"
                    : " pack ajouté"
            ) +
            " au panier."
        );

        setTimeout(
            openCart,
            100
        );
    }


    /* =====================================================
       SUPPRESSION PANIER
    ===================================================== */

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


    /* =====================================================
       AFFICHAGE PANIER
    ===================================================== */

    function renderCart() {

        const container =
            $("cartContent");

        if (!container) {
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

        cart.forEach(function (item) {

            const itemQuantity =
                Number(item.quantity);

            const total =
                itemQuantity *
                Number(item.price);

            html += `
                <div class="cart-item">

                    <div class="cart-item-top">

                        <div>

                            <div class="cart-item-name">
                                ${escapeHTML(
                                    item.name
                                )}
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
                        data-remove-id="${escapeHTML(
                            item.id
                        )}"
                    >
                        Supprimer
                    </button>

                </div>
            `;
        });

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
       PROTECTION HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       DISCORD
    ===================================================== */

    async function sendDiscordOrder() {

        if (
            !DISCORD_WEBHOOK_URL ||
            DISCORD_WEBHOOK_URL ===
            "COLLE TON WEBHOOK ICI"
        ) {

            console.warn(
                "Webhook Discord non configuré."
            );

            return false;
        }


        const total =
            getCartTotal();

        const packs =
            getCartCount();

        const members =
            packs *
            PRODUCT.members;


        const message = {

            username:
                "NOVA MEMBERS",

            embeds: [

                {

                    title:
                        "🛒 NOUVELLE COMMANDE",

                    description:
                        "Une commande vient d'être initiée.",

                    color:
                        0x8b5cf6,

                    fields: [

                        {
                            name:
                                "📦 Produit",

                            value:
                                PRODUCT.name,

                            inline:
                                true
                        },

                        {
                            name:
                                "🔢 Packs",

                            value:
                                String(packs),

                            inline:
                                true
                        },

                        {
                            name:
                                "👥 MEMBERS",

                            value:
                                formatNumber(members),

                            inline:
                                true
                        },

                        {
                            name:
                                "💰 Total",

                            value:
                                formatPrice(total),

                            inline:
                                true
                        },

                        {
                            name:
                                "💳 Paiement",

                            value:
                                "PayPal",

                            inline:
                                true
                        },

                        {
                            name:
                                "📊 Statut",

                            value:
                                "Commande initiée",

                            inline:
                                true
                        }

                    ],

                    footer: {

                        text:
                            "NOVA MEMBERS"

                    },

                    timestamp:
                        new Date().toISOString()
                }

            ]

        };


        try {

            const response =
                await fetch(
                    DISCORD_WEBHOOK_URL,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                message
                            )
                    }
                );


            if (!response.ok) {

                console.error(
                    "Discord a refusé la requête.",
                    response.status
                );

                return false;
            }

            return true;

        } catch (error) {

            console.error(
                "Erreur webhook Discord :",
                error
            );

            return false;
        }
    }


    /* =====================================================
       PAYPAL
    ===================================================== */

    async function checkoutPayPal() {

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


        toast(
            "Envoi de la commande..."
        );


        await sendDiscordOrder();


        const amount =
            total.toFixed(2);


        const url =
            PAYPAL_BASE +
            "/" +
            amount;


        setTimeout(function () {

            window.location.assign(
                url
            );

        }, 350);
    }


    /* =====================================================
       BOUTONS STATIQUES
    ===================================================== */

    function bindButton(
        id,
        handler
    ) {

        const button =
            $(id);

        if (!button) {

            console.warn(
                "Bouton introuvable :",
                id
            );

            return;
        }

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                handler();

            }
        );
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


    /* =====================================================
       BOUTONS DYNAMIQUES
    ===================================================== */

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

                    openQuantity();

                    return;
                }


                if (
                    button.id ===
                    "paypalButton"
                ) {

                    event.preventDefault();

                    checkoutPayPal();

                    return;
                }


                if (
                    button.hasAttribute(
                        "data-remove-id"
                    )
                ) {

                    event.preventDefault();

                    const id =
                        button.getAttribute(
                            "data-remove-id"
                        );

                    if (id) {

                        removeCartItem(id);
                    }
                }

            }
        );
    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    function setupOverlay() {

        const overlay =
            $("drawerOverlay");

        if (!overlay) {
            return;
        }

        overlay.addEventListener(
            "click",
            closeDrawers
        );
    }


    /* =====================================================
       CLAVIER
    ===================================================== */

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


    /* =====================================================
       ÉTOILES
    ===================================================== */

    function createStars() {

        const space =
            $("space");

        if (!space) {
            return;
        }

        for (
            let i = 0;
            i < 160;
            i++
        ) {

            const star =
                document.createElement(
                    "div"
                );

            star.className =
                "star";

            const size =
                Math.random() *
                2 +
                1;

            star.style.width =
                size +
                "px";

            star.style.height =
                size +
                "px";

            star.style.left =
                Math.random() *
                100 +
                "%";

            star.style.top =
                Math.random() *
                100 +
                "%";

            star.style.animationDelay =
                Math.random() *
                3 +
                "s";

            space.appendChild(
                star
            );
        }
    }


    /* =====================================================
       MORCEAUX DU LOGO
    ===================================================== */

    function createDebris() {

        const container =
            $("debris");

        if (!container) {
            return;
        }

        /*
         * 500 morceaux pour garder
         * l'animation fluide.
         */

        for (
            let i = 0;
            i < 500;
            i++
        ) {

            const piece =
                document.createElement(
                    "div"
                );

            piece.className =
                "debris-piece";


            const angle =
                Math.random() *
                Math.PI *
                2;


            const distance =
                100 +
                Math.random() *
                650;


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
       INTRO
    ===================================================== */

    function runIntro() {

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


        if (!intro || !site) {
            return;
        }


        /* CHARGEMENT 1 */

        setTimeout(
            function () {

                if (loadingText) {

                    loadingText.innerHTML =
                        "CHARGEMENT DU PRODUIT<span class=\"loading-dots\">...</span>";
                }

                if (loadingFill) {

                    loadingFill.style.width =
                        "35%";
                }

            },
            800
        );


        /* CHARGEMENT 2 */

        setTimeout(
            function () {

                if (loadingText) {

                    loadingText.innerHTML =
                        "CHARGEMENT DU PANIER<span class=\"loading-dots\">...</span>";
                }

                if (loadingFill) {

                    loadingFill.style.width =
                        "65%";
                }

            },
            1600
        );


        /* CHARGEMENT 3 */

        setTimeout(
            function () {

                if (loadingText) {

                    loadingText.innerHTML =
                        "CHARGEMENT...<span class=\"loading-dots\">...</span>";
                }

                if (loadingFill) {

                    loadingFill.style.width =
                        "85%";
                }

            },
            2300
        );


        /* FIN */

        setTimeout(
            function () {

                if (loadingText) {

                    loadingText.innerHTML =
                        "CHARGEMENT TERMINÉ";
                }

                if (loadingFill) {

                    loadingFill.style.width =
                        "100%";
                }

            },
            2800
        );


        /* BALLE */

        setTimeout(
            function () {

                if (ball) {

                    ball.classList.add(
                        "fly"
                    );
                }

            },
            3200
        );


        /* IMPACT + EXPLOSION */

        setTimeout(
            function () {

                if (impact) {

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


        /* TILT */

        setTimeout(
            function () {

                intro.classList.add(
                    "tilt"
                );

            },
            5000
        );


        /* POUBELLE */

        setTimeout(
            function () {

                intro.classList.add(
                    "trash-visible"
                );

            },
            5350
        );


        /* OUVERTURE POUBELLE */

        setTimeout(
            function () {

                intro.classList.add(
                    "trash-open"
                );

            },
            6050
        );


        /* MORCEAUX VERS LA POUBELLE */

        setTimeout(
            function () {

                const pieces =
                    document.querySelectorAll(
                        ".debris-piece"
                    );

                pieces.forEach(
                    function (piece) {

                        piece.style.setProperty(
                            "--x",
                            (
                                Math.random() *
                                80 -
                                40
                            ) +
                            "px"
                        );

                        piece.style.setProperty(
                            "--y",
                            (
                                250 +
                                Math.random() *
                                350
                            ) +
                            "px"
                        );
                    }
                );

            },
            6250
        );


        /* APPARITION DU SITE */

        setTimeout(
            function () {

                site.classList.add(
                    "visible"
                );

            },
            7000
        );


        /* FIN INTRO */

        setTimeout(
            function () {

                intro.classList.add(
                    "finished"
                );

            },
            7700
        );
    }


    /* =====================================================
       INITIALISATION
    ===================================================== */

    function init() {

        loadCart();

        updateQuantityUI();

        updateCartCount();

        renderCart();

        createStars();

        createDebris();

        setupStaticButtons();

        setupDynamicButtons();

        setupOverlay();

        setupKeyboard();

        runIntro();


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
                checkoutPayPal

        };


        console.log(
            "NOVA MEMBERS chargé correctement."
        );
    }


    /* =====================================================
       DÉMARRAGE
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once:true
            }
        );

    } else {

        init();
    }

})();
```
