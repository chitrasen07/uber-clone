// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACD5hraTd1c25ypmI_VEDQXrODUrD37OY",
  authDomain: "uber-a93b6.firebaseapp.com",
  projectId: "uber-a93b6",
  storageBucket: "uber-a93b6.firebasestorage.app",
  messagingSenderId: "582978006733",
  appId: "1:582978006733:web:79b545515fa2d78ce8c384",
  measurementId: "G-PDCKZ9TJFM"
};

// Initialize Firebase client SDK
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth, app };