import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
            discover: 'map-search',
            classes: 'calendar-clock',
            content: 'play-box-multiple',
            profile: 'account',
          };
          const iconName = iconMap[route.name];
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="classes" options={{ title: 'Classes' }} />
      <Tabs.Screen name="content" options={{ title: 'Content' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}