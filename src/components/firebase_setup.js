// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATs6Y5eZZ07D1On5fpxyAIIrW68IaOGUE",
  authDomain: "catsta-c4f15.firebaseapp.com",
  projectId: "catsta-c4f15",
  storageBucket: "catsta-c4f15.appspot.com",
  messagingSenderId: "523726488299",
  appId: "1:523726488299:web:20523d950013a51dd6f4ae",
  measurementId: "G-3N3S74KRW4",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

//for auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

//for storage
const Imgdb = getStorage(app);
const Namedb = getFirestore(app);
//const analytics = getAnalytics(app);

export { app, auth, provider, Imgdb, Namedb };