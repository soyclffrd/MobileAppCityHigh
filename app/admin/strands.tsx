import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

// Reuse styles from teachers.tsx
import { styles } from './_styles';

interface Strand {
  id: string;
  name: string;
  description: string;
}

interface FormData {
  name: string;
  description: string;
}

export default function StrandManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [strands, setStrands] = useState<Strand[]>([
    { id: '#1', name: 'TVL', description: 'Porro voluptatem' },
    { id: '#2', name: 'STEM', description: 'Porro voluptatem' },
    { id: '#3', name: 'HUMS', description: 'Porro voluptatem' },
    { id: '#4', name: 'GAS', description: 'Porro voluptatem' },
  ]);

  const toast = useToast();

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  const handleAddStrand = () => {
    setFormData({ name: '', description: '' });
    setIsAddModalVisible(true);
  };

  const handleEditStrand = (strand: Strand) => {
    setSelectedStrand(strand);
    setFormData({ name: strand.name, description: strand.description });
    setIsEditModalVisible(true);
  };

  const handleDeleteStrand = (strand: Strand) => {
    setSelectedStrand(strand);
    setIsDeleteModalVisible(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const newStrand: Strand = {
      id: '#' + (strands.length + 1),
      ...formData,
    };
    setStrands([...strands, newStrand]);
    setIsAddModalVisible(false);
    toast.show('Strand added successfully!', { type: 'success', placement: 'top' });
  };

  const handleSubmitEdit = () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!selectedStrand) return;
    const updatedStrands = strands.map((strand) =>
      strand.id === selectedStrand.id ? { ...strand, ...formData } : strand
    );
    setStrands(updatedStrands);
    setIsEditModalVisible(false);
    toast.show('Strand updated successfully!', { type: 'success', placement: 'top' });
  };

  const handleConfirmDelete = () => {
    if (!selectedStrand) return;
    const updatedStrands = strands.filter((strand) => strand.id !== selectedStrand.id);
    setStrands(updatedStrands);
    setIsDeleteModalVisible(false);
    toast.show('Strand deleted successfully!', { type: 'success', placement: 'top' });
  };

  const StrandForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(formData);
    React.useEffect(() => {
      setLocalFormData(formData);
    }, [formData]);
    const handleLocalChange = (field: keyof FormData, value: string) => {
      setLocalFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = () => {
      setFormData(localFormData);
      if (isEdit) {
        handleSubmitEdit();
      } else {
        handleSubmitAdd();
      }
    };
    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{isEdit ? 'Edit Strand' : 'Add Strand'}</Text>
          <TouchableOpacity
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Strand Name</Text>
        <TextInput
          style={styles.input}
          value={localFormData.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          placeholder="Enter strand name"
        />
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.input}
          value={localFormData.description}
          onChangeText={(text) => handleLocalChange('description', text)}
          placeholder="Enter description"
        />
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Strand' : 'Add Strand'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search strand..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>
      {/* Title and Add Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Strand Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStrand}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Strand</Text>
        </TouchableOpacity>
      </View>
      {/* Strand List */}
      <ScrollView style={styles.teacherList}>
        {strands
          .filter((strand) =>
            strand.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((strand) => (
            <View key={strand.id} style={styles.teacherCard}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>{strand.name}</Text>
              <Text style={{ color: '#666', marginBottom: 16 }}>{strand.description}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditStrand(strand)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteStrand(strand)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
      {/* Add Strand Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <StrandForm isEdit={false} />
        </View>
      </Modal>
      {/* Edit Strand Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <StrandForm isEdit={true} />
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.deleteConfirmation}>
            <Text style={styles.deleteTitle}>Are you sure you want to delete this strand?</Text>
            <Text style={styles.deleteMessage}>
              This action cannot be undone. This will permanently delete the strand record from the database.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[styles.deleteAction, styles.cancelDelete]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.deleteActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteAction, styles.confirmDelete]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

