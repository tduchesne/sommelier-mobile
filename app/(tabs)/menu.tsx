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
  Keyboard,
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// --- TYPES ---
type Plat = {
  id: number;
  nom: string;
  ingredients: string; 
  allergenes: string | null;
  allergenesModifiables: string | null;
  optionRemplacement: string | null;
};

interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedAllergies: string[];
  toggleAllergy: (allergen: string) => void;
}

// --- CONSTANTES ---
const API_URL = process.env.EXPO_PUBLIC_API_URL + '/plats';
const TABLET_BREAKPOINT = 700; // CodeRabbit suggestion

const ALLERGENES_LIST = [
  "Gluten", "Produits laitiers", "Noix", "Oeufs", 
  "Soja", "Viande", "Poisson", "Fruits de mer", "Moutarde"
];

// --- HELPER (CodeRabbit suggestion) ---
const parseTags = (tags: string | null): string[] => {
  if (!tags) return [];
  return tags.toLowerCase().split(',').map(tag => tag.trim());
};

// --- COMPOSANT HEADER ---
const MenuHeader = ({ searchText, setSearchText, selectedAllergies, toggleAllergy }: HeaderProps) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTop}>
      <Text style={styles.title}>Menu Saison</Text>
    </View>

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

    <Text style={styles.subtitle}>Filtrer par allergie (Exclusion intelligente) :</Text>
    
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
  const { width } = useWindowDimensions();
  const isTablet = width > TABLET_BREAKPOINT;
  const numColumns = isTablet ? 2 : 1;

  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const raw = await response.json(); // On récupère le JSON brut

        // Mapping sécurisé (CodeRabbit Suggestion 1)
        // Spring Boot envoie généralement du camelCase, mais on gère le snake_case au cas où.
        const data = Array.isArray(raw)
          ? raw.map((p: any) => ({
              ...p,
              // Priorité au camelCase, fallback sur snake_case, sinon null
              allergenesModifiables: p.allergenesModifiables ?? p.allergenes_modifiables ?? null,
              optionRemplacement: p.optionRemplacement ?? p.option_remplacement ?? null,
            }))
          : [];

        setPlats(data);
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

  // --- LOGIQUE DE FILTRAGE OPTIMISÉE ---
  const filteredPlats = plats.filter(plat => {
    // 1. Recherche Texte
    if (searchText.length > 0) {
      const query = searchText.toLowerCase();
      const matchNom = plat.nom.toLowerCase().includes(query);
      const matchIngr = plat.ingredients ? plat.ingredients.toLowerCase().includes(query) : false;
      if (!matchNom && !matchIngr) return false;
    }

    // 2. Filtre Allergènes
    if (selectedAllergies.length === 0) return true;
    if (!plat.allergenes) return true; 

    // Utilisation du Helper (CodeRabbit Suggestion 3)
    const dishAllergens = parseTags(plat.allergenes);
    const dishModifiables = parseTags(plat.allergenesModifiables);

    const isStrictlyForbidden = selectedAllergies.some(filter => {
      const filterLower = filter.toLowerCase();
      // Interdit si contient l'allergène ET qu'il n'est pas modifiable
      return dishAllergens.includes(filterLower) && !dishModifiables.includes(filterLower);
    });

    return !isStrictlyForbidden;
  });

  const renderItem = ({ item }: { item: Plat }) => {
    // Helper aussi utilisé ici
    const dishAllergens = parseTags(item.allergenes);
    const activeWarnings = selectedAllergies.filter(filter => 
        dishAllergens.includes(filter.toLowerCase())
    );
    const isModifiedDisplay = activeWarnings.length > 0;

    return (
      <View style={[
          styles.card, 
          isTablet && styles.cardTablet, 
          isModifiedDisplay && styles.cardWarning 
      ]}>
        <View style={styles.cardHeader}>
          <Text style={styles.nom}>{item.nom}</Text>
          {isModifiedDisplay && (
             <View style={styles.badgeModif}>
                 <MaterialIcons name="build" size={12} color="#FFF" />
                 <Text style={styles.badgeModifText}>MODIF. REQUISE</Text>
             </View>
          )}
        </View>
        
        <Text style={styles.ingredients} numberOfLines={isTablet ? 4 : undefined}>
            {item.ingredients}
        </Text>
        
        {item.allergenes ? (
          <View style={styles.allergenContainer}>
            <MaterialIcons name="warning" size={16} color="#d9534f" />
            <Text style={styles.allergenLabel}> Contient : </Text>
            <Text style={styles.allergenText}>{item.allergenes}</Text>
          </View>
        ) : null}

        {/* LOGIQUE OPTION: Si modif requise OU texte simple */}
        {item.optionRemplacement && item.optionRemplacement !== "Aucune option de remplacement." ? (
           <View style={[styles.optionContainer, isModifiedDisplay && styles.optionContainerHighlight]}>
             <MaterialIcons 
                 name={isModifiedDisplay ? "priority-high" : "check-circle-outline"} 
                 size={16} 
                 color={isModifiedDisplay ? "#d35400" : "#2e7d32"} 
             />
             <Text style={[styles.optionText, isModifiedDisplay && {color: '#d35400', fontWeight: 'bold'}]}>
                 {item.optionRemplacement}
             </Text>
           </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#800020" style={{marginTop: 50}}/>
      ) : (
        <FlatList
          key={numColumns} 
          data={filteredPlats}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={isTablet ? styles.row : undefined}
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
  
  // Header
  headerContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 16 },
  headerTop: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#800020', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 10, paddingHorizontal: 16, marginTop: 10 },
  
  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0',
    borderRadius: 8, marginHorizontal: 16, paddingHorizontal: 10, height: 44, marginTop: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

  // Filters
  filters: { flexDirection: 'row', paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, flexDirection: 'row', alignItems: 'center'
  },
  chipSelected: { backgroundColor: '#d9534f' },
  chipText: { color: '#333', fontSize: 13 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },

  // List & Grid
  listContent: { padding: 16 },
  row: { justifyContent: 'space-between' }, 
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#800020',
  },
  cardTablet: {
    flex: 1, marginHorizontal: 6, marginBottom: 16, maxWidth: '48%', 
  },
  cardWarning: {
    borderLeftColor: '#e67e22',
    backgroundColor: '#fffcf5'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6},
  badgeModif: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#e67e22', 
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8
  },
  badgeModifText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4},
  nom: { fontSize: 18, fontWeight: 'bold', color: '#222', flex: 1 },
  ingredients: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  
  allergenContainer: { 
    flexDirection: 'row', flexWrap:'wrap', alignItems: 'center', 
    backgroundColor: '#fff0f0', padding: 8, borderRadius: 6, marginBottom: 4 
  },
  allergenLabel: { fontSize: 12, fontWeight: 'bold', color: '#d9534f' },
  allergenText: { fontSize: 12, color: '#c9302c', flex: 1 },

  optionContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f5e9', padding: 8, borderRadius: 6, marginTop: 4
  },
  optionContainerHighlight: { backgroundColor: '#fcefe6' },
  optionText: { fontSize: 12, color: '#1b5e20', flex: 1, marginLeft: 6 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { textAlign: 'center', marginTop: 10, color: '#888', fontSize: 16 }
});