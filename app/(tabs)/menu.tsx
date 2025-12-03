import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView,
  TextInput,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// --- TYPES ---
type Plat = {
  id: number;
  nom: string;
  ingredients: string; 
  allergenes: string | null;
};

interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedAllergies: string[];
  toggleAllergy: (allergen: string) => void;
}

// --- CONSTANTES ---
const API_URL = process.env.EXPO_PUBLIC_API_URL + '/plats';

const ALLERGENES_LIST = [
  "Gluten", "Produits laitiers", "Noix", "Oeufs", 
  "Soja", "Viande", "Poisson", "Fruits de mer", "Moutarde"
];

// --- COMPOSANT HEADER (Défini à l'extérieur pour la stabilité du clavier) ---
const MenuHeader = ({ searchText, setSearchText, selectedAllergies, toggleAllergy }: HeaderProps) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTop}>
      <Text style={styles.title}>Menu Saison</Text>
    </View>

    {/* Barre de Recherche */}
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un plat, un ingrédient..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#999"
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
      />
      {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
      )}
    </View>

    <Text style={styles.subtitle}>Filtrer par allergie (Exclusion) :</Text>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
      {ALLERGENES_LIST.map((allergen) => {
        const isSelected = selectedAllergies.includes(allergen);
        return (
          <TouchableOpacity
            key={allergen}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggleAllergy(allergen)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {allergen}
            </Text>
            {isSelected && <MaterialIcons name="close" size={14} color="#FFF" style={{marginLeft:4}}/>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// --- ECRAN PRINCIPAL ---
export default function MenuScreen() {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) setPlats(data);
        else setPlats([]); 
      } catch (err) {
        console.error("Erreur API Plats:", err);
        setPlats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAllergy = (allergen: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const filteredPlats = plats.filter(plat => {
    // 1. Filtre Recherche
    if (searchText.length > 0) {
      const query = searchText.toLowerCase();
      const matchNom = plat.nom.toLowerCase().includes(query);
      const matchIngr = plat.ingredients ? plat.ingredients.toLowerCase().includes(query) : false;
      if (!matchNom && !matchIngr) return false;
    }

    // 2. Filtre Allergènes
    if (selectedAllergies.length === 0) return true;
    if (!plat.allergenes) return true; 

    const dishAllergens = plat.allergenes.toLowerCase().split(',').map(tag => tag.trim());
    const containsForbidden = selectedAllergies.some(filter => dishAllergens.includes(filter.toLowerCase()));

    return !containsForbidden;
  });

  const renderItem = ({ item }: { item: Plat }) => (
    <View style={styles.card}>
      <Text style={styles.nom}>{item.nom}</Text>
      <Text style={styles.ingredients}>{item.ingredients}</Text>
      
      {item.allergenes ? (
        <View style={styles.allergenContainer}>
          <MaterialIcons name="info-outline" size={16} color="#d9534f" />
          <Text style={styles.allergenLabel}> Contient : </Text>
          <Text style={styles.allergenText}>{item.allergenes}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#800020" style={{marginTop: 50}}/>
      ) : (
        <FlatList
          data={filteredPlats}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          // ON PASSE LE COMPOSANT HEADER ICI DIRECTEMENT
          ListHeaderComponent={
            <MenuHeader 
              searchText={searchText}
              setSearchText={setSearchText}
              selectedAllergies={selectedAllergies}
              toggleAllergy={toggleAllergy}
            />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled" 
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialIcons name="no-food" size={40} color="#ccc" />
                <Text style={styles.empty}>Aucun plat trouvé.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // Header Styles
  headerContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 16 },
  headerTop: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#800020', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 10, paddingHorizontal: 16, marginTop: 10 },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 44,
    marginTop: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

  // Filters Styles
  filters: { flexDirection: 'row', paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, flexDirection: 'row', alignItems: 'center'
  },
  chipSelected: { backgroundColor: '#d9534f' },
  chipText: { color: '#333', fontSize: 13 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },

  // List & Card Styles
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#800020'
  },
  nom: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  ingredients: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  
  allergenContainer: { 
    flexDirection: 'row', flexWrap:'wrap', alignItems: 'center', 
    backgroundColor: '#fff0f0', padding: 8, borderRadius: 6 
  },
  allergenLabel: { fontSize: 12, fontWeight: 'bold', color: '#d9534f' },
  allergenText: { fontSize: 12, color: '#c9302c', flex: 1 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', marginTop: 10, color: '#888', fontSize: 16 }
});