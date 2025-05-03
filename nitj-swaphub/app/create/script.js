"use stict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    collection,
    addDoc,
    getFirestore,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();
const auth = getAuth();

provider.setCustomParameters({
    hd: "nitj.ac.in",
});

const price_e = document.getElementById("price");
const exchangeInp = document.getElementById("exchange");
const form = document.getElementsByTagName("form")[0];
const titleInp = document.getElementById("title");
const thumbnailInp = document.getElementById("thumbnail-inp");
const descriptionInp = document.getElementById("description");
const thumbnailGuidance = document.getElementById("thumbnail-guidance");

let displayName;
let email;
let pfpURL;

onAuthStateChanged(auth, user => {
    if (user) {
        if (!user.email.endsWith("@nitj.ac.in")) deleteUser(user);

        displayName = user.displayName
            .split(" ")
            .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        email = user.email;
        pfpURL = user.photoURL;
    } else window.location.replace("/");
});

document.getElementById("trade-type-cont").addEventListener("input", e => {
    if (e.target === exchangeInp) price_e.disabled = true;
    else price_e.disabled = false;
});

document.getElementById("post-btn").addEventListener("click", async e => {
    if (form.checkValidity()) {
        e.preventDefault();
    }

    console.log(thumbnailInp.files);

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const docRef = await addDoc(collection(db, "listings"), {
                title: titleInp.value,
                thumbnail_img: reader.result,
                price: price_e.disabled ? null : Number(price_e.value),
                exchange: price_e.disabled,
                op_name: displayName,
                op_email: email,
                description: descriptionInp.value,
                pfp_url: pfpURL,
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }

        window.location.href = "/nitj-swaphub/app";
    };
    reader.onerror = () => {
        console.log("Error occurred reading file");
    };
    reader.readAsDataURL(thumbnailInp.files[0]);
});

thumbnailInp.addEventListener("change", e => {
    // Greater than 1 Mib
    if (e.target.files.length === 0)
        thumbnailGuidance.classList.remove("warning", "affirm");
    else if (e.target.files[0].size > 5245000) {
        console.log("Here");
        e.target.value = "";
        thumbnailGuidance.classList.add("warning");
        thumbnailGuidance.classList.remove("affirm");
    } else {
        thumbnailGuidance.classList.remove("warning");
        thumbnailGuidance.classList.add("affirm");
    }
});

document
    .querySelectorAll('input[inputmode="numeric"]')
    .forEach(inp =>
        inp.addEventListener(
            "input",
            e => (e.target.value = e.target.value.replaceAll(/\D/g, ""))
        )
    );

// {
// 	title: string
// 	thumbnail: string
// 	price: int/null
// 	exchange: bool
// 	op_name: string
// 	op_email: string
// 	images: [string]
// 	description: string
// }
