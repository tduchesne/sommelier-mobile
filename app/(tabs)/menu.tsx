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
  useWindowDimensions,
  Appearance 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// --- TYPES ---
type Plat = {
  id: number;
  nom: string;
  ingredients: string; 
  allergenes: string | null;
  allergenesModifiables: string | null;
  optionRemplacement: string | null;
  // NOUVEAU CHAMP
  typesMenu?: string[]; // ["LUNCH", "SOUPER"]
};

interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedAllergies: string[];
  toggleAllergy: (allergen: string) => void;
  // NOUVEAUX PROPS
  selectedMenuType: string | null;
  setSelectedMenuType: (type: string | null) => void;
  isDark: boolean;
}

// --- CONSTANTES & THEME ---
const API_URL = process.env.EXPO_PUBLIC_API_URL + '/plats';
const TABLET_BREAKPOINT = 700;

const ALLERGENES_LIST = [
  "Gluten", "Produits laitiers", "Noix", "Oeufs", 
  "Soja", "Viande", "Poisson", "Fruits de mer", "Moutarde"
];

const MENU_TYPES = ["BRUNCH", "LUNCH", "SOUPER", "SNACK", "DESSERT"];

// Couleurs dynamiques
const Colors = {
  light: {
    background: '#F2F2F7', 
    card: '#FFFFFF',
    text: '#000000',
    subText: '#666666',
    border: '#E5E5EA',
    input: '#E5E5EA',
    accent: '#800020',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E', 
    text: '#FFFFFF',
    subText: '#AAAAAA',
    border: '#38383A',
    input: '#2C2C2E',
    accent: '#FF4D6D', 
  }
};

// --- HELPER ---
const parseTags = (tags: string | null): string[] => {
  if (!tags) return [];
  return tags.toLowerCase().split(',').map(tag => tag.trim());
};

