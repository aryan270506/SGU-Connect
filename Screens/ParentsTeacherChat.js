import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Mock data for initial messages
const initialMessages = [
  { 
    id: '1', 
    text: 'Hello, how is my child doing?', 
    sender: 'parent',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'text',
    read: true
  },
  { 
    id: '2', 
    text: 'Hi there! Your child is performing well in class. They are very attentive and participates actively in discussions.', 
    sender: 'teacher',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'text',
    read: true
  },
];

const ParentsTeacherChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const flatListRef = useRef(null);

  // Auto-scroll when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'parent',
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [inputText]);

  // Delete message function
  const deleteMessage = useCallback((messageId) => {
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
  }, []);

  // Handle long press on message
  const handleMessageLongPress = useCallback((message) => {
    // Only allow deleting own messages (parent messages)
    if (message.sender === 'parent') {
      deleteMessage(message.id);
    }
  }, [deleteMessage]);

  // Send image message
  const sendImage = async (imageUri) => {
    setImageLoading(true);
    try {
      const newMessage = {
        id: Date.now().toString(),
        imageUri: imageUri,
        sender: 'parent',
        timestamp: new Date().toISOString(),
        type: 'image',
        read: false
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
      
      Alert.alert('Success', 'Image sent successfully!');
      
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  // Show image picker options
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

  // Open camera
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

  // Open gallery
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

  const renderMessage = useCallback(({ item }) => {
    const isParent = item.sender === 'parent';
    const messageDate = new Date(item.timestamp);
    const formattedTime = messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer, 
          isParent ? styles.parentMessage : styles.teacherMessage
        ]}
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={isParent ? 0.7 : 1}
        disabled={!isParent} // Only enable long press for parent messages
      >
        {/* Sender name for teacher messages */}
        {!isParent && (
          <Text style={styles.senderName}>Teacher</Text>
        )}
        
        {/* Message content */}
        {item.type === 'image' ? (
          <Image 
            source={{ uri: item.imageUri }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={[
            styles.messageText,
            isParent ? styles.parentMessageText : styles.teacherMessageText
          ]}>
            {item.text}
          </Text>
        )}

        {/* Message footer with time and read status */}
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            isParent ? styles.parentMessageTime : styles.teacherMessageTime
          ]}>
            {formattedTime}
          </Text>
          
          {/* Read status for parent messages */}
          {isParent && (
            <View style={styles.readStatus}>
              {item.read ? (
                <MaterialIcons name="done-all" size={14} color="rgba(255,255,255,0.8)" />
              ) : (
                <MaterialIcons name="done" size={14} color="rgba(255,255,255,0.6)" />
              )}
            </View>
          )}
        </View>

        {/* Delete hint for parent messages */}
        {isParent && (
          <View style={styles.deleteHint}>
            <Text style={styles.deleteHintText}>Long press to delete</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handleMessageLongPress]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parent-Teacher Chat</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Message Input Area */}
        <View style={styles.inputContainer}>
          {/* Image picker button */}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={showImagePicker}
            disabled={imageLoading}
          >
            <MaterialIcons 
              name="camera-alt" 
              size={24} 
              color={imageLoading ? "#B0BEC5" : "#007AFF"} 
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline={true}
            maxHeight={100}
            placeholderTextColor="#888"
            editable={!imageLoading}
          />
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            disabled={inputText.trim() === '' || imageLoading}
          >
            {imageLoading ? (
              <ActivityIndicator size={20} color="#B0BEC5" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={inputText.trim() === '' ? '#ccc' : '#007AFF'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  keyboardContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    position: 'relative',
  },
  parentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  teacherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  parentMessageText: {
    color: 'white',
  },
  teacherMessageText: {
    color: '#333',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 2,
  },
  parentMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  teacherMessageTime: {
    color: '#999',
  },
  readStatus: {
    marginLeft: 4,
  },
  deleteHint: {
    position: 'absolute',
    top: -20,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    opacity: 0,
  },
  deleteHintText: {
    color: 'white',
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default ParentsTeacherChat;