import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';

import { fetchDojos } from '@/lib/dojo-data';
import type { Dojo } from '@/types/app';

export default function ClassesScreen() {
  const [dojos, setDojos] = useState<Dojo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDojos()
      .then(setDojos)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Upcoming classes</Text>
      <Text variant="bodyMedium" style={styles.subheading}>Browse scheduled classes at nearby dojos.</Text>

      {isLoading && <ActivityIndicator accessibilityLabel="Loading classes" />}
      {!isLoading && dojos.length === 0 && <Text style={styles.message}>No classes scheduled yet.</Text>}

      {dojos.map((dojo) => (
        <Card key={dojo.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{dojo.name}</Text>
            <Text variant="bodyMedium">{dojo.city}</Text>
            <Text variant="bodyMedium" style={styles.address}>{dojo.address}</Text>
            <View style={styles.buttonsRow}>
              <Button mode="outlined" onPress={() => router.push({ pathname: '/dojo-profile', params: { dojo: JSON.stringify(dojo) } })}>View dojo</Button>
              <Button mode="contained" onPress={() => router.push({ pathname: '/lead-form', params: { dojo: JSON.stringify(dojo) } })}>Free trial</Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 16 },
  subheading: { opacity: 0.75 },
  card: { borderRadius: 18, overflow: 'hidden' },
  address: { marginTop: 8, opacity: 0.8 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  message: { paddingVertical: 12, opacity: 0.75 },
});