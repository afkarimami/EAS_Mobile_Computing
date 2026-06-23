// app/login.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// Impor langsung fungsi backend Firebase buatan Anda

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. TAMBAHKAN STATE INI: false = Mode Login, true = Mode Daftar
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 2. MODIFIKASI FUNGSI EKSEKUSI UTAMA
  const handleAuth = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Email dan Password tidak boleh kosong!');
      return;
    }

    try {
      setLoading(true);
      
      Alert.alert('Berhasil', 'Selamat datang di CineTracker!');
      router.replace('/(tabs)'); 
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan. Periksa kembali data Anda.';
      
      // Menangani pesan error Firebase agar lebih mudah dibaca user
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah (minimal 6 karakter).';
      }
      
      Alert.alert(isRegisterMode ? 'Pendaftaran Gagal' : 'Login Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.logoTitle}>🍿 CineTracker</ThemedText>
        {/* 3. SUBTITLE DINAMIS MENYESUAIKAN MODE */}
        <ThemedText type="subtitle">
          {isRegisterMode ? "Daftar akun baru untuk film favoritmu" : "Masuk untuk menyimpan film favoritmu"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Masukkan Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* 4. TOMBOL UTAMA MENJALANKAN handleAuth */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ThemedText style={styles.buttonText}>
              {isRegisterMode ? "Daftar Akun" : "Masuk"}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* 🛠️ PERUBAHAN BARU: Tombol untuk pindah ke halaman Register */}
        <TouchableOpacity 
          onPress={() => router.replace('/register' as any)} 
          style={styles.linkButton}
        >
          <ThemedText style={styles.linkText}>Belum punya akun? Daftar di sini</ThemedText>
        </TouchableOpacity>

      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 40, backgroundColor: 'transparent' },
  logoTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  formContainer: { backgroundColor: 'transparent', gap: 15 },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A1CEDC',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  // Stylings tambahan untuk teks link register
  linkButton: { alignItems: 'center', marginTop: 15 },
  linkText: { color: '#A1CEDC', fontSize: 14, fontWeight: '500' },
});