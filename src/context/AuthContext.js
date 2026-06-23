// src/context/AuthContext.js
import {
  onAuthStateChanged,
  signInWithEmailAndPassword, // Tambahkan ini untuk login
  signOut // Tambahkan ini untuk logout
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Masukkan fungsi login dan logout ke dalam value Provider
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};