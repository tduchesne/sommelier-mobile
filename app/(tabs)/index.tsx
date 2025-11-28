import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Vin } from '@/types/vin';

const API_URL = process.env.EXPO_PUBLIC_API_URL + '/vins';

export default function HomeScreen() {
  const [vins, setVins] = useState<Vin[]>([]);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const searchLower = searchText.trim().toLowerCase();

  useEffect(() => {
    const fetchVins = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Erreur de connexion');
        }
        const data = await response.json();
        setVins(data);
      } catch (error) {
        console.log('Erreur de connexion:', error);
      }
    };

    fetchVins();
  }, []);

  const filteredVins =
    searchLower.length === 0
      ? vins
      : vins.filter((vin) => {
          const nom = vin.nom.toLowerCase();
          const cepage = vin.cepage?.toLowerCase() ?? '';
          return nom.includes(searchLower) || cepage.includes(searchLower);
        });

  const renderItem = ({ item }: { item: Vin }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: '/details/[id]', params: { id: item.id } } as any)
      }
      accessibilityRole="button"
      accessibilityLabel={`Voir les détails de ${item.nom}`}>
      <Text style={styles.nom}>{item.nom}</Text>
      <Text style={styles.region}>{item.region}</Text>
      <Text style={styles.prix}>${item.prix}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>La Cave du Sommelier</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher (nom, cépage)..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText('')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche">
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredVins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  nom: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  region: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  prix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
