// app/(tabs)/profile.tsx
import React from 'react';
// 1. PASTIKAN 'Platform' SUDAH DI-IMPORT DI SINI
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native'; 
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '../../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router'; // Pastikan useRouter di-import

export default function ProfileScreen() {
  const router = useRouter();
  const userEmail = auth.currentUser?.email || 'User';

  // 2. PERBAIKAN FUNGSI LOGOUT AGAR KOMPATIBEL DENGAN WEB & HP
  const handleLogout = async () => {
    const executeSignOut = async () => {
      try {
        await signOut(auth);
        // Paksa rute kembali ke halaman login setelah berhasil keluar
        router.replace('/login');
      } catch (error: any) {
        if (Platform.OS === 'web') {
          alert('Gagal logout: ' + error.message);
        } else {
          Alert.alert('Gagal', 'Gagal logout: ' + error.message);
        }
      }
    };

    if (Platform.OS === 'web') {
      // Solusi untuk browser (localhost): Gunakan confirm bawaan browser
      const confirmWeb = window.confirm('Apakah Anda yakin ingin keluar?');
      if (confirmWeb) {
        await executeSignOut();
      }
    } else {
      // Solusi untuk HP (Android/iOS)
      Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: executeSignOut },
      ]);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.profileHeader}>
        <ThemedText style={styles.avatar}>👤</ThemedText>
        <ThemedText type="title" style={styles.emailText}>{userEmail}</ThemedText>
        <ThemedText type="subtitle" style={styles.roleText}>Anggota CineTracker</ThemedText>
      </ThemedView>

      <ThemedView style={styles.settingsContainer}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Pengaturan Akun</ThemedText>
        
        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <ThemedText style={styles.buttonLogoutText}>Keluar dari Akun</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 40, backgroundColor: 'transparent' },
  avatar: { fontSize: 80, marginBottom: 15 },
  emailText: { fontSize: 22, fontWeight: 'bold' },
  roleText: { fontSize: 14, color: '#888', marginTop: 5 },
  settingsContainer: { backgroundColor: 'transparent', width: '100%' },
  sectionTitle: { fontSize: 16, marginBottom: 15, color: '#ccc' },
  buttonLogout: {
    backgroundColor: '#FF6B6B',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonLogoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});