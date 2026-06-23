// src/config/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Salin kode dari gambar Anda ke sini
const firebaseConfig = {
  apiKey: "AIzaSyDwnzUa1rcDyvDdjkxrv8-kaVRnt7luS6g",
  authDomain: "eas-mobile-computing.firebaseapp.com",
  projectId: "eas-mobile-computing",
  storageBucket: "eas-mobile-computing.appspot.com",
  messagingSenderId: "989231140668",
  appId: "1:989231140668:web:25b7baa98007f37832d839"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang akan digunakan di file lain
export const auth = getAuth(app);
export const db = getFirestore(app);