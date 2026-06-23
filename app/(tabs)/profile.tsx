import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '../../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  // Mengambil data email dari user yang sedang login di Firebase
  const userEmail = auth.currentUser?.email || 'User';

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            // Sistem NavigationGate di _layout.tsx Anda otomatis akan melempar user kembali ke halaman /login
          } catch (error: any) {
            Alert.alert('Gagal', 'Gagal logout: ' + error.message);
          }
        },
      },
    ]);
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