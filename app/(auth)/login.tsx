import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    // 1. Validation locale
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez entrer un identifiant et un mot de passe.");
      return;
    }

    setLoading(true);

    try {
      // 2. Tentative de connexion
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      // 3. Activation de la session
      await setActive({ session: completeSignIn.createdSessionId });
      
      // La redirection est gérée par _layout.tsx
      
    } catch (err: any) {
      // --- LOGIQUE DE GESTION D'ERREUR PROPRE ---
      
      // Extraction sécurisée du code d'erreur
      const errorCode = err.errors && err.errors.length > 0 ? err.errors[0].code : null;
      const errorMessage = err.errors && err.errors.length > 0 ? err.errors[0].message : "Une erreur est survenue.";

      // Cas 1 : Déjà connecté (Succès caché)
      if (errorCode === 'session_exists') {
        // On ne fait RIEN (pas d'alerte, pas de log rouge).
        // On laisse le _layout.tsx faire la redirection.
        return; 
      }

      // Cas 2 : Vraie erreur
      console.error("❌ Erreur Login:", JSON.stringify(err, null, 2));
      
      let userMessage = "Une erreur est survenue.";
      if (errorCode === "form_password_incorrect") {
        userMessage = "Mot de passe incorrect.";
      } else if (errorMessage) {
        userMessage = errorMessage;
      }
      
      Alert.alert("Échec de connexion", userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Styles dynamiques
  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const inputBg = isDark ? '#1E1E1E' : '#F5F5F5';
  const placeholderColor = isDark ? '#888' : '#666';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Sommelier Numérique</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>Connexion Staff</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Identifiant ou Email</Text>
          <TextInput
            autoCapitalize="none"
            value={email}
            placeholder="sommelier"
            placeholderTextColor={placeholderColor}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColor }]}>Mot de passe</Text>
          <TextInput
            value={password}
            placeholder="••••••••"
            placeholderTextColor={placeholderColor}
            secureTextEntry={true}
            onChangeText={setPassword}
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={onSignInPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8E1616', // Rouge Vin
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 