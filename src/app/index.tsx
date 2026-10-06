import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';

export default function Index() {
  const { isLoading, user } = useAppContext();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'student') {
          router.replace('/(student)/discover');
        } else {
          router.replace('/(sensei)/dashboard');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isLoading, user]);

  return null;
}