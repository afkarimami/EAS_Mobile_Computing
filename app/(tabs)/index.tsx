import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';

// Menggunakan komponen bawaan template proyekmu agar tema warna konsisten
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPopularMovies, searchMovies, Movie } from '../src/services/tmdbApi'; // Sesuaikan path jika letak folder src berbeda

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil data film populer saat halaman dibuka
  const fetchInitialMovies = async () => {
    try {
      setLoading(true);
      setError(null);
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

  // Fungsi penanganan pencarian film
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      fetchInitialMovies();
      return;
    }

    try {
      setLoading(true);
      const searchData = await searchMovies(text);
      setMovies(searchData);
    } catch (err) {
      setError('Pencarian gagal.');
    } finally {
      setLoading(false);
    }
  };

  // Render item untuk FlatList
  const renderMovieCard = ({ item }: { item: Movie }) => {
    const posterUrl = item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/500x750.png?text=No+Image';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          // Navigasi ke halaman detail membawa parameter ID film
          router.push({
            pathname: '/detail', 
            params: { id: item.id }
          });
        }}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        <ThemedView style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.movieTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</ThemedText>
          <ThemedText style={styles.releaseDate}>{item.release_date}</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Judul Aplikasi */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">CineTracker</ThemedText>
        <ThemedText type="subtitle">Cari dan Simpan Film Favoritmu</ThemedText>
      </ThemedView>

      {/* Kolom Pencarian */}
      <TextInput
        style={styles.searchBar}
        placeholder="Cari film..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Logika Loading, Error, dan List Data */}
      {loading ? (
        <ActivityIndicator size="large" color="#A1CEDC" style={styles.center} />
      ) : error ? (
        <ThemedView style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInitialMovies}>
            <ThemedText style={styles.retryText}>Coba Lagi</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Memberi ruang agar tidak terpotong status bar atas
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 4,
  },
  searchBar: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(128, 128, 128, 0.1)', // Transparan tipis menyesuaikan tema light/dark
  },
  poster: {
    width: 90,
    height: 135,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  movieTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    color: '#e67e22',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 12,
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#A1CEDC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: 'bold',
  },
});