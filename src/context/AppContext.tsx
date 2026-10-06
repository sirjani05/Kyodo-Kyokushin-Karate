import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchUserProfile } from '@/lib/dojo-data';
import { getAuthModeLabel, supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types/app';

interface AppContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthReady: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (payload: { displayName: string; email: string; password: string; role: UserRole; dojoName?: string; city?: string }) => Promise<boolean>;
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
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          const sessionUser = data.session?.user;
          if (sessionUser) {
            const profile = await fetchUserProfile(sessionUser.id, sessionUser.email ?? '');
            if (active) setUser(profile);
          }
          return;
        }

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
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      const profile = await fetchUserProfile(data.user.id, data.user.email ?? email);
      if (!profile) throw new Error('Your account profile is missing or has an invalid role. Contact your dojo administrator.');
      await persistUser(profile);
      setUser(profile);
      return;
    }

    const nextUser = buildDemoUser(role, email, 'Demo Member');
    await persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (payload: { displayName: string; email: string; password: string; role: UserRole; dojoName?: string; city?: string }) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.displayName,
            role: payload.role,
            dojo_name: payload.dojoName ?? null,
            city: payload.city ?? 'Tokyo',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) return false;

      const profile = await fetchUserProfile(data.user.id, payload.email);
      if (!profile) throw new Error('Your account was created, but its profile is missing. Please contact support.');
      await persistUser(profile);
      setUser(profile);
      return true;
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
    return true;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
