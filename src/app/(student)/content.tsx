import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

export default function ContentScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineMedium">Training content</Text>
          <Text variant="bodyMedium" style={styles.subheading}>
            Video lessons, technique guides, and training plans will appear here.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 18,
  },
  cardContent: {
    gap: 12,
  },
  subheading: {
    opacity: 0.75,
  },
});