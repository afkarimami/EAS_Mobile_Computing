import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// IMPORT FUNGSI DARI API TMDB
import { getMoviesByGenre, getPopularMovies, getTopRatedMovies, getUpcomingMovies, Movie, searchMovies } from '../../src/services/tmdbApi';
// @ts-ignore
import { AuthContext } from '../../src/context/AuthContext';

// ✨ IMPORT CUSTOM HOOK TEMA GLOBAL KITA
import { useAppTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

const GENRES = [
  { id: 'all', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '35', name: 'Comedy' },
  { id: '27', name: 'Horror' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '18', name: 'Drama' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useContext(AuthContext) as any;
  
  // ✨ AMBIL FUNGSI DAN DATA WARNA DARI THEME CONTEXT
  const { colors, theme, toggleTheme } = useAppTheme();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // ✨ STATE BARU UNTUK POPUP SETTINGS TEMA
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated' | 'upcoming'>('popular');

  const loadDataMovies = async (pageTarget: number, tabTarget = activeTab) => {
    try {
      setLoading(true);
      setError(null);
      let data: Movie[] = [];

      if (searchQuery.trim() !== '') {
        data = await searchMovies(searchQuery, pageTarget);
      } else if (selectedGenre !== 'all') {
        data = await getMoviesByGenre(selectedGenre, pageTarget);
      } else {
        if (tabTarget === 'top_rated') {
          data = await getTopRatedMovies(pageTarget);
        } else if (tabTarget === 'upcoming') {
          data = await getUpcomingMovies(pageTarget);
        } else {
          data = await getPopularMovies(pageTarget);
        }
      }

      if (data && data.length > 0) {
        setMovies(data);
        setCurrentPage(pageTarget);
      } else {
        Alert.alert('Info', 'Tidak ada data film lagi di halaman ini.');
      }
    } catch (err) {
      setError('Gagal memuat film dari server TMDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataMovies(1, 'popular');
  }, []);

  const handleTabChange = (tab: 'popular' | 'top_rated' | 'upcoming') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedGenre('all'); 
    loadDataMovies(1, tab); 
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSelectedGenre('all');
      setActiveTab('popular');
      loadDataMovies(1, 'popular');
      return;
    }

    try {
      setLoading(true);
      setSelectedGenre('all'); 
      const searchData = await searchMovies(text, 1);
      setMovies(searchData);
      setCurrentPage(1);
    } catch (err) {
      setError('Pencarian gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genreId: string) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    setSidebarVisible(false);
    
    try {
      setLoading(true);
      setError(null);
      const dataGenre = genreId === 'all' ? await getPopularMovies(1) : await getMoviesByGenre(genreId, 1);
      setMovies(dataGenre);
      setCurrentPage(1);
      if (genreId === 'all') setActiveTab('popular');
    } catch (err) {
      setError('Gagal memfilter genre.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    loadDataMovies(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadDataMovies(currentPage - 1);
    }
  };

  const handleAddToWatchlist = async (movie: Movie) => {
    try {
      const userKey = user?.email ? `user_watchlist_${user.email}` : 'user_watchlist_guest';
      const existingWatchlistRaw = await AsyncStorage.getItem(userKey);
      let currentWatchlist = existingWatchlistRaw ? JSON.parse(existingWatchlistRaw) : [];

      const isExist = currentWatchlist.some((item: any) => item.id === movie.id);
      if (isExist) {
        Alert.alert('Info', `Film "${movie.title}" sudah ada di watchlist!`);
        return;
      }

      currentWatchlist.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      });

      await AsyncStorage.setItem(userKey, JSON.stringify(currentWatchlist));
      Alert.alert('Sukses 🎉', `"${movie.title}" masuk ke Watchlist!`);
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan ke watchlist.');
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      await logout();
      router.replace('/login'); 
    } catch (err: any) {
      Alert.alert('Error', 'Gagal logout.');
    }
  };

  const renderMovieCard = ({ item }: { item: Movie }) => {
    const posterUrl = item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/500x750.png?text=No+Image';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={() => {
          router.push({ pathname: '/detail', params: { id: item.id } });
        }}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        <View style={styles.infoContainer}>
          <ThemedText numberOfLines={2} style={[styles.movieTitle, { color: colors.text }]}>
            {item.title}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <ThemedText style={styles.starIcon}>⭐</ThemedText>
            <ThemedText style={styles.ratingText}>
              {item.vote_average ? item.vote_average.toFixed(1) : '0.0'}
            </ThemedText>
          </View>
          <ThemedText style={[styles.releaseDate, { color: colors.textMuted }]}>Release: {item.release_date || 'N/A'}</ThemedText>
          
          <TouchableOpacity 
            style={styles.watchlistButton}
            onPress={(e) => {
              e.stopPropagation(); 
              handleAddToWatchlist(item);
            }}
          >
            <ThemedText style={styles.watchlistButtonText}>Add Watchlist</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaginationFooter = () => {
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          disabled={currentPage === 1}
          onPress={handlePrevPage}
        >
          <ThemedText style={styles.pageButtonText}>◀ Prev</ThemedText>
        </TouchableOpacity>

        <View style={[styles.pageIndicatorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText style={[styles.pageIndicatorText, { color: colors.textMuted }]}>
            Halaman {currentPage}
          </ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.pageButton}
          onPress={handleNextPage}
        >
          <ThemedText style={styles.pageButtonText}>Next ▶</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const isPureCategoryMode = searchQuery.trim() === '' && selectedGenre === 'all';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER BAR */}
      <View style={styles.topRowContainer}>
        <TouchableOpacity style={[styles.sidebarToggle, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setSidebarVisible(true)}>
          <ThemedText style={[styles.sidebarToggleText, { color: colors.text }]}>☰</ThemedText>
        </TouchableOpacity>

        <View style={styles.headerTextWrapper}>
          <ThemedText style={[styles.logoText, { color: colors.text }]}>Movie<ThemedText style={styles.logoHighlight}>Licious</ThemedText></ThemedText>
          <ThemedText style={[styles.subtitleText, { color: colors.textMuted }]}>Cari Film Favoritmu Hanya Disini</ThemedText>
        </View>
        <TouchableOpacity style={[styles.profileAvatarButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setMenuVisible(true)}>
          <ThemedText style={styles.avatarIconText}>👤</ThemedText>
        </TouchableOpacity>
      </View>

      {/* SIDEBAR GENRE DENGAN TOMBOL SETTINGS DI BAWAHNYA */}
      <Modal visible={sidebarVisible} transparent={true} animationType="fade" onRequestClose={() => setSidebarVisible(false)}>
        <View style={styles.sidebarContainer}>
          <View style={[styles.sidebarContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Bagian Atas: Menu Genre */}
            <View style={{ flex: 1 }}>
              <View style={[styles.sidebarHeader, { borderColor: colors.border }]}>
                <ThemedText style={[styles.sidebarTitle, { color: colors.text }]}>Menu</ThemedText>
                <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                  <ThemedText style={[styles.closeButtonText, { color: colors.textMuted }]}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
                {GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre.id;
                  return (
                    <TouchableOpacity 
                      key={genre.id} 
                      style={[styles.sidebarItem, { backgroundColor: colors.background }, isSelected && styles.sidebarItemActive]} 
                      onPress={() => handleGenreSelect(genre.id)}
                    >
                      <ThemedText style={[styles.sidebarItemText, { color: colors.textMuted }, isSelected && styles.sidebarItemTextActive]}>{genre.name}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ✨ Bagian Bawah: Tombol Settings di Kiri Bawah Sidebar */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity 
                style={[styles.settingsButton, { borderColor: colors.border }]} 
                onPress={() => {
                  setSidebarVisible(false);
                  setSettingsVisible(true);
                }}
              >
                <ThemedText style={[styles.settingsButtonText, { color: colors.text }]}>⚙️ Settings</ThemedText>
              </TouchableOpacity>
            </View>

          </View>
          <TouchableOpacity style={styles.sidebarOverlayClose} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
        </View>
      </Modal>

      {/* DROPDOWN PROFIL */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={[styles.userEmailText, { color: colors.textMuted }]} numberOfLines={1}>{user?.email || 'user_master'}</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push('/profile'); }}>
              <ThemedText style={[styles.menuText, { color: colors.text }]}>My Watchlist</ThemedText>
            </TouchableOpacity>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <ThemedText style={styles.logoutTextText}>Keluar / Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL SETTINGS POP-UP UNTUK MEMILIH TEMA (LIGHT / DARK) */}
      <Modal visible={settingsVisible} transparent={true} animationType="fade" onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.centerOverlay}>
          <View style={[styles.settingsModalContent, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.settingsModalTitle, { color: colors.text }]}>Pengaturan Aplikasi</ThemedText>
            <ThemedText style={{ fontSize: 14, color: colors.textMuted, marginBottom: 15 }}>Pilih Tema:</ThemedText>
            
            <View style={styles.themeOptionsRow}>
              <TouchableOpacity 
                style={[styles.themeOptionCard, { borderColor: colors.border }, theme === 'dark' && styles.themeOptionSelected]} 
                onPress={() => toggleTheme('dark')}
              >
                <ThemedText style={{ color: theme === 'dark' ? '#fff' : colors.text }}>Dark Mode</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.themeOptionCard, { borderColor: colors.border }, theme === 'light' && styles.themeOptionSelected]} 
                onPress={() => toggleTheme('light')}
              >
                <ThemedText style={{ color: theme === 'light' ? '#fff' : colors.text }}>Light Mode</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.settingsCloseButton} onPress={() => setSettingsVisible(false)}>
              <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Tutup</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <TextInput 
          style={[styles.searchBar, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} 
          placeholder="Cari film favoritmu..." 
          placeholderTextColor={theme === 'dark' ? '#666' : '#aaa'} 
          value={searchQuery} 
          onChangeText={handleSearch} 
        />
      </View>

      {/* TAB SELECTION BAR */}
      {isPureCategoryMode && (
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, { backgroundColor: colors.surface, borderColor: colors.border }, activeTab === 'popular' && styles.tabButtonActive]} onPress={() => handleTabChange('popular')}>
            <ThemedText style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 'popular' && styles.tabButtonTextActive]}>Populer</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, { backgroundColor: colors.surface, borderColor: colors.border }, activeTab === 'top_rated' && styles.tabButtonActive]} onPress={() => handleTabChange('top_rated')}>
            <ThemedText style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 'top_rated' && styles.tabButtonTextActive]}>Top Rated</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, { backgroundColor: colors.surface, borderColor: colors.border }, activeTab === 'upcoming' && styles.tabButtonActive]} onPress={() => handleTabChange('upcoming')}>
            <ThemedText style={[styles.tabButtonText, { color: colors.textMuted }, activeTab === 'upcoming' && styles.tabButtonTextActive]}>Upcoming</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* MAIN LIST FILM */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF3B30" style={styles.center} />
      ) : error ? (
        <ThemedView style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadDataMovies(1)}>
            <ThemedText style={styles.retryText}>Coba Lagi</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList 
          data={movies} 
          keyExtractor={(item, index) => item.id.toString() + index} 
          renderItem={renderMovieCard} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderPaginationFooter} 
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  topRowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, backgroundColor: 'transparent', gap: 15 },
  sidebarToggle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  sidebarToggleText: { fontSize: 22, fontWeight: 'bold' },
  headerTextWrapper: { backgroundColor: 'transparent', flex: 1 },
  logoText: { fontSize: 26, fontWeight: '900' },
  logoHighlight: { color: '#FF3B30', fontSize: 26, fontWeight: '900' },
  subtitleText: { fontSize: 13, marginTop: 2 },
  profileAvatarButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  avatarIconText: { fontSize: 18 },
  
  sidebarContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' },
  sidebarOverlayClose: { flex: 1 }, 
  sidebarContent: { width: Math.min(width * 0.75, 280), height: '100%', padding: 20, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderRightWidth: 1, justifyContent: 'space-between' },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15, borderBottomWidth: 1 },
  sidebarTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButtonText: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 5 },
  sidebarList: { flex: 1 },
  sidebarItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  sidebarItemActive: { backgroundColor: '#FF3B30' },
  sidebarItemText: { fontSize: 15, fontWeight: '600' },
  sidebarItemTextActive: { color: '#fff', fontWeight: 'bold' },
  
  // ✨ Style Tambahan untuk Tombol Settings di Sidebar
  sidebarFooter: { paddingTop: 15, borderTopWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
  settingsButton: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', width: '100%' },
  settingsButtonText: { fontSize: 15, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  dropdownMenu: { position: 'absolute', top: 100, right: 20, borderRadius: 12, padding: 16, width: 200, borderWidth: 1 },
  userEmailText: { fontSize: 13, marginBottom: 8, textAlign: 'center' },
  dividerLine: { height: 1, marginVertical: 8 },
  menuRow: { paddingVertical: 6, width: '100%' },
  menuText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  logoutRow: { paddingVertical: 4, alignItems: 'center', width: '100%' },
  logoutTextText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 15 },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 15, backgroundColor: 'transparent' },
  searchBar: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  poster: { width: 95, height: 145, backgroundColor: '#2A2A2A' },
  infoContainer: { flex: 1, padding: 16, justifyContent: 'space-between' },
  movieTitle: { fontSize: 18, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starIcon: { fontSize: 14, marginRight: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#FFCC00' },
  releaseDate: { fontSize: 12 },
  watchlistButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 59, 48, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginTop: 8 },
  watchlistButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  errorText: { color: '#ff4d4d', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#FF3B30', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },

  paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 25, paddingHorizontal: 5 },
  pageButton: { backgroundColor: '#FF3B30', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, minWidth: 85, alignItems: 'center' },
  pageButtonDisabled: { backgroundColor: '#2A2A2A', opacity: 0.5 },
  pageButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  pageIndicatorBox: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  pageIndicatorText: { fontSize: 13, fontWeight: '600' },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  tabButtonActive: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  tabButtonText: { fontSize: 12, fontWeight: '600' },
  tabButtonTextActive: { color: '#fff', fontWeight: 'bold' },

  // ✨ Style Baru untuk Modal Settings Pop-up Tengah
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  settingsModalContent: { width: 300, padding: 20, borderRadius: 16, alignItems: 'center' },
  settingsModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  themeOptionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%', justifyContent: 'center' },
  themeOptionCard: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  themeOptionSelected: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  settingsCloseButton: { backgroundColor: '#FF3B30', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 8 }
});