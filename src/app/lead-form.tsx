import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { createTrialRequest } from '@/lib/dojo-data';
import type { Dojo } from '@/types/app';

export default function LeadFormScreen() {
  const { dojo, trialClass } = useLocalSearchParams<{ dojo: string; trialClass?: string }>();
  const parsedDojo: Dojo = JSON.parse(dojo);
  const parsedTrialClass = trialClass ? JSON.parse(trialClass) : undefined;
  const { user } = useAppContext();
  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim();
    if (!name.trim() || !normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Enter your name and a valid email address to request a trial.');
      return;
    }
    if (!user || user.role !== 'student') {
      setErrorMessage('Sign in with a student Supabase account to send a trial request.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createTrialRequest({
        studentId: user.uid,
        candidateName: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        dojoId: parsedDojo.id,
        trialClassId: parsedTrialClass?.id,
      });
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Your request could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">{isSubmitted ? 'Request sent' : 'Free trial request'}</Text>
          <Text variant="titleMedium">{parsedDojo.name}</Text>
          {parsedTrialClass ? <Text variant="bodyMedium">Class: {parsedTrialClass.title}</Text> : null}
          {isSubmitted ? (
            <>
              <Text>Your request has been sent to {parsedDojo.name}. The dojo will contact you to confirm the details.</Text>
              <Button mode="contained" onPress={() => router.back()}>Done</Button>
            </>
          ) : (
            <>
              <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" autoCapitalize="words" />
              <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" />
              <TextInput label="Phone (optional)" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" />
              {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
              <Button mode="contained" onPress={() => void handleSubmit()} loading={isSubmitting} disabled={isSubmitting}>
                Request trial
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 18 },
  card: { borderRadius: 20 },
  content: { gap: 14 },
  error: { color: '#b3261e' },
});