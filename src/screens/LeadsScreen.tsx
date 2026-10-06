import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

const leads = [
  { name: 'Aiko Tanaka', status: 'New lead', source: 'Website' },
  { name: 'Kenta Saito', status: 'Trial booked', source: 'Instagram' },
  { name: 'Nana Mori', status: 'Follow up', source: 'Google Maps' },
];

export function LeadsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Leads</Text>
      {leads.map((lead) => (
        <Card key={lead.name} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{lead.name}</Text>
            <Text variant="bodyMedium">Status: {lead.status}</Text>
            <Text variant="bodyMedium">Source: {lead.source}</Text>
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
  card: {
    borderRadius: 18,
  },
});
