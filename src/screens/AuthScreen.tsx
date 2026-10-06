import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppContext } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { UserRole } from '@/types/app';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { signIn, register } = useAppContext();
  const initialMode = route.params?.mode ?? 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dojoName, setDojoName] = useState('');
  const [city, setCity] = useState('Tokyo');
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginMode = mode === 'login';

  const submitLabel = useMemo(() => (isLoginMode ? 'Sign in' : 'Create profile'), [isLoginMode]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        await signIn(email.trim(), password, role);
      } else {
        await register({
          displayName: displayName.trim() || 'Kyodo Member',
          email: email.trim(),
          password,
          role,
          dojoName: dojoName.trim() || undefined,
          city: city.trim() || 'Tokyo',
        });
      }
      navigation.reset({
        index: 0,
        routes: [{ name: role === 'sensei' ? 'SenseiTabs' : 'StudentTabs' }],
      });
    } catch (error) {
      console.warn('Auth submit failed', error);
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
            value={mode}
            onValueChange={(next) => setMode(next as 'login' | 'register')}
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

          <Text variant="titleSmall">I am joining as</Text>
          <SegmentedButtons
            value={role}
            onValueChange={(next) => setRole(next as UserRole)}
            buttons={[
              { value: 'student', label: 'Student' },
              { value: 'sensei', label: 'Sensei' },
            ]}
          />

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
});
