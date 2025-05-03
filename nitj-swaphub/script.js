"use stict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    deleteUser,
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
const provider = new GoogleAuthProvider();
const auth = getAuth();

const continueToAppBtn = document.getElementById("continue-to-app-btn");
const continueWithGoogleCont = document.getElementById(
    "continue-with-google-cont"
);

provider.setCustomParameters({
    hd: "nitj.ac.in",
});

Array.from(document.getElementsByClassName("gsi-material-button")).forEach(
    btn =>
        btn.addEventListener("click", () =>
            signInWithPopup(auth, provider).catch(error =>
                console.log(
                    `Error occured with error code: ${error.code} and error message: ${error.message}`
                )
            )
        )
);

onAuthStateChanged(auth, user => {
    if (user) {
        if (!user.email.endsWith("@nitj.ac.in")) deleteUser(user);
        continueToAppBtn.style.display = "block";
        continueWithGoogleCont.style.display = "none";
    } else {
        continueToAppBtn.style.display = "none";
        continueWithGoogleCont.style.display = "block";
    }
});
