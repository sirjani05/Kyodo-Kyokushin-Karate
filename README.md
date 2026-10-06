# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Supabase setup

The app reads published dojos, trial classes, and training content from Supabase. Student trial requests are saved to `public.leads`.

1. In Supabase, open **Project Settings → API** and add these Expo-public variables to `.env.local` (the publishable/anon key is intended for client apps):

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```

2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates the tables, auth profile trigger, indexes, grants, and row-level security policies expected by the app.
3. Add dojo, trial class, and training content records in the Supabase dashboard. Public records must have `is_published = true`; new dojo and class records default to unpublished.
4. Restart Expo after changing environment variables.

Public queries are restricted to published records. Trial requests require a signed-in student profile; row-level security scopes submissions and reads to the student and the owning dojo. Sensei-created dojos remain unpublished until an administrator reviews and publishes them.

## Start the app

Use the project scripts to start Expo:

```bash
npm start
npm run android
npm run ios
npm run web
```

These scripts temporarily disable Expo Router's React Navigation import guard because the app currently uses a nested React Navigation navigator. This is a compatibility workaround; a full Expo Router route migration is still needed to remove it.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start Expo with the project launcher

   ```bash
   npm start
   ```

Scan the QR code using Expo Go on a physical device, or use a platform shortcut:

```bash
npm run android
npm run ios
npm run web
```

`npm run android` requires Android Studio's Android SDK and `adb` to be installed and discoverable. On Linux, if the SDK is installed in the default location, set `ANDROID_HOME="$HOME/Android/Sdk"` and add `$ANDROID_HOME/platform-tools` to `PATH`. If there is no local SDK, use Expo Go on a physical device instead.

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
