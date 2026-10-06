import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import type { Dojo } from '@/types/app';

export default function DojoProfileScreen() {
  const { dojo } = useLocalSearchParams<{ dojo: string }>();
  const parsedDojo: Dojo = JSON.parse(dojo);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        {parsedDojo.image ? <Card.Cover source={{ uri: parsedDojo.image }} /> : null}
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">{parsedDojo.name}</Text>
          <Text variant="titleMedium">{parsedDojo.city} • {parsedDojo.address}</Text>
          {parsedDojo.description ? <Text variant="bodyLarge" style={styles.description}>{parsedDojo.description}</Text> : null}
          <Text variant="bodyMedium">Sensei: {parsedDojo.sensei}</Text>
          {parsedDojo.rating > 0 ? <Text variant="bodyMedium">Rating: {parsedDojo.rating}/5</Text> : null}
          <Text variant="bodyMedium">Trial capacity: {parsedDojo.trialCapacity}</Text>
          <View style={styles.chipsRow}>
            {parsedDojo.specialties.map((item) => (
              <Chip key={item} mode="outlined">{item}</Chip>
            ))}
          </View>
          <Button mode="contained" onPress={() => router.push({ pathname: '/lead-form', params: { dojo: JSON.stringify(parsedDojo) } })}>Book a free trial</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 18,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    gap: 10,
    paddingVertical: 16,
  },
  description: {
    opacity: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});