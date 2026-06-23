// src/services/firebaseService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

// --- 1. Autentikasi ---
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// --- 2. Database (Firestore) ---

// CREATE/UPDATE: Tambah ke favorit
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

// READ: Ambil daftar favorit
export const getFavorites = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().favorites || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

// DELETE: Hapus dari favorit
export const removeFavorite = async (userId, movieData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      favorites: arrayRemove(movieData)
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};