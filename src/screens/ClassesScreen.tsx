import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

const trialClasses = [
  {
    id: 'class-1',
    dojoName: 'Shinbukan Dojo',
    title: 'Beginner Fundamentals',
    date: 'Tue, 18:30',
    format: 'In person',
    level: 'Beginner',
    seatsLeft: 6,
  },
  {
    id: 'class-2',
    dojoName: 'Kuroda Budo Center',
    title: 'Conditioning & Basics',
    date: 'Thu, 19:00',
    format: 'Open mat',
    level: 'Intermediate',
    seatsLeft: 4,
  },
  {
    id: 'class-3',
    dojoName: 'Seijou Karate Academy',
    title: 'Kata Clinic',
    date: 'Sat, 10:00',
    format: 'Workshop',
    level: 'All levels',
    seatsLeft: 8,
  },
];

export function ClassesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Upcoming trial classes</Text>
      {trialClasses.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{item.title}</Text>
            <Text variant="bodyLarge">{item.dojoName}</Text>
            <Text variant="bodyMedium">{item.date}</Text>
            <Text variant="bodyMedium">{item.format} • {item.level}</Text>
            <Text variant="bodyMedium">Seats left: {item.seatsLeft}</Text>
            <Button mode="contained" style={styles.button}>Reserve place</Button>
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
  button: {
    marginTop: 14,
  },
});
