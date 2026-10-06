import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

import { firebaseAuth, getAuthModeLabel } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types/app';

interface AppContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthReady: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (payload: { displayName: string; email: string; password: string; role: UserRole; dojoName?: string; city?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isStudent: boolean;
  isSensei: boolean;
  connectionLabel: string;
}

const STORAGE_KEY = 'kyodo.user.profile.v1';

const AppContext = createContext<AppContextValue | undefined>(undefined);

const buildDemoUser = (role: UserRole, email: string, displayName = 'Kyodo Member'): UserProfile => ({
  uid: `demo-${role}-${Date.now()}`,
  email,
  displayName,
  role,
  city: 'Tokyo',
  isDemo: true,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const readStoredSession = async () => {
      try {
        const secureProfile = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!secureProfile) {
          const fallback = await AsyncStorage.getItem(STORAGE_KEY);
          if (!fallback) {
            return;
          }
          const parsed = JSON.parse(fallback) as UserProfile;
          if (active) {
            setUser(parsed);
          }
          return;
        }
        const parsed = JSON.parse(secureProfile) as UserProfile;
        if (active) {
          setUser(parsed);
        }
      } catch (error) {
        console.warn('Could not restore stored profile', error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void readStoredSession();
    return () => {
      active = false;
    };
  }, []);

  const persistUser = async (nextUser: UserProfile | null) => {
    if (!nextUser) {
      await SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => undefined);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(nextUser));
    } catch (error) {
      console.warn('SecureStore unavailable, using AsyncStorage fallback', error);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const signIn = useCallback(async (email: string, password: string, role: UserRole) => {
    if (firebaseAuth) {
      const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const nextUser: UserProfile = {
        uid: credentials.user.uid,
        email: credentials.user.email ?? email,
        displayName: credentials.user.displayName ?? 'Kyodo Member',
        role,
        city: 'Tokyo',
        isDemo: false,
      };
      await persistUser(nextUser);
      setUser(nextUser);
      return;
    }

    const nextUser = buildDemoUser(role, email, 'Demo Member');
    await persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: { displayName: string; email: string; password: string; role: UserRole; dojoName?: string; city?: string }) => {
    if (firebaseAuth) {
      const demoUser: UserProfile = {
        uid: `firebase-${payload.role}-${Date.now()}`,
        email: payload.email,
        displayName: payload.displayName,
        role: payload.role,
        dojoName: payload.dojoName,
        city: payload.city ?? 'Tokyo',
        isDemo: false,
      };
      await persistUser(demoUser);
      setUser(demoUser);
      return;
    }

    const nextUser: UserProfile = {
      uid: `demo-${payload.role}-${Date.now()}`,
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role,
      dojoName: payload.dojoName,
      city: payload.city ?? 'Tokyo',
      isDemo: true,
    };
    await persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseAuth) {
      await firebaseSignOut(firebaseAuth).catch(() => undefined);
    }
    await persistUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      isLoading,
      isAuthReady: !isLoading,
      role: user?.role ?? null,
      signIn,
      register,
      signOut,
      isStudent: user?.role === 'student',
      isSensei: user?.role === 'sensei',
      connectionLabel: getAuthModeLabel(),
    }),
    [isLoading, register, signIn, signOut, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
