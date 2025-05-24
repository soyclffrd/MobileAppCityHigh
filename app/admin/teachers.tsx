import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  gender: string;
  avatar: string | null;
  phone?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  gender: string;
  avatar: string | null;
}

const API_URL = 'http://192.168.0.102:3001/api';

// Add debounce delay constant
const DEBOUNCE_DELAY = 1000; // 1 second delay
const ITEMS_PER_PAGE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Add timeout configuration
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': (options.headers as Record<string, string>)?.['Content-Type'] || 'application/json',
      },
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export default function TeacherManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const toast = useToast();

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'Not Assigned',
    gender: '',
    avatar: null,
  });

  const subjects = ['Not Assigned', 'Filipino', 'English', 'Mathematics', 'Science', 'Social Studies'];
  const genders = ['Male', 'Female'];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        setTeachers([]);
        fetchTeachers(true);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchTeachers(true);
  }, []);

  const fetchTeachers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const currentPage = isRefresh ? 1 : page;
      
      const response = await fetchWithTimeout(`${API_URL}/teachers?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (isRefresh) {
          setTeachers(data.teachers);
        } else {
          setTeachers(prev => [...prev, ...data.teachers]);
        }
        setHasMore(data.teachers.length === ITEMS_PER_PAGE);
        setRetryCount(0);
        if (!isRefresh) {
          setPage(prev => prev + 1);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch teachers');
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      let errorMessage = 'Could not connect to server. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check if the server is running and your internet connection is stable.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchTeachers(isRefresh);
        }, 2000);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchTeachers(true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchTeachers();
    }
  };

  const handleAddTeacher = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Not Assigned',
      gender: '',
      avatar: null,
    });
    setIsAddModalVisible(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      subject: teacher.subject,
      gender: teacher.gender,
      avatar: teacher.avatar,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalVisible(true);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setFormData({ ...formData, avatar: selectedImage.uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.show('Failed to pick image', { type: 'error' });
    }
  };

  const handleSubmitAdd = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.subject) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('gender', formData.gender);
      
      if (formData.avatar) {
        const uri = formData.avatar;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formDataToSend.append('avatar', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetchWithTimeout(`${API_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setTeachers([...teachers, data.teacher]);
        setIsAddModalVisible(false);
        toast.show('Teacher added successfully!', { type: 'success' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      let errorMessage = 'Failed to add teacher. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.subject) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!selectedTeacher) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('gender', formData.gender);
      
      if (formData.avatar) {
        const uri = formData.avatar;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formDataToSend.append('avatar', {
          uri,
          name: filename,
          type,
        } as any);
      }

      console.log('Sending update request to:', `${API_URL}/teachers/${selectedTeacher.id}`);
      console.log('Form data:', Object.fromEntries(formDataToSend as any));

      const response = await fetchWithTimeout(`${API_URL}/teachers/${selectedTeacher.id}`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      if (data.success) {
        const updatedTeachers = teachers.map((teacher) =>
          teacher.id === selectedTeacher.id ? data.teacher : teacher
        );
        setTeachers(updatedTeachers);
        setIsEditModalVisible(false);
        toast.show('Teacher updated successfully!', { type: 'success' });
      } else {
        throw new Error(data.message || 'Failed to update teacher');
      }
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      let errorMessage = 'Failed to update teacher. ';
      
      if (error.message.includes('timed out')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetchWithTimeout(`${API_URL}/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const updatedTeachers = teachers.filter(
          (teacher) => teacher.id !== selectedTeacher.id
        );
        setTeachers(updatedTeachers);
        setIsDeleteModalVisible(false);
        toast.show('Teacher deleted successfully!', { type: 'success' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      let errorMessage = 'Failed to delete teacher. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    }
  };

  const TeacherForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(formData);
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    useEffect(() => {
      setLocalFormData(formData);
    }, [formData]);

    const handleLocalChange = (field: keyof FormData, value: string) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const validateForm = () => {
      const errors: Partial<FormData> = {};
      
      if (!localFormData.name?.trim()) {
        errors.name = 'Name is required';
      }
      if (!localFormData.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(localFormData.email)) {
        errors.email = 'Invalid email format';
      }
      if (!localFormData.phone?.trim()) {
        errors.phone = 'Phone number is required';
      }
      if (!localFormData.subject?.trim()) {
        errors.subject = 'Subject is required';
      }
      if (!localFormData.gender?.trim()) {
        errors.gender = 'Gender is required';
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        setFormData(localFormData);
        if (isEdit) {
          handleSubmitEdit();
        } else {
          handleSubmitAdd();
        }
      } else {
        Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      }
    };

    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{isEdit ? 'Edit Teacher' : 'Add Teacher'}</Text>
          <TouchableOpacity
            onPress={() => isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={[styles.input, formErrors.name && styles.inputError]}
          value={localFormData.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          placeholder="Enter teacher's name"
        />
        {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={[styles.input, formErrors.email && styles.inputError]}
          value={localFormData.email}
          onChangeText={(text) => handleLocalChange('email', text)}
          placeholder="Enter teacher's email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

        <Text style={styles.inputLabel}>Phone *</Text>
        <TextInput
          style={[styles.input, formErrors.phone && styles.inputError]}
          value={localFormData.phone}
          onChangeText={(text) => handleLocalChange('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}

        <Text style={styles.inputLabel}>Subject *</Text>
        <View style={[styles.pickerContainer, formErrors.subject && styles.inputError]}>
          <Picker
            selectedValue={localFormData.subject}
            onValueChange={(value) => handleLocalChange('subject', value)}
            style={styles.picker}
          >
            {subjects.map((subject) => (
              <Picker.Item key={subject} label={subject} value={subject} />
            ))}
          </Picker>
        </View>
        {formErrors.subject && <Text style={styles.errorText}>{formErrors.subject}</Text>}

        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={[styles.pickerContainer, formErrors.gender && styles.inputError]}>
          <Picker
            selectedValue={localFormData.gender}
            onValueChange={(value) => handleLocalChange('gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            {genders.map((gender) => (
              <Picker.Item key={gender} label={gender} value={gender} />
            ))}
          </Picker>
        </View>
        {formErrors.gender && <Text style={styles.errorText}>{formErrors.gender}</Text>}

        <Text style={styles.inputLabel}>Profile Image</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}>
          <Text style={styles.imagePickerText}>
            {localFormData.avatar ? 'Change Image' : 'Choose File'}
          </Text>
        </TouchableOpacity>
        {localFormData.avatar && (
          <Image 
            source={{ uri: localFormData.avatar }}
            style={styles.previewImage}
          />
        )}

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
              {isEdit ? 'Update Teacher' : 'Add Teacher'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getImageUrl = (avatar: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    // Remove /api prefix since the backend serves uploads directly
    return `${API_URL.replace('/api', '')}${avatar}`;
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
            placeholder="Search teacher..."
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
        <Text style={styles.title}>Teacher Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTeacher}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Teacher List with Pull to Refresh and Infinite Scroll */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setRetryCount(0);
              fetchTeachers(true);
            }}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                {item.avatar ? (
                  <Image 
                    source={{ uri: getImageUrl(item.avatar) || '' }}
                    style={styles.avatar}
                    onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <MaterialIcons name="person" size={30} color="#666" />
                  </View>
                )}
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherName}>{item.name}</Text>
                  <View style={styles.genderBadge}>
                    <Text style={[
                      styles.genderText,
                      item.gender === 'Male' ? styles.maleText : styles.femaleText
                    ]}>{item.gender}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{item.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{item.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Subject:</Text>
                    <Text style={styles.detailValue}>{item.subject}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditTeacher(item)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTeacher(item)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#1a73e8" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          )}
          contentContainerStyle={styles.teacherList}
        />
      )}

      {/* Add Teacher Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <TeacherForm isEdit={false} />
        </View>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <TeacherForm isEdit={true} />
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
            <Text style={styles.deleteTitle}>Are you sure you want to delete this teacher?</Text>
            <Text style={styles.deleteMessage}>
              This action cannot be undone. This will permanently delete the teacher record from the database.
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
    padding: 8,
    paddingTop: (StatusBar.currentHeight || 0) + 8,
    borderBottomWidth: 0,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 28,
    fontSize: 14,
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  teacherList: {
    padding: 12,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
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
    backgroundColor: '#f0f0f0',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  genderBadge: {
    backgroundColor: '#e0ffe0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  maleText: {
    color: '#1a73e8',
  },
  femaleText: {
    color: '#e91e63',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
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
    padding: 24,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#666',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 