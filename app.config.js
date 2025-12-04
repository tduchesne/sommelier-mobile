const isProdProfile =
  process.env.EAS_BUILD_PROFILE === 'production' || process.env.NODE_ENV === 'production';

// In development, we allow falling back to a local HTTP backend.
// In production, EXPO_PUBLIC_API_URL is required and must be HTTPS.
const resolveApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (isProdProfile) {
    if (!envUrl) {
      throw new Error(
        'EXPO_PUBLIC_API_URL is required for production builds and must point to an HTTPS endpoint.'
      );
    }

    if (!/^https:\/\//.test(envUrl)) {
      throw new Error('EXPO_PUBLIC_API_URL must use HTTPS (e.g. https://api.example.com) in production.');
    }

    return envUrl;
  }

  // Development: use env if provided, otherwise fall back to the local HTTP backend.
  return envUrl || 'http://10.0.0.225:8080';
};

export default {
  expo: {
    name: 'sommelier-mobile',
    slug: 'sommelier-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'sommeliermobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.vinotech.sommeliermobile',
      // Only allow HTTP for the local backend when using the development build/profile.
      ...(isProdProfile
        ? {}
        : {
            infoPlist: {
              NSAppTransportSecurity: {
                NSExceptionDomains: {
                  '10.0.0.225': {
                    NSExceptionAllowsInsecureHTTPLoads: true,
                    NSIncludesSubdomains: false,
                  },
                },
              },
            },
          }),
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: resolveApiUrl(),
      eas: {
        projectId: 'a44c86a8-ad6b-476c-8278-95ef5acfce9a',
      },
    },
    "updates": {
    "url": "https://u.expo.dev/a44c86a8-ad6b-476c-8278-95ef5acfce9a"
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
  },
};

