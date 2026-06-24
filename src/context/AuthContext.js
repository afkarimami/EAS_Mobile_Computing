// src/context/AuthContext.js
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword // 1. 🟢 TAMBAHKAN IMPORT INI
} from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../config/firebaseConfig';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 2. Fungsi Logout
  const logout = () => {
    return signOut(auth);
  };

  // 3. Fungsi Register
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 4. 🟢 TAMBAHKAN FUNGSI UBAH SANDI INI
  const ubahSandi = (passwordBaru) => {
    if (auth.currentUser) {
      return updatePassword(auth.currentUser, passwordBaru);
    }
    return Promise.reject(new Error("Tidak ada pengguna yang sedang login."));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 5. 🟢 MASUKKAN 'ubahSandi' KE DALAM VALUE PROVIDER AGAR BISA DIPAKAI TEMAN ANDA
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, ubahSandi }}>
      {children}
    </AuthContext.Provider>
  );
};