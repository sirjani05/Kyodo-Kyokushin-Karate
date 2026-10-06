import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { VideoView, useVideoPlayer } from 'expo-video';

const videos = [
  {
    id: 'video-1',
    title: 'Five-minute mobility for karate beginners',
    category: 'Mobility',
    duration: '05:12',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'video-2',
    title: 'Kata breakdown: Heian Shodan',
    category: 'Kata',
    duration: '08:41',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
  },
  {
    id: 'video-3',
    title: 'Conditioning circuit for Kyokushin training',
    category: 'Conditioning',
    duration: '11:09',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
  },
];

function VideoCard({ videoUrl, title, category, duration }: { videoUrl: string; title: string; category: string; duration: string }) {
  const player = useVideoPlayer(videoUrl, (nextPlayer) => {
    nextPlayer.loop = false;
    nextPlayer.playbackRate = 1;
  });

  return (
    <Card style={styles.card}>
      <VideoView player={player} style={styles.video} nativeControls contentFit="cover" />
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodyMedium">{category} • {duration}</Text>
      </Card.Content>
    </Card>
  );
}

export function ContentScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">Training content</Text>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          videoUrl={video.videoUrl}
          title={video.title}
          category={video.category}
          duration={video.duration}
        />
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
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 210,
  },
});
