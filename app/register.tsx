import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform // 🟢 1. Import Platform untuk mendeteksi Web/HP
  ,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// @ts-ignore
import { AuthContext } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useContext(AuthContext) as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🟢 2. Fungsi pembantu agar Alert bisa muncul di Web maupun HP tanpa macet
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    // 🟢 3. Jejak Log untuk memastikan tombol merespons saat diklik
    console.log('Tombol Daftar Akun berhasil dipicu!', { email, password, confirmPassword });

    if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
      showAlert('Error', 'Semua kolom harus diisi!');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    try {
      setLoading(true);
      console.log('Mengirim data pendaftaran ke AuthContext Firebase...');
      
      // Memanggil fungsi register Firebase melalui Context
      await register(email, password);
      
      console.log('Pendaftaran sukses di server Firebase!');
      showAlert('Berhasil', 'Akun berhasil dibuat! Silakan masuk.');
      router.replace('/login'); 
    } catch (error: any) {
      console.error('Terjadi kesalahan saat register:', error);
      
      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar digunakan akun lain.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah (minimal 6 karakter).';
      } else if (error.message) {
        errorMessage = error.message; // Tampilkan pesan bawaan jika ada kendala konfigurasi
      }
      
      showAlert('Pendaftaran Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.logoTitle}>🍿 Buat Akun</ThemedText>
        <ThemedText type="subtitle">Daftar sekarang untuk mulai menyimpan film</ThemedText>
      </ThemedView>

      <ThemedView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Email Baru"
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

        <TextInput
          style={styles.input}
          placeholder="Ulangi Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ThemedText style={styles.buttonText}>Daftar Akun</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}>
          <ThemedText style={styles.linkText}>Sudah punya akun? Masuk di sini</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 30, backgroundColor: 'transparent' },
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
  linkButton: { alignItems: 'center', marginTop: 10 },
  linkText: { color: '#A1CEDC', fontSize: 14 },
});