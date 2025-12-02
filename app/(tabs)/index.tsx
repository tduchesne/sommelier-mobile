import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Vin } from '@/types/vin';

// On récupère l'URL proprement (déjà configurée)
const API_URL = process.env.EXPO_PUBLIC_API_URL + '/vins';

// Couleurs thématiques
const COLORS = {
  ROUGE: '#800020',       // Bordeaux
  BLANC: '#F2C94C',       // Jaune doré
  ROSE: '#F48FB1',        // Rose
  EFFERVESCENT: '#56CCF2',// Bleu clair (Bulles)
  ORANGE: '#F2994A',      // Orange
  LIQUOREUX: '#BB6BD9',   // Violet
  DEFAULT: '#ccc'
};

const getWineColor = (couleur: string | undefined) => {
  if (!couleur) return COLORS.DEFAULT;
  return COLORS[couleur as keyof typeof COLORS] || COLORS.DEFAULT;
};

export default function HomeScreen() {
  const [vins, setVins] = useState<Vin[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const searchLower = searchText.trim().toLowerCase();

  useEffect(() => {
    const fetchVins = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur de connexion');
        const data = await response.json();
        if (Array.isArray(data)) {
          setVins(data);
        }
      } catch (error) {
        console.log('Erreur de connexion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVins();
  }, []);

  const filteredVins = searchLower.length === 0
    ? vins
    : vins.filter((vin) => {
        const nom = vin.nom.toLowerCase();
        const cepage = vin.cepage?.toLowerCase() ?? '';
        const region = vin.region?.toLowerCase() ?? '';
        return nom.includes(searchLower) || cepage.includes(searchLower) || region.includes(searchLower);
      });

  const renderItem = ({ item }: { item: Vin }) => {
    const accentColor = getWineColor(item.couleur);

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: accentColor }]}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/details/[id]', params: { id: item.id } } as any)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.nom} numberOfLines={1}>{item.nom}</Text>
          <Text style={styles.prix}>${item.prix}</Text>
        </View>
        
        <View style={styles.cardSubHeader}>
          {item.couleur && (
            <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}> 
              <Text style={[styles.badgeText, { color: accentColor }]}>{item.couleur}</Text>
            </View>
          )}
          <Text style={styles.region} numberOfLines={1}>{item.region}</Text>
        </View>

        {item.cepage && <Text style={styles.cepage} numberOfLines={1}>{item.cepage}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Carte des Vins</Text>
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (nom, cépage, région)..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#800020" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredVins}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucun vin trouvé.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Fond légèrement gris comme le menu
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 16,
    paddingBottom: 8,
    textAlign: 'center',
    color: '#800020', // Rouge Bordeaux
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
    // Ombre légère
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0, // Géré par gap dans la liste
    
    // Style bordure gauche comme les plats
    borderLeftWidth: 4, 
    // borderLeftColor est défini dynamiquement
    
    // Ombres
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nom: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  prix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#800020', // Prix en bordeaux
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  region: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  cepage: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  }
});