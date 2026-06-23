import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';

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

  const handleRegister = async () => {
    if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
      Alert.alert('Error', 'Semua kolom harus diisi!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok!');
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      Alert.alert('Berhasil', 'Akun berhasil dibuat! Silakan masuk.');
      router.replace('/login');
    } catch (error: any) {
      let errorMessage = 'Gagal mendaftar. Coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah digunakan.';
      }
      Alert.alert('Pendaftaran Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cardContainer}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.logoTitle}>Buat <ThemedText style={styles.logoHighlight}>Akun</ThemedText></ThemedText>
          <ThemedText style={styles.logoSubtitle}>Gabung MovieLicious untuk memantau film favoritmu</ThemedText>
        </ThemedView>

        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.inputLabel}>Email Baru</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <ThemedText style={styles.inputLabel}>Password</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Minimal 6 karakter"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <ThemedText style={styles.inputLabel}>Konfirmasi Password</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ulangi password"
            placeholderTextColor="#666"
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
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Daftar Sekarang</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}>
            <ThemedText style={styles.linkTextText}>Sudah punya akun? <ThemedText style={styles.linkHighlight}>Masuk di sini</ThemedText></ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', paddingHorizontal: 20 },
  cardContainer: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 30, width: '100%', maxWidth: 450, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  headerContainer: { alignItems: 'center', marginBottom: 30, backgroundColor: 'transparent' },
  logoTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  logoHighlight: { color: '#FF3B30', fontSize: 36, fontWeight: '900' },
  logoSubtitle: { fontSize: 13, color: '#aaa', marginTop: 8, textAlign: 'center' },
  formContainer: { backgroundColor: 'transparent', gap: 6 },
  inputLabel: { color: '#ddd', fontSize: 14, fontWeight: '600', marginTop: 8, paddingLeft: 4 },
  input: { height: 52, borderColor: '#333', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#2A2A2A', color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#FF3B30', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 25, shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  disabledButton: { backgroundColor: '#555' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkTextText: { color: '#aaa', fontSize: 14 },
  linkHighlight: { color: '#FF3B30', fontWeight: 'bold' }
});