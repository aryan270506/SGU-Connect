import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const AdminChatScreen = ({ route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [adminName, setAdminName] = useState('Admin');
  const [imageLoading, setImageLoading] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  
  // Get year and division from navigation parameters
  const { year, division } = route.params || { year: '1st', division: 'A' };

  // Generate a unique ID for messages
  const generateId = () => Math.random().toString(36).substring(2, 9);

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
    if (message.trim() === '') return;

    const newMessage = {
      id: generateId(),
      text: message,
      year: year,
      division: division,
      year_division: `${year}_${division}`,
      sender: adminName,
      senderType: 'admin',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');

    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [message, year, division, adminName]);

  // Send image message
  const sendImage = async (imageUri) => {
    setImageLoading(true);
    try {
      const newMessage = {
        id: generateId(),
        imageUri: imageUri,
        year: year,
        division: division,
        year_division: `${year}_${division}`,
        sender: adminName,
        senderType: 'admin',
        timestamp: new Date(),
        type: 'image'
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
    const isAdmin = item.senderType === 'admin';
    const formattedTime = `${item.timestamp.getHours()}:${String(item.timestamp.getMinutes()).padStart(2, '0')}`;

    return (
      <View style={[
        styles.messageContainer,
        isAdmin && styles.adminMessageContainer
      ]}>
        <View style={styles.messageContent}>
          {isAdmin && (
            <Text style={styles.senderName}>{item.sender}</Text>
          )}
          <View style={[
            styles.messageBubble,
            isAdmin ? styles.adminMessageBubble : styles.studentMessageBubble
          ]}>
            {item.type === 'image' ? (
              <Image 
                source={{ uri: item.imageUri }} 
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
          </View>
          <Text style={styles.messageTime}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.chatSafeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatHeader}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>
            {year} Year, Division {division}
          </Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#c5c5c5" />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubText}>
              Messages sent here will be visible to all students of {year} Year, Division {division}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

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
              color={imageLoading ? "#B0BEC5" : "#4a6fa5"} 
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={`Message to ${year} Year, Division ${division}`}
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
            editable={!imageLoading}
          />
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            disabled={message.trim() === '' || imageLoading}
          >
            {imageLoading ? (
              <ActivityIndicator size={20} color="#B0BEC5" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={message.trim() === '' ? '#ccc' : 'white'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chatSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  chatHeader: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageContent: {
    maxWidth: '80%',
  },
  messageBubble: {
    backgroundColor: '#4a6fa5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
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
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4a6fa5',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminMessageContainer: {
    alignItems: 'flex-end',
  },
  adminMessageBubble: {
    backgroundColor: '#4a6fa5',
  },
  studentMessageBubble: {
    backgroundColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
});

export default AdminChatScreen;