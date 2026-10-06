import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { router } from 'expo-router';

import { fetchDojos } from '@/lib/dojo-data';
import type { Dojo } from '@/types/app';

const DEFAULT_REGION = {
  latitude: 35.6762,
  longitude: 139.6503,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

export default function DiscoverScreen() {
  const [dojos, setDojos] = useState<Dojo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDojos = useCallback(() => fetchDojos(), []);

  useEffect(() => {
    let active = true;
    loadDojos()
      .then((rows) => {
        if (active) setDojos(rows);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Could not load dojos.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadDojos]);

  const retryLoading = () => {
    setIsLoading(true);
    setErrorMessage(null);
    loadDojos()
      .then(setDojos)
      .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Could not load dojos.'))
      .finally(() => setIsLoading(false));
  };

  const mappedDojos = dojos.filter((dojo) => dojo.mapRegion);
  const region = mappedDojos.length
    ? {
        latitude: (Math.min(...mappedDojos.map((dojo) => dojo.mapRegion!.latitude)) +
          Math.max(...mappedDojos.map((dojo) => dojo.mapRegion!.latitude))) / 2,
        longitude: (Math.min(...mappedDojos.map((dojo) => dojo.mapRegion!.longitude)) +
          Math.max(...mappedDojos.map((dojo) => dojo.mapRegion!.longitude))) / 2,
        latitudeDelta: Math.max(
          0.05,
          Math.max(...mappedDojos.map((dojo) => dojo.mapRegion!.latitude)) -
            Math.min(...mappedDojos.map((dojo) => dojo.mapRegion!.latitude)),
        ) * 1.4,
        longitudeDelta: Math.max(
          0.05,
          Math.max(...mappedDojos.map((dojo) => dojo.mapRegion!.longitude)) -
            Math.min(...mappedDojos.map((dojo) => dojo.mapRegion!.longitude)),
        ) * 1.4,
      }
    : DEFAULT_REGION;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Explore dojos</Text>
      <Text variant="bodyMedium" style={styles.subheading}>Explore Kyokushin dojos and request a free trial class.</Text>

      {isLoading && <ActivityIndicator accessibilityLabel="Loading dojos" />}
      {errorMessage && (
        <Card style={styles.noticeCard}>
          <Card.Content style={styles.noticeContent}>
            <Text accessibilityRole="alert">{errorMessage}</Text>
            <Button onPress={retryLoading}>Try again</Button>
          </Card.Content>
        </Card>
      )}
      {!isLoading && !errorMessage && dojos.length === 0 && (
        <Text style={styles.message}>No dojos are published yet. Please check back soon.</Text>
      )}

      {dojos.length > 0 && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <MapView style={styles.map} initialRegion={region}>
              {mappedDojos.map((dojo) => (
                <Marker
                  key={dojo.id}
                  coordinate={{ latitude: dojo.mapRegion!.latitude, longitude: dojo.mapRegion!.longitude }}
                  title={dojo.name}
                  description={dojo.address}
                />
              ))}
            </MapView>
          </Card.Content>
        </Card>
      )}

      {dojos.map((dojo) => (
        <Card key={dojo.id} style={styles.card}>
          {dojo.image ? <Card.Cover source={{ uri: dojo.image }} /> : null}
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge">{dojo.name}</Text>
              {dojo.rating > 0 && <Text variant="labelLarge">★ {dojo.rating.toFixed(1)}</Text>}
            </View>
            <Text variant="bodyMedium">{dojo.city}{dojo.distanceKm === null ? '' : ` • ${dojo.distanceKm.toFixed(1)} km away`}</Text>
            <Text variant="bodyMedium" style={styles.address}>{dojo.address}</Text>
            {dojo.description ? <Text variant="bodyMedium" style={styles.description}>{dojo.description}</Text> : null}
            <View style={styles.chipsRow}>
              {dojo.specialties.map((specialty) => (
                <Chip key={specialty} mode="outlined">{specialty}</Chip>
              ))}
            </View>
            <Text variant="bodyMedium" style={styles.meta}>Sensei: {dojo.sensei}</Text>
            <Text variant="bodyMedium" style={styles.meta}>Free trial places: {dojo.trialCapacity}</Text>
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
  mapCard: { borderRadius: 18, overflow: 'hidden' },
  map: { width: '100%', height: 180 },
  card: { borderRadius: 18, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  address: { marginTop: 8, opacity: 0.8 },
  description: { marginTop: 8, opacity: 0.82 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  meta: { marginTop: 12 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  noticeCard: { borderRadius: 18 },
  noticeContent: { gap: 8 },
  message: { paddingVertical: 12, opacity: 0.75 },
});