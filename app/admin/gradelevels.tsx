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
import { styles } from './_styles';

interface GradeLevel {
  id: string;
  name: string;
}

interface FormData {
  name: string;
}

export default function GradeLevelManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([
    { id: '#1', name: 'Grade 7' },
    { id: '#2', name: 'Grade 8' },
    { id: '#3', name: 'Grade 9' },
    { id: '#4', name: 'Grade 10' },
    { id: '#5', name: 'Grade 11' },
    { id: '#6', name: 'Grade 12' },
  ]);

  const toast = useToast();

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
  });

  const handleAddGrade = () => {
    setFormData({ name: '' });
    setIsAddModalVisible(true);
  };

  const handleEditGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setFormData({ name: grade.name });
    setIsEditModalVisible(true);
  };

  const handleDeleteGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setIsDeleteModalVisible(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in the grade level name');
      return;
    }
    const newGrade: GradeLevel = {
      id: '#' + (gradeLevels.length + 1),
      ...formData,
    };
    setGradeLevels([...gradeLevels, newGrade]);
    setIsAddModalVisible(false);
    toast.show('Grade Level added successfully!', { type: 'success', placement: 'top' });
  };

  const handleSubmitEdit = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in the grade level name');
      return;
    }
    if (!selectedGrade) return;
    const updatedGrades = gradeLevels.map((grade) =>
      grade.id === selectedGrade.id ? { ...grade, ...formData } : grade
    );
    setGradeLevels(updatedGrades);
    setIsEditModalVisible(false);
    toast.show('Grade Level updated successfully!', { type: 'success', placement: 'top' });
  };

  const handleConfirmDelete = () => {
    if (!selectedGrade) return;
    const updatedGrades = gradeLevels.filter((grade) => grade.id !== selectedGrade.id);
    setGradeLevels(updatedGrades);
    setIsDeleteModalVisible(false);
    toast.show('Grade Level deleted successfully!', { type: 'success', placement: 'top' });
  };

  const GradeForm = ({ isEdit }: { isEdit: boolean }) => {
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
          <Text style={styles.formTitle}>{isEdit ? 'Edit Grade Level' : 'Add Grade Level'}</Text>
          <TouchableOpacity
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Grade Level Name</Text>
        <TextInput
          style={styles.input}
          value={localFormData.name}
          onChangeText={handleLocalChange}
          placeholder="Enter grade level name"
        />
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => (isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false))}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isEdit ? 'Update Grade' : 'Add Grade'}</Text>
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
            placeholder="Search grade level..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>
      {/* Title and Add Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Grades Level</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGrade}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Grade</Text>
        </TouchableOpacity>
      </View>
      {/* Grade Level List */}
      <ScrollView style={styles.teacherList}>
        {gradeLevels
          .filter((grade) =>
            grade.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((grade) => (
            <View key={grade.id} style={styles.teacherCard}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>{grade.name}</Text>
              <Text style={{ color: '#666', marginBottom: 16 }}>ID: {grade.id}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditGrade(grade)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteGrade(grade)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
      {/* Add Grade Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <GradeForm isEdit={false} />
        </View>
      </Modal>
      {/* Edit Grade Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <GradeForm isEdit={true} />
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.deleteConfirmation}>
            <Text style={styles.deleteTitle}>Are you sure you want to delete this grade level?</Text>
            <Text style={styles.deleteMessage}>
              This action cannot be undone. This will permanently delete the grade level record from the database.
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