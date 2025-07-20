import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const AddAssignmentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [imageHeight, setImageHeight] = useState(200); // Default image height
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    image: null,
    subject: '',
    imageHeight: 200, // Individual image height for each assignment
  });

  // Get data from previous screen
  const {
    selectedYear,
    selectedDivision,
    teacherId,
    employeeId,
    teacherName
  } = route.params || {};

  const handleAddAssignment = () => {
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      image: null,
      subject: '',
      imageHeight: imageHeight, // Use current slider value
    });
    setShowAssignmentForm(true);
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera (Free Crop)', 
          onPress: () => openCamera()
        },
        { 
          text: 'Gallery (Free Crop)', 
          onPress: () => openGallery()
        },
        { 
          text: 'Square Crop', 
          onPress: () => openWithSquareCrop()
        }
      ]
    );
  };

  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      // Launch camera with updated options for vertical scrolling and free cropping
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        // Removed aspect ratio constraint to allow any shape and vertical scrolling
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCurrentAssignment({
          ...currentAssignment,
          image: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

      // Launch image library with updated options for vertical scrolling and free cropping
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        // Removed aspect ratio constraint to allow any shape and vertical scrolling
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
        exif: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCurrentAssignment({
          ...currentAssignment,
          image: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  // Square crop option
  const openWithSquareCrop = async () => {
    Alert.alert(
      'Square Crop',
      'Choose source',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => launchImagePicker('camera', [1, 1])
        },
        { 
          text: 'Gallery', 
          onPress: () => launchImagePicker('gallery', [1, 1])
        }
      ]
    );
  };

  // Generic image picker function
  const launchImagePicker = async (source, aspectRatio = null) => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: aspectRatio,
          quality: 0.8,
          allowsMultipleSelection: false,
          base64: false,
          exif: false,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: aspectRatio,
          quality: 0.8,
          allowsMultipleSelection: false,
          base64: false,
          exif: false,
          selectionLimit: 1,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCurrentAssignment({
          ...currentAssignment,
          image: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error with image picker:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const handleSaveAssignment = () => {
    if (!currentAssignment.title.trim()) {
      Alert.alert('Error', 'Please enter assignment title');
      return;
    }

    const newAssignment = {
      ...currentAssignment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      imageHeight: currentAssignment.imageHeight || imageHeight,
    };

    setAssignments([...assignments, newAssignment]);
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      image: null,
      subject: '',
      imageHeight: imageHeight,
    });
    setShowAssignmentForm(false);
  };

  const handleDeleteAssignment = (id) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setAssignments(assignments.filter(assignment => assignment.id !== id));
        }}
      ]
    );
  };

  const handleEditAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setImageHeight(assignment.imageHeight || 200);
    setShowAssignmentForm(true);
  };

  const renderAssignmentCard = (assignment) => (
    <View key={assignment.id} style={styles.assignmentCard}>
      {assignment.image && (
        <Image 
          source={{ uri: assignment.image }} 
          style={[
            styles.assignmentImage, 
            { height: assignment.imageHeight || 200 }
          ]} 
        />
      )}
      <View style={styles.assignmentContent}>
        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
        {assignment.subject && (
          <Text style={styles.assignmentSubject}>{assignment.subject}</Text>
        )}
        {assignment.description && (
          <Text style={styles.assignmentDescription}>{assignment.description}</Text>
        )}
        {assignment.dueDate && (
          <Text style={styles.assignmentDueDate}>Due: {assignment.dueDate}</Text>
        )}
        <View style={styles.assignmentActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditAssignment(assignment)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteAssignment(assignment.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAddAssignmentCard = () => (
    <View style={[styles.mainCard, assignments.length > 0 && styles.compactCard]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>📝</Text>
        </View>
      </View>
      
      <Text style={styles.title}>Add New Assignment</Text>
      <Text style={styles.subtitle}>
        Create assignments for your students quickly and easily
      </Text>

      {assignments.length === 0 && (
        <View style={styles.classInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>
              {selectedYear?.label || selectedYear?.value || selectedYear || 'Not selected'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Division:</Text>
            <Text style={styles.infoValue}>
              {selectedDivision?.label || selectedDivision?.value || selectedDivision || 'Not selected'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teacher:</Text>
            <Text style={styles.infoValue}>
              {teacherName?.label || teacherName?.value || teacherName || 'Not available'}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddAssignment}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.buttonText}>Create Assignment</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignment Center</Text>
        <Text style={styles.headerSubtitle}>Create and manage assignments</Text>
      </View>

      {/* Main Content - Enhanced ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {/* Existing Assignments */}
        {assignments.map(renderAssignmentCard)}

        {/* Add Assignment Card */}
        {renderAddAssignmentCard()}
        
        {/* Extra padding at bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tip: You can crop images in any shape and customize image sizes
        </Text>
      </View>

      {/* Assignment Form Modal */}
      <Modal
        visible={showAssignmentForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAssignmentForm(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Assignment</Text>
            <TouchableOpacity onPress={handleSaveAssignment}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Assignment Title *</Text>
              <TextInput
                style={styles.input}
                value={currentAssignment.title}
                onChangeText={(text) => setCurrentAssignment({...currentAssignment, title: text})}
                placeholder="Enter assignment title"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={currentAssignment.subject}
                onChangeText={(text) => setCurrentAssignment({...currentAssignment, subject: text})}
                placeholder="Enter subject"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentAssignment.description}
                onChangeText={(text) => setCurrentAssignment({...currentAssignment, description: text})}
                placeholder="Enter assignment description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                value={currentAssignment.dueDate}
                onChangeText={(text) => setCurrentAssignment({...currentAssignment, dueDate: text})}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assignment Image</Text>
              <TouchableOpacity 
                style={[styles.imageUploadButton, { height: imageHeight }]} 
                onPress={handleImagePicker}
              >
                {currentAssignment.image ? (
                  <Image 
                    source={{ uri: currentAssignment.image }} 
                    style={[styles.uploadedImage, { height: imageHeight }]} 
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                    <Text style={styles.imageUploadText}>Tap to add image</Text>
                    <Text style={styles.imageUploadSubtext}>Free crop or square crop available</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Image Size Controls */}
              <View style={styles.sizeControlContainer}>
                <Text style={styles.sizeControlLabel}>
                  Image Size: {Math.round(imageHeight)}px
                </Text>
                <View style={styles.sizeButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.sizeButton, styles.decreaseButton]}
                    onPress={() => {
                      const newHeight = Math.max(100, imageHeight - 25);
                      setImageHeight(newHeight);
                      setCurrentAssignment({
                        ...currentAssignment,
                        imageHeight: newHeight
                      });
                    }}
                  >
                    <Text style={styles.sizeButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.sizePresets}>
                    <TouchableOpacity 
                      style={[styles.presetButton, imageHeight === 150 && styles.activePreset]}
                      onPress={() => {
                        setImageHeight(150);
                        setCurrentAssignment({
                          ...currentAssignment,
                          imageHeight: 150
                        });
                      }}
                    >
                      <Text style={[styles.presetText, imageHeight === 150 && styles.activePresetText]}>Small</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.presetButton, imageHeight === 250 && styles.activePreset]}
                      onPress={() => {
                        setImageHeight(250);
                        setCurrentAssignment({
                          ...currentAssignment,
                          imageHeight: 250
                        });
                      }}
                    >
                      <Text style={[styles.presetText, imageHeight === 250 && styles.activePresetText]}>Medium</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.presetButton, imageHeight === 350 && styles.activePreset]}
                      onPress={() => {
                        setImageHeight(350);
                        setCurrentAssignment({
                          ...currentAssignment,
                          imageHeight: 350
                        });
                      }}
                    >
                      <Text style={[styles.presetText, imageHeight === 350 && styles.activePresetText]}>Large</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.sizeButton, styles.increaseButton]}
                    onPress={() => {
                      const newHeight = Math.min(400, imageHeight + 25);
                      setImageHeight(newHeight);
                      setCurrentAssignment({
                        ...currentAssignment,
                        imageHeight: newHeight
                      });
                    }}
                  >
                    <Text style={styles.sizeButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.sizeIndicator}>
                  <View style={styles.sizeBar}>
                    <View 
                      style={[
                        styles.sizeProgress, 
                        { width: `${((imageHeight - 100) / 300) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Extra padding at bottom for better scrolling in modal */}
            <View style={styles.modalBottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexGrow: 1,
  },
  bottomPadding: {
    height: 30,
  },
  mainCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  compactCard: {
    padding: 20,
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  assignmentImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  assignmentContent: {
    padding: 20,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  assignmentSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  assignmentDueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 16,
  },
  assignmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  classInfo: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
    textAlign: 'right',
  },
  addButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  saveButton: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalBottomPadding: {
    height: 50,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageUploadButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 36,
    marginBottom: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
    marginTop: 4,
  },
  uploadedImage: {
    width: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  sizeControlContainer: {
    marginTop: 16,
  },
  sizeControlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  sizeButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 8,
  },
  decreaseButton: {
    backgroundColor: '#ef4444',
  },
  increaseButton: {
    backgroundColor: '#22c55e',
  },
  sizeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  sizePresets: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activePreset: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activePresetText: {
    color: '#ffffff',
  },
  sizeIndicator: {
    alignItems: 'center',
  },
  sizeBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sizeProgress: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
});

export default AddAssignmentsScreen;