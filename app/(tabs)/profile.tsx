import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';

export default function Profile() {
  // State untuk menyimpan data profil pengguna
  const [name, setName] = useState<string>('Movie Lover');
  const [bio, setBio] = useState<string>('Binge-watching is my cardio 🍿');
  const [avatar, setAvatar] = useState<string>('https://via.placeholder.com/150/E50914/FFFFFF?text=User');

  // State sementara untuk memegang nilai input ketika sedang menaip/edit
  const [inputName, setInputName] = useState<string>('');
  const [inputBio, setInputBio] = useState<string>('');
  const [inputAvatar, setInputAvatar] = useState<string>('');

  // State untuk mengawal mod: FALSE = Papar Profil, TRUE = Mod Edit Form
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Ambil data profil lama yang tersimpan dari AsyncStorage sebaik sahaja skrin difokuskan
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      const savedBio = await AsyncStorage.getItem('user_bio');
      const savedAvatar = await AsyncStorage.getItem('user_avatar');

      if (savedName) setName(savedName);
      if (savedBio) setBio(savedBio);
      if (savedAvatar) setAvatar(savedAvatar);
    } catch (error) {
      console.error('Failed to upload profile data:', error);
    }
  };

  // Fungsi untuk mengaktifkan mod mengedit dan mengisi data sedia ada ke dalam input form
  const handleStartEdit = () => {
    setInputName(name);
    setInputBio(bio);
    setInputAvatar(avatar);
    setIsEditing(true);
  };

  // Fungsi untuk menyimpan data baharu ke AsyncStorage
  const handleSaveProfile = async () => {
    if (!inputName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    try {
      await AsyncStorage.setItem('user_name', inputName);
      await AsyncStorage.setItem('user_bio', inputBio);
      await AsyncStorage.setItem('user_avatar', inputAvatar || 'https://via.placeholder.com/150/E50914/FFFFFF?text=User');

      // Kemas kini state paparan utama
      setName(inputName);
      setBio(inputBio);
      setAvatar(inputAvatar);
      
      setIsEditing(false); // Keluar dari mod edit
      Alert.alert('Success', 'Your profile has been updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="👤 My Profile" />

      <View style={styles.contentContainer}>
        {/* Bahagian Paparan Imej Avatar */}
        <Image 
          source={{ uri: isEditing ? inputAvatar : avatar }} 
          style={styles.avatarImage} 
        />

        {!isEditing ? (
          /* ================= PAPARAN PROFIL ASAL ================= */
          <View style={styles.infoWrapper}>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.bioText}>{bio}</Text>

            <Pressable style={styles.editButton} onPress={handleStartEdit}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Pressable>
          </View>
        ) : (
          /* ================= MOD BORANG EDIT (EDIT FORM) ================= */
          <View style={styles.formWrapper}>
            <Text style={styles.label}>Profile Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama anda"
              placeholderTextColor="#666"
              value={inputName}
              onChangeText={setInputName}
            />

            <Text style={styles.label}>Bio / Description</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tulis bio ringkas..."
              placeholderTextColor="#666"
              value={inputBio}
              onChangeText={setInputBio}
              multiline
            />

            <Text style={styles.label}>Avatar Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan URL gambar profil"
              placeholderTextColor="#666"
              value={inputAvatar}
              onChangeText={setInputAvatar}
            />

            {/* Butang Aksi Simpan / Batal */}
            <View style={styles.actionRow}>
              <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </Pressable>

              <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    paddingHorizontal: 16,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E50914',
    marginBottom: 20,
    backgroundColor: '#262626'
  },
  infoWrapper: {
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bioText: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formWrapper: {
    width: '100%',
    paddingHorizontal: 10,
  },
  label: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  bioInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#00B14F', // Warna hijau untuk butang simpan sukses
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelBtnText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
    fontSize: 16,
  },
});