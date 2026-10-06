import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { useAppContext } from '@/context/AppContext';
import { fetchSenseiLeads, updateLeadStatus } from '@/lib/dojo-data';
import type { Lead } from '@/types/app';

const nextStatus: Partial<Record<Lead['status'], Lead['status']>> = {
  new: 'contacted',
  contacted: 'booked',
};

const statusLabel: Record<Lead['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  booked: 'Trial booked',
};

export function LeadsScreen() {
  const { user } = useAppContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLeads = useCallback(() => fetchSenseiLeads(), []);

  useEffect(() => {
    let active = true;
    loadLeads()
      .then((rows) => {
        if (active) setLeads(rows);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Could not load trial requests.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadLeads]);

  const retryLoading = () => {
    setIsLoading(true);
    setErrorMessage(null);
    loadLeads()
      .then(setLeads)
      .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Could not load trial requests.'))
      .finally(() => setIsLoading(false));
  };

  const advanceLead = async (lead: Lead) => {
    const status = nextStatus[lead.status];
    if (!status) return;
    setUpdatingLeadId(lead.id);
    setErrorMessage(null);
    try {
      await updateLeadStatus(lead.id, status);
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update this trial request.');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Trial requests</Text>
      {isLoading && <ActivityIndicator accessibilityLabel="Loading trial requests" />}
      {errorMessage && (
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <Text accessibilityRole="alert">{errorMessage}</Text>
            <Button onPress={retryLoading}>Try again</Button>
          </Card.Content>
        </Card>
      )}
      {!isLoading && !errorMessage && leads.length === 0 && (
        <Text style={styles.message}>No trial requests have come in yet.</Text>
      )}
      {leads.map((lead) => (
        <Card key={lead.id} style={styles.card}>
          <Card.Content style={styles.content}>
            <Text variant="titleLarge">{lead.candidateName}</Text>
            <Text variant="bodyMedium">{lead.dojoName}</Text>
            <Text variant="bodyMedium">Status: {statusLabel[lead.status]}</Text>
            <Text variant="bodyMedium">{lead.email}</Text>
            {lead.phone ? <Text variant="bodyMedium">{lead.phone}</Text> : null}
            <Text variant="bodySmall">{new Date(lead.createdAt).toLocaleDateString()}</Text>
            {nextStatus[lead.status] ? (
              <Button
                mode="contained"
                loading={updatingLeadId === lead.id}
                disabled={!user || updatingLeadId !== null}
                onPress={() => void advanceLead(lead)}
              >
                Mark {statusLabel[nextStatus[lead.status]!].toLowerCase()}
              </Button>
            ) : null}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 16 },
  card: { borderRadius: 18 },
  content: { gap: 8 },
  message: { paddingVertical: 12, opacity: 0.75 },
});
