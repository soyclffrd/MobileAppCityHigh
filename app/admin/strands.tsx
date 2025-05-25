import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

interface Strand {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
}

const API_URL = 'http://192.168.0.102:3001/api';
const DEBOUNCE_DELAY = 1000;
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

const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
};

export default function StrandManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [strands, setStrands] = useState<Strand[]>([]);
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
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        setStrands([]);
        fetchStrands(true);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchStrands(true);
  }, []);

  const fetchStrands = async (isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pageNum = isRefresh ? 1 : page;
      const response = await fetchWithTimeout(
        `${API_URL}/strands?page=${pageNum}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch strands');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch strands');
      }

      setStrands(isRefresh ? data.strands : [...strands, ...data.strands]);
      setHasMore(data.strands.length === ITEMS_PER_PAGE);
      setPage(pageNum);
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching strands:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch strands');
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStrands(isRefresh);
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
    fetchStrands(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchStrands(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchStrands(true);
  };

  const handleAddStrand = () => {
    setFormData(INITIAL_FORM_DATA);
    setIsAddModalVisible(true);
  };

  const handleEditStrand = (strand: Strand) => {
    setSelectedStrand(strand);
    setFormData({
      name: strand.name,
      description: strand.description,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteStrand = (strand: Strand) => {
    setSelectedStrand(strand);
    setIsDeleteModalVisible(true);
  };

  const handleSubmitAdd = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Adding new strand with data:', formData);

      const response = await fetchWithTimeout(`${API_URL}/strands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();
      console.log('Add response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add strand');
      }

      // Add the new strand to the beginning of the list
      setStrands(prevStrands => [data.strand, ...prevStrands]);
      setIsAddModalVisible(false);
      setFormData(INITIAL_FORM_DATA);
      toast.show('Strand added successfully!', { type: 'success' });

      // Refresh the list to ensure we have the latest data
      fetchStrands(true);
    } catch (error: any) {
      console.error('Error adding strand:', error);
      let errorMessage = 'Failed to add strand. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
      throw error; // Re-throw the error to be caught by the form
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (formData: FormData) => {
    if (!selectedStrand) return;

    try {
      setLoading(true);
      setError(null);

      if (!formData.name?.trim() || !formData.description?.trim()) {
        toast.show('Please fill in all required fields', { type: 'error' });
        return;
      }

      console.log('Updating strand with data:', formData);

      const response = await fetchWithTimeout(`${API_URL}/strands/${selectedStrand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update strand');
      }

      // Update the strands list with the new data
      setStrands(prevStrands => {
        const updatedStrands = prevStrands.map(s => 
          s.id === selectedStrand.id ? data.strand : s
        );
        return updatedStrands;
      });
      
      setIsEditModalVisible(false);
      setSelectedStrand(null);
      setFormData(INITIAL_FORM_DATA);
      toast.show('Strand updated successfully!', { type: 'success' });

      // Refresh the list to ensure we have the latest data
      fetchStrands(true);
    } catch (error: any) {
      console.error('Error updating strand:', error);
      let errorMessage = 'Failed to update strand. ';
      
      if (error instanceof TypeError && error.message === 'Network request failed') {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      toast.show(errorMessage, { type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStrand) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithTimeout(`${API_URL}/strands/${selectedStrand.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete strand');
      }

      setStrands(strands.filter(s => s.id !== selectedStrand.id));
      setIsDeleteModalVisible(false);
      toast.show('Strand deleted successfully!', { type: 'success' });
    } catch (error) {
      console.error('Error deleting strand:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete strand');
    } finally {
      setLoading(false);
    }
  };

  const StrandForm = ({ isEdit }: { isEdit: boolean }) => {
    const [localFormData, setLocalFormData] = useState<FormData>(isEdit ? formData : INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    // Reset form when modal opens
    useEffect(() => {
      if (!isEdit) {
        setLocalFormData(INITIAL_FORM_DATA);
      } else {
        setLocalFormData(formData);
      }
      setFormErrors({});
    }, [isEdit, formData]);

    const handleLocalChange = (field: keyof FormData, value: string) => {
      console.log('Changing field:', field, 'to value:', value);
      setLocalFormData(prev => ({ ...prev, [field]: value }));
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const validateForm = () => {
      const errors: Partial<FormData> = {};
      
      if (!localFormData.name?.trim()) {
        errors.name = 'Strand name is required';
      }
      if (!localFormData.description?.trim()) {
        errors.description = 'Description is required';
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
          <Text style={styles.formTitle}>{isEdit ? 'Edit Strand' : 'Add Strand'}</Text>
          <TouchableOpacity
            onPress={() => {
              setFormErrors({});
              isEdit ? setIsEditModalVisible(false) : setIsAddModalVisible(false);
            }}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Strand Name *</Text>
        <TextInput
          style={[styles.input, formErrors.name && styles.inputError]}
          value={localFormData.name}
          onChangeText={(text) => handleLocalChange('name', text)}
          placeholder="Enter strand name"
        />
        {formErrors.name && <Text style={styles.formErrorText}>{formErrors.name}</Text>}

        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, { height: 80 }, formErrors.description && styles.inputError]}
          value={localFormData.description}
          onChangeText={(text) => handleLocalChange('description', text)}
          placeholder="Enter description"
          multiline
        />
        {formErrors.description && <Text style={styles.formErrorText}>{formErrors.description}</Text>}

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
              {isEdit ? 'Update Strand' : 'Add Strand'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search strands..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Strands</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Strand</Text>
        </TouchableOpacity>
      </View>

      {/* Strand List */}
      {loading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading strands...</Text>
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
              fetchStrands(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={strands}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="school" size={30} color="#666" />
                </View>
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherName}>{item.name || 'Unnamed Strand'}</Text>
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
                  onPress={() => handleEditStrand(item)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteStrand(item)}
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
                <Text style={styles.loadingMoreText}>Loading more strands...</Text>
              </View>
            ) : null
          )}
          contentContainerStyle={styles.teacherList}
        />
      )}
      {/* Add Strand Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <StrandForm isEdit={false} />
        </View>
      </Modal>
      {/* Edit Strand Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <StrandForm isEdit={true} />
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
    padding: 12,
  },
  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
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
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
  },
  teacherDetails: {
    flex: 1,
    width: '100%',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
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
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  formErrorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
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
    marginTop: 12,
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
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

