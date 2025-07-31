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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getDatabase, ref, push, onValue, serverTimestamp } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const TeacherStudentDoubtReply = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const database = getDatabase();
      const chatPath = `teacher_announcements/${selectedYear.value}_${selectedDivision.value}`;
      const messagesRef = ref(database, chatPath);
      
      const messageData = {
        text: message.trim(),
        teacherId: teacherId,
        employeeId: employeeId,
        teacherName: teacherName,
        timestamp: serverTimestamp(),
        year: selectedYear.value,
        division: selectedDivision.value,
        messageType: 'announcement',
        type: 'text',
        createdAt: new Date().toISOString(),
      };

      await push(messagesRef, messageData);
      setMessage('');
      
      // Show success feedback
      Alert.alert('Success', 'Message sent successfully!');
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendImage = async (imageUri) => {
    setLoading(true);
    try {
      const database = getDatabase();
      const chatPath = `teacher_announcements/${selectedYear.value}_${selectedDivision.value}`;
      const messagesRef = ref(database, chatPath);
      
      const messageData = {
        imageUri: imageUri,
        teacherId: teacherId,
        employeeId: employeeId,
        teacherName: teacherName,
        timestamp: serverTimestamp(),
        year: selectedYear.value,
        division: selectedDivision.value,
        messageType: 'announcement',
        type: 'image',
        createdAt: new Date().toISOString(),
      };

      await push(messagesRef, messageData);
      
      // Show success feedback
      Alert.alert('Success', 'Image sent successfully!');
      
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setLoading(false);
    }
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
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
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

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <View style={styles.teacherInfo}>
          <Ionicons name="person-circle" size={20} color="#667eea" />
          <Text style={styles.teacherName}>{item.teacherName}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
      </View>
      <View style={styles.messageBubble}>
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
          <Text style={styles.headerSubtitle}>Students Doubts</Text>
        </View>
        
        
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
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
              placeholder="Type Your Answer..."
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
    fontSize: 24,
    marginTop: 2,
  },
  headerRight: {
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
  timestamp: {
    fontSize: 12,
    color: '#999',
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
    color: '#667eea',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});

export default TeacherStudentDoubtReply;