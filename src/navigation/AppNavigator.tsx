import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppContext } from '@/context/AppContext';
import { ClassesScreen } from '@/screens/ClassesScreen';
import { ContentScreen } from '@/screens/ContentScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { DojoProfileScreen } from '@/screens/DojoProfileScreen';
import { LeadFormScreen } from '@/screens/LeadFormScreen';
import { LeadsScreen } from '@/screens/LeadsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SenseiDashboardScreen } from '@/screens/SenseiDashboardScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import type { Dojo } from '@/types/app';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: { mode?: 'login' | 'register' };
  StudentTabs: undefined;
  SenseiTabs: undefined;
  DojoProfile: { dojo: Dojo };
  LeadForm: { dojo: Dojo };
};

export type StudentTabsParamList = {
  Discover: undefined;
  Classes: undefined;
  Content: undefined;
  Profile: undefined;
};

export type SenseiTabsParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const StudentTab = createBottomTabNavigator<StudentTabsParamList>();
const SenseiTab = createBottomTabNavigator<SenseiTabsParamList>();

function StudentTabs() {
  return (
    <StudentTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof StudentTabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
            Discover: 'map-search',
            Classes: 'calendar-clock',
            Content: 'play-box-multiple',
            Profile: 'account',
          };
          const iconName = iconMap[route.name as keyof StudentTabsParamList];
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <StudentTab.Screen name="Discover" component={DiscoverScreen} />
      <StudentTab.Screen name="Classes" component={ClassesScreen} />
      <StudentTab.Screen name="Content" component={ContentScreen} />
      <StudentTab.Screen name="Profile" component={ProfileScreen} />
    </StudentTab.Navigator>
  );
}

function SenseiTabs() {
  return (
    <SenseiTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof SenseiTabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
            Dashboard: 'home-analytics',
            Leads: 'clipboard-list',
            Profile: 'account-cog',
          };
          return <MaterialCommunityIcons name={icons[route.name as keyof SenseiTabsParamList]} size={size} color={color} />;
        },
      })}
    >
      <SenseiTab.Screen name="Dashboard" component={SenseiDashboardScreen} />
      <SenseiTab.Screen name="Leads" component={LeadsScreen} />
      <SenseiTab.Screen name="Profile" component={ProfileScreen} />
    </SenseiTab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <RootStack.Screen name="Welcome" component={WelcomeScreen} />
            <RootStack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : user.role === 'student' ? (
          <>
            <RootStack.Screen name="StudentTabs" component={StudentTabs} />
            <RootStack.Screen name="DojoProfile" component={DojoProfileScreen} />
            <RootStack.Screen name="LeadForm" component={LeadFormScreen} />
          </>
        ) : (
          <>
            <RootStack.Screen name="SenseiTabs" component={SenseiTabs} />
            <RootStack.Screen name="DojoProfile" component={DojoProfileScreen} />
            <RootStack.Screen name="LeadForm" component={LeadFormScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
