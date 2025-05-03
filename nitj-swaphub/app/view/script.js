"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getDoc,
    getFirestore,
    doc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBeZQkmn6sLHOFvR0b1kp91ZXjTacYPsvU",
    authDomain: "nitjswaphub-a156f.firebaseapp.com",
    projectId: "nitjswaphub-a156f",
    storageBucket: "nitjswaphub-a156f.firebasestorage.app",
    messagingSenderId: "118274918479",
    appId: "1:118274918479:web:c530963323abf135c7c23a",
    measurementId: "G-B245F4SB05",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (!localStorage.getItem("view")) window.location.replace("/app");

const productTitle_e = document.getElementById("product-title");
const description_e = document.getElementById("description");
const exchangeMethod_e = document.getElementById("exchange-method");
const imgSect_e = document.getElementById("img-display");
const opPFP_e = document.getElementById("op-pfp");
const opName_e = document.getElementById("op-name");
const opEmail_e = document.getElementById("op-email");
const productImg_e = document.querySelector("#img-display > img");

const listing = await getDoc(doc(db, "listings", localStorage.getItem("view")));
const data = listing.data();

// imgSect_e.style.backgroundImage = `url(${data.thumbnail_img})`;
productImg_e.src = data.thumbnail_img;

productTitle_e.innerText = data.title;
description_e.innerText = data.description;
if (data.exchange) {
    exchangeMethod_e.classList.add("exchange");
    exchangeMethod_e.innerHTML =
        '<ion-icon name="repeat-outline"></ion-icon> Exchange';
} else {
    exchangeMethod_e.classList.add("payment");
    exchangeMethod_e.innerText = `Rs. ${data.price}`;
}

opPFP_e.src = data.pfp_url;
opName_e.innerText = data.op_name;
opEmail_e.href += opEmail_e.innerText = data.op_email;
