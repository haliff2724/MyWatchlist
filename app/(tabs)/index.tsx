import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';

interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

const SUGGESTED_MOVIES: Movie[] = [
  { Title: "The Dark Knight", Year: "2008", imdbID: "tt0468569", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg" },
  { Title: "Inception", Year: "2010", imdbID: "tt1375666", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg" },
  { Title: "Interstellar", Year: "2014", imdbID: "tt0816692", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg" },
  { Title: "Ratatouille", Year: "2007", imdbID: "tt0382932", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTMzODU0NTkxMF5BMl5BanBnXkFtZTcwMjQ4MzMzMw@@._V1_SX300.jpg" },
  { Title: "Cars", Year: "2006", imdbID: "tt0317219", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTg5NzY0MzA2MV5BMl5BanBnXkFtZTYwNDc3NTc2._V1_SX300.jpg" },
  { Title: "Moana", Year: "2016", imdbID: "tt3521164", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMjI4MzU5NTExNF5BMl5BanBnXkFtZTgwNzY1MTEwMDI@._V1_SX300.jpg" }
];

const GENRES = ['All', 'Action', 'Sci-Fi', 'Animation', 'Adventure', 'Drama'];

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>(SUGGESTED_MOVIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  // --- STATE UNTUK JEJAK SAMA ADA USER TENGAH SEARCH ATAU LIHAT SUGGESTION ---
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const API_KEY = 'c1aecf62'; 

  const searchMovies = async () => {
    const cleanQuery = searchText.trim();
    setSelectedGenre('All'); 
    
    if (!cleanQuery) {
      setMovies(SUGGESTED_MOVIES); 
      setIsSearching(false); // Kembali ke mod asal (Suggested)
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setErrorMessage('');
    setIsSearching(true); // Tukar mod kepada Search Results

    try {
      const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${cleanQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.Response === 'True' && data.Search) {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setErrorMessage(data.Error || 'No movies found.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movie: Movie) => {
    try {
      const existingData = await AsyncStorage.getItem('watchlist');
      let currentList = existingData ? JSON.parse(existingData) : [];
      
      const isExist = currentList.some((item: Movie) => item.imdbID === movie.imdbID);
      if (isExist) {
        Alert.alert('Info', 'This movie has been added to your Watchlist');
        return;
      }

      currentList.push(movie);
      await AsyncStorage.setItem('watchlist', JSON.stringify(currentList));
      Alert.alert('Berjaya!', `"${movie.Title}" dimasukkan ke Watchlist.`);
    } catch (error) {
      Alert.alert('Ralat', 'Gagal menyimpan movie.');
    }
  };

  const filteredMovies = movies.filter((movie) => {
    if (selectedGenre === 'All') return true;

    const mockGenreMap: Record<string, string[]> = {
      "tt0468569": ['Action', 'Drama'],
      "tt1375666": ['Action', 'Sci-Fi', 'Adventure'],
      "tt0816692": ['Sci-Fi', 'Adventure', 'Drama'],
      "tt0382932": ['Animation', 'Adventure'],
      "tt0317219": ['Animation', 'Adventure'],
      "tt3521164": ['Animation', 'Adventure']
    };

    const genresForMovie = mockGenreMap[movie.imdbID] || [];
    return genresForMovie.includes(selectedGenre);
  });

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>
        {errorMessage ? `⚠️ ${errorMessage}` : 'No movies match your filter criteria.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="🎬 MyWatchlist" />

      {/* Bar Carian */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search movies..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (!text.trim()) {
              setMovies(SUGGESTED_MOVIES);
              setIsSearching(false); // Reset auto jika user padam teks carian
            }
          }}
          onSubmitEditing={searchMovies}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={searchMovies}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {/* Horizontal Genre Filter Bar */}
      <View style={styles.genreContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {GENRES.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <Pressable
                key={genre}
                style={[styles.genreTab, isActive && styles.genreTabActive]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Text style={[styles.genreText, isActive && styles.genreTextActive]}>
                  {genre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* --- TAMBAHAN TEKS DINAMIK: SUGGESTED MOVIES / SEARCH RESULTS --- */}
      {!loading && (
        <Text style={styles.sectionHeading}>
          {isSearching ? '🔍 Search Results' : '✨ Suggested Movies'}
        </Text>
      )}

      {/* Indikator Loading / Senarai Filem */}
      {loading ? (
        <ActivityIndicator size="large" color="#E50914" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredMovies} 
          keyExtractor={(item) => item.imdbID}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <Link 
              href={{ pathname: '/details', params: { id: item.imdbID } }} 
              asChild
            >
              <Pressable style={{ width: '100%' }}>
                <MovieCard
                  title={item.Title}
                  image={item.Poster}
                  type={item.Type}
                  year={item.Year}
                  rightAction={
                    <Pressable style={styles.addBtn} onPress={() => addToWatchlist(item)}>
                      <Text style={styles.addBtnText}>+ Watchlist</Text>
                    </Pressable>
                  }
                />
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141414', 
    paddingHorizontal: 16, 
    paddingTop: 50 
  },
  searchRow: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    gap: 10 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#262626', 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    color: '#FFFFFF', 
    height: 48 
  },
  searchButton: { 
    backgroundColor: '#E50914', 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    height: 48 
  },
  searchButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold' 
  },
  genreContainer: {
    marginBottom: 16,
    height: 36,
  },
  genreTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#262626',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
  },
  genreTabActive: {
    backgroundColor: '#E50914',
  },
  genreText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '600',
  },
  genreTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // --- STYLE UNTUK SECTION HEADING ---
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  // -----------------------------------
  loader: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  centerContainer: { 
    flex: 1, 
    paddingVertical: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: { 
    color: '#666666', 
    fontSize: 16, 
    textAlign: 'center' 
  },
  addBtn: { 
    backgroundColor: '#333', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#E50914', 
    marginRight: 12 
  },
  addBtnText: { 
    color: '#E50914', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
});