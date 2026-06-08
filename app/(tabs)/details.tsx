import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from './detailcss';

interface MovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
}

export default function Details() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  
  // State untuk pengurusan komen
  const [comment, setComment] = useState<string>('');
  const [savedComment, setSavedComment] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // --- TAMBAH STATE BARU UNTUK TOGGLE PLOT ---
  const [isPlotExpanded, setIsPlotExpanded] = useState<boolean>(false);

  const API_KEY = 'c1aecf62';

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      checkWatchlistStatus();
      loadSavedComment();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
      const data = await response.json();
      if (data.Response === 'True') {
        setMovie(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load movies details.');
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const existingData = await AsyncStorage.getItem('watchlist');
      if (existingData) {
        const list = JSON.parse(existingData);
        const found = list.some((item: any) => item.imdbID === id);
        setIsInWatchlist(found);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleWatchlist = async () => {
    if (!movie) return;
    try {
      const existingData = await AsyncStorage.getItem('watchlist');
      let list = existingData ? JSON.parse(existingData) : [];

      if (isInWatchlist) {
        list = list.filter((item: any) => item.imdbID !== id);
        setIsInWatchlist(false);
        Alert.alert('Info', 'The movie has been removed from Watchlist.');
      } else {
        const movieSummary = {
          Title: movie.Title,
          Year: movie.Year,
          imdbID: movie.imdbID,
          Type: 'movie',
          Poster: movie.Poster
        };
        list.push(movieSummary);
        setIsInWatchlist(true);
        Alert.alert('Successful', 'This movie has been add to Watchlist.');
      }
      await AsyncStorage.setItem('watchlist', JSON.stringify(list));
    } catch (error) {
      Alert.alert('Error', 'Failed to update Watchlist.');
    }
  };

  const loadSavedComment = async () => {
    try {
      const checkSaved = await AsyncStorage.getItem(`comment_${id}`);
      if (checkSaved) {
        setSavedComment(checkSaved);
        setComment(checkSaved);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Reminder', 'Please enter comment before saving.');
      return;
    }
    try {
      await AsyncStorage.setItem(`comment_${id}`, comment);
      setSavedComment(comment);
      setIsEditing(false);
      Alert.alert('Successful', 'Your comment has been saved.');
    } catch (error) {
      Alert.alert('Error', 'Your comment has fail to be save.');
    }
  };

  const deleteComment = async () => {
    Alert.alert('Deleting Comment', 'Are you sure to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(`comment_${id}`);
            setSavedComment('');
            setComment('');
            setIsEditing(false);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete the comment.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: '#FFFFFF' }}>Maklumat filem tidak ditemui.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Image 
          source={{ uri: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/262626/FFFFFF?text=No+Poster' }} 
          style={styles.bannerPoster}
          resizeMode="cover"
        />

        <View style={styles.infoWrapper}>
          <Text style={styles.title}>{movie.Title}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.ratingText}>⭐ {movie.imdbRating}</Text>
            <Text style={styles.metaText}>|  {movie.Year}</Text>
            <Text style={styles.metaText}>|  {movie.Runtime}</Text>
            <Text style={styles.metaText}>|  {movie.Rated}</Text>
          </View>

          <Text style={styles.genre}>{movie.Genre}</Text>

          <Pressable
            style={[styles.btnBase, styles.watchlistBtn, isInWatchlist ? styles.watchlistBtnActive : styles.watchlistBtnInactive]}
            onPress={toggleWatchlist}
          >
            <Text style={[styles.btnTextBase, isInWatchlist ? styles.watchlistTextActive : styles.watchlistTextInactive]}>
              {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </Text>
          </Pressable>

          {/* --- KEMASKINI DI SINI: SEKSYEN PLOT SUMMARY DENGAN TOGGLE ACTION --- */}
          <Text style={styles.sectionTitle}>Plot Summary</Text>
          <Text 
            style={styles.plot}
            numberOfLines={isPlotExpanded ? undefined : 3} // Menunjukkan 3 barisan sahaja jika belum di-expand
            ellipsizeMode="tail"
          >
            {movie.Plot}
          </Text>
          
          {/* Butang Show More / Show Less hanya muncul jika teks plot melebihi panjang standard */}
          {movie.Plot && movie.Plot.length > 100 && (
            <Pressable 
              onPress={() => setIsPlotExpanded(!isPlotExpanded)}
              style={{ marginTop: 5, marginBottom: 15 }}
            >
              <Text style={{ color: '#E50914', fontWeight: 'bold' }}>
                {isPlotExpanded ? 'Show Less ↑' : 'Show More ↓'}
              </Text>
            </Pressable>
          )}
          {/* ------------------------------------------------------------------ */}

          {/* SEKSYEN KOMEN */}
          {isInWatchlist ? (
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Comments</Text>
              
              {savedComment && !isEditing ? (
                <View style={styles.commentBox}>
                  <Text style={styles.commentText}>"{savedComment}"</Text>
                  <View style={styles.commentActionRow}>
                    <Pressable style={styles.textBtn} onPress={() => setIsEditing(true)}>
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </Pressable>
                    <Pressable style={styles.textBtn} onPress={deleteComment}>
                      <Text style={styles.deleteCommentText}>🗑️ Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Tulis pendapat atau nota peribadi anda mengenai filem ini..."
                    placeholderTextColor="#666666"
                    multiline
                    value={comment}
                    onChangeText={setComment}
                  />
                  <View style={styles.buttonRow}>
                    <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={saveComment}>
                      <Text style={styles.btnTextBase}>Save Comment</Text>
                    </Pressable>
                    
                    {isEditing && (
                      <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={() => {
                        setComment(savedComment);
                        setIsEditing(false);
                      }}>
                        <Text style={styles.btnTextBase}>Cancel</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.commentSection}>
              <Text style={styles.lockedCommentText}>
                🔒 Add this movie into **Watchlist** first before commenting.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}