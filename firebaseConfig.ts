
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Configured for Project: wemarket-9ad6a
const firebaseConfig = {
  apiKey: "AIzaSyASnN5_qWb9DTMgR8rvYpKPb7KPqMHr-f4",
  authDomain: "wemarket-9ad6a.firebaseapp.com",
  projectId: "wemarket-9ad6a",
  storageBucket: "wemarket-9ad6a.firebasestorage.app",
  messagingSenderId: "29481151738",
  appId: "1:29481151738:web:07fcb622a550133016ad43",
  measurementId: "G-S10RYRS6BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
