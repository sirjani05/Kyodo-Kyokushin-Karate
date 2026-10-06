import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

export default function DashboardScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Sensei dashboard</Text>
      <View style={styles.statsRow}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">38</Text>
            <Text variant="bodyMedium">New leads</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">12</Text>
            <Text variant="bodyMedium">Trials booked</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">This week</Text>
          <View style={styles.chipsRow}>
            <Chip>3 beginner classes</Chip>
            <Chip>2 video courses</Chip>
            <Chip>5 follow-ups</Chip>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 18,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
});