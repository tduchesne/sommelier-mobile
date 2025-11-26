# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## API configuration & production safety

- **Development**
  - By default, the app will talk to a local backend at `http://10.0.0.225:8080`.
  - On iOS, an App Transport Security (ATS) exception is only enabled for this local IP when using the **development** profile/build.
- **Production**
  - Set **`EXPO_PUBLIC_API_URL`** to a **HTTPS** endpoint (for example `https://api.example.com`) before running a production build.
  - Production builds will fail if `EXPO_PUBLIC_API_URL` is missing or does not start with `https://`.
  - You can run the same check locally or in CI with:

    ```bash
    npm run check:prod-env
    ```

- **EAS build profiles**
  - `eas.json` defines at least two build profiles:
    - **development**: internal/dev builds with the ATS exception for the local backend.
    - **production**: store builds without any ATS HTTP exception and requiring a secure HTTPS API URL.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
