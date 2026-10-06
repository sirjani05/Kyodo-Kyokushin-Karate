import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SenseiTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
            dashboard: 'home-analytics',
            leads: 'clipboard-list',
            profile: 'account-cog',
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="leads" options={{ title: 'Leads' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}