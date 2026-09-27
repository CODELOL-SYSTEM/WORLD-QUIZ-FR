```javascript
"use strict";

/*
============================================================
 NOVASHOP - APP.JS
 MEMBERS

 Le fonctionnement principal est déjà sécurisé dans
 index.html afin que les boutons restent fonctionnels
 même si ce fichier externe rencontre un problème.
============================================================
*/

console.log(
  "NOVASHOP APP.JS chargé."
);

/*
============================================================
 CONFIGURATION
============================================================
*/

window.NOVASHOP_MEMBERS = {

  product: {
    id: "members-1k",
    name: "MEMBERS",
    members: 1000,
    price: 5.49
  },

  paypal:
    "https://paypal.me/SH0PNOVA"

};

/*
============================================================
 VERIFICATION
============================================================
*/

if(
  typeof window.NOVASHOP_MEMBERS !==
  "undefined"
){

  console.log(
    "Produit MEMBERS : 1K = 5,49 €"
  );

}
```
