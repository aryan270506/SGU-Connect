import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const TeacherChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [frontendMessages, setFrontendMessages] = useState([]); // Local messages only
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const flatListRef = useRef(null);
  
  const route = useRoute();
  const navigation = useNavigation();
  
  const {
    selectedYear,
    selectedDivision,
    teacherId,
    employeeId,
    teacherName
  } = route.params || {};

  useEffect(() => {
    if (selectedYear && selectedDivision && teacherId) {
      fetchMessages();
    }
  }, [selectedYear, selectedDivision, teacherId]);

  // Combine Firebase messages with local frontend messages
  const getAllMessages = () => {
    const combined = [...messages, ...frontendMessages];
    return combined.sort((a, b) => {
      const timeA = a.timestamp || new Date(a.createdAt).getTime();
      const timeB = b.timestamp || new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  };

  const fetchMessages = () => {
    try {
      const database = getDatabase();
      const chatPath = `teacher_announcements/${selectedYear.value}_${selectedDivision.value}`;
      const messagesRef = ref(database, chatPath);
      
      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        if (messagesData) {
          const messagesList = Object.entries(messagesData).map(([key, value]) => ({
            id: key,
            ...value,
            isFromFirebase: true, // Mark as Firebase message
          }));
          
          // Sort messages by timestamp
          messagesList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          setMessages(messagesList);
          
          // Auto scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } else {
          setMessages([]);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setLoading(true);
    try {
      // Create a local message object (not saved to Firebase)
      const messageData = {
        id: `frontend_${Date.now()}_${Math.random()}`, // Unique local ID
        text: message.trim(),
        teacherId: teacherId,
        employeeId: employeeId,
        teacherName: teacherName,
        timestamp: Date.now(),
        year: selectedYear.value,
        division: selectedDivision.value,
        messageType: 'announcement',
        type: 'text',
        createdAt: new Date().toISOString(),
        isFromFirebase: false, // Mark as local frontend message
      };

      // Add to local frontend messages array
      setFrontendMessages(prev => [...prev, messageData]);
      setMessage('');
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Show success feedback
      Alert.alert('Success', 'Message displayed locally (not saved to database)');
      
    } catch (error) {
      console.error('Error displaying message:', error);
      Alert.alert('Error', 'Failed to display message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendImage = async (imageUri) => {
    setLoading(true);
    try {
      // Create a local image message object (not saved to Firebase)
      const messageData = {
        id: `frontend_img_${Date.now()}_${Math.random()}`, // Unique local ID
        imageUri: imageUri,
        teacherId: teacherId,
        employeeId: employeeId,
        teacherName: teacherName,
        timestamp: Date.now(),
        year: selectedYear.value,
        division: selectedDivision.value,
        messageType: 'announcement',
        type: 'image',
        createdAt: new Date().toISOString(),
        isFromFirebase: false, // Mark as local frontend message
      };

      // Add to local frontend messages array
      setFrontendMessages(prev => [...prev, messageData]);
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Show success feedback
      Alert.alert('Success', 'Image displayed locally (not saved to database)');
      
    } catch (error) {
      console.error('Error displaying image:', error);
      Alert.alert('Error', 'Failed to display image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      // Check if it's a local frontend message
      const isLocalMessage = messageId.startsWith('frontend_');
      
      if (isLocalMessage) {
        // Remove from local frontend messages
        setFrontendMessages(prev => prev.filter(msg => msg.id !== messageId));
        Alert.alert('Success', 'Local message removed');
      } else {
        // Handle Firebase message deletion (if needed)
        const database = getDatabase();
        const chatPath = `teacher_announcements/${selectedYear.value}_${selectedDivision.value}`;
        const messageRef = ref(database, `${chatPath}/${messageId}`);
        
        await remove(messageRef);
        Alert.alert('Success', 'Firebase message deleted');
      }
      
      setShowDeleteModal(false);
      setMessageToDelete(null);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message. Please try again.');
    }
  };

  const handleDeleteMessage = (item) => {
    setMessageToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: () => openCamera()
        },
        { 
          text: 'Choose from Library', 
          onPress: () => openGallery()
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

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendImage(result.assets[0].uri);
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
        Alert.log('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
        exif: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (item) => {
    return item.teacherId === teacherId || item.employeeId === employeeId;
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <View style={styles.teacherInfo}>
          <Ionicons name="person-circle" size={20} color="#667eea" />
          <Text style={styles.teacherName}>
            {item.teacherName}
            {!item.isFromFirebase && (
              <Text style={styles.localLabel}> (Local)</Text>
            )}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          {isMyMessage(item) && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteMessage(item)}
            >
              <Ionicons name="trash-outline" size={16} color="#ff4757" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={[
        styles.messageBubble,
        !item.isFromFirebase && styles.localMessageBubble
      ]}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbox-ellipses-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubText}>
        Send the first announcement to {selectedYear?.label} - {selectedDivision?.label}
      </Text>
      
    </View>
  );

  const DeleteConfirmationModal = () => (
    <Modal
      transparent={true}
      visible={showDeleteModal}
      animationType="fade"
      onRequestClose={cancelDelete}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Ionicons name="warning" size={24} color="#ff4757" />
            <Text style={styles.modalTitle}>Delete Message</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            Are you sure you want to delete this message? This action cannot be undone.
          </Text>
          
          {messageToDelete && (
            <View style={styles.messagePreview}>
              {messageToDelete.type === 'image' ? (
                <View style={styles.imagePreview}>
                  <Ionicons name="image" size={16} color="#999" />
                  <Text style={styles.previewText}>Image message</Text>
                </View>
              ) : (
                <Text style={styles.previewText} numberOfLines={2}>
                  "{messageToDelete.text}"
                </Text>
              )}
              {!messageToDelete.isFromFirebase && (
                <Text style={styles.localPreviewNote}>(Local message)</Text>
              )}
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={cancelDelete}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteButtonModal]}
              onPress={confirmDelete}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {selectedYear?.label} - {selectedDivision?.label}
          </Text>
          <Text style={styles.headerSubtitle}>Teacher Announcements </Text>
        </View>
        
        <View style={styles.headerRightIcon}>
          <Ionicons name="megaphone" size={24} color="#fff" />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={getAllMessages()}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={showImagePicker}
              disabled={loading}
            >
              <Ionicons name="camera" size={40} color="#667eea" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder="Type Your Announcement (Local Only)..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || loading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!message.trim() || loading}
            >
              {loading ? (
                <Ionicons name="hourglass" size={24} color="#fff" />
              ) : (
                <Ionicons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputInfo}>
            <Text style={styles.characterCount}>
              {message.length}/500
            </Text>
            <Text style={styles.inputHint}>
              💡 This message will be sent to all students in {selectedYear?.label} - {selectedDivision?.label}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerRightIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  frontendNote: {
    fontSize: 12,
    color: '#ff6b35',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
    marginLeft: 6,
  },
  localLabel: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  messageBubble: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  localMessageBubble: {
    backgroundColor: '#ff6b35',
    borderLeftWidth: 3,
    borderLeftColor: '#ff8c42',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  messageImage: {
    width: 250,
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  inputInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: width * 0.9,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  messagePreview: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  localPreviewNote: {
    fontSize: 12,
    color: '#ff6b35',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  deleteButtonModal: {
    backgroundColor: '#ff4757',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default TeacherChatScreen;