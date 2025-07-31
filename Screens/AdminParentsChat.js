import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { database, auth } from './firebase';

const AdminParentsChat = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Years data
  const years = [
    { 
      id: '1st-year', 
      title: '1st Year Parents', 
      color: '#4a6fa5',
      icon: 'people-circle-outline'
    },
    { 
      id: '2nd-year', 
      title: '2nd Year Parents', 
      color: '#5886c1',
      icon: 'people-circle-outline'
    },
    { 
      id: '3rd-year', 
      title: '3rd Year Parents', 
      color: '#3f5e8f',
      icon: 'people-circle-outline'
    },
  ];

  // Fetch messages for a specific year from Firebase Realtime Database
  useEffect(() => {
    if (!selectedYear) return;

    setIsLoading(true);
    const adminMessagesRef = database.ref(`admin_parent_messages/${selectedYear}`);
    const parentMessagesRef = database.ref('parent_messages');

    const combineMessages = (adminSnap, parentSnap) => {
      const fetchedMessages = [];
      
      // Process admin messages
      if (adminSnap.exists()) {
        adminSnap.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          fetchedMessages.push({
            id: childSnapshot.key,
            ...message,
            sender: 'Admin',
            timestamp: new Date(message.timestamp),
          });
        });
      }
      
      // Process parent messages and filter by year
      if (parentSnap.exists()) {
        parentSnap.forEach((parentNode) => {
          parentNode.forEach((messageNode) => {
            const message = messageNode.val();
            if (message.year === selectedYear) {
              fetchedMessages.push({
                id: messageNode.key,
                ...message,
                sender: 'Parent',
                timestamp: new Date(message.timestamp),
              });
            }
          });
        });
      }
      // Sort messages by timestamp
      fetchedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(prev => ({
        ...prev,
        [selectedYear]: fetchedMessages,
      }));
      setIsLoading(false);
    };

    const onError = (error) => {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Unable to fetch messages');
      setIsLoading(false);
    };

    // Set up listeners for both message sources
    adminMessagesRef.on('value', (adminSnap) => {
      parentMessagesRef.once('value', (parentSnap) => {
        combineMessages(adminSnap, parentSnap);
      }, onError);
    }, onError);

    parentMessagesRef.on('value', (parentSnap) => {
      adminMessagesRef.once('value', (adminSnap) => {
        combineMessages(adminSnap, parentSnap);
      }, onError);
    }, onError);

    // Cleanup listeners
    return () => {
      adminMessagesRef.off();
      parentMessagesRef.off();
    };
  }, [selectedYear]);

  // Send text message to parents of selected year
  const sendMessage = async () => {
    if (currentMessage.trim() === '' || !selectedYear) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Authentication Error', 'Please log in first');
        return;
      }

      const newMessage = {
        text: currentMessage,
        sender: 'Admin',
        senderId: currentUser.uid,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      const messagesRef = database.ref(`admin_parent_messages/${selectedYear}`);
      const newMessageRef = messagesRef.push();
      
      await newMessageRef.set(newMessage);
      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Unable to send message');
    }
  };

  // Send image message
  const sendImage = async (imageUri) => {
    if (!selectedYear) return;
    
    setImageLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Authentication Error', 'Please log in first');
        return;
      }

      const newMessage = {
        imageUri: imageUri,
        sender: 'Admin',
        senderId: currentUser.uid,
        timestamp: new Date().toISOString(),
        type: 'image'
      };
      
      const messagesRef = database.ref(`admin_parent_messages/${selectedYear}`);
      const newMessageRef = messagesRef.push();
      
      await newMessageRef.set(newMessage);
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
  
  const goBackToYearSelection = () => {
    setSelectedYear(null);
  };

  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.sender === 'Parent' && styles.parentMessageContainer
    ]}>
      <View style={[
        styles.messageContent,
        item.sender === 'Parent' && styles.parentMessageContent
      ]}>
        <View style={[
          styles.messageBubble,
          item.sender === 'Parent' && styles.parentMessageBubble
        ]}>
          {item.type === 'image' ? (
            <Image 
              source={{ uri: item.imageUri }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[
              styles.messageText,
              item.sender === 'Parent' && styles.parentMessageText
            ]}>
              {item.text}
            </Text>
          )}
        </View>
        <Text style={styles.messageTime}>
          {item.sender === 'Parent' ? 'Parent' : 'You'} • 
          {item.timestamp ? `${item.timestamp.getHours()}:${String(item.timestamp.getMinutes()).padStart(2, '0')}` : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4a6fa5" barStyle="light-content" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          {selectedYear ? (
            <>
              <TouchableOpacity onPress={goBackToYearSelection} style={styles.menuButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {years.find(y => y.id === selectedYear)?.title}
              </Text>
            </>
          ) : (
            <Text style={styles.headerTitle}>Parents Chat</Text>
          )}
        </View>
        
        {!selectedYear ? (
          <View style={styles.yearSelectionContainer}>
            <Text style={styles.yearSelectionHeader}>
              Select a Year to Message Parents
            </Text>
            
            <View style={styles.yearBlocksContainer}>
              {years.map((year) => (
                <TouchableOpacity 
                  key={year.id}
                  style={[styles.yearBlock, { backgroundColor: year.color }]}
                  onPress={() => setSelectedYear(year.id)}
                >
                  <View style={styles.yearBlockContent}>
                    <Ionicons name={year.icon} size={36} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={styles.yearBlockTitle}>{year.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {isLoading ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Loading messages...</Text>
              </View>
            ) : (!messages[selectedYear] || messages[selectedYear].length === 0) ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={80} color="#c5c5c5" />
                <Text style={styles.emptyStateText}>No messages yet</Text>
                <Text style={styles.emptyStateSubText}>
                  Start sending messages to 
                  {' '}{years.find(y => y.id === selectedYear)?.title}
                </Text>
              </View>
            ) : (
              <FlatList
                data={messages[selectedYear]}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                inverted
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
                value={currentMessage}
                onChangeText={setCurrentMessage}
                placeholder={`Message to ${years.find(y => y.id === selectedYear)?.title}`}
                placeholderTextColor="#999"
                multiline
                editable={!imageLoading}
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={sendMessage}
                disabled={(currentMessage.trim() === '' && !imageLoading) || imageLoading}
              >
                {imageLoading ? (
                  <ActivityIndicator size={20} color="#B0BEC5" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={24} 
                    color={currentMessage.trim() === '' ? '#b8c7d9' : 'white'} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4a6fa5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  yearSelectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  yearSelectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  yearBlocksContainer: {
    alignItems: 'center',
  },
  yearBlock: {
    width: '90%',
    height: 100,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  yearBlockContent: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearBlockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'white',
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
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  parentMessageContainer: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
  },
  parentMessageContent: {
    maxWidth: '80%',
  },
  messageBubble: {
    backgroundColor: '#4a6fa5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  parentMessageBubble: {
    backgroundColor: '#e5e5ea',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  parentMessageText: {
    color: '#333',
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
  },
  sendButton: {
    backgroundColor: '#4a6fa5',
    width: 46,
    height: 46,
    borderRadius: 23,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminParentsChat;