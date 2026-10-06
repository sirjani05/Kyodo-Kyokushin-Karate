import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

import { useAppContext } from '@/context/AppContext';

export function ProfileScreen() {
  const { user, signOut, isStudent, isSensei } = useAppContext();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Text size={64} label={user?.displayName?.slice(0, 2).toUpperCase() ?? 'KK'} />
          <Text variant="headlineSmall">{user?.displayName ?? 'Kyodo Member'}</Text>
          <Text variant="bodyLarge">{user?.email ?? 'member@example.com'}</Text>
          <Text variant="bodyMedium">Role: {isStudent ? 'Student' : isSensei ? 'Sensei' : 'Member'}</Text>
          <Text variant="bodyMedium">City: {user?.city ?? 'Tokyo'}</Text>
          <Button mode="contained" onPress={() => void signOut()}>
            Sign out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
});
