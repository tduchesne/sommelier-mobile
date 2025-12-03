import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme'; // Vérifie ton chemin d'import

// --- THEME CONFIGURATION ---
const ThemeColors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    subText: '#666666',
    inputBg: '#F9F9F9',
    border: '#EEEEEE',
    primary: '#800020',
  },
  dark: {
    background: '#1C1C1E', // Gris iOS sombre
    text: '#FFFFFF',
    subText: '#AAAAAA',
    inputBg: '#2C2C2E', // Gris input sombre
    border: '#38383A',
    primary: '#FF4D6D', // Rouge légèrement éclairci pour lisibilité sur fond noir
  }
};

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

// Couleurs thématiques des vins
const WINE_COLORS = [
  { id: 'ROUGE', label: 'Rouge', color: '#800020', text: '#fff' },
  { id: 'BLANC', label: 'Blanc', color: '#F2C94C', text: '#333' },
  { id: 'ROSE', label: 'Rosé', color: '#F48FB1', text: '#333' },
  { id: 'EFFERVESCENT', label: 'Bulles', color: '#56CCF2', text: '#333' },
  { id: 'ORANGE', label: 'Orange', color: '#F2994A', text: '#333' },
  { id: 'LIQUOREUX', label: 'Moelleux', color: '#BB6BD9', text: '#fff' },
];

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  // 1. Détection du Thème
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? ThemeColors.dark : ThemeColors.light;

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Reset filters when modal opens to ensure sync
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetState = { couleur: null, minPrix: '', maxPrix: '', region: '' };
    setFilters(resetState);
    // On n'applique pas immédiatement pour laisser l'utilisateur confirmer
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* KeyboardAvoidingView pour que le clavier ne cache pas les inputs */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: '100%', height: '80%' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={[styles.modalView, { backgroundColor: theme.background }]}>
                
                {/* HEADER */}
                <View style={styles.header}>
                  <Text style={[styles.title, { color: theme.primary }]}>Filtres Avancés</Text>
                  <TouchableOpacity onPress={onClose}>
                    <MaterialIcons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                  
                  {/* SECTION COULEUR */}
                  <Text style={[styles.label, { color: theme.text }]}>Couleur</Text>
                  <View style={styles.colorGrid}>
                    {WINE_COLORS.map((c) => {
                      const isSelected = filters.couleur === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.colorButton,
                            { 
                              // Si sélectionné: couleur du vin, sinon: couleur input du thème
                              backgroundColor: isSelected ? c.color : theme.inputBg,
                              borderColor: isDark ? theme.border : 'transparent' 
                            },
                            isSelected && styles.colorButtonSelected
                          ]}
                          onPress={() => setFilters({ ...filters, couleur: isSelected ? null : c.id })}
                        >
                          <Text style={[
                            styles.colorText, 
                            { 
                              // Si sélectionné: couleur définie (blanc/noir), sinon: texte du thème
                              color: isSelected ? c.text : theme.text, 
                              fontWeight: isSelected ? 'bold' : 'normal' 
                            }
                          ]}>
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* SECTION PRIX */}
                  <Text style={[styles.label, { color: theme.text }]}>Prix ($)</Text>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.inputHalf, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                      placeholder="Min"
                      placeholderTextColor={theme.subText}
                      keyboardType="numeric"
                      value={filters.minPrix}
                      onChangeText={(t) => setFilters({ ...filters, minPrix: t })}
                    />
                    <Text style={{ marginHorizontal: 10, color: theme.subText }}>à</Text>
                    <TextInput
                      style={[styles.inputHalf, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                      placeholder="Max"
                      placeholderTextColor={theme.subText}
                      keyboardType="numeric"
                      value={filters.maxPrix}
                      onChangeText={(t) => setFilters({ ...filters, maxPrix: t })}
                    />
                  </View>

                  {/* SECTION RÉGION */}
                  <Text style={[styles.label, { color: theme.text }]}>Région</Text>
                  <TextInput
                    style={[styles.inputFull, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                    placeholder="Ex: Bourgogne, Loire, Italie..."
                    placeholderTextColor={theme.subText}
                    value={filters.region}
                    onChangeText={(t) => setFilters({ ...filters, region: t })}
                  />

                </ScrollView>

                {/* FOOTER ACTIONS */}
                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                  <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={[styles.resetText, { color: theme.subText }]}>Réinitialiser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.applyButton, { backgroundColor: theme.primary }]} onPress={handleApply}>
                    <Text style={styles.applyText}>Appliquer les filtres</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '100%', // Géré par le conteneur parent
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
  },
  content: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  inputFull: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  resetButton: {
    padding: 15,
    justifyContent: 'center',
  },
  resetText: {
    fontWeight: '600',
  },
  applyButton: {
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