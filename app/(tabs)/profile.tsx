import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState, useContext } from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// 🛠️ IMPORT AUTHCONTEXT UNTUK MEMBACA DATA AKUN LOGIN
// @ts-ignore
import { AuthContext } from '../../src/context/AuthContext';

export default function WatchlistScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext) as any; // Mengambil data user yang sedang login
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([]);

  // Mengenerate key unik berdasarkan email user
  const getUserKey = () => user?.email ? `user_watchlist_${user.email}` : 'user_watchlist_guest';

  const loadWatchlistData = async () => {
    try {
      const userKey = getUserKey();
      const storedData = await AsyncStorage.getItem(userKey);
      if (storedData) {
        setWatchlistMovies(JSON.parse(storedData));
      } else {
        setWatchlistMovies([]);
      }
    } catch (err) {
      console.log('Gagal memuat data watchlist lokal.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWatchlistData();
    }, [user]) // Memicu ulang jika user login berubah
  );

  const handleRemoveWatchlist = async (id: number) => {
    try {
      const userKey = getUserKey();
      const updatedList = watchlistMovies.filter(movie => movie.id !== id);
      setWatchlistMovies(updatedList);
      
      // Simpan kembali ke penyimpanan akun yang sesuai
      await AsyncStorage.setItem(userKey, JSON.stringify(updatedList));
      Alert.alert('Dihapus', 'Film berhasil dikeluarkan dari Watchlist.');
    } catch (err) {
      Alert.alert('Error', 'Gagal menghapus film.');
    }
  };

  const renderMovieCard = ({ item }: { item: any }) => {
    const posterUrl = item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/500x750.png?text=No+Image';

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/detail', 
            params: { 
              id: item.id,
              title: item.title,
              poster_path: item.poster_path,
              vote_average: item.vote_average ? item.vote_average.toString() : '0.0',
              release_date: item.release_date
            }
          });
        }}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        <View style={styles.infoContainer}>
          <View>
            <ThemedText numberOfLines={2} style={styles.movieTitle}>
              {item.title}
            </ThemedText>
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.starIcon}>⭐</ThemedText>
              <ThemedText style={styles.ratingText}>
                {item.vote_average ? Number(item.vote_average).toFixed(1) : '0.0'}
              </ThemedText>
            </View>
            <ThemedText style={styles.releaseDate}>Release: {item.release_date || 'N/A'}</ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation(); 
              handleRemoveWatchlist(item.id);
            }}
          >
            <ThemedText style={styles.removeButtonText}>Hapus</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.outerContainer}>
      <View style={styles.innerContent}>
        
        {/* HEADER BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/')}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.backButtonText}>⬅   Home</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.titlePage}>My Watchlist</ThemedText>
            {/* Menampilkan email pemilik akun aktif di bawah judul */}
            <ThemedText style={styles.userEmailText}>{user?.email || 'user_master'}</ThemedText>
          </View>
        </View>

        {/* KONDISI REAL TIME JIKA WATCHLIST KOSONG */}
        {watchlistMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}></ThemedText>
            <ThemedText style={styles.emptyText}>Watchlist kamu kosong. Cari dan tambahkan beberapa film kesukaanmu</ThemedText>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/')}
            >
              <ThemedText style={styles.exploreButtonText}>Cari Film Sekarang</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={watchlistMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMovieCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', paddingTop: 40 },
  innerContent: { width: '100%', maxWidth: 500, flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 20, height: 50 },
  backButton: { backgroundColor: '#1A1A1A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  backButtonText: { color: '#E0E0E0', fontSize: 14, fontWeight: '700' },
  titleWrapper: { alignItems: 'flex-end' },
  titlePage: { fontSize: 20, fontWeight: 'bold', color: '#FF3B30' },
  userEmailText: { fontSize: 11, color: '#888', marginTop: 2 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { flexDirection: 'row', marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#141414', borderWidth: 1, borderColor: '#222' },
  poster: { width: 95, height: 145, backgroundColor: '#2A2A2A' },
  infoContainer: { flex: 1, padding: 14, justifyContent: 'space-between' },
  movieTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  starIcon: { fontSize: 14, marginRight: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#FFCC00' },
  releaseDate: { fontSize: 12, color: '#777', marginTop: 2 },
  removeButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 59, 48, 0.15)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginTop: 8 },
  removeButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16, textAlign: 'center' },
  emptyText: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  exploreButton: { backgroundColor: '#FF3B30', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
  exploreButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});