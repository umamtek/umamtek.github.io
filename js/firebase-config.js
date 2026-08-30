// =====================================================
// UMAMTEK FIREBASE CONFIGURATION
// =====================================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// Firebase configuration

const firebaseConfig = {

    apiKey:
        "AIzaSyCU-5U3KL85H7LRsHg9ck-KXo9RuTKqd68",

    authDomain:
        "umamtek-2cc57.firebaseapp.com",

    projectId:
        "umamtek-2cc57",

    storageBucket:
        "umamtek-2cc57.firebasestorage.app",

    messagingSenderId:
        "868603171659",

    appId:
        "1:868603171659:web:087f9df552ed09f354cece",

    measurementId:
        "G-KFYVWYS2TL"
};


// Initialize Firebase

const app =
    initializeApp(firebaseConfig);


// Firebase Authentication

const auth =
    getAuth(app);


// Firestore Database

const db =
    getFirestore(app);


// Export

export {
    app,
    auth,
    db
};