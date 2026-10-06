import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Button, Card, Text } from 'react-native-paper';

import { fetchTrainingContent } from '@/lib/dojo-data';
import type { TrainingContent } from '@/types/app';

function VideoCard({ video }: { video: TrainingContent }) {
  const player = useVideoPlayer(video.videoUrl, (nextPlayer) => {
    nextPlayer.loop = false;
    nextPlayer.playbackRate = 1;
  });

  return (
    <Card style={styles.card}>
      <VideoView player={player} style={styles.video} nativeControls contentFit="cover" />
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium">{video.title}</Text>
        <Text variant="bodyMedium">{video.category} • {video.duration} • {video.level}</Text>
        {video.description ? <Text variant="bodyMedium">{video.description}</Text> : null}
      </Card.Content>
    </Card>
  );
}

export function ContentScreen() {
  const [videos, setVideos] = useState<TrainingContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadContent = useCallback(() => fetchTrainingContent(), []);

  useEffect(() => {
    let active = true;
    loadContent()
      .then((rows) => {
        if (active) setVideos(rows);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Could not load training content.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadContent]);

  const retryLoading = () => {
    setIsLoading(true);
    setErrorMessage(null);
    loadContent()
      .then(setVideos)
      .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Could not load training content.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <FlatList
      data={videos}
      keyExtractor={(video) => video.id}
      renderItem={({ item }) => <VideoCard video={item} />}
      contentContainerStyle={styles.container}
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      windowSize={3}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="headlineMedium">Training content</Text>
          {isLoading && <ActivityIndicator accessibilityLabel="Loading training content" />}
          {errorMessage && (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text accessibilityRole="alert">{errorMessage}</Text>
                <Button onPress={retryLoading}>Try again</Button>
              </Card.Content>
            </Card>
          )}
        </View>
      }
      ListEmptyComponent={
        !isLoading && !errorMessage
          ? <Text style={styles.message}>Training videos will appear here when published.</Text>
          : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 16 },
  header: { gap: 16 },
  card: { borderRadius: 18, overflow: 'hidden' },
  cardContent: { gap: 8 },
  video: { width: '100%', height: 210 },
  message: { paddingVertical: 12, opacity: 0.75 },
});
