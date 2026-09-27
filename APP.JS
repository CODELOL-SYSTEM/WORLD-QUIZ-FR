```javascript
"use strict";

/*
================================================================
 NOVASHOP MEMBERS
 APP.JS
 VERSION COMPLÈTE
================================================================

 Fonctionnalités :

 - Loader de 3 secondes
 - Transition feu
 - Particules
 - Étoiles
 - Constellations
 - Éclairs
 - Formulaire Discord
 - Quantité
 - Panier
 - LocalStorage
 - Tiroir gauche
 - Tiroir droit
 - Overlay
 - Fermeture X
 - Fermeture Échap
 - Toasts
 - PayPal
 - Validation
 - Responsive
 - Protection contre erreurs JS
================================================================
*/


(function () {

    /* ============================================================
       CONFIGURATION
    ============================================================ */

    const CONFIG = {

        product: {
            id: "members-1k",
            name: "MEMBERS",
            members: 1000,
            price: 5.49
        },

        paypal: {
            baseUrl: "https://paypal.me/SH0PNOVA"
        },

        storage: {
            cart: "novashop_members_cart_v3"
        },

        quantity: {
            min: 1,
            max: 9999
        },

        loader: {
            duration: 3000
        },

        fire: {
            delayAfterLoader: 250,
            visibleDuration: 2800,
            fadeDuration: 1700,
            siteRevealDelay: 1800
        },

        background: {
            stars: 150,
            bolts: 12,
            constellationLines: 20
        }

    };


    /* ============================================================
       ÉTAT
    ============================================================ */

    let quantity = 1;

    let cart = [];

    let currentDrawer = null;

    let isInitialized = false;


    /* ============================================================
       DOM HELPER
    ============================================================ */

    function $(selector) {

        try {

            return document.querySelector(selector);

        } catch (error) {

            console.error(
                "Erreur DOM :",
                selector,
                error
            );

            return null;

        }

    }


    function $all(selector) {

        try {

            return Array.from(
                document.querySelectorAll(selector)
            );

        } catch (error) {

            console.error(
                "Erreur DOM multiple :",
                selector,
                error
            );

            return [];

        }

    }


    /* ============================================================
       DOM
    ============================================================ */

    const DOM = {};


    function cacheDOM() {

        DOM.body =
            document.body;

        DOM.loader =
            $("#loader");

        DOM.loaderProgress =
            $("#loaderProgress");

        DOM.loaderPercent =
            $("#loaderPercent");

        DOM.fire =
            $("#fireTransition");

        DOM.site =
            $("#site");

        DOM.space =
            $("#spaceBackground");

        DOM.overlay =
            $("#drawerOverlay");

        DOM.quantityDrawer =
            $("#quantityDrawer");

        DOM.cartDrawer =
            $("#cartDrawer");

        DOM.chooseButton =
            $("#chooseButton");

        DOM.heroCartButton =
            $("#heroCartButton");

        DOM.cartButton =
            $("#cartButton");

        DOM.closeQuantity =
            $("#closeQuantity");

        DOM.closeCart =
            $("#closeCart");

        DOM.minusButton =
            $("#minusButton");

        DOM.plusButton =
            $("#plusButton");

        DOM.addCartButton =
            $("#addCartButton");

        DOM.quantityValue =
            $("#quantityValue");

        DOM.membersPreview =
            $("#membersPreview");

        DOM.totalPreview =
            $("#totalPreview");

        DOM.discordUsername =
            $("#discordUsername");

        DOM.discordServer =
            $("#discordServer");

        DOM.usernameError =
            $("#usernameError");

        DOM.serverError =
            $("#serverError");

        DOM.cartItems =
            $("#cartItems");

        DOM.cartTotal =
            $("#cartTotal");

        DOM.cartCount =
            $("#cartCount");

        DOM.paypalButton =
            $("#paypalButton");

        DOM.toastContainer =
            $("#toastContainer");

    }


    /* ============================================================
       PRIX
    ============================================================ */

    function formatPrice(value) {

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {

            return "0,00 €";

        }

        return number.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + " €";

    }


    /* ============================================================
       NOMBRE
    ============================================================ */

    function formatNumber(value) {

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }

        return number.toLocaleString(
            "fr-FR"
        );

    }


    /* ============================================================
       HTML SAFE
    ============================================================ */

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


    /* ============================================================
       RANDOM
    ============================================================ */

    function random(min, max) {

        return (
            Math.random() *
            (max - min)
        ) + min;

    }


    /* ============================================================
       RANDOM INTEGER
    ============================================================ */

    function randomInt(min, max) {

        return Math.floor(
            random(min, max + 1)
        );

    }


    /* ============================================================
       LOCAL STORAGE
    ============================================================ */

    function loadCart() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storage.cart
                );

            if (!raw) {

                return [];

            }

            const parsed =
                JSON.parse(raw);

            if (
                !Array.isArray(parsed)
            ) {

                return [];

            }

            return parsed.filter(
                isValidCartItem
            );

        } catch (error) {

            console.error(
                "Erreur chargement panier :",
                error
            );

            return [];

        }

    }


    function isValidCartItem(item) {

        if (
            !item ||
            typeof item !== "object"
        ) {

            return false;

        }

        if (
            typeof item.quantity !==
            "number"
        ) {

            return false;

        }

        if (
            item.quantity < 1
        ) {

            return false;

        }

        if (
            typeof item.price !==
            "number"
        ) {

            return false;

        }

        return true;

    }


    function saveCart() {

        try {

            localStorage.setItem(
                CONFIG.storage.cart,
                JSON.stringify(cart)
            );

        } catch (error) {

            console.error(
                "Erreur sauvegarde panier :",
                error
            );

            showToast(
                "Impossible de sauvegarder le panier.",
                "error"
            );

        }

    }


    /* ============================================================
       BACKGROUND STARS
    ============================================================ */

    function createStars() {

        if (!DOM.space) {

            return;

        }

        const fragment =
            document.createDocumentFragment();

        for (
            let i = 0;
            i < CONFIG.background.stars;
            i++
        ) {

            const star =
                document.createElement("span");

            star.className =
                "star";

            const size =
                random(.7, 2.4);

            star.style.width =
                `${size}px`;

            star.style.height =
                `${size}px`;

            star.style.left =
                `${random(0,100)}%`;

            star.style.top =
                `${random(0,100)}%`;

            star.style.setProperty(
                "--star-speed",
                `${random(1.8,5)}s`
            );

            star.style.animationDelay =
                `${random(0,5)}s`;

            fragment.appendChild(
                star
            );

        }

        DOM.space.appendChild(
            fragment
        );

    }


    /* ============================================================
       ELECTRIC BOLTS
    ============================================================ */

    function createElectricBolts() {

        if (!DOM.space) {

            return;

        }

        for (
            let i = 0;
            i < CONFIG.background.bolts;
            i++
        ) {

            const bolt =
                document.createElement("div");

            bolt.className =
                "electricBolt";

            bolt.style.left =
                `${random(-5,100)}%`;

            bolt.style.top =
                `${random(-10,100)}%`;

            bolt.style.height =
                `${random(90,260)}px`;

            bolt.style.setProperty(
                "--bolt-angle",
                `${random(-70,70)}deg`
            );

            bolt.style.setProperty(
                "--bolt-duration",
                `${random(2.5,6)}s`
            );

            bolt.style.setProperty(
                "--bolt-delay",
                `${random(0,6)}s`
            );

            DOM.space.appendChild(
                bolt
            );

        }

    }


    /* ============================================================
       CONSTELLATIONS
    ============================================================ */

    function createConstellations() {

        if (!DOM.space) {

            return;

        }

        for (
            let i = 0;
            i < CONFIG.background.constellationLines;
            i++
        ) {

            const line =
                document.createElement("div");

            line.className =
                "constellationLine";

            line.style.left =
                `${random(0,95)}%`;

            line.style.top =
                `${random(0,95)}%`;

            line.style.width =
                `${random(40,180)}px`;

            line.style.transform =
                `rotate(${random(-55,55)}deg)`;

            line.style.opacity =
                random(.08,.3);

            DOM.space.appendChild(
                line
            );

        }

    }


    /* ============================================================
       FIRE FLAMES
    ============================================================ */

    function createFireFlames() {

        if (!DOM.fire) {

            return;

        }

        const fragment =
            document.createDocumentFragment();

        const positions = [
            [2, 300, 145],
            [12, 430, 170],
            [24, 350, 130],
            [37, 510, 190],
            [50, 450, 160],
            [61, 560, 210],
            [75, 400, 150],
            [87, 330, 140]
        ];

        positions.forEach(
            (
                [left, height, width],
                index
            ) => {

                const flame =
                    document.createElement("div");

                flame.className =
                    "flame";

                flame.style.setProperty(
                    "--flame-left",
                    `${left}%`
                );

                flame.style.setProperty(
                    "--flame-height",
                    `${height}px`
                );

                flame.style.setProperty(
                    "--flame-width",
                    `${width}px`
                );

                flame.style.setProperty(
                    "--flame-blur",
                    `${random(2,7)}px`
                );

                flame.style.setProperty(
                    "--flame-duration",
                    `${random(.35,.8)}s`
                );

                flame.style.animationDelay =
                    `${index * -.07}s`;

                fragment.appendChild(
                    flame
                );

            }
        );

        DOM.fire.appendChild(
            fragment
        );

    }


    /* ============================================================
       FIRE PARTICLES
    ============================================================ */

    function createFireParticles() {

        if (!DOM.fire) {

            return;

        }

        const fragment =
            document.createDocumentFragment();

        for (
            let i = 0;
            i < 110;
            i++
        ) {

            const particle =
                document.createElement("span");

            particle.className =
                "fireParticle";

            particle.style.setProperty(
                "--particle-left",
                `${random(0,100)}%`
            );

            particle.style.setProperty(
                "--particle-bottom",
                `${random(-5,80)}px`
            );

            particle.style.setProperty(
                "--particle-size",
                `${random(1,5)}px`
            );

            particle.style.setProperty(
                "--particle-duration",
                `${random(1.2,3.5)}s`
            );

            particle.style.setProperty(
                "--particle-delay",
                `${random(0,3)}s`
            );

            particle.style.setProperty(
                "--particle-x",
                `${random(-100,100)}px`
            );

            particle.style.setProperty(
                "--particle-y",
                `${random(-250,-80)}px`
            );

            fragment.appendChild(
                particle
            );

        }

        DOM.fire.appendChild(
            fragment
        );

    }


    /* ============================================================
       FIRE SMOKE
    ============================================================ */

    function createFireSmoke() {

        if (!DOM.fire) {

            return;

        }

        const fragment =
            document.createDocumentFragment();

        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const smoke =
                document.createElement("span");

            smoke.className =
                "fireSmoke";

            smoke.style.setProperty(
                "--smoke-left",
                `${random(5,95)}%`
            );

            smoke.style.setProperty(
                "--smoke-bottom",
                `${random(20,300)}px`
            );

            smoke.style.setProperty(
                "--smoke-size",
                `${random(50,150)}px`
            );

            smoke.style.setProperty(
                "--smoke-duration",
                `${random(2,5)}s`
            );

            smoke.style.setProperty(
                "--smoke-delay",
                `${random(0,4)}s`
            );

            smoke.style.setProperty(
                "--smoke-x",
                `${random(-160,160)}px`
            );

            fragment.appendChild(
                smoke
            );

        }

        DOM.fire.appendChild(
            fragment
        );

    }


    /* ============================================================
       FIRE ASH
    ============================================================ */

    function createFireAsh() {

        if (!DOM.fire) {

            return;

        }

        const fragment =
            document.createDocumentFragment();

        for (
            let i = 0;
            i < 65;
            i++
        ) {

            const ash =
                document.createElement("span");

            ash.className =
                "fireAsh";

            ash.style.setProperty(
                "--ash-left",
                `${random(0,100)}%`
            );

            ash.style.setProperty(
                "--ash-bottom",
                `${random(0,500)}px`
            );

            ash.style.setProperty(
                "--ash-size",
                `${random(2,7)}px`
            );

            ash.style.setProperty(
                "--ash-duration",
                `${random(2,5)}s`
            );

            ash.style.setProperty(
                "--ash-delay",
                `${random(0,4)}s`
            );

            ash.style.setProperty(
                "--ash-x",
                `${random(-180,180)}px`
            );

            fragment.appendChild(
                ash
            );

        }

        DOM.fire.appendChild(
            fragment
        );

    }


    /* ============================================================
       FIRE INITIALISATION
    ============================================================ */

    function prepareFire() {

        createFireFlames();

        createFireParticles();

        createFireSmoke();

        createFireAsh();

    }


    /* ============================================================
       LOADER PROGRESS
    ============================================================ */

    function updateLoaderProgress(
        progress
    ) {

        const safeProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );

        const percent =
            Math.floor(
                safeProgress * 100
            );

        if (DOM.loaderProgress) {

            DOM.loaderProgress.style.width =
                `${percent}%`;

        }

        if (DOM.loaderPercent) {

            DOM.loaderPercent.textContent =
                `${percent}%`;

        }

    }


    /* ============================================================
       LOADER
    ============================================================ */

    function startLoader() {

        if (!DOM.loader) {

            revealSite();

            return;

        }

        const start =
            performance.now();

        let finished =
            false;


        function frame(now) {

            if (finished) {

                return;

            }

            const elapsed =
                now - start;

            const progress =
                Math.min(
                    elapsed /
                    CONFIG.loader.duration,
                    1
                );

            updateLoaderProgress(
                progress
            );


            if (
                progress < 1
            ) {

                requestAnimationFrame(
                    frame
                );

                return;

            }


            finished = true;

            finishLoader();

        }


        requestAnimationFrame(
            frame
        );

    }


    /* ============================================================
       FINISH LOADER
    ============================================================ */

    function finishLoader() {

        updateLoaderProgress(
            1
        );


        setTimeout(
            () => {

                if (DOM.loader) {

                    DOM.loader.classList.add(
                        "loader-hidden"
                    );

                }

            },
            50
        );


        setTimeout(
            startFireTransition,
            CONFIG.fire.delayAfterLoader + 50
        );

    }


    /* ============================================================
       FIRE TRANSITION
    ============================================================ */

    function startFireTransition() {

        if (!DOM.fire) {

            revealSite();

            return;

        }

        DOM.fire.classList.add(
            "fire-active"
        );


        setTimeout(
            () => {

                DOM.fire.classList.add(
                    "fire-fade"
                );

            },
            CONFIG.fire.visibleDuration
        );


        setTimeout(
            () => {

                DOM.fire.classList.remove(
                    "fire-active"
                );

                DOM.fire.classList.remove(
                    "fire-fade"
                );

                revealSite();

            },
            CONFIG.fire.visibleDuration +
            CONFIG.fire.fadeDuration +
            CONFIG.fire.siteRevealDelay
        );

    }


    /* ============================================================
       REVEAL SITE
    ============================================================ */

    function revealSite() {

        if (!DOM.site) {

            return;

        }

        DOM.site.classList.add(
            "site-visible"
        );

    }


    /* ============================================================
       TOAST
    ============================================================ */

    function showToast(
        message,
        type = "normal"
    ) {

        if (!DOM.toastContainer) {

            return;

        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.textContent =
            message;

        DOM.toastContainer.appendChild(
            toast
        );


        setTimeout(
            () => {

                toast.classList.add(
                    "toast-out"
                );

                setTimeout(
                    () => {

                        if (
                            toast.parentNode
                        ) {

                            toast.remove();

                        }

                    },
                    400
                );

            },
            3500
        );

    }


    /* ============================================================
       DRAWER HELPERS
    ============================================================ */

    function setDrawerVisibility(
        drawer,
        visible
    ) {

        if (!drawer) {

            return;

        }

        drawer.classList.toggle(
            "drawer-visible",
            visible
        );

        drawer.setAttribute(
            "aria-hidden",
            visible
                ? "false"
                : "true"
        );

    }


    /* ============================================================
       OPEN DRAWER
    ============================================================ */

    function openDrawer(
        drawer
    ) {

        if (!drawer) {

            return;

        }


        if (
            currentDrawer === drawer
        ) {

            return;

        }


        closeDrawers(
            false
        );


        currentDrawer =
            drawer;


        setDrawerVisibility(
            drawer,
            true
        );


        if (DOM.overlay) {

            DOM.overlay.classList.add(
                "overlay-visible"
            );

            DOM.overlay.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        if (DOM.body) {

            DOM.body.classList.add(
                "drawer-open"
            );

        }

    }


    /* ============================================================
       CLOSE DRAWERS
    ============================================================ */

    function closeDrawers(
        animate = true
    ) {

        setDrawerVisibility(
            DOM.quantityDrawer,
            false
        );

        setDrawerVisibility(
            DOM.cartDrawer,
            false
        );


        if (DOM.overlay) {

            DOM.overlay.classList.remove(
                "overlay-visible"
            );

            DOM.overlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (DOM.body) {

            DOM.body.classList.remove(
                "drawer-open"
            );

        }


        currentDrawer =
            null;

    }


    /* ============================================================
       OPEN QUANTITY
    ============================================================ */

    function openQuantityDrawer() {

        updateQuantityUI();

        clearFormErrors();

        openDrawer(
            DOM.quantityDrawer
        );


        setTimeout(
            () => {

                if (
                    DOM.discordUsername
                ) {

                    DOM.discordUsername.focus();

                }

            },
            400
        );

    }


    /* ============================================================
       OPEN CART
    ============================================================ */

    function openCartDrawer() {

        renderCart();

        openDrawer(
            DOM.cartDrawer
        );

    }


    /* ============================================================
       QUANTITY
    ============================================================ */

    function setQuantity(
        value
    ) {

        let next =
            Number(value);

        if (
            !Number.isFinite(next)
        ) {

            next =
                CONFIG.quantity.min;

        }

        next =
            Math.floor(next);

        next =
            Math.max(
                CONFIG.quantity.min,
                Math.min(
                    CONFIG.quantity.max,
                    next
                )
            );

        quantity =
            next;

        updateQuantityUI();

    }


    function increaseQuantity() {

        setQuantity(
            quantity + 1
        );

    }


    function decreaseQuantity() {

        setQuantity(
            quantity - 1
        );

    }


    /* ============================================================
       QUANTITY UI
    ============================================================ */

    function updateQuantityUI() {

        const members =
            quantity *
            CONFIG.product.members;

        const total =
            quantity *
            CONFIG.product.price;


        if (DOM.quantityValue) {

            DOM.quantityValue.textContent =
                formatNumber(quantity);

        }


        if (DOM.membersPreview) {

            DOM.membersPreview.textContent =
                `${formatNumber(members)} MEMBERS`;

        }


        if (DOM.totalPreview) {

            DOM.totalPreview.textContent =
                formatPrice(total);

        }

    }


    /* ============================================================
       FORM ERROR
    ============================================================ */

    function clearFormErrors() {

        if (DOM.discordUsername) {

            DOM.discordUsername.classList.remove(
                "inputError"
            );

        }


        if (DOM.discordServer) {

            DOM.discordServer.classList.remove(
                "inputError"
            );

        }


        if (DOM.usernameError) {

            DOM.usernameError.textContent =
                "";

        }


        if (DOM.serverError) {

            DOM.serverError.textContent =
                "";

        }

    }


    /* ============================================================
       VALIDATE USERNAME
    ============================================================ */

    function validateUsername() {

        if (!DOM.discordUsername) {

            return false;

        }

        const value =
            DOM.discordUsername.value.trim();


        if (!value) {

            DOM.discordUsername.classList.add(
                "inputError"
            );

            if (DOM.usernameError) {

                DOM.usernameError.textContent =
                    "Entre ton pseudo Discord.";

            }

            return false;

        }


        if (value.length < 2) {

            DOM.discordUsername.classList.add(
                "inputError"
            );

            if (DOM.usernameError) {

                DOM.usernameError.textContent =
                    "Le pseudo est trop court.";

            }

            return false;

        }


        DOM.discordUsername.classList.remove(
            "inputError"
        );


        if (DOM.usernameError) {

            DOM.usernameError.textContent =
                "";

        }


        return true;

    }


    /* ============================================================
       VALIDATE SERVER
    ============================================================ */

    function validateServer() {

        if (!DOM.discordServer) {

            return false;

        }

        const value =
            DOM.discordServer.value.trim();


        if (!value) {

            DOM.discordServer.classList.add(
                "inputError"
            );

            if (DOM.serverError) {

                DOM.serverError.textContent =
                    "Entre le nom de ton serveur.";

            }

            return false;

        }


        if (value.length < 2) {

            DOM.discordServer.classList.add(
                "inputError"
            );

            if (DOM.serverError) {

                DOM.serverError.textContent =
                    "Le nom du serveur est trop court.";

            }

            return false;

        }


        DOM.discordServer.classList.remove(
            "inputError"
        );


        if (DOM.serverError) {

            DOM.serverError.textContent =
                "";

        }


        return true;

    }


    /* ============================================================
       VALIDATE FORM
    ============================================================ */

    function validateDiscordForm() {

        clearFormErrors();

        const usernameOK =
            validateUsername();

        const serverOK =
            validateServer();


        if (!usernameOK) {

            if (
                DOM.discordUsername
            ) {

                DOM.discordUsername.focus();

            }

            return null;

        }


        if (!serverOK) {

            if (
                DOM.discordServer
            ) {

                DOM.discordServer.focus();

            }

            return null;

        }


        return {

            username:
                DOM.discordUsername.value.trim(),

            server:
                DOM.discordServer.value.trim()

        };

    }


    /* ============================================================
       CREATE CART ITEM
    ============================================================ */

    function createCartItem(
        discord
    ) {

        return {

            id:
                CONFIG.product.id,

            name:
                CONFIG.product.name,

            quantity:
                quantity,

            members:
                CONFIG.product.members,

            price:
                CONFIG.product.price,

            discordUsername:
                discord.username,

            discordServer:
                discord.server,

            createdAt:
                new Date().toISOString()

        };

    }


    /* ============================================================
       ADD TO CART
    ============================================================ */

    function addToCart() {

        const discord =
            validateDiscordForm();


        if (!discord) {

            showToast(
                "Complète les informations Discord.",
                "error"
            );

            return;

        }


        const item =
            createCartItem(
                discord
            );


        cart.push(
            item
        );


        saveCart();

        renderCart();

        updateCartCount();

        closeDrawers();


        showToast(
            "Pack ajouté au panier.",
            "success"
        );


        setTimeout(
            () => {

                openCartDrawer();

            },
            380
        );

    }


    /* ============================================================
       CART TOTAL
    ============================================================ */

    function getCartTotal() {

        return cart.reduce(
            (
                total,
                item
            ) => {

                const quantityValue =
                    Number(
                        item.quantity
                    );

                const price =
                    Number(
                        item.price
                    );

                if (
                    !Number.isFinite(
                        quantityValue
                    ) ||
                    !Number.isFinite(
                        price
                    )
                ) {

                    return total;

                }

                return total +
                    quantityValue *
                    price;

            },
            0
        );

    }


    /* ============================================================
       CART COUNT
    ============================================================ */

    function getCartCount() {

        return cart.reduce(
            (
                total,
                item
            ) => {

                const value =
                    Number(
                        item.quantity
                    );

                if (
                    !Number.isFinite(value)
                ) {

                    return total;

                }

                return total + value;

            },
            0
        );

    }


    function updateCartCount() {

        if (!DOM.cartCount) {

            return;

        }

        DOM.cartCount.textContent =
            formatNumber(
                getCartCount()
            );

    }


    /* ============================================================
       RENDER CART
    ============================================================ */

    function renderCart() {

        if (!DOM.cartItems) {

            return;

        }


        if (
            cart.length === 0
        ) {

            DOM.cartItems.innerHTML = `
                <div class="emptyCart">
                    <div class="emptyCartIcon">
                        🛒
                    </div>

                    <div class="emptyCartText">
                        Ton panier est vide.
                    </div>
                </div>
            `;


            updateCartTotal();

            updateCartCount();

            return;

        }


        DOM.cartItems.innerHTML =
            cart.map(
                (
                    item,
                    index
                ) => {

                    const itemQuantity =
                        Number(
                            item.quantity
                        );

                    const itemMembers =
                        itemQuantity *
                        Number(
                            item.members
                        );

                    const itemPrice =
                        itemQuantity *
                        Number(
                            item.price
                        );


                    return `
                        <article
                            class="cartItem"
                            data-cart-index="${index}"
                        >

                            <div
                                class="cartItemTop"
                            >

                                <div
                                    class="cartItemName"
                                >
                                    ${escapeHTML(
                                        item.name
                                    )}
                                </div>

                                <div
                                    class="cartItemPrice"
                                >
                                    ${formatPrice(
                                        itemPrice
                                    )}
                                </div>

                            </div>


                            <div
                                class="cartItemDetails"
                            >

                                <div>
                                    <strong>
                                        Membres :
                                    </strong>
                                    ${formatNumber(
                                        itemMembers
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        Quantité :
                                    </strong>
                                    ${formatNumber(
                                        itemQuantity
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        Discord :
                                    </strong>
                                    ${escapeHTML(
                                        item.discordUsername ||
                                        ""
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        Serveur :
                                    </strong>
                                    ${escapeHTML(
                                        item.discordServer ||
                                        ""
                                    )}
                                </div>

                            </div>


                            <button
                                type="button"
                                class="removeItemButton"
                                data-remove-index="${index}"
                            >
                                Supprimer
                            </button>

                        </article>
                    `;

                }
            ).join("");


        updateCartTotal();

        updateCartCount();

    }


    /* ============================================================
       UPDATE TOTAL
    ============================================================ */

    function updateCartTotal() {

        if (!DOM.cartTotal) {

            return;

        }

        DOM.cartTotal.textContent =
            formatPrice(
                getCartTotal()
            );

    }


    /* ============================================================
       REMOVE ITEM
    ============================================================ */

    function removeCartItem(
        index
    ) {

        const safeIndex =
            Number(index);


        if (
            !Number.isInteger(
                safeIndex
            )
        ) {

            return;

        }


        if (
            safeIndex < 0 ||
            safeIndex >= cart.length
        ) {

            return;

        }


        cart.splice(
            safeIndex,
            1
        );


        saveCart();

        renderCart();


        showToast(
            "Article supprimé du panier.",
            "normal"
        );

    }


    /* ============================================================
       CLEAR CART
    ============================================================ */

    function clearCart() {

        cart = [];

        saveCart();

        renderCart();

    }


    /* ============================================================
       PAYPAL URL
    ============================================================ */

    function createPayPalURL() {

        const total =
            getCartTotal();


        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

            return null;

        }


        const amount =
            total.toFixed(2);


        return (
            `${CONFIG.paypal.baseUrl}/` +
            `${amount}`
        );

    }


    /* ============================================================
       PAYPAL CHECKOUT
    ============================================================ */

    function checkoutPayPal() {

        if (
            cart.length === 0
        ) {

            showToast(
                "Ton panier est vide.",
                "error"
            );

            return;

        }


        const url =
            createPayPalURL();


        if (!url) {

            showToast(
                "Le montant du panier est invalide.",
                "error"
            );

            return;

        }


        /*
         * Redirection vers PayPal.
         *
         * Le montant est calculé uniquement
         * à partir du panier local.
         */

        window.location.assign(
            url
        );

    }


    /* ============================================================
       INPUT EVENTS
    ============================================================ */

    function setupInputEvents() {

        if (
            DOM.discordUsername
        ) {

            DOM.discordUsername.addEventListener(
                "input",
                () => {

                    DOM.discordUsername.classList.remove(
                        "inputError"
                    );

                    if (
                        DOM.usernameError
                    ) {

                        DOM.usernameError.textContent =
                            "";

                    }

                }
            );

        }


        if (
            DOM.discordServer
        ) {

            DOM.discordServer.addEventListener(
                "input",
                () => {

                    DOM.discordServer.classList.remove(
                        "inputError"
                    );

                    if (
                        DOM.serverError
                    ) {

                        DOM.serverError.textContent =
                            "";

                    }

                }
            );

        }

    }


    /* ============================================================
       BUTTON EVENTS
    ============================================================ */

    function setupButtonEvents() {

        if (
            DOM.chooseButton
        ) {

            DOM.chooseButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openQuantityDrawer();

                }
            );

        }


        if (
            DOM.heroCartButton
        ) {

            DOM.heroCartButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCartDrawer();

                }
            );

        }


        if (
            DOM.cartButton
        ) {

            DOM.cartButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCartDrawer();

                }
            );

        }


        if (
            DOM.closeQuantity
        ) {

            DOM.closeQuantity.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    closeDrawers();

                }
            );

        }


        if (
            DOM.closeCart
        ) {

            DOM.closeCart.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    closeDrawers();

                }
            );

        }


        if (
            DOM.overlay
        ) {

            DOM.overlay.addEventListener(
                "click",
                function () {

                    closeDrawers();

                }
            );

        }


        if (
            DOM.minusButton
        ) {

            DOM.minusButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    decreaseQuantity();

                }
            );

        }


        if (
            DOM.plusButton
        ) {

            DOM.plusButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    increaseQuantity();

                }
            );

        }


        if (
            DOM.addCartButton
        ) {

            DOM.addCartButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    addToCart();

                }
            );

        }


        if (
            DOM.paypalButton
        ) {

            DOM.paypalButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    checkoutPayPal();

                }
            );

        }


        if (
            DOM.cartItems
        ) {

            DOM.cartItems.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "[data-remove-index]"
                        );


                    if (!button) {

                        return;

                    }


                    const index =
                        Number(
                            button.dataset.removeIndex
                        );


                    removeCartItem(
                        index
                    );

                }
            );

        }

    }


    /* ============================================================
       KEYBOARD
    ============================================================ */

    function setupKeyboardEvents() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeDrawers();

                }


                if (
                    event.key ===
                    "+" ||
                    event.key ===
                    "="
                ) {

                    if (
                        currentDrawer ===
                        DOM.quantityDrawer
                    ) {

                        increaseQuantity();

                    }

                }


                if (
                    event.key ===
                    "-"
                ) {

                    if (
                        currentDrawer ===
                        DOM.quantityDrawer
                    ) {

                        decreaseQuantity();

                    }

                }

            }
        );


        if (
            DOM.discordUsername
        ) {

            DOM.discordUsername.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        if (
                            DOM.discordServer
                        ) {

                            DOM.discordServer.focus();

                        }

                    }

                }
            );

        }


        if (
            DOM.discordServer
        ) {

            DOM.discordServer.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        addToCart();

                    }

                }
            );

        }

    }


    /* ============================================================
       FORM RESTORE
    ============================================================ */

    function restoreDiscordFields() {

        if (!cart.length) {

            return;

        }

        const last =
            cart[
                cart.length - 1
            ];


        if (
            !last ||
            typeof last !==
            "object"
        ) {

            return;

        }


        if (
            DOM.discordUsername &&
            last.discordUsername
        ) {

            DOM.discordUsername.value =
                last.discordUsername;

        }


        if (
            DOM.discordServer &&
            last.discordServer
        ) {

            DOM.discordServer.value =
                last.discordServer;

        }

    }


    /* ============================================================
       CLEAN CART
    ============================================================ */

    function cleanCart() {

        cart =
            cart.filter(
                (item) => {

                    if (
                        !isValidCartItem(
                            item
                        )
                    ) {

                        return false;

                    }


                    item.quantity =
                        Math.max(
                            1,
                            Math.floor(
                                Number(
                                    item.quantity
                                )
                            )
                        );


                    item.price =
                        Number(
                            item.price
                        );


                    item.members =
                        Number(
                            item.members
                        ) ||
                        CONFIG.product.members;


                    item.name =
                        item.name ||
                        CONFIG.product.name;


                    item.discordUsername =
                        String(
                            item.discordUsername ||
                            ""
                        ).slice(
                            0,
                            100
                        );


                    item.discordServer =
                        String(
                            item.discordServer ||
                            ""
                        ).slice(
                            0,
                            100
                        );


                    return true;

                }
            );

        saveCart();

    }


    /* ============================================================
       WINDOW VISIBILITY
    ============================================================ */

    function setupVisibilityEvents() {

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    document.hidden
                ) {

                    return;

                }

                renderCart();

            }
        );

    }


    /* ============================================================
       BEFORE UNLOAD
    ============================================================ */

    function setupBeforeUnload() {

        window.addEventListener(
            "beforeunload",
            function () {

                saveCart();

            }
        );

    }


    /* ============================================================
       LOG
    ============================================================ */

    function logStartup() {

        console.log(
            "=========================================="
        );

        console.log(
            "NOVASHOP MEMBERS"
        );

        console.log(
            "APP.JS chargé correctement."
        );

        console.log(
            `Prix : ${formatPrice(
                CONFIG.product.price
            )} / 1K MEMBERS`
        );

        console.log(
            `Panier : ${cart.length} ligne(s)`
        );

        console.log(
            "=========================================="
        );

    }


    /* ============================================================
       SAFETY CHECK
    ============================================================ */

    function checkRequiredDOM() {

        const required = [

            DOM.loader,
            DOM.fire,
            DOM.site,
            DOM.chooseButton,
            DOM.cartButton,
            DOM.quantityDrawer,
            DOM.cartDrawer,
            DOM.addCartButton,
            DOM.cartItems,
            DOM.paypalButton

        ];


        const missing =
            required.filter(
                (element) =>
                    !element
            );


        if (
            missing.length > 0
        ) {

            console.warn(
                "Certains éléments DOM sont absents :",
                missing
            );

        }


        return true;

    }


    /* ============================================================
       GLOBAL ERROR HANDLER
    ============================================================ */

    function setupErrorHandler() {

        window.addEventListener(
            "error",
            function (event) {

                console.error(
                    "Erreur JavaScript :",
                    event.error ||
                    event.message
                );

            }
        );


        window.addEventListener(
            "unhandledrejection",
            function (event) {

                console.error(
                    "Promise rejetée :",
                    event.reason
                );

            }
        );

    }


    /* ============================================================
       INITIALISATION
    ============================================================ */

    function init() {

        if (
            isInitialized
        ) {

            return;

        }


        isInitialized =
            true;


        cacheDOM();


        checkRequiredDOM();


        setupErrorHandler();


        cart =
            loadCart();


        cleanCart();


        createStars();

        createElectricBolts();

        createConstellations();

        prepareFire();


        updateQuantityUI();

        renderCart();

        updateCartCount();


        restoreDiscordFields();


        setupInputEvents();

        setupButtonEvents();

        setupKeyboardEvents();

        setupVisibilityEvents();

        setupBeforeUnload();


        logStartup();


        startLoader();

    }


    /* ============================================================
       DOM READY
    ============================================================ */

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


/*
================================================================
 FIN APP.JS
================================================================
*/
```
