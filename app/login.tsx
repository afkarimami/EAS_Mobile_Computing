// app/login.tsx
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react'; // 1. 🟢 Tambahkan useContext
import {
  ActivityIndicator,
  Alert,
  Platform // 2. 🟢 Tambahkan Platform untuk deteksi Web
  ,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// 3. 🟢 Import AuthContext kelompokmu
// @ts-ignore
import { AuthContext } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  
  // 4. 🟢 Ambil fungsi login dari AuthContext
  const { login } = useContext(AuthContext) as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 5. 🟢 Fungsi pembantu agar Alert aman di Web browser (localhost)
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAuth = async () => {
    if (email.trim() === '' || password.trim() === '') {
      showAlert('Error', 'Email dan Password tidak boleh kosong!');
      return;
    }

    try {
      setLoading(true);
      console.log('Mencoba melakukan login ke Firebase...');
      
      // 6. 🟢 EKSEKUSI LOGIN SEBENARNYA KE FIREBASE VIA CONTEXT
      await login(email, password);
      
      console.log('Login berhasil!');
      showAlert('Berhasil', 'Selamat datang di CineTracker!');
      router.replace('/(tabs)'); 
    } catch (error: any) {
      console.error('Eror saat login:', error);
      let errorMessage = 'Terjadi kesalahan. Periksa kembali data Anda.';
      
      // Menangani pesan error Firebase agar lebih mudah dibaca user
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      }
      
      showAlert('Login Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.logoTitle}>🍿 CineTracker</ThemedText>
        <ThemedText type="subtitle">Masuk untuk menyimpan film favoritmu</ThemedText>
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

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ThemedText style={styles.buttonText}>Masuk</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/register')} 
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
  linkButton: { alignItems: 'center', marginTop: 15 },
  linkText: { color: '#A1CEDC', fontSize: 14, fontWeight: '500' },
});