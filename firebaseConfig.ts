
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configured for Project: mymarket-6a23e
const firebaseConfig = {
  apiKey: "AIzaSyCon1jQQCifbBihNA1Q7byLie4GFmDeeXY",
  authDomain: "mymarket-6a23e.firebaseapp.com",
  projectId: "mymarket-6a23e",
  storageBucket: "mymarket-6a23e.firebasestorage.app",
  messagingSenderId: "282889168962",
  appId: "1:282889168962:web:4699ac777362c993d8a5db",
  measurementId: "G-S7HYJFS39J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
