import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: theme.colors.background }}
    >
      <Card style={styles.heroCard}>
        <Card.Content>
          <View style={styles.brandRow}>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Chip mode="flat">Kyodo Karate</Chip>
          </View>

          <Text variant="headlineMedium" style={styles.title}>
            Grow stronger with a dojo that fits your journey.
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Find nearby Kyokushin dojos, book a free trial, and keep training with structured content and live class updates.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineSmall">5+</Text>
            <Text variant="bodyMedium">new students per month goal</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineSmall">12</Text>
            <Text variant="bodyMedium">dojos within reach</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.featureCard}>
        <Card.Content>
          <Text variant="titleLarge">Built for student growth and sensei conversion</Text>
          <View style={styles.chipsRow}>
            <Chip>Nearby discovery</Chip>
            <Chip>Lead capture</Chip>
            <Chip>Trial classes</Chip>
            <Chip>Training content</Chip>
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={() => navigation.navigate('Auth', { mode: 'register' })} style={styles.primaryButton}>
        Create account
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Auth', { mode: 'login' })}>
        Sign in
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    width: 52,
    height: 52,
  },
  title: {
    marginTop: 8,
    lineHeight: 40,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
  },
  featureCard: {
    borderRadius: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  primaryButton: {
    marginTop: 8,
  },
});
