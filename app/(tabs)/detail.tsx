import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMovieDetails, Movie } from '../src/services/tmdbApi'; // Sesuaikan path jika perlu

export default function DetailScreen() {
  const router = useRouter();
  // Mengambil parameter ID film yang dikirim dari Halaman Utama
  const { id } = useLocalSearchParams(); 
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        // Memanggil fungsi Axios untuk mengambil data detail 1 film
        const data = await getMovieDetails(id as string);
        setMovie(data);
      } catch (err) {
        setError('Gagal memuat detail film.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#A1CEDC" />
      </ThemedView>
    );
  }

  if (error || !movie) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>{error || 'Film tidak ditemukan'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Kembali</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750.png?text=No+Image';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Poster Besar */}
      <Image source={{ uri: posterUrl }} style={styles.backdrop} />

      <ThemedView style={styles.contentContainer}>
        {/* Judul & Info Singkat */}
        <ThemedText type="title" style={styles.title}>{movie.title}</ThemedText>
        
        <ThemedView style={styles.metaContainer}>
          <ThemedText style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</ThemedText>
          <ThemedText style={styles.releaseDate}>📅 {movie.release_date}</ThemedText>
        </ThemedView>

        {/* Genre */}
        {movie.genres && (
          <ThemedView style={styles.genreContainer}>
            {movie.genres.map((genre) => (
              <ThemedView key={genre.id} style={styles.genreBadge}>
                <ThemedText style={styles.genreText}>{genre.name}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Garis Pembatas */}
        <ThemedView style={styles.separator} />

        {/* Sinopsis / Overview */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Sinopsis</ThemedText>
        <ThemedText style={styles.overview}>
          {movie.overview || 'Sinopsis tidak tersedia untuk film ini.'}
        </ThemedText>

        {/* Garis Pembatas Menuju Bagian Backend */}
        <ThemedView style={styles.separator} />

        {/* 🛑 TEMPAT UNTUK TEMANMU (BAGIAN BACKEND / FIREBASE) */}
        <TouchableOpacity 
          style={styles.watchlistButton}
          onPress={() => {
            alert('Fitur Tambah ke Watchlist ini akan dikerjakan oleh Temanmu menggunakan Firebase!');
          }}
        >
          <ThemedText style={styles.watchlistButtonText}>➕ Tambah ke Watchlist</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: 380,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  rating: {
    fontSize: 16,
    color: '#e67e22',
    fontWeight: 'bold',
  },
  releaseDate: {
    fontSize: 16,
    color: '#888',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  genreBadge: {
    backgroundColor: 'rgba(161, 206, 220, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    verticalAlign: 'middle',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  watchlistButton: {
    backgroundColor: '#A1CEDC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  watchlistButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#A1CEDC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});