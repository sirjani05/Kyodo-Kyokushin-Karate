import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card, Chip, Text } from 'react-native-paper';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList, StudentTabsParamList } from '@/navigation/AppNavigator';
import type { Dojo } from '@/types/app';

type ScreenProps = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, 'Discover'>,
  NativeStackScreenProps<RootStackParamList>
>;

const dojoList: Dojo[] = [
  {
    id: 'dojo-1',
    name: 'Shinbukan Dojo',
    city: 'Tokyo',
    address: 'Shinjuku, Tokyo',
    distanceKm: 2.1,
    rating: 4.9,
    trialCapacity: 18,
    description: 'Technical Kyokushin classes focused on fundamentals, body conditioning, and disciplined kumite progression.',
    sensei: 'Sensei Taro Sato',
    specialties: ['Beginner Friendly', 'Kumite', 'Conditioning'],
    image: 'https://images.unsplash.com/photo-1549057446-9f5c6ac91a04',
    mapRegion: {
      latitude: 35.6938,
      longitude: 139.7038,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    },
  },
  {
    id: 'dojo-2',
    name: 'Kuroda Budo Center',
    city: 'Tokyo',
    address: 'Setagaya, Tokyo',
    distanceKm: 5.8,
    rating: 4.8,
    trialCapacity: 12,
    description: 'A comprehensive training environment with a warm community, youth programs, and detailed belt progression.',
    sensei: 'Sensei Keisuke Kuroda',
    specialties: ['Youth', 'Kata', 'Self-defense'],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    mapRegion: {
      latitude: 35.6274,
      longitude: 139.6993,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    },
  },
  {
    id: 'dojo-3',
    name: 'Seijou Karate Academy',
    city: 'Osaka',
    address: 'Umeda, Osaka',
    distanceKm: 8.4,
    rating: 4.7,
    trialCapacity: 10,
    description: 'High-energy adult classes with gritty conditioning, controlled sparring, and personal mentorship.',
    sensei: 'Sensei Yasuo Iwata',
    specialties: ['Adults', 'Strength', 'Competition'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    mapRegion: {
      latitude: 34.7025,
      longitude: 135.4959,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    },
  },
];

export function DiscoverScreen({ navigation }: ScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Nearby dojos</Text>
      <Text variant="bodyMedium" style={styles.subheading}>Discover the best Kyokushin environments by distance, trust, and trial access.</Text>

      <Card style={styles.mapCard}>
        <Card.Content>
          <MapView
            style={styles.map}
            initialRegion={dojoList[0].mapRegion}
          >
            {dojoList.map((dojo) => (
              <Marker
                key={dojo.id}
                coordinate={{ latitude: dojo.mapRegion.latitude, longitude: dojo.mapRegion.longitude }}
                title={dojo.name}
                description={dojo.address}
              />
            ))}
          </MapView>
        </Card.Content>
      </Card>

      {dojoList.map((dojo) => (
        <Card key={dojo.id} style={styles.card}>
          <Card.Cover source={{ uri: dojo.image }} />
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge">{dojo.name}</Text>
              <Text variant="labelLarge">⭐ {dojo.rating}</Text>
            </View>
            <Text variant="bodyMedium">{dojo.city} • {dojo.distanceKm} km away</Text>
            <Text variant="bodyMedium" style={styles.address}>{dojo.address}</Text>
            <Text variant="bodyMedium" style={styles.description}>{dojo.description}</Text>
            <View style={styles.chipsRow}>
              {dojo.specialties.map((specialty) => (
                <Chip key={specialty} mode="outlined">{specialty}</Chip>
              ))}
            </View>
            <Text variant="bodyMedium" style={styles.meta}>Sensei: {dojo.sensei}</Text>
            <Text variant="bodyMedium" style={styles.meta}>Free trial seats: {dojo.trialCapacity}</Text>
            <View style={styles.buttonsRow}>
              <Button mode="outlined" onPress={() => navigation.navigate('DojoProfile', { dojo })}>View dojo</Button>
              <Button mode="contained" onPress={() => navigation.navigate('LeadForm', { dojo })}>Free trial</Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
  subheading: {
    opacity: 0.75,
  },
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 180,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  address: {
    marginTop: 8,
    opacity: 0.8,
  },
  description: {
    marginTop: 8,
    opacity: 0.82,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  meta: {
    marginTop: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
});
