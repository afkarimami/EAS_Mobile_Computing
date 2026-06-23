// src/services/firebaseService.js

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

// 1. Fungsi Autentikasi
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// 2. Fungsi Database (Firestore)
// Fungsi ini akan dipanggil oleh Frontend saat user klik "Like" atau "Add to Favorite"
export const addMovieToFavorites = async (userId, movieData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      favorites: arrayUnion(movieData)
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};