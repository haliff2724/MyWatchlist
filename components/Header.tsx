import { Ionicons } from '@expo/vector-icons'; // Pastikan expo icons diimport
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';




interface HeaderProps {
  title: string;
  showBack?: boolean;     
  backAction?: () => void; 
}

export default function Header({ title, showBack = false, backAction }: HeaderProps) {
  const router = useRouter();


  const handleBack = () => {
    if (backAction) {
      backAction();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.headerContainer}>
      {showBack && (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E50914" />
        </Pressable>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {/* View kosong di kanan sekadar untuk bagi teks tajuk kekal center balance */}
      {showBack && <View style={{ width: 24 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
});