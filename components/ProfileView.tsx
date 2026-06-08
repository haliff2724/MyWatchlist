import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ProfileViewProps {
  name: string;
  email: string;
  avatarUrl: string;
}

export default function ProfileView({ name, email, avatarUrl }: ProfileViewProps) {
  return (
    <View style={styles.profileCard}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.emailText}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#1F1F1F',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginVertical: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emailText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
});