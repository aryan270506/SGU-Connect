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
import { getDatabase, ref, push, onValue, serverTimestamp, remove, set } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const TeacherStudentDoubtReply = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get student data from navigation params
  const { student } = route.params || {};
  
  // You'll need to get teacher data from your auth context or pass it through navigation
  const teacherId = 'teacher_123'; // Get from your auth context
  const teacherName = 'Teacher Name'; // Get from your auth context
  const employeeId = 'emp_123'; // Get from your auth context

  useEffect(() => {
    if (student?.id) {
      fetchMessages();
    }
  }, [student?.id]);

  const fetchMessages = () => {
    try {
      const database = getDatabase();
      // Create a unique chat path using teacher and student IDs
      const chatPath = `teacher_student_chats/${teacherId}_${student.id}`;
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
      // Add message to local state only (no Firebase)
      const localMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        senderId: teacherId,
        senderName: teacherName,
        senderType: 'teacher',
        receiverId: student.id,
        receiverName: student.name,
        timestamp: Date.now(),
        messageType: 'doubt_reply',
        type: 'text',
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      // Add to local messages array
      setMessages(prevMessages => [...prevMessages, localMessage]);
      
      // Clear input
      setMessage('');
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
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
      // Add image message to local state only (no Firebase)
      const localMessage = {
        id: Date.now().toString(),
        imageUri: imageUri,
        senderId: teacherId,
        senderName: teacherName,
        senderType: 'teacher',
        receiverId: student.id,
        receiverName: student.name,
        timestamp: Date.now(),
        messageType: 'doubt_reply',
        type: 'image',
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      // Add to local messages array
      setMessages(prevMessages => [...prevMessages, localMessage]);
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 const deleteMessage = async (messageId, messageSenderId) => {
  // Check if the message belongs to the current teacher
  if (messageSenderId !== teacherId) {
    Alert.alert('Error', 'You can only delete your own messages');
    return;
  }

  Alert.alert(
    'Delete Message',
    'Are you sure you want to delete this message?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Since messages are stored in local state only, 
            // remove the message from the local messages array
            setMessages(prevMessages => 
              prevMessages.filter(message => message.id !== messageId)
            );
            
            // Optional: If you want to also try to delete from Firebase
            // (in case some messages are stored there), you can keep this part:
            /*
            const database = getDatabase();
            const chatPath = `teacher_student_chats/${teacherId}_${student.id}`;
            const messageRef = ref(database, `${chatPath}/${messageId}`);
            await remove(messageRef);
            */
            
          } catch (error) {
            console.error('Error deleting message:', error);
            Alert.alert('Error', 'Failed to delete message. Please try again.');
          }
        },
      },
    ]
  );
};

  const handleMessageLongPress = (item) => {
    // Only show delete option for messages from the current teacher
    if (item.senderId === teacherId) {
      deleteMessage(item.id, item.senderId);
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
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

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

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === teacherId;
    const isTeacherMessage = item.senderType === 'teacher';
    
    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={isOwnMessage ? 0.7 : 1}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <Ionicons 
              name={isTeacherMessage ? "person-circle" : "school"} 
              size={20} 
              color={isTeacherMessage ? "#667eea" : "#28a745"} 
            />
            <Text style={[
              styles.senderName,
              { color: isTeacherMessage ? "#667eea" : "#28a745" }
            ]}>
              {item.senderName}
            </Text>
            {isOwnMessage && (
              <Text style={styles.ownMessageIndicator}>(You)</Text>
            )}
          </View>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
            {isOwnMessage && (
              <Ionicons 
                name="trash-outline" 
                size={14} 
                color="#ccc" 
                style={styles.deleteIcon}
              />
            )}
          </View>
        </View>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {item.type === 'image' ? (
            <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
          )}
        </View>
        {isOwnMessage && (
          <Text style={styles.longPressHint}>Long press to delete</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbox-ellipses-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubText}>
        Start the conversation with {student?.name}
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
            {student?.name || 'Student'}
          </Text>
          <Text style={styles.headerSubtitle}>Doubt Discussion</Text>
        </View>
        
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {student?.name?.charAt(0) || 'S'}
          </Text>
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
              <Ionicons name="camera" size={24} color="#667eea" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer..."
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
                <Ionicons name="hourglass" size={20} color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.characterCount}>
            {message.length}/500
          </Text>
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
    fontSize: 14,
    marginTop: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  ownMessageIndicator: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '400',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteIcon: {
    marginLeft: 6,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#667eea',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  longPressHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default TeacherStudentDoubtReply;