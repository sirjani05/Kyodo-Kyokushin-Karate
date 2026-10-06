import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import type { UserRole } from '@/types/app';

export default function AuthScreen() {
  const { signIn, register } = useAppContext();
  const { mode } = useLocalSearchParams<{ mode?: 'login' | 'register' }>();
  const initialMode = mode ?? 'login';
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dojoName, setDojoName] = useState('');
  const [city, setCity] = useState('Tokyo');
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const isLoginMode = currentMode === 'login';

  const submitLabel = useMemo(() => (isLoginMode ? 'Sign in' : 'Create profile'), [isLoginMode]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedbackMessage(null);
    try {
      if (isLoginMode) {
        await signIn(email.trim(), password);
      } else {
        const signedIn = await register({
          displayName: displayName.trim() || 'Kyodo Member',
          email: email.trim(),
          password,
          role,
          dojoName: dojoName.trim() || undefined,
          city: city.trim() || 'Tokyo',
        });
        if (!signedIn) {
          setFeedbackMessage('Your account was created. Check your email to confirm your address, then sign in.');
        }
      }
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : 'Could not authenticate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineMedium">{isLoginMode ? 'Welcome back' : 'Start your dojo journey'}</Text>
          <SegmentedButtons
            value={currentMode}
            onValueChange={(next) => setCurrentMode(next as 'login' | 'register')}
            buttons={[
              { value: 'login', label: 'Sign in' },
              { value: 'register', label: 'Register' },
            ]}
          />

          {!isLoginMode && (
            <TextInput
              label="Full name"
              value={displayName}
              onChangeText={setDisplayName}
              mode="outlined"
              autoCapitalize="words"
            />
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
          />

          {!isLoginMode && (
            <>
              <TextInput
                label="Dojo name (optional)"
                value={dojoName}
                onChangeText={setDojoName}
                mode="outlined"
              />
              <TextInput
                label="City"
                value={city}
                onChangeText={setCity}
                mode="outlined"
              />
            </>
          )}

          {!isLoginMode && (
            <>
              <Text variant="titleSmall">I am joining as</Text>
              <SegmentedButtons
                value={role}
                onValueChange={(next) => setRole(next as UserRole)}
                buttons={[
                  { value: 'student', label: 'Student' },
                  { value: 'sensei', label: 'Sensei' },
                ]}
              />
            </>
          )}

          {feedbackMessage ? <Text accessibilityRole="alert" style={styles.feedback}>{feedbackMessage}</Text> : null}

          <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
  },
  cardContent: {
    gap: 14,
  },
  feedback: {
    color: '#b3261e',
  },
});