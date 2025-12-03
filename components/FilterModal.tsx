import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Types pour les props
type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
};

export type FilterState = {
  couleur: string | null;
  minPrix: string;
  maxPrix: string;
  region: string;
};

// Couleurs thématiques
const WINE_COLORS = [
  { id: 'ROUGE', label: 'Rouge', color: '#800020', text: '#fff' },
  { id: 'BLANC', label: 'Blanc', color: '#F2C94C', text: '#333' },
  { id: 'ROSE', label: 'Rosé', color: '#F48FB1', text: '#333' },
  { id: 'EFFERVESCENT', label: 'Bulles', color: '#56CCF2', text: '#333' },
  { id: 'ORANGE', label: 'Orange', color: '#F2994A', text: '#333' },
  { id: 'LIQUOREUX', label: 'Moelleux', color: '#BB6BD9', text: '#fff' },
];

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  // État local du formulaire
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetState = { couleur: null, minPrix: '', maxPrix: '', region: '' };
    setFilters(resetState);
    onApply(resetState); // Appliquer immédiatement le reset
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalView}>
              <View style={styles.header}>
                <Text style={styles.title}>Filtres Avancés</Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                
                {/* SECTION COULEUR */}
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorGrid}>
                  {WINE_COLORS.map((c) => {
                    const isSelected = filters.couleur === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.colorButton,
                          { backgroundColor: isSelected ? c.color : '#f0f0f0' },
                          isSelected && styles.colorButtonSelected
                        ]}
                        onPress={() => setFilters({ ...filters, couleur: isSelected ? null : c.id })}
                      >
                        <Text style={[
                          styles.colorText, 
                          { color: isSelected ? c.text : '#555', fontWeight: isSelected ? 'bold' : 'normal' }
                        ]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* SECTION PRIX */}
                <Text style={styles.label}>Prix ($)</Text>
                <View style={styles.row}>
                  <TextInput
                    style={styles.inputHalf}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={filters.minPrix}
                    onChangeText={(t) => setFilters({ ...filters, minPrix: t })}
                  />
                  <Text style={{ marginHorizontal: 10 }}>à</Text>
                  <TextInput
                    style={styles.inputHalf}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={filters.maxPrix}
                    onChangeText={(t) => setFilters({ ...filters, maxPrix: t })}
                  />
                </View>

                {/* SECTION RÉGION */}
                <Text style={styles.label}>Région</Text>
                <TextInput
                  style={styles.inputFull}
                  placeholder="Ex: Bourgogne, Loire, Italie..."
                  value={filters.region}
                  onChangeText={(t) => setFilters({ ...filters, region: t })}
                />

              </ScrollView>

              {/* FOOTER ACTIONS */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetText}>Réinitialiser</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyText}>Appliquer les filtres</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%', // Prend 80% de l'écran
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#800020',
  },
  content: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333', // Bordure pour mieux voir la sélection sur les couleurs claires
  },
  colorText: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputHalf: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
  },
  inputFull: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    padding: 15,
    justifyContent: 'center',
  },
  resetText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#800020',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  applyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});