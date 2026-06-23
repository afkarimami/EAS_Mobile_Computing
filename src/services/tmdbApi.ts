import axios from 'axios';

// 1. UBAH DI SINI: Masukkan API Key TMDB milikmu yang tadi
const TMDB_API_KEY = '87dea7a5820896fbada3fca1414cd008'; 
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'id-ID', // Biar sinopsis & data film otomatis berbahasa Indonesia
  },
  timeout: 10000, 
});

// Interface untuk menyelaraskan tipe data di TypeScript
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  overview: string;
  release_date: string;
  genres?: { id: number; name: string }[]; // Tambahan opsional untuk detail genre film
}

// ==========================================================
// FITUR 1: Halaman Utama & Pencarian (Tanggung Jawab Anggota 1)
// ==========================================================

// Mengambil Film Populer
export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/popular');
    return response.data.results; 
  } catch (error) {
    console.error("Gagal mengambil data film populer:", error);
    throw error; 
  }
};

// Mencari Film berdasarkan judul
export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query }
    });
    return response.data.results;
  } catch (error) {
    console.error("Gagal mencari film:", error);
    throw error;
  }
};

// ==========================================================
// FITUR 2: Detail Film (Tanggung Jawab Anggota 1)
// ==========================================================

// TAMBAHKAN FUNGSI INI: Mengambil detail lengkap 1 film spesifik berdasarkan ID
export const getMovieDetails = async (movieId: string | number): Promise<Movie> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil detail film dengan ID ${movieId}:`, error);
    throw error;
  }
};