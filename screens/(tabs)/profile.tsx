import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';

interface UserAccount {
  email: string;
  password?: string;
  name: string;
  bio: string;
  avatar: string;
}

export default function Profile({ navigation }: { navigation?: any }) {
  
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');

 
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

 
  const [inputName, setInputName] = useState<string>('');
  const [inputBio, setInputBio] = useState<string>('');
  const [inputAvatar, setInputAvatar] = useState<string>('');

  
  useFocusEffect(
    React.useCallback(() => {
      checkUserSession();
    }, [])
  );

  const checkUserSession = async () => {
    try {
      const activeEmail = await AsyncStorage.getItem('current_user_email');
      if (activeEmail) {
        setCurrentUserEmail(activeEmail);
        loadUserProfile(activeEmail);
      } else {
        setCurrentUserEmail(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const loadUserProfile = async (userEmail: string) => {
    try {
      const allUsersData = await AsyncStorage.getItem('registered_users');
      if (allUsersData) {
        const usersList: UserAccount[] = JSON.parse(allUsersData);
        const matchedUser = usersList.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
        
        if (matchedUser) {
          setName(matchedUser.name);
          setBio(matchedUser.bio);
          setAvatar(matchedUser.avatar);
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const handleRegister = async () => {
    const cleanEmail = emailInput.trim();
    const cleanPassword = passwordInput.trim();
    const cleanConfirm = confirmPasswordInput.trim();

    if (!cleanEmail || !cleanPassword || !cleanConfirm) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const allUsersData = await AsyncStorage.getItem('registered_users');
      let usersList: UserAccount[] = allUsersData ? JSON.parse(allUsersData) : [];

      const isEmailExist = usersList.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
      if (isEmailExist) {
        Alert.alert('Error', 'This email is already registered.');
        return;
      }

      const newUser: UserAccount = {
        email: cleanEmail,
        password: cleanPassword,
        name: cleanEmail.split('@')[0],
        bio: 'Binge-watching is my cardio 🍿',
        avatar: 'https://via.placeholder.com/150/E50914/FFFFFF?text=User',
      };

      usersList.push(newUser);
      await AsyncStorage.setItem('registered_users', JSON.stringify(usersList));

      Alert.alert('Success', 'Account registered successfully! Please login.', [
        {
          text: 'OK',
          onPress: () => {
            setAuthMode('LOGIN');
            setPasswordInput('');
            setConfirmPasswordInput('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed.');
    }
  };

  const handleLogin = async () => {
    const cleanEmail = emailInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    try {
      const allUsersData = await AsyncStorage.getItem('registered_users');
      if (!allUsersData) {
        Alert.alert('Error', 'No registered users found. Please sign up first.');
        return;
      }

      const usersList: UserAccount[] = JSON.parse(allUsersData);
      const userFound = usersList.find(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase() && u.password === cleanPassword
      );

      if (userFound) {
        await AsyncStorage.setItem('current_user_email', userFound.email);
        setCurrentUserEmail(userFound.email);
        
        setName(userFound.name);
        setBio(userFound.bio);
        setAvatar(userFound.avatar);

        setEmailInput('');
        setPasswordInput('');
        Alert.alert('Welcome Back!', `Logged in successfully as ${userFound.name}`);
      } else {
        Alert.alert('Error', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login process failed.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('current_user_email');
          setCurrentUserEmail(null);
          setIsEditingProfile(false);
        },
      },
    ]);
  };

  const handleStartEdit = () => {
    setInputName(name);
    setInputBio(bio);
    setInputAvatar(avatar);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!inputName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    try {
      const allUsersData = await AsyncStorage.getItem('registered_users');
      if (allUsersData && currentUserEmail) {
        let usersList: UserAccount[] = JSON.parse(allUsersData);
        
        usersList = usersList.map((u) => {
          if (u.email.toLowerCase() === currentUserEmail.toLowerCase()) {
            return {
              ...u,
              name: inputName.trim(),
              bio: inputBio.trim(),
              avatar: inputAvatar.trim() || 'https://via.placeholder.com/150/E50914/FFFFFF?text=User',
            };
          }
          return u;
        });

        await AsyncStorage.setItem('registered_users', JSON.stringify(usersList));
        setName(inputName.trim());
        setBio(inputBio.trim());
        setAvatar(inputAvatar.trim() || 'https://via.placeholder.com/150/E50914/FFFFFF?text=User');
        
        setIsEditingProfile(false);
        Alert.alert('Success', 'Your profile has been updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={currentUserEmail ? "👤 My Profile" : "🔑 Authentication"} showBack={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!currentUserEmail ? (
            <View style={styles.authWrapper}>
              <Text style={styles.authTitle}>
                {authMode === 'LOGIN' ? 'Sign In to Your Account' : 'Create New Account'}
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
                value={emailInput}
                onChangeText={setEmailInput}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                value={passwordInput}
                onChangeText={setPasswordInput}
              />

              {authMode === 'REGISTER' && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    autoCapitalize="none"
                    value={confirmPasswordInput}
                    onChangeText={setConfirmPasswordInput}
                  />
                </View>
              )}

              <Pressable
                style={[styles.primaryBtn, { marginTop: 25 }]}
                onPress={authMode === 'LOGIN' ? handleLogin : handleRegister}
              >
                <Text style={styles.buttonText}>
                  {authMode === 'LOGIN' ? 'Log In' : 'Register Now'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                  setEmailInput('');
                  setPasswordInput('');
                  setConfirmPasswordInput('');
                }}
                style={styles.switchAuthBtn}
              >
                <Text style={styles.switchAuthText}>
                  {authMode === 'LOGIN'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Log In'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.profileWrapper}>
              <Image
                source={{ uri: isEditingProfile ? inputAvatar : avatar || 'https://via.placeholder.com/150/E50914/FFFFFF?text=User' }}
                style={styles.avatarImage}
              />

              {!isEditingProfile ? (
                <View style={styles.infoWrapper}>
                  <Text style={styles.nameText}>{name}</Text>
                  <Text style={styles.emailSubText}>✉️ {currentUserEmail}</Text>
                  <Text style={styles.bioText}>{bio}</Text>

                  <Pressable style={styles.editButton} onPress={handleStartEdit}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </Pressable>

                  <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Logout</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formWrapper}>
                  <Text style={styles.label}>Profile Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                    value={inputName}
                    onChangeText={setInputName}
                  />

                  <Text style={styles.label}>Bio / Description</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#666"
                    value={inputBio}
                    onChangeText={setInputBio}
                    multiline
                  />

                  <Text style={styles.label}>Avatar Image URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste image URL here"
                    placeholderTextColor="#666"
                    value={inputAvatar}
                    onChangeText={setInputAvatar}
                  />

                  <View style={styles.actionRow}>
                    <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => setIsEditingProfile(false)}>
                      <Text style={styles.cancelBtnText}>Batal</Text>
                    </Pressable>

                    <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSaveProfile}>
                      <Text style={styles.buttonText}>Simpan</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414', paddingHorizontal: 16 },
  scrollContent: { paddingVertical: 20, alignItems: 'center' },
  authWrapper: { width: '100%', paddingHorizontal: 10, marginTop: 20 },
  authTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  profileWrapper: { alignItems: 'center', width: '100%' },
  avatarImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#E50914', marginBottom: 20, backgroundColor: '#262626' },
  infoWrapper: { alignItems: 'center', width: '100%', gap: 10 },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  emailSubText: { fontSize: 14, color: '#888888', marginBottom: 5 },
  bioText: { fontSize: 15, color: '#AAAAAA', textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
  primaryBtn: { backgroundColor: '#E50914', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', width: '100%' },
  editButton: { backgroundColor: '#E50914', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25, marginTop: 10 },
  logoutButton: { backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 35, borderRadius: 25, borderWidth: 1, borderColor: '#FF4D4D', marginTop: 15 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  logoutBtnText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 14 },
  switchAuthBtn: { marginTop: 20, alignItems: 'center' },
  switchAuthText: { color: '#E50914', fontSize: 14, fontWeight: '600' },
  formWrapper: { width: '100%', paddingHorizontal: 10 },
  label: { color: '#E50914', fontSize: 14, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#262626', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 14, height: 48, fontSize: 15, width: '100%' },
  bioInput: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 15 },
  btn: { flex: 1, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { backgroundColor: '#00B14F' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666' },
  cancelBtnText: { color: '#AAAAAA', fontWeight: 'bold', fontSize: 16 },
});