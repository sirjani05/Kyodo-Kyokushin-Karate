import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { fetchTrialClasses } from '@/lib/dojo-data';
import type { RootStackParamList, StudentTabsParamList } from '@/navigation/AppNavigator';
import type { TrialClass } from '@/types/app';

type ScreenProps = CompositeScreenProps<
  BottomTabScreenProps<StudentTabsParamList, 'Classes'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ClassesScreen({ navigation }: ScreenProps) {
  const [classes, setClasses] = useState<TrialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadClasses = useCallback(() => fetchTrialClasses(), []);

  useEffect(() => {
    let active = true;
    loadClasses()
      .then((rows) => {
        if (active) setClasses(rows);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Could not load trial classes.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadClasses]);

  const retryLoading = () => {
    setIsLoading(true);
    setErrorMessage(null);
    loadClasses()
      .then(setClasses)
      .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Could not load trial classes.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Upcoming trial classes</Text>
      {isLoading && <ActivityIndicator accessibilityLabel="Loading trial classes" />}
      {errorMessage && (
        <Card style={styles.card}>
          <Card.Content style={styles.noticeContent}>
            <Text accessibilityRole="alert">{errorMessage}</Text>
            <Button onPress={retryLoading}>Try again</Button>
          </Card.Content>
        </Card>
      )}
      {!isLoading && !errorMessage && classes.length === 0 && (
        <Text style={styles.message}>No trial classes are scheduled yet.</Text>
      )}
      {classes.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{item.title}</Text>
            <Text variant="bodyLarge">{item.dojoName}</Text>
            <Text variant="bodyMedium">{item.date} • {item.time}</Text>
            <Text variant="bodyMedium">{item.format} • {item.level}</Text>
            <Text variant="bodyMedium">Places remaining: {item.seatsLeft}</Text>
            <Button
              mode="contained"
              style={styles.button}
              disabled={item.seatsLeft <= 0}
              onPress={() => navigation.navigate('LeadForm', {
                dojo: item.dojo,
                trialClass: { id: item.id, title: item.title },
              })}
            >
              {item.seatsLeft > 0 ? 'Request a place' : 'Class full'}
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 16 },
  card: { borderRadius: 18 },
  button: { marginTop: 14 },
  noticeContent: { gap: 8 },
  message: { paddingVertical: 12, opacity: 0.75 },
});
