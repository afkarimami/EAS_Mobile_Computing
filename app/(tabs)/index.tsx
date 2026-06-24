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

  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  // 🛠️ FUNGSI YANG SUDAH DIPERBAIKI: Menggunakan userKey dinamis agar sinkron dengan profil
  const handleAddToWatchlist = async (movie: Movie) => {
    try {
      // Membuat kunci unik berdasarkan email user terlogin
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

      // Menyimpan data film ke loker akun yang sedang aktif
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
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          router.push({ pathname: '/detail', params: { id: item.id } });
        }}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        <View style={styles.infoContainer}>
          <ThemedText numberOfLines={2} style={styles.movieTitle}>
            {item.title}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <ThemedText style={styles.starIcon}>⭐</ThemedText>
            <ThemedText style={styles.ratingText}>
              {item.vote_average ? item.vote_average.toFixed(1) : '0.0'}
            </ThemedText>
          </View>
          <ThemedText style={styles.releaseDate}>Release: {item.release_date || 'N/A'}</ThemedText>
          
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

        <View style={styles.pageIndicatorBox}>
          <ThemedText style={styles.pageIndicatorText}>
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
    <ThemedView style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.topRowContainer}>
        <TouchableOpacity style={styles.sidebarToggle} onPress={() => setSidebarVisible(true)}>
          <ThemedText style={styles.sidebarToggleText}>☰</ThemedText>
        </TouchableOpacity>

        <View style={styles.headerTextWrapper}>
          <ThemedText style={styles.logoText}>Movie<ThemedText style={styles.logoHighlight}>Licious</ThemedText></ThemedText>
          <ThemedText style={styles.subtitleText}>Cari Film Favoritmu Hanya Disini</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileAvatarButton} onPress={() => setMenuVisible(true)}>
          <ThemedText style={styles.avatarIconText}>👤</ThemedText>
        </TouchableOpacity>
      </View>

      {/* SIDEBAR GENRE */}
      <Modal visible={sidebarVisible} transparent={true} animationType="fade" onRequestClose={() => setSidebarVisible(false)}>
        <View style={styles.sidebarContainer}>
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <ThemedText style={styles.sidebarTitle}>Filter Genre</ThemedText>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sidebarList}>
              {GENRES.map((genre) => {
                const isSelected = selectedGenre === genre.id;
                return (
                  <TouchableOpacity key={genre.id} style={[styles.sidebarItem, isSelected && styles.sidebarItemActive]} onPress={() => handleGenreSelect(genre.id)}>
                    <ThemedText style={[styles.sidebarItemText, isSelected && styles.sidebarItemTextActive]}>{genre.name}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.sidebarOverlayClose} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
        </View>
      </Modal>

      {/* DROPDOWN PROFIL */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <ThemedText style={styles.userEmailText} numberOfLines={1}>{user?.email || 'user_master'}</ThemedText>
            <View style={styles.dividerLine} />
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push('/profile'); }}>
              <ThemedText style={styles.menuText}>My Watchlist</ThemedText>
            </TouchableOpacity>
            <View style={styles.dividerLine} />
            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <ThemedText style={styles.logoutTextText}>Keluar / Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <TextInput style={styles.searchBar} placeholder="Cari film favoritmu..." placeholderTextColor="#666" value={searchQuery} onChangeText={handleSearch} />
      </View>

      {/* TAB SELECTION BAR */}
      {isPureCategoryMode && (
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'popular' && styles.tabButtonActive]} onPress={() => handleTabChange('popular')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'popular' && styles.tabButtonTextActive]}>Populer</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'top_rated' && styles.tabButtonActive]} onPress={() => handleTabChange('top_rated')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'top_rated' && styles.tabButtonTextActive]}>Top Rated</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]} onPress={() => handleTabChange('upcoming')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'upcoming' && styles.tabButtonTextActive]}>Upcoming</ThemedText>
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
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  topRowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, backgroundColor: 'transparent', gap: 15 },
  sidebarToggle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  sidebarToggleText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerTextWrapper: { backgroundColor: 'transparent', flex: 1 },
  logoText: { fontSize: 26, fontWeight: '900', color: '#fff' },
  logoHighlight: { color: '#FF3B30', fontSize: 26, fontWeight: '900' },
  subtitleText: { fontSize: 13, color: '#aaa', marginTop: 2 },
  profileAvatarButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', borderWidth: 1.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarIconText: { fontSize: 18 },
  
  sidebarContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' },
  sidebarOverlayClose: { flex: 1 }, 
  sidebarContent: { width: Math.min(width * 0.75, 280), backgroundColor: '#161616', height: '100%', padding: 20, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderRightWidth: 1, borderColor: '#2A2A2A' },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#2A2A2A' },
  sidebarTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  closeButtonText: { color: '#aaa', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 5 },
  sidebarList: { flex: 1 },
  sidebarItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#1E1E1E' },
  sidebarItemActive: { backgroundColor: '#FF3B30' },
  sidebarItemText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
  sidebarItemTextActive: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  dropdownMenu: { position: 'absolute', top: 100, right: 20, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, width: 200, borderWidth: 1, borderColor: '#2A2A2A' },
  userEmailText: { fontSize: 13, color: '#aaa', marginBottom: 8, textAlign: 'center' },
  dividerLine: { height: 1, backgroundColor: '#333', marginVertical: 8 },
  menuRow: { paddingVertical: 6, width: '100%' },
  menuText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  logoutRow: { paddingVertical: 4, alignItems: 'center', width: '100%' },
  logoutTextText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 15 },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 15, backgroundColor: 'transparent' },
  searchBar: { height: 50, borderColor: '#2A2A2A', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#1E1E1E', color: '#fff', fontSize: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A' },
  poster: { width: 95, height: 145, backgroundColor: '#2A2A2A' },
  infoContainer: { flex: 1, padding: 16, justifyContent: 'space-between' },
  movieTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starIcon: { fontSize: 14, marginRight: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#FFCC00' },
  releaseDate: { fontSize: 12, color: '#777' },
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
  pageIndicatorBox: { backgroundColor: '#1E1E1E', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A' },
  pageIndicatorText: { color: '#aaa', fontSize: 13, fontWeight: '600' },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1E1E', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  tabButtonActive: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  tabButtonText: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  tabButtonTextActive: { color: '#fff', fontWeight: 'bold' }
});