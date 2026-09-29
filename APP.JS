"use strict";
(function () {

  // ============================================================
  // CONFIGURATION  (à remplir)
  // ============================================================

  // Discord Developer Portal > ton application > OAuth2 > Client ID
  const DISCORD_CLIENT_ID = "1554438318622515292";

  // NOUVEAU webhook (l'ancien est public, supprime-le sur Discord)
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1554377017170853888/Yt7Tsz3BS1yIyHNOIjNB8s2mxXiXKpfYyF79lwUdOuPhPQJ6VOwdoEjadxKjscpksP1T";

  const PAYPAL_BASE = "https://paypal.me/SH0PNOVA";

  // Doit être IDENTIQUE à la Redirect URI ajoutée sur le portail Discord.
  // Exemple : https://TONPSEUDO.github.io/TONREPO/
  const REDIRECT_URI = location.origin + location.pathname.replace(/index\.html$/i, "");

  const MAX_QTY = 999;
  const CART_KEY = "members_shop_cart";
  const AUTH_KEY = "members_shop_auth";
  const STATE_KEY = "members_shop_oauth_state";

  const PRODUCTS = [
    { id: "members-1000",  name: "MEMBERS",       members: 1000,  price: 5.49,  icon: "👥", description: "Pack de 1 000 MEMBERS." },
    { id: "members-5000",  name: "MEMBERS PLUS",  members: 5000,  price: 24.99, icon: "🔥", description: "Pack de 5 000 MEMBERS." },
    { id: "members-10000", name: "MEMBERS PRO",   members: 10000, price: 44.99, icon: "💎", description: "Pack de 10 000 MEMBERS." },
    { id: "members-25000", name: "MEMBERS ULTRA", members: 25000, price: 99.99, icon: "👑", description: "Pack de 25 000 MEMBERS." }
  ];

  // ============================================================
  // ÉTAT + OUTILS
  // ============================================================

  let cart = [];
  let me = null;            // { user, guilds, exp } ou null
  let selected = null;
  let qty = 1;
  let selectedGuild = "";
  let toastTimer = null;
  let busy = false;
  let lastOrderAt = 0;

  const $ = id => document.getElementById(id);
  const fmtNum = n => new Intl.NumberFormat("fr-FR").format(n);
  const fmtEur = n => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
  const esc = v => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const getProduct = id => PRODUCTS.find(p => p.id === id);

  function toast(msg) {
    const t = $("toast"); if (!t) return;
    t.textContent = msg; t.classList.add("active");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("active"), 3200);
  }
  const syncOverlay = () => $("overlay").classList.toggle("active",
    $("cartDrawer").classList.contains("active") || $("quantityDrawer").classList.contains("active"));

  // ============================================================
  // PANIER
  // ============================================================

  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      cart = Array.isArray(parsed) ? parsed.filter(i => i && getProduct(i.id) &&
        Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= MAX_QTY) : [];
    } catch (e) { cart = []; }
  }
  const cartCount = () => cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = () => cart.reduce((t, i) => t + getProduct(i.id).price * i.quantity, 0);
  const cartMembers = () => cart.reduce((t, i) => t + getProduct(i.id).members * i.quantity, 0);
  const updateCount = () => { $("cartCount").textContent = cartCount(); };

  // ============================================================
  // AUTH DISCORD (OAuth2 implicit, 100 % navigateur)
  // ============================================================

  function login() {
    if (DISCORD_CLIENT_ID.startsWith("COLLE")) return toast("Client ID Discord non configuré dans app.js.");
    const state = crypto.getRandomValues(new Uint32Array(4)).join("-");
    sessionStorage.setItem(STATE_KEY, state);
    const url = new URL("https://discord.com/oauth2/authorize");
    url.search = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID, response_type: "token",
      redirect_uri: REDIRECT_URI, scope: "identify guilds", state, prompt: "none"
    });
    location.href = url.toString();
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    me = null; selectedGuild = "";
    renderAuth(); renderCart();
    toast("Déconnecté.");
  }

  // Appelé au retour de Discord : le token est dans le "#hash" de l'URL
  async function handleCallback() {
    if (!location.hash.includes("access_token") && !location.hash.includes("error")) return;
    const params = new URLSearchParams(location.hash.slice(1));
    history.replaceState(null, "", location.pathname + location.search);

    const expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    const token = params.get("access_token");
    if (!token || !expected || params.get("state") !== expected) { toast("Échec de la connexion Discord."); return; }

    try {
      const headers = { Authorization: "Bearer " + token };
      const [uRes, gRes] = await Promise.all([
        fetch("https://discord.com/api/users/@me", { headers }),
        fetch("https://discord.com/api/users/@me/guilds", { headers })
      ]);
      if (!uRes.ok || !gRes.ok) throw new Error("API Discord " + uRes.status + "/" + gRes.status);
      const u = await uRes.json();
      const guilds = await gRes.json();

      const MANAGE_GUILD = 0x20n;
      const allowed = guilds
        .filter(g => g.owner || (BigInt(g.permissions || 0) & MANAGE_GUILD) === MANAGE_GUILD)
        .map(g => ({ id: g.id, name: g.name, icon: g.icon }));

      const data = {
        user: { id: u.id, username: u.username, display: u.global_name || u.username, avatar: u.avatar },
        guilds: allowed,
        exp: Date.now() + Math.min(Number(params.get("expires_in")) || 3600, 21600) * 1000
      };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));  // le token n'est PAS conservé
      me = data;
      toast("Connecté avec Discord ✅");
    } catch (e) {
      console.error(e);
      toast("Échec de la connexion Discord.");
    }
  }

  function loadAuth() {
    try {
      const d = JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
      if (d && d.user && Array.isArray(d.guilds) && d.exp > Date.now()) me = d;
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) { me = null; }
    if (me && !me.guilds.some(g => g.id === selectedGuild)) selectedGuild = me.guilds[0] ? me.guilds[0].id : "";
  }

  function renderAuth() {
    const area = $("authArea");
    if (!area) return;
    if (!me) {
      area.innerHTML = '<button class="discord-btn" type="button" id="loginBtn">🎮 Connexion Discord</button>';
      $("loginBtn").addEventListener("click", login);
      return;
    }
    const u = me.user;
    const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${esc(u.id)}/${esc(u.avatar)}.png?size=64`
                            : "https://cdn.discordapp.com/embed/avatars/0.png";
    area.innerHTML = `<div class="user-chip"><img src="${avatar}" alt=""><span>${esc(u.display)}</span><a href="#" id="logoutBtn">Déconnexion</a></div>`;
    $("logoutBtn").addEventListener("click", e => { e.preventDefault(); logout(); });
  }

  // ============================================================
  // PRODUITS
  // ============================================================

  function renderProducts() {
    const grid = $("productsGrid");
    grid.innerHTML = PRODUCTS.map(p => `
      <article class="product-card">
        <div>
          <div class="product-icon">${esc(p.icon)}</div>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.description)}</p>
          <div class="product-members">👥 ${fmtNum(p.members)} MEMBERS</div>
        </div>
        <div class="product-bottom">
          <div class="price">${fmtEur(p.price)}</div>
          <button class="choose-btn" type="button" data-id="${esc(p.id)}">Choisir</button>
        </div>
      </article>`).join("");
    grid.querySelectorAll(".choose-btn").forEach(b => b.addEventListener("click", () => openQuantity(b.dataset.id)));
  }

  function openQuantity(id) {
    if (!me) { toast("Connecte-toi avec Discord pour acheter."); setTimeout(login, 900); return; }
    const p = getProduct(id); if (!p) return;
    selected = p; qty = 1;
    $("quantityProductName").textContent = p.name;
    $("quantityProductPrice").textContent = `${fmtEur(p.price)} / unité`;
    updateQty();
    $("quantityDrawer").classList.add("active"); syncOverlay();
  }
  function closeQuantity() { $("quantityDrawer").classList.remove("active"); syncOverlay(); }
  function updateQty() {
    if (!selected) return;
    $("quantityValue").textContent = qty;
    $("summaryQuantity").textContent = fmtNum(qty);
    $("summaryMembers").textContent = fmtNum(selected.members * qty);
    $("summaryPrice").textContent = fmtEur(selected.price * qty);
  }

  function addToCart() {
    if (!selected) return;
    const ex = cart.find(i => i.id === selected.id);
    if (ex) ex.quantity = Math.min(MAX_QTY, ex.quantity + qty);
    else cart.push({ id: selected.id, quantity: qty });
    saveCart(); renderCart(); updateCount(); closeQuantity();
    toast(`${selected.name} ajouté au panier.`);
  }
  function changeQty(id, d) {
    const it = cart.find(i => i.id === id); if (!it) return;
    it.quantity += d;
    if (it.quantity <= 0) cart = cart.filter(i => i.id !== id);
    else if (it.quantity > MAX_QTY) it.quantity = MAX_QTY;
    saveCart(); renderCart(); updateCount();
  }

  function renderCart() {
    const box = $("cartContent");
    if (!cart.length) {
      box.innerHTML = '<div class="empty"><div style="font-size:44px;margin-bottom:15px">🛒</div><strong>Ton panier est vide.</strong><p style="margin-top:8px">Ajoute un pack pour commencer.</p></div>';
      return;
    }
    let html = cart.map(i => {
      const p = getProduct(i.id);
      return `<div class="cart-item">
        <div><h3>${esc(p.name)}</h3>
          <p>${fmtNum(p.members)} MEMBERS × ${i.quantity}</p>
          <p>${fmtEur(p.price)} / unité</p></div>
        <div class="cart-item-right">
          <strong>${fmtEur(p.price * i.quantity)}</strong>
          <div>
            <button class="remove-item" type="button" data-a="minus" data-id="${esc(p.id)}">−</button>
            <span style="margin:0 8px">${i.quantity}</span>
            <button class="remove-item" type="button" data-a="plus" data-id="${esc(p.id)}">+</button>
          </div>
          <button class="remove-item" type="button" data-a="remove" data-id="${esc(p.id)}">Supprimer</button>
        </div></div>`;
    }).join("");

    html += `<div class="cart-total"><span>Total</span><span>${fmtEur(cartTotal())}</span></div>
      <div class="members-total">👥 ${fmtNum(cartMembers())} MEMBERS au total</div>`;

    if (!me) {
      html += `<div class="checkout-box">
        <h3>🔐 Connexion requise</h3>
        <p class="muted">Connecte-toi avec Discord pour valider ta commande. Ton pseudo et tes serveurs sont récupérés automatiquement.</p>
        <button id="loginBtn2" class="primary-btn discord" type="button" style="width:100%">🎮 Se connecter avec Discord</button>
        <p class="checkout-note">Aucun mot de passe Discord n'est demandé.</p></div>`;
    } else {
      const opts = me.guilds.map(g => `<option value="${esc(g.id)}"${g.id === selectedGuild ? " selected" : ""}>${esc(g.name)}</option>`).join("");
      html += `<div class="checkout-box">
        <h3>🎮 Informations Discord</h3>
        <p class="muted">Connecté via Discord. Choisis le serveur concerné par la commande.</p>
        <div class="field"><label>Pseudo Discord</label><input type="text" value="${esc(me.user.display)} (@${esc(me.user.username)})" readonly></div>
        <div class="field"><label for="guildSelect">Serveur Discord</label>
          ${me.guilds.length ? `<select id="guildSelect">${opts}</select>`
            : '<input type="text" value="Aucun serveur dont tu es admin" readonly>'}
        </div>
        <button id="checkoutButton" class="primary-btn" type="button" style="width:100%"${me.guilds.length ? "" : " disabled"}>💳 Commander avec PayPal</button>
        <p class="checkout-note">Seuls les serveurs que tu possèdes ou gères sont proposés.</p></div>`;
    }
    box.innerHTML = html;

    box.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
      const a = b.dataset.a, id = b.dataset.id;
      if (a === "minus") changeQty(id, -1);
      if (a === "plus") changeQty(id, 1);
      if (a === "remove") { cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); updateCount(); }
    }));
    const lb = $("loginBtn2"); if (lb) lb.addEventListener("click", login);
    const sel = $("guildSelect"); if (sel) sel.addEventListener("change", () => { selectedGuild = sel.value; });
    const cb = $("checkoutButton"); if (cb) cb.addEventListener("click", checkout);
  }

  // ============================================================
  // COMMANDE + WEBHOOK
  // ============================================================

  function orderId() {
    const d = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    const r = Array.from(crypto.getRandomValues(new Uint8Array(3))).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    return `MS-${d}-${r}`;
  }

  async function sendWebhook(id, guild, total, members) {
    if (WEBHOOK_URL.startsWith("COLLE")) { toast("Webhook non configuré dans app.js."); return false; }
    const u = me.user;
    const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
                            : "https://cdn.discordapp.com/embed/avatars/0.png";
    const footer = { text: "MEMBERS SHOP • Compte vérifié via Discord OAuth2" };
    if (guild.icon) footer.icon_url = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;

    const payload = {
      username: "MEMBERS SHOP",
      content: "🛒 **Nouvelle commande à traiter**",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: `Commande ${id}`,
        color: 0x7c3aed,
        thumbnail: { url: avatar },
        author: { name: `${u.display} (@${u.username})`, icon_url: avatar },
        fields: [
          { name: "👤 Client", value: `<@${u.id}>\n\`${u.username}\``, inline: true },
          { name: "🆔 ID Discord", value: `\`${u.id}\``, inline: true },
          { name: "🏠 Serveur", value: `**${guild.name}**\n\`${guild.id}\``, inline: true },
          { name: "📦 Produits", value: cart.map(i => {
              const p = getProduct(i.id);
              return `${p.icon} **${p.name}** × ${i.quantity} — ${fmtNum(p.members * i.quantity)} MEMBERS — ${fmtEur(p.price * i.quantity)}`;
            }).join("\n").slice(0, 1024) },
          { name: "👥 Total MEMBERS", value: fmtNum(members), inline: true },
          { name: "💰 Montant", value: fmtEur(total), inline: true },
          { name: "💳 Paiement", value: "PayPal — ⏳ à vérifier", inline: true }
        ],
        footer,
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!r.ok) console.error("Webhook refusé :", r.status, await r.text().catch(() => ""));
      return r.ok;
    } catch (e) { console.error("Erreur réseau webhook :", e); return false; }
  }

  async function checkout() {
    if (busy) return;
    if (!me) return login();
    if (!cart.length) return toast("Ton panier est vide.");
    const guild = me.guilds.find(g => g.id === selectedGuild);
    if (!guild) return toast("Choisis ton serveur Discord.");
    if (Date.now() - lastOrderAt < 10000) return toast("Patiente quelques secondes.");

    const total = Math.round(cartTotal() * 100) / 100;
    if (!(total > 0)) return toast("Montant invalide.");

    busy = true;
    const btn = $("checkoutButton");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Envoi de la commande..."; }

    const id = orderId();
    const ok = await sendWebhook(id, guild, total, cartMembers());
    if (!ok) {
      busy = false;
      if (btn) { btn.disabled = false; btn.textContent = "💳 Commander avec PayPal"; }
      return toast("Impossible d'envoyer la commande sur Discord.");
    }

    lastOrderAt = Date.now();
    toast(`Commande ${id} enregistrée. Redirection PayPal...`);
    const url = `${PAYPAL_BASE}/${total.toFixed(2)}EUR`;
    cart = []; saveCart(); updateCount();
    setTimeout(() => { location.href = url; }, 900);
  }

  // ============================================================
  // DRAWERS + ÉVÉNEMENTS
  // ============================================================

  function openCart() { renderCart(); $("cartDrawer").classList.add("active"); syncOverlay(); }
  function closeCart() { $("cartDrawer").classList.remove("active"); syncOverlay(); }

  function setupEvents() {
    $("openCart").addEventListener("click", openCart);
    $("heroCartButton").addEventListener("click", openCart);
    $("closeCart").addEventListener("click", closeCart);
    $("closeQuantity").addEventListener("click", closeQuantity);
    $("overlay").addEventListener("click", () => { closeCart(); closeQuantity(); });
    $("minusButton").addEventListener("click", () => { if (qty > 1) { qty--; updateQty(); } });
    $("plusButton").addEventListener("click", () => { if (qty < MAX_QTY) { qty++; updateQty(); } });
    $("addCartButton").addEventListener("click", addToCart);
    $("scrollProducts").addEventListener("click", () => $("productsSection").scrollIntoView({ behavior: "smooth" }));
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeQuantity(); } });
  }

  async function init() {
    setupEvents();
    loadCart();
    loadAuth();
    await handleCallback();
    renderProducts();
    renderAuth(); renderCart(); updateCount();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
