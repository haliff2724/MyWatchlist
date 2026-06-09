import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';

interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}


export default function Watchlist({ navigation }: { navigation: any }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      const data = await AsyncStorage.getItem('watchlist');
      if (data) setWatchlist(JSON.parse(data));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMovie = async (id: string) => {
    Alert.alert('Delete', 'Are you sure to remove this movie ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedList = watchlist.filter((item) => item.imdbID !== id);
          setWatchlist(updatedList);
          await AsyncStorage.setItem('watchlist', JSON.stringify(updatedList));
        },
      },
    ]);
  };

  const renderEmptyWatchlist = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>No movies has been added to watchlist.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="🍿 Watchlist" />

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.imdbID}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={renderEmptyWatchlist}
        renderItem={({ item }) => (
          /* 3. Replaced <Link> with Pressable + navigation.navigate */
          <Pressable 
            style={{ width: '100%' }}
            onPress={() => navigation.navigate('Details', { id: item.imdbID })}
          >
            <MovieCard
              title={item.Title}
              image={item.Poster}
              type={item.Type}
              year={item.Year}
              rightAction={
                <Pressable style={styles.deleteBtn} onPress={() => deleteMovie(item.imdbID)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              }
            />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141414',
    paddingHorizontal: 16
  },
  scrollContent: { 
    paddingBottom: 40 
  },
  separator: { 
    height: 12 
  },
  centerContainer: { 
    flex: 1, 
    paddingVertical: 50, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: { 
    color: '#666666', 
    fontSize: 16 
  },
  deleteBtn: { 
    width: 80,             
    height: 125,          
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#262626', 
    borderLeftWidth: 1,
    borderLeftColor: '#2A2A2A'
  }, 
  deleteText: { 
    color: '#FF4D4D', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});