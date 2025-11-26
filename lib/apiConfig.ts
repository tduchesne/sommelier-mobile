import Constants from 'expo-constants';

export function getApiUrl(): string {
  const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  const apiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  const resolvedApiUrl = apiUrlFromConfig || apiUrlFromEnv;

  if (!resolvedApiUrl) {
    throw new Error(
      'API_URL not configured — set EXPO_PUBLIC_API_URL or expoConfig.extra.apiUrl in app.config.js'
    );
  }

  return resolvedApiUrl;
}


