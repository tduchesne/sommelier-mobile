import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Vin {
  id: string;
  nom: string;
  region: string;
  prix: number;
}

export default function HomeScreen() {
  const [vins, setVins] = useState<Vin[]>([]);

  useEffect(() => {
    const fetchVins = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/vins');
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
      <FlatList
        data={vins}
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
