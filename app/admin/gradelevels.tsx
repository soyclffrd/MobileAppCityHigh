import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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

interface GradeLevel {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
  is_active: boolean;
}

// Use original Node.js backend URL
const API_URL = 'http://192.168.0.102:3001/api';
const ITEMS_PER_PAGE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

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
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(id);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  is_active: true,
};

export default function GradeLevelManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
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
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Initial fetch
  useEffect(() => {
    fetchGradeLevels(true);
  }, []);

  const fetchGradeLevels = async (isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pageNum = isRefresh ? 1 : page;
      const url = `${API_URL}/grade-levels?page=${pageNum}&limit=${ITEMS_PER_PAGE}`;
      console.log('Fetching grade levels from:', url);
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }

      const data = await response.json();
      console.log('Server response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Server returned unsuccessful response');
      }

      if (!data.gradeLevels || !Array.isArray(data.gradeLevels)) {
        console.error('Invalid response format:', data);
        throw new Error('Server returned invalid data format');
      }

      setGradeLevels(isRefresh ? data.gradeLevels : [...gradeLevels, ...data.gradeLevels]);
      setHasMore(data.gradeLevels.length === ITEMS_PER_PAGE);
      setPage(pageNum);
      setRetryCount(0);
    } catch (error) {
      console.error('Error in fetchGradeLevels:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch grade levels');
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchGradeLevels(isRefresh);
        }, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGradeLevels(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchGradeLevels(false);
    }
  };

  const handleAddGrade = () => {
    setFormData(INITIAL_FORM_DATA);
    setIsAddModalVisible(true);
  };

  const handleEditGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setFormData({
      name: grade.name,
      description: grade.description,
      is_active: grade.is_active,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteGrade = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setIsDeleteModalVisible(true);
  };

  const handleSubmitAdd = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.name?.trim()) {
        toast.show('Please fill in all required fields', { type: 'error' });
        return;
      }

      console.log('Adding new grade level with data:', formData);

      const response = await fetchWithTimeout(`${API_URL}/grade-levels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add grade level');
      }

      const data = await response.json();
      console.log('Add response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to add grade level');
      }

      setGradeLevels(prev => [data.gradeLevel, ...prev]);
      setIsAddModalVisible(false);
      setFormData(INITIAL_FORM_DATA);
      toast.show('Grade Level added successfully!', { type: 'success' });

      fetchGradeLevels(true);
    } catch (error: any) {
      console.error('Error adding grade level:', error);
      let errorMessage = 'Failed to add grade level. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (formData: FormData) => {
    if (!selectedGrade) return;

    try {
      setLoading(true);
      setError(null);

      if (!formData.name?.trim()) {
        toast.show('Please fill in all required fields', { type: 'error' });
        return;
      }

      console.log('Updating grade level with data:', formData);

      const response = await fetchWithTimeout(`${API_URL}/grade-levels/${selectedGrade.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active,
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update grade level');
      }

      setGradeLevels(prev => prev.map(grade => 
        grade.id === selectedGrade.id ? data.gradeLevel : grade
      ));
      setIsEditModalVisible(false);
      setSelectedGrade(null);
      setFormData(INITIAL_FORM_DATA);
      toast.show('Grade Level updated successfully!', { type: 'success' });

      fetchGradeLevels(true);
    } catch (error: any) {
      console.error('Error updating grade level:', error);
      let errorMessage = 'Failed to update grade level. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedGrade) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithTimeout(`${API_URL}/grade-levels/${selectedGrade.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete grade level');
      }

      setGradeLevels(gradeLevels.filter(g => g.id !== selectedGrade.id));
      setIsDeleteModalVisible(false);
      toast.show('Grade Level deleted successfully!', { type: 'success' });
    } catch (error: unknown) {
      console.error('Error deleting grade level:', error);
      let errorMessage = 'Failed to delete grade level. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error instanceof Error && error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error instanceof Error) {
        errorMessage += error.message || 'An unexpected error occurred.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    setGradeLevels([]);
    fetchGradeLevels(true);
  };

  const GradeForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(isEdit ? formData : INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    useEffect(() => {
      if (!isEdit) {
        setLocalFormData(INITIAL_FORM_DATA);
      } else {
        setLocalFormData(formData);
      }
      setFormErrors({});
    }, [isEdit, formData]);

    const handleLocalChange = (field: keyof FormData, value: string | boolean) => {
      console.log('Changing field:', field, 'to value:', value);
      setLocalFormData(prev => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const validateForm = () => {
      const errors: Partial<FormData> = {};
      
      if (!localFormData.name?.trim()) {
        errors.name = 'Grade level name is required';
      }

      setFormErrors(errors);
      console.log('Form validation errors:', errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
      console.log('Current form data:', localFormData);
      
      if (validateForm()) {
        const validatedData = {
          name: localFormData.name?.trim() || '',
          description: localFormData.description?.trim() || '',
          is_active: localFormData.is_active,
        };
        
        console.log('Submitting form data:', validatedData);
        
        try {
          if (isEdit) {
            await handleSubmitEdit(validatedData);
          } else {
            await handleSubmitAdd(validatedData);
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          toast.show('Failed to submit form. Please try again.', { type: 'error' });
        }
      } else {
        toast.show('Please fill in all required fields correctly', { type: 'error' });
      }
    };

    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>{isEdit ? 'Edit Grade Level' : 'Add Grade Level'}</Text>
          <TouchableOpacity
            onPress={() => {
              setFormErrors({});
              isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false);
            }}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Grade Level Name *</Text>
        <TextInput
          style={[styles.input, formErrors.name && styles.inputError]}
          value={localFormData.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          placeholder="Enter grade level name"
        />
        {formErrors.name && <Text style={styles.formErrorText}>{formErrors.name}</Text>}

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
            onPress={() => {
              setFormErrors({});
              isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Grade Level' : 'Add Grade Level'}
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
          <TextInput
            style={styles.searchInput}
            placeholder="Search grade levels..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Title and Add Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Grade Levels</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddGrade}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Grade Level</Text>
        </TouchableOpacity>
      </View>

      {/* Grade Level List */}
      {loading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading grade levels...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setRetryCount(0);
              fetchGradeLevels(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gradeLevels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="school" size={30} color="#666" />
                </View>
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherName}>{item.name || 'Unnamed Grade Level'}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{item.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{item.description || 'No description'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditGrade(item)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteGrade(item)}
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
                <Text style={styles.loadingMoreText}>Loading more grade levels...</Text>
              </View>
            ) : null
          )}
          contentContainerStyle={styles.teacherList}
        />
      )}

      {/* Add Grade Level Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <GradeForm isEdit={false} />
        </View>
      </Modal>

      {/* Edit Grade Level Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <GradeForm isEdit={true} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a73e8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  teacherList: {
    padding: 16,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#1a73e8',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
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
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  formErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteAction: {
    padding: 12,
    minWidth: 120,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelDelete: {
    backgroundColor: '#f5f5f5',
  },
  confirmDelete: {
    backgroundColor: '#FF3B30',
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
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
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