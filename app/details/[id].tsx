import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- TYPES & CONSTANTES ---
// On définit un type local ou on importe. Pour l'exemple, je définis ici pour être autonome.
type PlatSimple = { id: number; nom: string };
type VinDetail = {
  id: number;
  nom: string;
  prix: number;
  region: string;
  cepage: string;
  couleur: string;
  notesDegustation: string;
  platsAccordes?: PlatSimple[]; // Relation Backend
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_URL = `${BASE_URL?.replace(/\/$/, '')}/vins`;

const COLORS_VIN = {
  ROUGE: '#800020', BLANC: '#F2C94C', ROSE: '#F48FB1',
  EFFERVESCENT: '#56CCF2', ORANGE: '#F2994A', LIQUOREUX: '#BB6BD9', DEFAULT: '#999'
};

const getWineColor = (c: string | undefined) => COLORS_VIN[c as keyof typeof COLORS_VIN] || COLORS_VIN.DEFAULT;

// Thème unifié
const ThemeColors = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    subText: '#666666',
    border: '#E5E5EA',
    accent: '#800020',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    subText: '#AAAAAA',
    border: '#38383A',
    accent: '#FF4D6D',
  }
};

export default function VinDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? ThemeColors.dark : ThemeColors.light;

  const [vin, setVin] = useState<VinDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVinDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVin(data);
        }
      } catch (error) {
        console.error("Erreur fetch details vin", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVinDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!vin) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Vin introuvable.</Text>
      </View>
    );
  }

  const wineAccent = getWineColor(vin.couleur);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Configuration Header Navigation */}
      

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <View style={[styles.iconCircle, { backgroundColor: wineAccent + '20' }]}>
             <MaterialIcons name="wine-bar" size={60} color={wineAccent} />
          </View>
          
          <Text style={[styles.nom, { color: theme.text }]}>{vin.nom}</Text>
          <Text style={[styles.region, { color: theme.subText }]}>{vin.region}</Text>
          
          <View style={[styles.priceTag, { backgroundColor: theme.accent }]}>
             <Text style={styles.priceText}>${vin.prix}</Text>
          </View>
        </View>

        {/* INFO GRID */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <View style={styles.infoBlock}>
              <MaterialIcons name="invert-colors" size={20} color={theme.subText} />
              <Text style={[styles.label, { color: theme.subText }]}>Couleur</Text>
              <Text style={[styles.value, { color: theme.text }]}>{vin.couleur}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoBlock}>
              <MaterialIcons name="spa" size={20} color={theme.subText} />
              <Text style={[styles.label, { color: theme.subText }]}>Cépage</Text>
              <Text style={[styles.value, { color: theme.text }]}>{vin.cepage || 'Assemblage'}</Text>
            </View>
          </View>
        </View>

        {/* NOTES DE DEGUSTATION */}
        {vin.notesDegustation && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>Notes de Dégustation</Text>
            <Text style={[styles.description, { color: theme.text }]}>
              &quot;{vin.notesDegustation}&quot;
            </Text>
          </View>
        )}

        {/* ACCORDS METS-VINS (Si dispo) */}
        {vin.platsAccordes && vin.platsAccordes.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeaderRow}>
               <MaterialIcons name="restaurant-menu" size={20} color={theme.accent} style={{marginRight: 8}}/>
               <Text style={[styles.sectionTitle, { color: theme.accent, marginBottom: 0 }]}>Accords Suggérés</Text>
            </View>
            
            <View style={styles.chipsContainer}>
              {vin.platsAccordes.map((plat) => (
                <View key={plat.id} style={[styles.platChip, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={[styles.platText, { color: theme.text }]}>{plat.nom}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40, paddingTop: 60 }, // PaddingTop pour compenser le Header Transparent
  
  // HERO
  heroContainer: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  nom: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  region: { fontSize: 16, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  priceTag: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },
  priceText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },

  // CARD INFO
  card: {
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBlock: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  divider: { width: 1, height: '100%' },
  label: { fontSize: 12, marginTop: 4, marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 16, fontWeight: '600' },

  // SECTIONS
  section: {
    marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, fontStyle: 'italic' },

  // CHIPS
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, 
  },
  platText: { fontSize: 14, fontWeight: '500' },
});