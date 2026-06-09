import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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

// Interface untuk struktur setiap komen awam
interface PublicComment {
  id: string; // ID unik untuk setiap komen
  userId: string; // Email penulis komen
  userName: string; // Nama penulis komen
  userAvatar: string; // Gambar profil penulis komen
  text: string; // Isi komen
  timestamp: string; // Tarikh/Masa komen dibuat
}

export default function Details() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  
  // --- STATE PENGURUSAN AKAUN AKTIF ---
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserData, setCurrentUserData] = useState<{ name: string; avatar: string } | null>(null);

  // --- STATE PENGURUSAN KOMEN AWAM ---
  const [commentsList, setCommentsList] = useState<PublicComment[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // State untuk toggle plot summary
  const [isPlotExpanded, setIsPlotExpanded] = useState<boolean>(false);

  const API_KEY = 'c1aecf62';

  // Trigger setiap kali skrin difokuskan untuk memastikan data akaun terkini
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        checkUserSession();
        loadPublicComments();
      }
    }, [id])
  );

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      checkWatchlistStatus();
    }
  }, [id]);

  // Semak sesi akaun yang sedang aktif log masuk
  const checkUserSession = async () => {
    try {
      const activeEmail = await AsyncStorage.getItem('current_user_email');
      if (activeEmail) {
        setCurrentUserEmail(activeEmail);
        
        // Tarik maklumat nama dan avatar akaun aktif daripada registered_users
        const allUsersData = await AsyncStorage.getItem('registered_users');
        if (allUsersData) {
          const usersList = JSON.parse(allUsersData);
          const matchedUser = usersList.find((u: any) => u.email.toLowerCase() === activeEmail.toLowerCase());
          if (matchedUser) {
            setCurrentUserData({ name: matchedUser.name, avatar: matchedUser.avatar });
          }
        }
      } else {
        setCurrentUserEmail(null);
        setCurrentUserData(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  // --- AMBIL SEMUA KOMEN KONGSI (PUBLIC) ---
  const loadPublicComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(`movie_comments_${id}`);
      if (savedComments) {
        setCommentsList(JSON.parse(savedComments));
      } else {
        setCommentsList([]);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  // --- SIMPAN / TAMBAH KOMEN BARU ATAU KEMASKINI KOMEN ---
  const saveComment = async () => {
    if (!commentInput.trim()) {
      Alert.alert('Reminder', 'Please enter comment before saving.');
      return;
    }
    if (!currentUserEmail || !currentUserData) {
      Alert.alert('Error', 'You must be logged in to comment.');
      return;
    }

    try {
      let updatedList = [...commentsList];

      if (editingCommentId) {
        // Logik Kemas Kini (Edit Mode) - Ganti teks pada ID yang sepadan
        updatedList = updatedList.map((c) => {
          if (c.id === editingCommentId) {
            return { ...c, text: commentInput.trim() };
          }
          return c;
        });
        setEditingCommentId(null);
        Alert.alert('Successful', 'Your comment has been updated.');
      } else {
        // Logik Tambah Komen Baharu (Jika bukan dalam mod edit)
        const newComment: PublicComment = {
          id: Date.now().toString(),
          userId: currentUserEmail,
          userName: currentUserData.name,
          userAvatar: currentUserData.avatar,
          text: commentInput.trim(),
          timestamp: new Date().toLocaleDateString('ms-MY'),
        };
        updatedList.push(newComment);
        Alert.alert('Successful', 'Your comment has been saved.');
      }

      await AsyncStorage.setItem(`movie_comments_${id}`, JSON.stringify(updatedList));
      setCommentsList(updatedList);
      setCommentInput('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save comment.');
    }
  };

  // --- PADAM KOMEN (HANYA MILIK SENDIRI) ---
  const deleteComment = async (commentId: string) => {
    Alert.alert('Deleting Comment', 'Are you sure to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedList = commentsList.filter((c) => c.id !== commentId);
            await AsyncStorage.setItem(`movie_comments_${id}`, JSON.stringify(updatedList));
            setCommentsList(updatedList);
            if (editingCommentId === commentId) {
              setEditingCommentId(null);
              setCommentInput('');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete the comment.');
          }
        }
      }
    ]);
  };

  const startEditComment = (comment: PublicComment) => {
    setEditingCommentId(comment.id);
    setCommentInput(comment.text);
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

          {/* PLOT SUMMARY SECTION */}
          <Text style={styles.sectionTitle}>Plot Summary</Text>
          <Text 
            style={styles.plot}
            numberOfLines={isPlotExpanded ? undefined : 3}
            ellipsizeMode="tail"
          >
            {movie.Plot}
          </Text>
          
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

          {/* ================= SEKSYEN KOMEN AWAM KONGSI ================= */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Public Comments ({commentsList.length})</Text>

            {/* Senarai Semua Komen (Semua Akaun Boleh Lihat) */}
            {commentsList.map((item) => {
              const isMyComment = currentUserEmail && item.userId.toLowerCase() === currentUserEmail.toLowerCase();
              
              return (
                <View key={item.id} style={styles.commentBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                    <Image source={{ uri: item.userAvatar }} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#333' }} />
                    <Text style={{ color: '#E50914', fontWeight: 'bold', fontSize: 13 }}>{item.userName}</Text>
                    <Text style={{ color: '#666', fontSize: 11 }}>{item.timestamp}</Text>
                    {isMyComment && <Text style={{ color: '#00B14F', fontSize: 10, fontWeight: 'bold' }}>(You)</Text>}
                  </View>
                  
                  <Text style={styles.commentText}>"{item.text}"</Text>

                  {/* Butang Aksi Edit/Delete Cuma Muncul Jika Komen Ini Milik Akaun Yang Sedang Login */}
                  {isMyComment && (
                    <View style={styles.commentActionRow}>
                      <Pressable style={styles.textBtn} onPress={() => startEditComment(item)}>
                        <Text style={styles.editBtnText}>✏️ Edit</Text>
                      </Pressable>
                      <Pressable style={styles.textBtn} onPress={() => deleteComment(item.id)}>
                        <Text style={styles.deleteCommentText}>🗑️ Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}

            {commentsList.length === 0 && (
              <Text style={{ color: '#666', fontStyle: 'italic', marginVertical: 10, textAlign: 'center' }}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            )}

            {/* Input Borang Komen */}
            {currentUserEmail ? (
              isInWatchlist ? (
                <View style={{ marginTop: 15 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 14, color: '#AAA' }]}>
                    {editingCommentId ? '📝 Edit Your Comment:' : '💬 Add a Comment:'}
                  </Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Tulis pendapat atau nota peribadi anda mengenai filem ini..."
                    placeholderTextColor="#666666"
                    multiline
                    value={commentInput}
                    onChangeText={setCommentInput}
                  />
                  <View style={styles.buttonRow}>
                    <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={saveComment}>
                      <Text style={styles.btnTextBase}>
                        {editingCommentId ? 'Update Comment' : 'Save Comment'}
                      </Text>
                    </Pressable>
                    
                    {editingCommentId && (
                      <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={() => {
                        setEditingCommentId(null);
                        setCommentInput('');
                      }}>
                        <Text style={styles.btnTextBase}>Cancel</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={[styles.lockedCommentText, { marginTop: 15 }]}>
                  🔒 Add this movie into **Watchlist** first before commenting.
                </Text>
              )
            ) : (
              <Text style={[styles.lockedCommentText, { marginTop: 15 }]}>
                🔒 Please **Login** into your account first to read or write comments.
              </Text>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}