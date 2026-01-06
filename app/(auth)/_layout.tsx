import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false, // On cache le header pour l'écran de connexion
          title: 'Connexion' 
        }} 
      />
      {/* On pourra ajouter "signup" ou "forgot-password" ici plus tard */}
    </Stack>
  );
}