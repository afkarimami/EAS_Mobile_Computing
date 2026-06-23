// src/context/AuthContext.js
import {
    createUserWithEmailAndPassword, // 1. 🟢 TAMBAHKAN IMPORT INI UNTUK DAFTAR
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
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

  // 3. 🟢 TAMBAHKAN FUNGSI REGISTER INI
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 4. 🟢 MASUKKAN 'register' KE DALAM VALUE PROVIDER DI BAWAH INI
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};