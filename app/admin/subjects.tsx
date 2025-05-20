import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Picker,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

interface Subject {
  id: string;
  name: string;
  code: string;
  status: 'Available' | 'Unavailable';
  gradeLevel: string;
  strand: string;
  students: number;
  description: string;
}

interface FormData {
  name: string;
  code: string;
  status: 'Available' | 'Unavailable';
  gradeLevel: string;
  strand: string;
  students: number;
  description: string;
}

export default function SubjectManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '#18',
      name: 'Physics 1',
      code: 'aconiles992',
      status: 'Available',
      gradeLevel: 'Grade 12',
      strand: 'No Strand',
      students: 12,
      description: 'This subject is designed for Grade 12 students in the No Strand strand. Currently has 12 enrolled students.',
    },
    // Add more sample subjects as needed
  ]);

  const toast = useToast();

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    status: 'Available',
    gradeLevel: '',
    strand: '',
    students: 0,
    description: '',
  });

  const gradeLevels = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const strands = ['No Strand', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Sports', 'Arts & Design'];
  const statuses = ['Available', 'Unavailable'];

  const handleAddSubject = () => {
    setFormData({
      name: '',
      code: '',
      status: 'Available',
      gradeLevel: '',
      strand: '',
      students: 0,
      description: '',
    });
    setIsAddModalVisible(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      status: subject.status,
      gradeLevel: subject.gradeLevel,
      strand: subject.strand,
      students: subject.students,
      description: subject.description,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalVisible(true);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsViewModalVisible(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.name || !formData.code || !formData.gradeLevel || !formData.strand) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const newSubject: Subject = {
      id: '#' + (subjects.length + 1),
      ...formData,
    };
    setSubjects([...subjects, newSubject]);
    setIsAddModalVisible(false);
    toast.show('Subject added successfully!', { type: 'success', placement: 'top' });
  };

  const handleSubmitEdit = () => {
    if (!formData.name || !formData.code || !formData.gradeLevel || !formData.strand) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!selectedSubject) return;
    const updatedSubjects = subjects.map((subject) =>
      subject.id === selectedSubject.id
        ? { ...subject, ...formData }
        : subject
    );
    setSubjects(updatedSubjects);
    setIsEditModalVisible(false);
    toast.show('Subject updated successfully!', { type: 'success', placement: 'top' });
  };

  const handleConfirmDelete = () => {
    if (!selectedSubject) return;
    const updatedSubjects = subjects.filter(
      (subject) => subject.id !== selectedSubject.id
    );
    setSubjects(updatedSubjects);
    setIsDeleteModalVisible(false);
    toast.show('Subject deleted successfully!', { type: 'success', placement: 'top' });
  };

  const SubjectForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(formData);
    useEffect(() => {
      setLocalFormData(formData);
    }, [formData]);
    const handleLocalChange = (field: keyof FormData, value: string | number) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }));
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
          <Text style={styles.formTitle}>{isEdit ? 'Edit Subject' : 'Add Subject'}</Text>
          <TouchableOpacity
            onPress={() => isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Subject Name</Text>
        <TextInput
          style={styles.input}
          value={localFormData.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          placeholder="Enter subject name"
        />
        <Text style={styles.inputLabel}>Subject Code</Text>
        <TextInput
          style={styles.input}
          value={localFormData.code}
          onChangeText={(text) => handleLocalChange('code', text)}
          placeholder="Enter subject code"
        />
        <Text style={styles.inputLabel}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={localFormData.status}
            onValueChange={(value) => handleLocalChange('status', value)}
            style={styles.picker}
          >
            {statuses.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputLabel}>Grade Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={localFormData.gradeLevel}
            onValueChange={(value) => handleLocalChange('gradeLevel', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Grade Level" value="" />
            {gradeLevels.map((level) => (
              <Picker.Item key={level} label={level} value={level} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputLabel}>Strand</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={localFormData.strand}
            onValueChange={(value) => handleLocalChange('strand', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Strand" value="" />
            {strands.map((strand) => (
              <Picker.Item key={strand} label={strand} value={strand} />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputLabel}>Number of Students</Text>
        <TextInput
          style={styles.input}
          value={String(localFormData.students)}
          onChangeText={(text) => handleLocalChange('students', Number(text))}
          placeholder="Enter number of students"
          keyboardType="numeric"
        />
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={localFormData.description}
          onChangeText={(text) => handleLocalChange('description', text)}
          placeholder="Enter description"
          multiline
        />
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Subject' : 'Add Subject'}
            </Text>
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
            placeholder="Search subject..."
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
        <Text style={styles.title}>Subject Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Subject</Text>
        </TouchableOpacity>
      </View>
      {/* Subject List */}
      <ScrollView style={styles.teacherList}>
        {subjects.map((subject) => (
          <View key={subject.id} style={styles.teacherCard}>
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>{subject.name}</Text>
              <Text style={{ color: '#888', fontSize: 13 }}>{subject.code}</Text>
              <View style={[styles.genderBadge, { backgroundColor: subject.status === 'Available' ? '#e0ffe0' : '#ffe0e0' }]}> 
                <Text style={{ color: subject.status === 'Available' ? '#22bb66' : '#ff4444', fontSize: 12 }}>{subject.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID:</Text>
                <Text style={styles.detailValue}>{subject.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Grade Level:</Text>
                <Text style={styles.detailValue}>{subject.gradeLevel}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Strand:</Text>
                <Text style={styles.detailValue}>{subject.strand}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Students:</Text>
                <Text style={styles.detailValue}>{subject.students}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditSubject(subject)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteSubject(subject)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#90caf9' }]}
                onPress={() => handleViewSubject(subject)}
              >
                <MaterialIcons name="visibility" size={20} color="#1976D2" />
                <Text style={{ color: '#1976D2', marginLeft: 6 }}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Add Subject Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <SubjectForm isEdit={false} />
        </View>
      </Modal>
      {/* Edit Subject Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <SubjectForm isEdit={true} />
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.deleteConfirmation}>
            <Text style={styles.deleteTitle}>Are you sure you want to delete this subject?</Text>
            <Text style={styles.deleteMessage}>
              This action cannot be undone. This will permanently delete the subject record from the database.
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
      {/* View Subject Modal */}
      <Modal
        visible={isViewModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          {selectedSubject && (
            <View style={[styles.formContainer, { maxWidth: 400, alignSelf: 'center' }]}> 
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Subject Details</Text>
                <TouchableOpacity onPress={() => setIsViewModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.teacherName}>{selectedSubject.name}</Text>
              <View style={[styles.genderBadge, { backgroundColor: selectedSubject.status === 'Available' ? '#e0ffe0' : '#ffe0e0', alignSelf: 'flex-start', marginVertical: 8 }]}> 
                <Text style={{ color: selectedSubject.status === 'Available' ? '#22bb66' : '#ff4444', fontSize: 12 }}>{selectedSubject.status}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue}>{selectedSubject.id}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Subject Code</Text>
                  <Text style={styles.detailValue}>{selectedSubject.code}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={styles.detailLabel}>Grade Level</Text>
                  <Text style={styles.detailValue}>{selectedSubject.gradeLevel}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Strand</Text>
                  <Text style={styles.detailValue}>{selectedSubject.strand}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={styles.detailLabel}>Enrolled Students</Text>
                  <Text style={styles.detailValue}>{selectedSubject.students} students</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{selectedSubject.status}</Text>
                </View>
              </View>
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee', marginVertical: 12 }} />
              <Text style={styles.inputLabel}>Description</Text>
              <Text style={{ color: '#333', marginBottom: 16 }}>{selectedSubject.description}</Text>
              <TouchableOpacity style={[styles.submitButton, { marginTop: 8 }]} onPress={() => setIsViewModalVisible(false)}>
                <Text style={styles.submitButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
  genderBadge: {
    backgroundColor: '#ffe0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 90,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
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
    padding: 20,
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
});
