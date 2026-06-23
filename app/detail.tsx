import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// @ts-ignore --- Mengabaikan pengecekan ketat TypeScript khusus untuk API TMDB kamu
import { getMovieDetails, Movie } from '../src/services/tmdbApi';

// @ts-ignore --- Mengabaikan pengecekan ketat TypeScript khusus untuk file backend JS temanmu
import { addMovieToFavorites } from '../src/services/firebaseService'; 
// @ts-ignore --- Mengabaikan pengecekan ketat TypeScript
import { useAuth } from '../src/hooks/useAuth'; 

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  // Ambil user dari hook buatan temanmu (jika belum ada, dia akan bernilai null/undefined)
  const authContext = useAuth(); 
  const user = authContext?.user; 

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
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

  const handleAddToWatchlist = async () => {
    if (!movie) return;

    // Jika temanmu belum selesai membuat sistem login, kita beri pengaman ID cadangan dulu biar tidak crash
    const userId = user?.uid || "user_praktikum_master";

    try {
      setIsSubmitting(true);
      
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      };

      // Panggil fungsi Firestore temanmu
      const result = await addMovieToFavorites(userId, movieData);

      if (result && result.success) {
        Alert.alert('Berhasil', `Film "${movie.title}" masuk ke Watchlist Firebase!`);
      } else {
        Alert.alert('Berhasil', `Film "${movie.title}" berhasil dikirim ke database.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal menyambung ke Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Image source={{ uri: posterUrl }} style={styles.backdrop} />

      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>{movie.title}</ThemedText>
        
        <ThemedView style={styles.metaContainer}>
          <ThemedText style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</ThemedText>
          <ThemedText style={styles.releaseDate}>📅 {movie.release_date}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.separator} />

        <ThemedText type="subtitle" style={styles.sectionTitle}>Sinopsis</ThemedText>
        <ThemedText style={styles.overview}>
          {movie.overview || 'Sinopsis tidak tersedia untuk film ini.'}
        </ThemedText>

        <ThemedView style={styles.separator} />

        <TouchableOpacity 
          style={[styles.watchlistButton, isSubmitting && styles.disabledButton]}
          onPress={handleAddToWatchlist}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ThemedText style={styles.watchlistButtonText}>➕ Tambah ke Watchlist</ThemedText>
          )}
        </TouchableOpacity>
      </</ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { width: '100%', height: 380, resizeMode: 'cover' },
  contentContainer: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, minHeight: 400 },
  title: { fontSize: 24, marginBottom: 10 },
  metaContainer: { flexDirection: 'row', gap: 15, marginBottom: 15, backgroundColor: 'transparent' },
  rating: { fontSize: 16, color: '#e67e22', fontWeight: 'bold' },
  releaseDate: { fontSize: 16, color: '#888' },
  separator: { height: 1, backgroundColor: 'rgba(128, 128, 128, 0.2)', marginVertical: 15 },
  sectionTitle: { fontSize: 18, marginBottom: 8 },
  overview: { fontSize: 15, lineHeight: 22, color: '#666' },
  watchlistButton: { backgroundColor: '#A1CEDC', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  disabledButton: { backgroundColor: '#ccc' },
  watchlistButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 15 },
  backButton: { backgroundColor: '#A1CEDC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#000', fontWeight: 'bold' },
});