# Kyokushin Karate

Expo SDK 57 React Native application for discovering dojos, viewing trial classes and training videos, submitting trial requests, and managing Sensei leads.

## Supabase setup

1. In Supabase **Project Settings → API**, copy the project URL and publishable/anon key.
2. Create `.env.local` in the repository root using [.env.example](./.env.example):

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```

   Never put a Supabase `service_role` key in the mobile app.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in Supabase SQL Editor. It creates `profiles`, `dojos`, `trial_classes`, `training_content`, and `leads`, as well as the profile trigger, indexes, grants, and row-level security policies.
4. Add records to the tables. Discovery screens only show published dojos, upcoming published classes for those dojos, and published video content. Trial requests require an authenticated student profile.
5. Restart Expo after configuring environment variables.

Supabase Auth stores its persisted session using AsyncStorage. The mobile app has no demo-auth fallback: missing configuration and backend errors are surfaced to the user.

## Install and run

```bash
npm install
npm start
```

Use Expo Go to scan the QR code on a physical device. Other scripts:

```bash
npm run android
npm run ios
npm run web
```

Launching an Android emulator requires Android Studio's Android SDK and `adb`. The project launcher temporarily bypasses Expo Router's React Navigation import guard because this app mounts a React Navigation v6 navigator inside Expo Router. A full Expo Router migration would remove that workaround.

## Validation

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
