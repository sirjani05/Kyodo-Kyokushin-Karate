import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadForm'>;

export function LeadFormScreen({ route, navigation }: Props) {
  const { dojo } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    console.log('Lead created for', dojo.name, { name, email, phone });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium">Free trial request</Text>
          <Text variant="titleMedium">{dojo.name}</Text>
          <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" />
          <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" />
          <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" />
          <Button mode="contained" onPress={handleSubmit}>Request trial</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    borderRadius: 20,
  },
  content: {
    gap: 14,
  },
});
