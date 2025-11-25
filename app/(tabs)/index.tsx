import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.0.225:8080';

interface Vin {
  id: string;
  nom: string;
  region: string;
  prix: number;
  cepage?: string;
}

export default function HomeScreen() {
  const [vins, setVins] = useState<Vin[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchVins = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vins`);
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

  const filteredVins = vins.filter((vin) => {
    const searchLower = searchText.toLowerCase();
    const nomMatch = vin.nom.toLowerCase().includes(searchLower);
    const cepageMatch = vin.cepage?.toLowerCase().includes(searchLower) ?? false;
    return nomMatch || cepageMatch;
  });

  const renderItem = ({ item }: { item: Vin }) => (
    <View style={styles.card}>
      <Text style={styles.nom}>{item.nom}</Text>
      <Text style={styles.region}>{item.region}</Text>
      <Text style={styles.prix}>${item.prix}</Text>
    </View>
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
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText('')}
            activeOpacity={0.7}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredVins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    marginBottom: 12,
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
