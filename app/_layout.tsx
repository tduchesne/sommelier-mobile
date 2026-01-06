import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { View, ActivityIndicator } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/tokenCache'; // Ton import existant
import { useColorScheme } from '@/hooks/use-color-scheme'; // Ton hook existant

// Récupération de la clé Clerk
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

// Composant Interne : Gère la Navigation, le Thème et la Redirection
function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Tes hooks existants
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 1. Gestion de l'orientation (Ton code)
  useEffect(() => {
    async function unlockOrientation() {
      await ScreenOrientation.unlockAsync();
    }
    unlockOrientation();
  }, []);

  // 2. Gestion de la Sécurité 
  useEffect(() => {
    if (!isLoaded) return;

    
    const inAuthGroup = (segments as string[])[0] === '(auth)';
    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)/' as any); 
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/login' as any); 
    }
  
  }, [isSignedIn, isLoaded, segments]);

  // 3. Écran de chargement pendant que Clerk s'initialise
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  // 4. Ta Navigation existante (Stack)
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* On ajoute l'écran d'auth à la Stack (caché) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Accueil' }} />
        
        <Stack.Screen 
          name="details/[id]" 
          options={{ 
            headerTitle: '',
            headerTransparent: true,
            headerBackTitle: '',
            headerTintColor: isDark ? '#FFFFFF' : '#000000',
          }} 
        />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Composant Racine : Le Wrapper Clerk
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}