import { VINS_ENDPOINT } from '@/config/api';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { VinDetail } from '@/types/vin';

export default function VinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vin, setVin] = useState<VinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVin = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${VINS_ENDPOINT}/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du vin');
        }

        const data = await response.json();
        setVin(data);
      } catch (err) {
        console.log('Erreur de connexion:', err);
        setError("Impossible de charger les détails de ce vin.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVin();
    } else {
      setError("Identifiant de vin manquant.");
      setLoading(false);
    }
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : vin ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{vin.nom}</Text>
          <Text style={styles.subTitle}>
            {vin.region} • ${vin.prix}
          </Text>
          {vin.cepage && <Text style={styles.cepage}>Cépage : {vin.cepage}</Text>}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes de degustation</Text>
            <Text style={styles.sectionText}>
              {vin.notesDegustation || "Aucune note de degustation n'est disponible pour ce vin."}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>Vin introuvable.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  subTitle: {
    fontSize: 18,
    color: '#555',
  },
  cepage: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    textAlign: 'center',
  },
});


