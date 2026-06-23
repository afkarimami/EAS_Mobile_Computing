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

    // 1. KUNCI PERBAIKAN: Gabungkan deteksi semua halaman Autentikasi (Login & Register)
    const isAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!user && !isAuthScreen) {
      // Jika BELUM login dan tidak sedang di halaman auth, paksa ke halaman login
      router.replace('/login'); 
    } else if (user && isAuthScreen) {
      // Jika SUDAH login tetapi malah membuka halaman login/register, kembalikan ke utama (tabs)
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
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: 'Register' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      
      {/* Detail Film Penuh */}
      <Stack.Screen 
        name="detail" 
        options={{ 
          title: 'Detail Film', 
          headerShown: true,
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#1A1A1A' } 
        }} 
      />
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