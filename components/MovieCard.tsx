import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface MovieCardProps {
  title: string;
  image: string;
  type: string;
  year: string;
  rightAction?: React.ReactNode; // Menyokong butang aksi dinamik di sebelah kanan kad
}

export default function MovieCard({ title, image, type, year, rightAction }: MovieCardProps) {
  
  // Jika imej daripada API bernilai 'N/A', gunakan placeholder asas
  const posterSource = image && image !== 'N/A' 
    ? { uri: image } 
    : { uri: 'https://via.placeholder.com/150/262626/FFFFFF?text=No+Poster' };

  return (
    <View style={styles.card}>
      <View style={styles.clickableArea}>
        <Image 
          source={posterSource} 
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
          </View>
          <Text style={styles.infoText}>🗓️ Year: {year}</Text>
        </View>
      </View>
      {rightAction && <View style={styles.actionContainer}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#1F1F1F', 
    borderRadius: 12, 
    flexDirection: 'row', 
    overflow: 'hidden', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#2A2A2A' 
  },
  clickableArea: { 
    flexDirection: 'row', 
    flex: 1, 
    alignItems: 'center' 
  },
  poster: { 
    width: 90, 
    height: 125, 
    backgroundColor: '#262626' 
  },
  textContainer: { 
    padding: 12, 
    flex: 1, 
    gap: 4 
  },
  titleText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  badge: { 
    backgroundColor: '#333', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4, 
    alignSelf: 'flex-start', 
    borderWidth: 0.5, 
    borderColor: '#E50914' 
  },
  badgeText: { 
    color: '#E50914', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  infoText: { 
    color: '#AAAAAA', 
    fontSize: 13 
  },
  actionContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});