import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Vin } from '@/types/vin';
import FilterModal, { FilterState } from '@/components/FilterModal'; // <--- IMPORT

// Gestion de l'URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) throw new Error("EXPO_PUBLIC_API_URL manquante");
const API_URL = `${BASE_URL.replace(/\/$/, '')}/vins`;

// Couleurs (inchangé)
const COLORS = {
  ROUGE: '#800020', BLANC: '#F2C94C', ROSE: '#F48FB1',
  EFFERVESCENT: '#56CCF2', ORANGE: '#F2994A', LIQUOREUX: '#BB6BD9', DEFAULT: '#ccc'
};
const getWineColor = (c: string | undefined) => COLORS[c as keyof typeof COLORS] || COLORS.DEFAULT;

export default function HomeScreen() {
  const [vins, setVins] = useState<Vin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Recherche texte (Client-side)
  const [searchText, setSearchText] = useState('');
  
  // Filtres avancés (Server-side)
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ couleur: null, minPrix: '', maxPrix: '', region: '' });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const router = useRouter();

  // Fonction pour charger les vins (Standard ou Recherche)
  const fetchVins = useCallback(async () => {
    setLoading(true);
    try {
      // Construction de l'URL
      let url = API_URL;
      const params = new URLSearchParams();
      // Taille de la page
      params.append('size', '500');
      // Si on a des filtres actifs, on utilise l'endpoint de recherche
      // Sinon on utilise l'endpoint standard (qui renvoie la liste complète)
      if (filters.couleur) params.append('couleur', filters.couleur);
      if (filters.minPrix) params.append('minPrix', filters.minPrix);
      if (filters.maxPrix) params.append('maxPrix', filters.maxPrix);
      if (filters.region) params.append('region', filters.region);

      // On détecte si on doit utiliser le mode recherche
      const isSearching = params.toString().length > 0;
      
      if (isSearching) {
        url = `${API_URL}/search?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur réseau');
      
      const data = await response.json();
      
      // Gestion Pagination vs Liste simple
      // Le nouvel endpoint /search retourne { content: [...] }
      // L'ancien /vins retourne [...] (sauf si vous l'avez migré aussi)
      let listeVins = [];
      if (Array.isArray(data)) {
        listeVins = data;
      } else if (data.content && Array.isArray(data.content)) {
        listeVins = data.content;
      }

      setVins(listeVins);

    } catch (error) {
      console.log('Erreur:', error);
      setVins([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Recharger quand les filtres changent
  useEffect(() => {
    fetchVins();
    
    // Calculer combien de filtres sont actifs pour le badge
    let count = 0;
    if (filters.couleur) count++;
    if (filters.minPrix) count++;
    if (filters.maxPrix) count++;
    if (filters.region) count++;
    setActiveFiltersCount(count);

  }, [filters]);

  // Filtrage local par texte (Nom/Cépage)
  const filteredVins = vins.filter((vin) => {
    const searchLower = searchText.trim().toLowerCase();
    if (searchLower === '') return true;
    const nom = vin.nom.toLowerCase();
    const cepage = vin.cepage?.toLowerCase() ?? '';
    return nom.includes(searchLower) || cepage.includes(searchLower);
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
      
      <View style={styles.toolbar}>
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher (nom)..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bouton Filtres */}
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]} 
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="filter-list" size={24} color={activeFiltersCount > 0 ? "white" : "#800020"} />
          {activeFiltersCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Liste */}
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

      {/* Modale */}
      <FilterModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onApply={setFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', padding: 16, textAlign: 'center', color: '#800020' },
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#eee', height: 50
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  
  // Bouton Filtre
  filterButton: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee'
  },
  filterButtonActive: { backgroundColor: '#800020', borderColor: '#800020' },
  badgeCount: {
    position: 'absolute', top: -5, right: -5, backgroundColor: 'red',
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  badgeCountText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // Liste (inchangé)
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardSubHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  nom: { fontSize: 17, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
  prix: { fontSize: 16, fontWeight: '700', color: '#800020' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  region: { fontSize: 14, color: '#666', flex: 1 },
  cepage: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 }
});