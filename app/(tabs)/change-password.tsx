import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// @ts-ignore
import { AuthContext } from '../../src/context/AuthContext';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { ubahSandi } = useContext(AuthContext) as any;
  const { colors } = useAppTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePassword = async () => {
    if (newPassword.trim().length < 6) {
      Alert.alert('Error', 'Sandi baru minimal harus 6 karakter!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi sandi tidak cocok!');
      return;
    }

    try {
      setLoading(true);
      await ubahSandi(newPassword);
      Alert.alert('Sukses 🎉', 'Kata sandi berhasil diperbarui!', [
        { text: 'OK', onPress: () => router.back() } // Kembali ke halaman sebelumnya
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.card}>
        <ThemedText style={[styles.title, { color: colors.text }]}>Ganti Sandi Baru</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
          Silakan masukkan kata sandi baru akun Anda.
        </ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Masukkan sandi baru..."
          placeholderTextColor="#666"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Ulangi sandi baru..."
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={[styles.btnSimpan, { backgroundColor: loading ? '#888' : '#FF3B30' }]}
          onPress={handleSavePassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>Simpan Sandi</ThemedText>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBatal} onPress={() => router.back()}>
          <ThemedText style={[styles.btnBatalText, { color: colors.textMuted }]}>Batal</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 340, padding: 20, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
  input: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, marginBottom: 16 },
  btnSimpan: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnBatal: { marginTop: 15, alignItems: 'center' },
  btnBatalText: { fontSize: 15, fontWeight: '600' }
});