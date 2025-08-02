import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const StudentChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello Mrs. Johnson! I have a question about the homework.',
      sender: 'student',
      time: '10:30 AM',
      studentName: 'Emma Watson',
      studentAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      type: 'text'
    },
    {
      id: '2',
      text: 'Hi Emma! What would you like to know?',
      sender: 'teacher',
      time: '10:32 AM',
      type: 'text'
    },
    {
      id: '3',
      text: 'I\'m not sure about problem #5 in the math assignment.',
      sender: 'student',
      time: '10:33 AM',
      studentName: 'Emma Watson',
      studentAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      type: 'text'
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    
    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'teacher',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId) => {
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
          onPress: () => {
            setMessages(prevMessages => 
              prevMessages.filter(message => message.id !== messageId)
            );
          },
        },
      ]
    );
  };

  const handleLongPress = (item) => {
    // Only allow deletion of teacher's messages
    if (item.sender === 'teacher') {
      handleDeleteMessage(item.id);
    }
  };

  const sendImage = async (imageUri) => {
    setLoading(true);
    try {
      const message = {
        id: Date.now().toString(),
        imageUri: imageUri,
        sender: 'teacher',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image'
      };
      
      setMessages(prevMessages => [...prevMessages, message]);
      
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

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isTeacher = item.sender === 'teacher';
    
    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isTeacher ? styles.teacherMessage : styles.studentMessage
        ]}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        activeOpacity={isTeacher ? 0.7 : 1}
      >
        {!isTeacher && (
          <View style={styles.studentInfo}>
            <Image 
              source={{ uri: item.studentAvatar }} 
              style={styles.avatar} 
            />
            <Text style={styles.studentName}>{item.studentName}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isTeacher ? styles.teacherBubble : styles.studentBubble
        ]}>
          {item.type === 'image' ? (
            <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
          ) : (
            <Text style={isTeacher ? styles.teacherText : styles.studentText}>
              {item.text}
            </Text>
          )}
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
        
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with Parents</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={showImagePicker}
              disabled={loading}
            >
              <Ionicons name="camera" size={24} color="#4a8cff" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!newMessage.trim() || loading) && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={!newMessage.trim() || loading}
            >
              {loading ? (
                <Ionicons name="hourglass" size={24} color="#fff" />
              ) : (
                <Ionicons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  teacherMessage: {
    alignItems: 'flex-end',
  },
  studentMessage: {
    alignItems: 'flex-start',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  teacherBubble: {
    backgroundColor: '#4a8cff',
    borderBottomRightRadius: 2,
  },
  studentBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  teacherText: {
    color: '#fff',
    fontSize: 16,
  },
  studentText: {
    color: '#333',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  deleteHint: {
    fontSize: 10,
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 2,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4a8cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default StudentChatScreen;