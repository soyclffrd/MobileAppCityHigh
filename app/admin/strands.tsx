import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

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
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
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
              <View style={styles.teacherInfo}>
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="school" size={30} color="#666" />
                </View>
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherName}>{strand.name}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{strand.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{strand.description}</Text>
                  </View>
                </View>
              </View>
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
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <StrandForm isEdit={false} />
        </View>
      </Modal>
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <StrandForm isEdit={true} />
        </View>
      </Modal>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    padding: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 16,
    borderBottomWidth: 0,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 32,
    fontSize: 14,
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 120,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  teacherList: {
    padding: 16,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  teacherInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 0,
    paddingTop: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  editButton: {
    backgroundColor: '#1a73e8',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 12,
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteConfirmation: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteAction: {
    padding: 12,
    minWidth: 100,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelDelete: {
    backgroundColor: '#f5f5f5',
  },
  confirmDelete: {
    backgroundColor: '#ff4444',
  },
  deleteActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

