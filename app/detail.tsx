import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMovieDetails, getMovieCredits, getMovieRecommendations, getMovieVideos, Movie } from '../src/services/tmdbApi';

// 🛠️ Hubungkan komponen trailer pintar kita
import MovieTrailer from './MovieTrailer'; 

const { width } = Dimensions.get('window');

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllDetailData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detailData, creditsData, recommendationsData, videosData] = await Promise.all([
          getMovieDetails(id as string),
          getMovieCredits(id as string),
          getMovieRecommendations(id as string),
          getMovieVideos(id as string),
        ]);

        setMovie(detailData);
        setCast(creditsData.slice(0, 10)); 
        setRecommendations(recommendationsData);

        const officialTrailer = videosData.find(
          (video: any) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        );

        if (officialTrailer) {
          setTrailerId(officialTrailer.key);
        } else {
          setTrailerId(null);
        }
      } catch (err) {
        setError('Gagal memuat detail data film.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetailData();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </ThemedView>
    );
  }

  if (error || !movie) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>{error || 'Film tidak ditemukan.'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Kembali</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const backdropUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750.png?text=No+Image';

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* POSTER / BACKDROP UTAMA */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: backdropUrl }} style={styles.mainPoster} resizeMode="cover" />
          <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
            <ThemedText style={styles.floatingBackText}>◀ Kembali</ThemedText>
          </TouchableOpacity>
        </View>

        {/* INFORMASI UTAMA FILM */}
        <View style={styles.infoWrapper}>
          <ThemedText style={styles.titleText}>{movie.title}</ThemedText>
          
          <View style={styles.metaRow}>
            <ThemedText style={styles.ratingBox}>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</ThemedText>
            <ThemedText style={styles.releaseText}>{movie.release_date || 'N/A'}</ThemedText>
          </View>

          {/* 🛠️ TRAILER AMAN UNTUK SEMUA PLATFORM */}
          {trailerId && (
            <View style={styles.trailerContainer}>
              <ThemedText style={styles.sectionTitle}>Official Trailer</ThemedText>
              <View style={styles.youtubeWrapper}>
                <MovieTrailer videoId={trailerId} />
              </View>
            </View>
          )}

          {/* SINOPSIS */}
          <ThemedText style={styles.sectionTitle}>Sinopsis</ThemedText>
          <ThemedText style={styles.overviewText}>
            {movie.overview || 'Sinopsis tidak tersedia dalam bahasa Indonesia.'}
          </ThemedText>

          {/* LIST PEMAIN */}
          {cast.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Pemain Utama</ThemedText>
              <FlatList
                data={cast}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const avatarUrl = item.profile_path
                    ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                    : 'https://via.placeholder.com/185x278.png?text=No+Photo';
                  return (
                    <View style={styles.castCard}>
                      <Image source={{ uri: avatarUrl }} style={styles.castImage} />
                      <ThemedText numberOfLines={1} style={styles.castName}>{item.name}</ThemedText>
                      <ThemedText numberOfLines={1} style={styles.castCharacter}>as {item.character}</ThemedText>
                    </View>
                  );
                }}
              />
            </View>
          )}

          {/* REKOMENDASI FILM */}
          {recommendations.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Rekomendasi Serupa</ThemedText>
              <FlatList
                data={recommendations}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const moviePoster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                    : 'https://via.placeholder.com/185x278.png?text=No+Image';
                  return (
                    <TouchableOpacity 
                      style={styles.recCard}
                      onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
                    >
                      <Image source={{ uri: moviePoster }} style={styles.recImage} />
                      <ThemedText numberOfLines={1} style={styles.recTitle}>{item.title}</ThemedText>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  errorText: { color: '#ff4d4d', fontSize: 16, marginBottom: 15, textAlign: 'center' },
  imageContainer: { width: '100%', height: 400, backgroundColor: '#222', position: 'relative' },
  mainPoster: { width: '100%', height: '100%' },
  floatingBackButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  floatingBackText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  backButton: { backgroundColor: '#FF3B30', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  infoWrapper: { padding: 20 },
  titleText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  ratingBox: { backgroundColor: '#FFCC00', color: '#000', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, fontWeight: 'bold', fontSize: 14 },
  releaseText: { color: '#aaa', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 15, marginBottom: 10 },
  overviewText: { fontSize: 15, color: '#ccc', lineHeight: 22, textAlign: 'justify' },
  trailerContainer: { marginBottom: 10 },
  youtubeWrapper: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginTop: 5 },
  sectionContainer: { marginTop: 20 },
  castCard: { width: 90, marginRight: 12, alignItems: 'center' },
  castImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', marginBottom: 6, borderWidth: 1, borderColor: '#444' },
  castName: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center', width: '100%' },
  castCharacter: { color: '#777', fontSize: 10, textAlign: 'center', width: '100%' },
  recCard: { width: 110, marginRight: 12 },
  recImage: { width: 110, height: 160, borderRadius: 10, backgroundColor: '#333', marginBottom: 6 },
  recTitle: { color: '#ccc', fontSize: 12, fontWeight: '600', paddingHorizontal: 2 }
});