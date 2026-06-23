import { useRouter } from 'expo-router';
import React, { useEffect, useState, useContext } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  Modal,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { getPopularMovies, Movie, searchMovies, getMoviesByGenre } from '../../src/services/tmdbApi';
// @ts-ignore
import { AuthContext } from '../../src/context/AuthContext';

const GENRES = [
  { id: 'all', name: 'All' },
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

  const fetchInitialMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedGenre('all');
      const data = await getPopularMovies();
      setMovies(data);
    } catch (err) {
      setError('Gagal memuat film. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialMovies();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      fetchInitialMovies();
      return;
    }
    try {
      setLoading(true);
      setSelectedGenre('all');
      const searchData = await searchMovies(text);
      setMovies(searchData);
    } catch (err) {
      setError('Pencarian gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genreId: string) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    if (genreId === 'all') {
      fetchInitialMovies();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const filteredData = await getMoviesByGenre(genreId);
      setMovies(filteredData);
    } catch (err) {
      setError('Gagal memfilter genre.');
    } finally {
      setLoading(false);
    }
  };

  // Menyimpan Film ke dalam AsyncStorage menggunakan key 'user_watchlist'
  const handleAddToWatchlist = async (movie: Movie) => {
    try {
      const existingWatchlistRaw = await AsyncStorage.getItem('user_watchlist');
      let currentWatchlist = existingWatchlistRaw ? JSON.parse(existingWatchlistRaw) : [];

      const isExist = currentWatchlist.some((item: any) => item.id === movie.id);
      if (isExist) {
        Alert.alert('Info', `Film "${movie.title}" sudah ada di watchlist kamu!`);
        return;
      }

      currentWatchlist.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      });

      await AsyncStorage.setItem('user_watchlist', JSON.stringify(currentWatchlist));
      Alert.alert('Sukses 🎉', `"${movie.title}" berhasil disimpan ke Watchlist!`);
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
          
          {/* 🛠️ DIUBAH: Teks tombol menjadi Add Watchlist */}
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topRowContainer}>
        <View style={styles.headerTextWrapper}>
          <ThemedText style={styles.logoText}>Movie<ThemedText style={styles.logoHighlight}>Licious</ThemedText></ThemedText>
          <ThemedText style={styles.subtitleText}>Cari dan Simpan Film Favoritmu</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileAvatarButton} onPress={() => setMenuVisible(true)}>
          <ThemedText style={styles.avatarIconText}>👤</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <ThemedText style={styles.userEmailText} numberOfLines={1}>{user?.email || 'user_master'}</ThemedText>
            <View style={styles.dividerLine} />
            {/* 🛠️ DIUBAH: Teks dropdown menu menjadi Lihat My Watchlist */}
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push('/profile'); }}>
              <ThemedText style={styles.menuText}>📺 Lihat My Watchlist</ThemedText>
            </TouchableOpacity>
            <View style={styles.dividerLine} />
            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <ThemedText style={styles.logoutTextText}>🚪 Keluar / Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.searchWrapper}>
        <TextInput style={styles.searchBar} placeholder="Cari film favoritmu..." placeholderTextColor="#666" value={searchQuery} onChangeText={handleSearch} />
      </View>

      <View style={styles.genreContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScrollStyle}>
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre.id;
            return (
              <TouchableOpacity key={genre.id} style={[styles.genreTag, isSelected && styles.genreTagActive]} onPress={() => handleGenreSelect(genre.id)}>
                <ThemedText style={[styles.genreText, isSelected && styles.genreTextActive]}>{genre.name}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3B30" style={styles.center} />
      ) : error ? (
        <ThemedView style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInitialMovies}>
            <ThemedText style={styles.retryText}>Coba Lagi</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList data={movies} keyExtractor={(item) => item.id.toString()} renderItem={renderMovieCard} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  topRowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, backgroundColor: 'transparent' },
  headerTextWrapper: { backgroundColor: 'transparent', flex: 1 },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  logoHighlight: { color: '#FF3B30', fontSize: 28, fontWeight: '900' },
  subtitleText: { fontSize: 14, color: '#aaa', marginTop: 4 },
  profileAvatarButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E1E1E', borderWidth: 1.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarIconText: { fontSize: 18 },
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
  genreContainer: { marginBottom: 20, backgroundColor: 'transparent' },
  genreScrollStyle: { paddingHorizontal: 20, gap: 10 },
  genreTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A' },
  genreTagActive: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  genreText: { fontSize: 14, color: '#aaa', fontWeight: '600' },
  genreTextActive: { color: '#fff' },
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
});