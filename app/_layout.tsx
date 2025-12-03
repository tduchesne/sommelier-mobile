import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark'; // Pour la couleur de la flèche

  useEffect(() => {
    async function unlockOrientation() {
      await ScreenOrientation.unlockAsync();
    }
    unlockOrientation();
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Accueil' }} />
        
        {/* CORRECTION ICI : On définit le style transparent dès l'initialisation */}
        <Stack.Screen 
          name="details/[id]" 
          options={{ 
            headerTitle: '',             // Pas de titre
            headerTransparent: true,     // Fond transparent immédiat
            headerBackTitle: '', // Pas de texte "Retour"
            headerTintColor: isDark ? '#FFFFFF' : '#000000', // Couleur flèche adaptée
          }} 
        />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}