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
import { styles } from './_styles'; // Use shared styles

interface Section {
  id: string;
  name: string;
  // Add other section properties based on your image reference later
}

interface FormData {
  name: string;
  // Add other form data properties later
}

export default function SectionManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<Section[]>([
    { id: '#1', name: 'Sampaguita' },
    { id: '#2', name: 'Sun Flower' },
    { id: '#3', name: 'Rose' },
    { id: '#4', name: 'Orchids' },
    { id: '#5', name: 'Olympia Woods' },
    // Add more placeholder data as needed
  ]);

  const toast = useToast();

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    // Initialize other form data properties
  });

  const handleAddSection = () => {
    setFormData({ name: '' }); // Initialize form for adding
    setIsAddModalVisible(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setFormData({ name: section.name }); // Load existing data for editing
    setIsEditModalVisible(true);
  };

  const handleDeleteSection = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteModalVisible(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in the section name');
      return;
    }
    const newSection: Section = {
      id: '#' + (sections.length + 1), // Simple ID generation
      ...formData,
    };
    setSections([...sections, newSection]);
    setIsAddModalVisible(false);
    toast.show('Section added successfully!', { type: 'success', placement: 'top' });
  };

  const handleSubmitEdit = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in the section name');
      return;
    }
    if (!selectedSection) return;
    const updatedSections = sections.map((section) =>
      section.id === selectedSection.id ? { ...section, ...formData } : section
    );
    setSections(updatedSections);
    setIsEditModalVisible(false);
    toast.show('Section updated successfully!', { type: 'success', placement: 'top' });
  };

  const handleConfirmDelete = () => {
    if (!selectedSection) return;
    const updatedSections = sections.filter((section) => section.id !== selectedSection.id);
    setSections(updatedSections);
    setIsDeleteModalVisible(false);
    toast.show('Section deleted successfully!', { type: 'success', placement: 'top' });
  };

  const SectionForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(formData);
    React.useEffect(() => {
      setLocalFormData(formData);
    }, [formData]);
    const handleLocalChange = (value: string) => {
      setLocalFormData({ name: value });
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
          <Text style={styles.formTitle}>{isEdit ? 'Edit Section' : 'Add Section'}</Text>
          <TouchableOpacity
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Section Name</Text>
        <TextInput
          style={styles.input}
          value={localFormData.name}
          onChangeText={handleLocalChange}
          placeholder="Enter section name"
        />
        {/* Add other form fields based on your image reference */}
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Section' : 'Add Section'}</Text>
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
            placeholder="Search section..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>
      {/* Title and Add Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Section Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSection}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Section</Text>
        </TouchableOpacity>
      </View>
      {/* Section List */}
      <ScrollView style={styles.teacherList}> {/* Reusing teacherList style for now */}
        {sections
          .filter((section) =>
            section.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((section) => (
            <View key={section.id} style={styles.teacherCard}> {/* Reusing teacherCard style for now */}
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>{section.name}</Text>
              <Text style={{ color: '#666', marginBottom: 16 }}>ID: {section.id}</Text>
              {/* Display other section details here based on your image reference */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditSection(section)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteSection(section)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
      {/* Add Section Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <SectionForm isEdit={false} />
        </View>
      </Modal>
      {/* Edit Section Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <SectionForm isEdit={true} />
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.deleteConfirmation}>
            <Text style={styles.deleteTitle}>Are you sure you want to delete this section?</Text>
            <Text style={styles.deleteMessage}>
              This action cannot be undone. This will permanently delete the section record.
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