// --- COMPOSANT HEADER ---
// --- COMPOSANT HEADER ---
const MenuHeader = ({ 
  searchText, setSearchText, 
  selectedAllergies, toggleAllergy, 
  selectedMenuType, setSelectedMenuType,
  isDark 
}: HeaderProps) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
      
      {/* 1. TITRE & SOUS-TITRE */}
      <View style={styles.headerTop}>
        <Text style={[styles.title, { color: theme.accent }]}>MENU SAISON</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>Que Sera Syrah</Text>
      </View>

      {/* 2. BARRE DE RECHERCHE (Remontée ici) */}
      <View style={[styles.searchContainer, { backgroundColor: theme.input }]}>
        <MaterialIcons name="search" size={20} color={theme.subText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un plat..."
          placeholderTextColor={theme.subText}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
        {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color={theme.subText} />
            </TouchableOpacity>
        )}
      </View>

      {/* 3. FILTRE TYPE DE MENU (Catégories) */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
             style={[
               styles.menuTypeChip, 
               { 
                 backgroundColor: selectedMenuType === null ? theme.accent : theme.input,
                 borderColor: selectedMenuType === null ? theme.accent : theme.border 
               }
             ]}
             onPress={() => setSelectedMenuType(null)}
          >
            <Text style={[styles.menuTypeText, { color: selectedMenuType === null ? '#FFF' : theme.text }]}>TOUS</Text>
          </TouchableOpacity>

          {MENU_TYPES.map((type) => {
             const isSelected = selectedMenuType === type;
             return (
               <TouchableOpacity
                 key={type}
                 style={[
                   styles.menuTypeChip, 
                   { 
                     backgroundColor: isSelected ? theme.accent : theme.input,
                     borderColor: isSelected ? theme.accent : theme.border 
                   }
                 ]}
                 onPress={() => setSelectedMenuType(isSelected ? null : type)}
               >
                 <Text style={[styles.menuTypeText, { color: isSelected ? '#FFF' : theme.text }]}>
                   {type}
                 </Text>
               </TouchableOpacity>
             );
          })}
        </ScrollView>
      </View>

      {/* 4. FILTRE ALLERGÈNES (Spécifique) */}
      <Text style={[styles.filterLabel, { color: theme.text }]}>Exclure allergènes :</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{paddingRight: 16}}>
        {ALLERGENES_LIST.map((allergen) => {
          const isSelected = selectedAllergies.includes(allergen);
          return (
            <TouchableOpacity
              key={allergen}
              style={[
                styles.chip, 
                { backgroundColor: isSelected ? '#D9534F' : theme.input }
              ]}
              onPress={() => toggleAllergy(allergen)}
            >
              <Text style={[
                styles.chipText, 
                { color: isSelected ? '#FFF' : theme.text, fontWeight: isSelected ? 'bold' : 'normal' }
              ]}>
                {allergen}
              </Text>
              {isSelected && <MaterialIcons name="close" size={14} color="#FFF" style={{marginLeft:4}}/>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// --- ECRAN PRINCIPAL ---
export default function MenuScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const isTablet = width > TABLET_BREAKPOINT;
  const numColumns = isTablet ? 2 : 1;

  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Filtres
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMenuType, setSelectedMenuType] = useState<string | null>(null); // State MenuType
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const raw = await response.json();
        const data = Array.isArray(raw)
          ? raw.map((p: any) => ({
              ...p,
              allergenesModifiables: p.allergenesModifiables ?? p.allergenes_modifiables ?? null,
              optionRemplacement: p.optionRemplacement ?? p.option_remplacement ?? null,
              typesMenu: p.typesMenu ?? p.types_menu ?? [], // Mapping typesMenu
            }))
          : [];
        setPlats(data);
      } catch (err) {
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

  // --- LOGIQUE DE FILTRAGE MISE À JOUR ---
  const filteredPlats = plats.filter(plat => {
    // 1. Filtre Type de Menu (NOUVEAU)
    // Si un type est sélectionné, le plat doit l'avoir dans sa liste typesMenu
    if (selectedMenuType) {
       if (!plat.typesMenu || !plat.typesMenu.includes(selectedMenuType)) {
         return false; 
       }
    }

    // 2. Recherche Texte
    if (searchText.length > 0) {
      const query = searchText.toLowerCase();
      if (!plat.nom.toLowerCase().includes(query) && !plat.ingredients.toLowerCase().includes(query)) return false;
    }

    // 3. Filtre Allergènes (Exclusion Intelligente)
    if (selectedAllergies.length === 0) return true;
    if (!plat.allergenes) return true; 

    const dishAllergens = parseTags(plat.allergenes);
    const dishModifiables = parseTags(plat.allergenesModifiables);
    return !selectedAllergies.some(filter => 
      dishAllergens.includes(filter.toLowerCase()) && !dishModifiables.includes(filter.toLowerCase())
    );
  });

  const renderItem = ({ item }: { item: Plat }) => {
    const dishAllergens = parseTags(item.allergenes);
    const activeWarnings = selectedAllergies.filter(filter => dishAllergens.includes(filter.toLowerCase()));
    const isModifiedDisplay = activeWarnings.length > 0;

    return (
      <View style={[
          styles.card, 
          { backgroundColor: theme.card },
          isTablet && styles.cardTablet, 
          isModifiedDisplay && { borderColor: '#E67E22', borderWidth: 1 } 
      ]}>
        
        <View style={styles.cardHeader}>
          <Text style={[styles.nom, { color: theme.text }]}>{item.nom}</Text>
          {isModifiedDisplay && (
             <View style={styles.badgeModif}>
                 <MaterialIcons name="build" size={10} color="#FFF" />
                 <Text style={styles.badgeModifText}>MODIF.</Text>
             </View>
          )}
        </View>
        
        <Text style={[styles.ingredients, { color: theme.subText }]} numberOfLines={isTablet ? 4 : undefined}>
            {item.ingredients}
        </Text>
        
        <View style={styles.badgesArea}>
          {item.allergenes ? (
            <View style={styles.allergenBadge}>
              <MaterialIcons name="warning" size={12} color="#D9534F" />
              <Text style={styles.allergenText}>{item.allergenes}</Text>
            </View>
          ) : null}

          {item.optionRemplacement && item.optionRemplacement !== "Aucune option de remplacement." ? (
             <View style={[
               styles.optionBadge, 
               isModifiedDisplay ? { backgroundColor: '#FFF3E0' } : { backgroundColor: '#E8F5E9' }
             ]}>
               <MaterialIcons 
                   name={isModifiedDisplay ? "priority-high" : "check"} 
                   size={12} 
                   color={isModifiedDisplay ? "#D35400" : "#2E7D32"} 
               />
               <Text style={[
                 styles.optionText, 
                 { color: isModifiedDisplay ? "#D35400" : "#2E7D32" }
               ]}>
                   {item.optionRemplacement}
               </Text>
             </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{marginTop: 50}}/>
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
              selectedMenuType={selectedMenuType}
              setSelectedMenuType={setSelectedMenuType}
              isDark={isDark}
            />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled" 
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialIcons name="restaurant" size={40} color={theme.subText} />
                <Text style={[styles.empty, { color: theme.subText }]}>Aucun plat trouvé dans cette catégorie.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingBottom: 16, marginBottom: 10, borderBottomWidth: 1 },
  headerTop: { paddingHorizontal: 16, paddingTop: 10, alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  subtitle: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  
  // Menu Types (Chips du haut)
  menuTypeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    marginRight: 8, borderWidth: 1
  },
  menuTypeText: { fontSize: 12, fontWeight: 'bold' },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, marginHorizontal: 16, paddingHorizontal: 12, height: 40, marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },

  filterLabel: { marginLeft: 16, marginBottom: 8, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  filters: { paddingLeft: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    marginRight: 8, flexDirection: 'row', alignItems: 'center'
  },
  chipText: { fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' }, 
  card: {
    borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTablet: { flex: 1, marginHorizontal: 8, maxWidth: '48%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  nom: { fontSize: 17, fontWeight: '700', flex: 1 },
  ingredients: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  badgesArea: { gap: 8 },
  allergenBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  allergenText: { fontSize: 11, color: '#D9534F', marginLeft: 4, fontWeight: '500' },
  optionBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  optionText: { fontSize: 11, marginLeft: 4, fontWeight: '600', flexShrink: 1 },
  badgeModif: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#E67E22', 
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, marginLeft: 8
  },
  badgeModifText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginLeft: 3 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  empty: { textAlign: 'center', marginTop: 10, fontSize: 16 }
});