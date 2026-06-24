import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// 1. Tentukan tipe tema yang tersedia
type ThemeType = 'dark' | 'light';

// 2. Tentukan struktur data yang akan dibagikan ke komponen lain
interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: (selectedTheme: ThemeType) => void;
  colors: typeof darkColors;
}

// 3. Seting warna untuk masing-masing tema (Kamu bisa sesuaikan kodenya di sini)
const darkColors = {
  background: '#121212',  // Warna dasar background gelap
  surface: '#1e1e1e',     // Warna sidebar / card gelap
  text: '#ffffff',        // Warna teks putih
  textMuted: '#aaa',      // Warna teks abu-abu (untuk deskripsi)
  primary: '#FF3B30',     // Warna merah khas aplikasi kamu
  border: '#333333'       // Warna garis pembatas gelap
};

const lightColors = {
  background: '#f4f4f4',  // Warna dasar background terang
  surface: '#ffffff',     // Warna sidebar / card putih bersih
  text: '#121212',        // Warna teks hitam
  textMuted: '#666',      // Warna teks abu-abu gelap
  primary: '#FF3B30',     // Warna merah tetap sama
  border: '#dddddd'       // Warna garis pembatas terang
};

// 4. Buat Context-nya
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 5. Buat Provider komponen yang akan membungkus aplikasi
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  
  // Kita set default awalnya 'dark' sesuai tampilan awal aplikasi kamu
  const [theme, setTheme] = useState<ThemeType>('dark');

  const toggleTheme = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
  };

  // Pilih warna berdasarkan tema yang sedang aktif
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 6. Buat custom hook bawaan agar panggil di file lain tinggal satu baris
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
};