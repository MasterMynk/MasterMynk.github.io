"use stict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    collection,
    getDocs,
    getFirestore,
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
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getFirestore(app);

const nameToGreet = document.getElementById("name-to-greet");
const main_e = document.getElementsByTagName("main")[0];

const hideModal = overlay => overlay.classList.add("hidden");
const showModal = overlay => overlay.classList.remove("hidden");
const signOutModalOverlay = document.getElementById("sign-out-modal-overlay");
let activeModal;

/* Authentication stuff */
provider.setCustomParameters({
    hd: "nitj.ac.in",
});

onAuthStateChanged(auth, user => {
    if (user) {
        if (!user.email.endsWith("@nitj.ac.in")) deleteUser(user);
        const firstName = user.displayName.split(" ", 1)[0];
        nameToGreet.innerText =
            " " + firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();

        console.log(user.photoURL);
    } else window.location.replace("/");
});

/* Web page basic functionality */
document
    .getElementById("sign-out-btn")
    .addEventListener("click", () =>
        signOut(auth).catch(e =>
            console.log(`Error signing out ${e.code} with message ${e.message}`)
        )
    );

Array.from(document.getElementsByClassName("modal-overlay")).forEach(overlay =>
    overlay.addEventListener("click", e => {
        if (
            e.target === overlay ||
            e.target === overlay.getElementsByClassName("exit-btn")[0]
        )
            hideModal(overlay);
    })
);

document.addEventListener("keyup", e => {
    if (e.key === "Escape") hideModal(activeModal);
});

document.getElementById("sign-out-checkbox").addEventListener("input", e => {
    activeModal = signOutModalOverlay;
    showModal(signOutModalOverlay);
});

/* Getting and displaying listings */
const querySnapshot = await getDocs(collection(db, "listings"));
querySnapshot.forEach(doc => {
    const data = doc.data();

    const listing = document.createElement("a");
    listing.classList.add("product-listing");
    listing.href = "/app/view";
    listing.addEventListener("click", e =>
        localStorage.setItem("view", doc.id)
    );

    const thumbnailCont = document.createElement("div");
    thumbnailCont.classList.add("thumbnail-cont");

    const img = document.createElement("img");
    img.src = data.thumbnail_img;
    img.alt = "Product Image";
    img.classList.add("thumbnail");

    thumbnailCont.appendChild(img);

    const title = document.createElement("h3");
    title.classList.add("title");
    title.innerText = data.title;

    const value = document.createElement("div");
    value.classList.add("value");
    if (data.exchange) {
        value.classList.add("exchange");
        value.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
    } else value.innerText = `Rs. ${data.price}`;

    const opCont = document.createElement("div");
    opCont.classList.add("op-cont");

    const postedBy = document.createElement("p");
    postedBy.innerText = "Posted by";

    const opName = document.createElement("p");
    opName.classList.add("op-name");
    opName.innerText = data.op_name; // TOCHANGE

    const opEmail = document.createElement("a");
    opEmail.classList.add("op-email");
    opEmail.href = `mailto:${data.op_email}`; // TOCHANGE
    opEmail.innerText = data.op_email;

    opCont.append(postedBy, opName, opEmail);
    listing.append(thumbnailCont, title, value, opCont);
    main_e.appendChild(listing);
});

/* <a class="product-listing" href="">
    <div class="thumbnail-cont">
        <img
            src="/assets/coat.jpg"
            alt="Product Image"
            class="thumbnail"
        />
    </div>
    <h3 class="title">White Lab Coat</h3>
    <div class="value exchange">
        <ion-icon name="repeat-outline"></ion-icon>
    </div>
    <div class="op-cont">
        <p>Posted by</p>
        <p class="op-name">Mayank Ajay Shigaonker</p>
        <a class="op-email" href="mailto:mayankas.vl.24@nitj.ac.in"
            >mayankas.vl.24@nitj.ac.in</a
        >
    </div>
</a> */
