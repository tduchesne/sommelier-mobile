import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo } from 'react'; // React importé ici
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  useWindowDimensions,
  Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Vin } from '@/types/vin';
import FilterModal, { FilterState } from '@/components/FilterModal';
import { useColorScheme } from '@/hooks/use-color-scheme';

// --- CONSTANTES & THEME ---
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) throw new Error("EXPO_PUBLIC_API_URL manquante");
const API_URL = `${BASE_URL.replace(/\/$/, '')}/vins`;
const TABLET_BREAKPOINT = 700;

const COLORS_VIN = {
  ROUGE: '#800020', BLANC: '#F2C94C', ROSE: '#F48FB1',
  EFFERVESCENT: '#56CCF2', ORANGE: '#F2994A', LIQUOREUX: '#BB6BD9', DEFAULT: '#999'
};

const getWineColor = (c: string | undefined) => COLORS_VIN[c as keyof typeof COLORS_VIN] || COLORS_VIN.DEFAULT;

const ThemeColors = {
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

// --- COMPOSANT CARTE OPTIMISÉ (Memoized) ---
// 1. On définit le composant avec un nom pour éviter l'erreur "missing display name"
const WineCardItem = ({ item, isTablet, theme, onPress }: { item: Vin, isTablet: boolean, theme: any, onPress: () => void }) => {
  const accentColor = getWineColor(item.couleur);
  
  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { backgroundColor: theme.card },
        isTablet && styles.cardTablet
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={[styles.nom, { color: theme.text }]} numberOfLines={1}>{item.nom}</Text>
          <Text style={[styles.region, { color: theme.subText }]} numberOfLines={1}>{item.region}</Text>
        </View>
        <Text style={[styles.prix, { color: theme.accent }]}>${item.prix}</Text>
      </View>

      <View style={styles.cardFooter}>
        {item.couleur && (
          <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}> 
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
            <Text style={[styles.badgeText, { color: accentColor }]}>{item.couleur}</Text>
          </View>
        )}
        
        {item.cepage && (
           <Text style={[styles.cepage, { color: theme.subText }]} numberOfLines={1}>
             {item.cepage}
           </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// 2. On l'exporte en memo
const WineCard = React.memo(WineCardItem);

// --- ECRAN PRINCIPAL ---
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? ThemeColors.dark : ThemeColors.light;
  
  const isTablet = width > TABLET_BREAKPOINT;
  const numColumns = isTablet ? 2 : 1;

  const [vins, setVins] = useState<Vin[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ couleur: null, minPrix: '', maxPrix: '', region: '' });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const router = useRouter();

  const fetchVins = useCallback(async () => {
    setLoading(true);
    try {
      let url = API_URL;
      const params = new URLSearchParams();
      params.append('size', '500'); 
      
      if (filters.couleur) params.append('couleur', filters.couleur);
      if (filters.minPrix) params.append('minPrix', filters.minPrix);
      if (filters.maxPrix) params.append('maxPrix', filters.maxPrix);
      if (filters.region) params.append('region', filters.region);

      if (params.toString().length > 0) {
        url = `${API_URL}/search?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur réseau');
      
      const data = await response.json();
      
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

  useEffect(() => {
    fetchVins();
    let count = 0;
    if (filters.couleur) count++;
    if (filters.minPrix) count++;
    if (filters.maxPrix) count++;
    if (filters.region) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const filteredVins = useMemo(() => {
    const searchLower = searchText.trim().toLowerCase();
    if (searchLower === '') return vins;
    return vins.filter((vin) => {
      const nom = vin.nom.toLowerCase();
      const cepage = vin.cepage?.toLowerCase() ?? '';
      return nom.includes(searchLower) || cepage.includes(searchLower);
    });
  }, [vins, searchText]);

  const renderItem = useCallback(({ item }: { item: Vin }) => (
    <WineCard 
      item={item} 
      isTablet={isTablet} 
      theme={theme}
      onPress={() => router.push({ pathname: '/details/[id]', params: { id: item.id } } as any)}
    />
  ), [isTablet, theme, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      
      <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.accent }]}>CARTE DES VINS</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>Que Sera Syrah</Text>
      </View>
      
      <View style={styles.toolbar}>
        <View style={[styles.searchContainer, { backgroundColor: theme.input }]}>
          <MaterialIcons name="search" size={20} color={theme.subText} style={styles.searchIcon}/>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher (nom, cépage)..."
            placeholderTextColor={theme.subText}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: activeFiltersCount > 0 ? theme.accent : theme.input }
          ]} 
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="tune" size={24} color={activeFiltersCount > 0 ? "white" : theme.text} />
          {activeFiltersCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{marginTop: 50}} />
      ) : (
        <FlatList
          key={numColumns}
          data={filteredVins}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={numColumns}
          columnWrapperStyle={isTablet ? styles.row : undefined}
          initialNumToRender={10} 
          maxToRenderPerBatch={10} 
          windowSize={5} 
          removeClippedSubviews={true} 
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subText }]}>Aucun vin trouvé.</Text>
          }
        />
      )}

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
  container: { flex: 1 },
  headerContainer: { paddingBottom: 16, marginBottom: 10, borderBottomWidth: 1, alignItems: 'center', paddingTop: 10 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  subtitle: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, height: 44
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  filterButton: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  badgeCount: {
    position: 'absolute', top: -5, right: -5, backgroundColor: 'red',
    borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#fff'
  },
  badgeCountText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTablet: { flex: 1, marginHorizontal: 6, marginBottom: 16, maxWidth: '48%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  nom: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  region: { fontSize: 13 },
  prix: { fontSize: 17, fontWeight: '700', marginLeft: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  badge: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  cepage: { fontSize: 13, fontStyle: 'italic', flex: 1 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16 }
});