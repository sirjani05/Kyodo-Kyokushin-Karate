import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DojoProfile'>;

export function DojoProfileScreen({ route, navigation }: Props) {
  const { dojo } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: dojo.image }} />
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">{dojo.name}</Text>
          <Text variant="titleMedium">{dojo.city} • {dojo.address}</Text>
          <Text variant="bodyLarge" style={styles.description}>{dojo.description}</Text>
          <Text variant="bodyMedium">Sensei: {dojo.sensei}</Text>
          <Text variant="bodyMedium">Rating: {dojo.rating}/5</Text>
          <Text variant="bodyMedium">Trial capacity: {dojo.trialCapacity}</Text>
          <View style={styles.chipsRow}>
            {dojo.specialties.map((item) => (
              <Chip key={item} mode="outlined">{item}</Chip>
            ))}
          </View>
          <Button mode="contained" onPress={() => navigation.navigate('LeadForm', { dojo })}>Book a free trial</Button>
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
