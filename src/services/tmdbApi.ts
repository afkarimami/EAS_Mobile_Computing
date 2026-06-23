import axios from 'axios';

// 1. API Key TMDB milikmu
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
  genre_ids?: number[]; // Tambahan wajib untuk melacak ID genre film
  genres?: { id: number; name: string }[]; // Tambahan opsional untuk detail genre film
}

// ==========================================================
// FITUR 1: Halaman Utama & Pencarian (Dukung Pagination Server)
// ==========================================================

// Mengambil Film Populer dengan dukungan Parameter Page
export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page } // Menambahkan parameter halaman ke TMDB
    });
    return response.data.results; 
  } catch (error) {
    console.error("Gagal mengambil data film populer:", error);
    throw error; 
  }
};

// 🛠️ Mengambil Film dengan Rating Tertinggi (Top Rated)
export const getTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page }
    });
    return response.data.results; 
  } catch (error) {
    console.error("Gagal mengambil data film top rated:", error);
    throw error; 
  }
};

// 🛠️ Mengambil Film yang Akan Datang (Upcoming)
export const getUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { page }
    });
    return response.data.results; 
  } catch (error) {
    console.error("Gagal mengambil data film upcoming:", error);
    throw error; 
  }
};

// Mencari Film berdasarkan judul dengan dukungan Parameter Page
export const searchMovies = async (query: string, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { 
        query,
        page // Menambahkan parameter halaman ke pencarian
      }
    });
    return response.data.results;
  } catch (error) {
    console.error("Gagal mencari film:", error);
    throw error;
  }
};

// Mengambil film berdasarkan genre (discover) dengan dukungan Parameter Page
export const getMoviesByGenre = async (genreId: string | number, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page // Menambahkan parameter halaman ke filter genre
      }
    });
    return response.data.results;
  } catch (error) {
    console.error(`Gagal mengambil film untuk genre ${genreId}:`, error);
    throw error;
  }
};

// ==========================================================
// FITUR 2: Detail Film
// ==========================================================

// Mengambil detail lengkap 1 film spesifik berdasarkan ID
export const getMovieDetails = async (movieId: string | number): Promise<Movie> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil detail film dengan ID ${movieId}:`, error);
    throw error;
  }
};

// ==========================================================
// TAMBAHAN BARU: Fitur Detail Tambahan (Cast, Rekomendasi & Video Trailer)
// ==========================================================

// 1. Mengambil daftar pemain (Cast/Aktor) berdasarkan ID Film
export const getMovieCredits = async (movieId: string | number): Promise<any[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data.cast; // Mengembalikan array daftar aktor
  } catch (error) {
    console.error(`Gagal mengambil cast film ID ${movieId}:`, error);
    throw error;
  }
};

// 2. Mengambil rekomendasi film serupa berdasarkan ID Film
export const getMovieRecommendations = async (movieId: string | number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`);
    return response.data.results; // Mengembalikan array film serupa
  } catch (error) {
    console.error(`Gagal mengambil rekomendasi film ID ${movieId}:`, error);
    throw error;
  }
};

// 3. 🛠️ FUNGSI BARU: Mengambil video (Trailer/Teaser YouTube) berdasarkan ID Film
export const getMovieVideos = async (movieId: string | number): Promise<any[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`, {
      params: {
        // Jangan gunakan id-ID saja karena TMDB sering kali tidak punya trailer bahasa Indonesia.
        // Kita bypass default language dengan en-US khusus untuk request video agar trailer YouTube pasti ketemu.
        language: 'en-US' 
      }
    });
    return response.data.results; // Mengembalikan array daftar video dari YouTube
  } catch (error) {
    console.error(`Gagal mengambil video trailer film ID ${movieId}:`, error);
    throw error;
  }
};