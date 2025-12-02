import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Plat = {
  id: number;
  nom: string;
  ingredients: string; // On utilise ingredients comme description
  allergenes: string | null;
};

// L'URL propre (déjà configurée dans votre .env)
const API_URL = process.env.EXPO_PUBLIC_API_URL + '/plats';

const ALLERGENES_LIST = [
  "Gluten", "Produits laitiers", "Noix", "Oeufs", 
  "Soja", "Viande", "Poisson", "Fruits de mer", "Moutarde"
];

export default function MenuScreen() {
  // 1. Initialisation sécurisée avec un tableau vide
  const [plats, setPlats] = useState<Plat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State pour les filtres : Ce que l'utilisateur veut ÉVITER
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        
        // 2. Vérifier si la réponse est OK (200)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        // 3. Vérifier que c'est bien un tableau avant de le mettre dans le state
        if (Array.isArray(data)) {
          setPlats(data);
        } else {
          console.error("Format de données invalide reçue:", data);
          setPlats([]); // On reste sur un tableau vide par sécurité
        }
      } catch (err) {
        console.error("Erreur API Plats:", err);
        setPlats([]); // En cas d'erreur, tableau vide = pas de crash
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAllergy = (allergen: string) => {
    setSelectedAllergies(prev => {
      // "prev" représente l'état le plus récent, garanti par React
      if (prev.includes(allergen)) {
        // Si l'allergène y est, on l'enlève
        return prev.filter(a => a !== allergen);
      } else {
        // Sinon, on l'ajoute
        return [...prev, allergen];
      }
    });
  };

  // Logique de filtrage d'exclusion
  // Grâce à l'init sécurisée, 'plats' est garanti d'être un tableau (donc .filter existe)
  const filteredPlats = plats.filter(plat => {
    if (selectedAllergies.length === 0) return true;
    if (!plat.allergenes) return true; // Pas d'infos = on affiche

    // Si je coche "Gluten", je cache les plats qui contiennent "Gluten"
    const containsForbidden = selectedAllergies.some(filter => 
      plat.allergenes?.toLowerCase().includes(filter.toLowerCase())
    );
    return !containsForbidden;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Menu Saison</Text>
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
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialIcons name="no-food" size={40} color="#ccc" />
                <Text style={styles.empty}>Aucun plat ne correspond à ces critères stricts.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#800020', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 10 },
  filters: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, flexDirection: 'row', alignItems: 'center'
  },
  chipSelected: { backgroundColor: '#d9534f' },
  chipText: { color: '#333', fontSize: 13 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },
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