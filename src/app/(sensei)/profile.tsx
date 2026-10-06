import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';

export default function SenseiProfileScreen() {
  const { user, signOut } = useAppContext();
  const theme = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineMedium">Profile</Text>
          <Text variant="bodyLarge">{user?.displayName ?? 'Sensei'}</Text>
          <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
          <Text variant="bodyMedium" style={styles.role}>Role: Sensei</Text>
          {user?.dojoName && <Text variant="bodyMedium" style={styles.dojo}>Dojo: {user.dojoName}</Text>}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">Account</Text>
          <Button mode="outlined" onPress={handleSignOut} style={styles.signOutButton}>
            Sign out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 16 },
  card: { borderRadius: 18 },
  cardContent: { gap: 12 },
  email: { opacity: 0.7 },
  role: { opacity: 0.8 },
  dojo: { opacity: 0.8, marginTop: 4 },
  signOutButton: { marginTop: 8 },
});