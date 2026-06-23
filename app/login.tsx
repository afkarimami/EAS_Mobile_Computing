import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// @ts-ignore
import { AuthContext } from '../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext) as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Email dan Password tidak boleh kosong!');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      Alert.alert('Berhasil', 'Selamat datang kembali di CineTracker!');
      router.replace('/(tabs)'); 
    } catch (error: any) {
      let errorMessage = 'Gagal login. Periksa kembali akun Anda.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email atau password salah.';
      }
      Alert.alert('Login Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cardContainer}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.logoTitle}>Movie<ThemedText style={styles.logoHighlight}>Licious</ThemedText></ThemedText>
          <ThemedText style={styles.logoSubtitle}>Nonton, Catat, dan Atur Film Favoritmu</ThemedText>
        </ThemedView>

        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.inputLabel}>Email</ThemedText>
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
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Masuk Ke Akun</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.replace('/register' as any)} 
            style={styles.linkButton}
          >
            <ThemedText style={styles.linkTextText}>Belum punya akun? <ThemedText style={styles.linkHighlight}>Daftar Sekarang</ThemedText></ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', paddingHorizontal: 20 },
  cardContainer: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 30, width: '100%', maxWidth: 450, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  headerContainer: { alignItems: 'center', marginBottom: 35, backgroundColor: 'transparent' },
  logoTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  logoHighlight: { color: '#FF3B30', fontSize: 36, fontWeight: '900' },
  logoSubtitle: { fontSize: 13, color: '#aaa', marginTop: 8, textAlign: 'center' },
  formContainer: { backgroundColor: 'transparent', gap: 8 },
  inputLabel: { color: '#ddd', fontSize: 14, fontWeight: '600', marginTop: 10, paddingLeft: 4 },
  input: { height: 52, borderColor: '#333', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#2A2A2A', color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#FF3B30', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 25, shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  disabledButton: { backgroundColor: '#555' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkTextText: { color: '#aaa', fontSize: 14 },
  linkHighlight: { color: '#FF3B30', fontWeight: 'bold' }
});