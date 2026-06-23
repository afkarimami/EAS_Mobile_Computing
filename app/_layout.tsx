import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
// @ts-ignore
import { AuthContext, AuthProvider } from '../src/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Komponen internal untuk menangani navigasi berdasarkan status login
function NavigationGate() {
  const { user, loading } = useContext(AuthContext) as any;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Cek apakah user sedang berada di dalam grup halaman utama (tabs)
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // Jika BELUM login dan mencoba buka halaman utama, lempar ke halaman login
      // Sesuaikan path '/login' jika temanmu menaruh file loginnya di tempat lain (misal: 'app/login.tsx')
      router.replace('/login' as any); 
    } else if (user && !inTabsGroup) {
      // Jika SUDAH login tapi terdampar di luar, kembalikan ke halaman utama
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#A1CEDC" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Daftarkan halaman login temanmu di sini jika dibutuhkan */}
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}