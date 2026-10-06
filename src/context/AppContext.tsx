import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchUserProfile } from '@/lib/dojo-data';
import { getAuthModeLabel, requireSupabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types/app';

interface AppContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthReady: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: { displayName: string; email: string; password: string; role: UserRole; dojoName?: string; city?: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  isStudent: boolean;
  isSensei: boolean;
  connectionLabel: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const client = requireSupabase();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (!sessionUser) return;

        const profile = await fetchUserProfile(sessionUser.id, sessionUser.email ?? '');
        if (active) setUser(profile);
      } catch (error) {
        console.warn('Could not restore Supabase session', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await fetchUserProfile(data.user.id, data.user.email ?? email);
    if (!profile) {
      throw new Error('Your account profile is missing or has an invalid role. Contact your dojo administrator.');
    }
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: {
    displayName: string;
    email: string;
    password: string;
    role: UserRole;
    dojoName?: string;
    city?: string;
  }) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
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

    if (error) throw error;
    if (!data.user || !data.session) return false;

    const profile = await fetchUserProfile(data.user.id, payload.email);
    if (!profile) {
      throw new Error('Your account was created, but its profile is missing. Please contact support.');
    }
    setUser(profile);
    return true;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
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
