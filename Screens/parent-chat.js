import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { firebase, database } from './firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParentsTeacherChat from './ParentsTeacherChat';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const Tab = createBottomTabNavigator();

const TeachersChatScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Teachers Chat Screen - Coming Soon</Text>
    </View>
  );
};

const AdminChatScreen = ({ route }) => {
  // States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [parentData, setParentData] = useState(null);

   const navigation = useNavigation();
  
  // Get the PRN from route params if available
  const routeStudentData = route.params?.studentData;
  const prn = routeStudentData?.prn || '9404041001'; // Default fallback (using id instead of prn_number)
  
  const flatListRef = useRef(null);

  // Fetch student and parent data from Firebase
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Try to find the student data using the ID (which is the actual PRN)
        const snapshot = await database.ref('Parents')
          .orderByChild('id')
          .equalTo(prn)
          .once('value');
        
        if (snapshot.exists()) {
          let foundData = null;
          snapshot.forEach((childSnapshot) => {
            foundData = childSnapshot.val();
          });
          
          if (foundData) {
            const student = {
              name: foundData.full_id || 'N/A', // Using full_id as name
              prn: foundData.id || 'N/A', // Using id as PRN
              email: foundData.email || 'N/A',
              branch: foundData.branch || 'N/A',
              division: foundData.division || 'N/A',
              admissionYear: foundData.year || 'N/A',
              parentNumber: foundData.password || 'N/A' // Using password as parent contact
            };
            
            setStudentData(student);
            setParentData({
              number: foundData.password || 'N/A' // Using password as parent contact
            });

            // Initialize with empty messages since we're not fetching from Firebase
            setMessages([]);
          }
        } else {
          console.log('No student found with ID:', prn);
          if (routeStudentData) {
            setStudentData(routeStudentData);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [prn]);

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
  
  // Send a new message (without saving to Firebase)
  const sendMessage = () => {
    if (newMessage.trim() === '' || !studentData) return;
    
    try {
      const newMessageObj = {
        id: Date.now().toString(), // Use timestamp as ID
        text: newMessage.trim(),
        isAdmin: false,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, newMessageObj]);
      setNewMessage('');
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 200);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  // Send image message
  const sendImage = async (imageUri) => {
    if (!studentData) return;
    
    setImageLoading(true);
    try {
      const newMessageObj = {
        id: Date.now().toString(),
        imageUri: imageUri,
        isAdmin: false,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'image'
      };
      
      setMessages(prevMessages => [...prevMessages, newMessageObj]);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 200);
      
      // Show success feedback
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

  // Open gallery
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
  
  // Render a message item
  const renderMessageItem = ({ item }) => {
    const isParent = !item.isAdmin;
    const messageDate = new Date(item.timestamp);
    const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={[
        styles.messageItem,
        isParent ? styles.parentMessage : styles.teacherMessage
      ]}>
        {!isParent && <Text style={styles.senderName}>Admin</Text>}
        
        {item.type === 'image' ? (
          <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>{formattedTime}</Text>
          {isParent && (
            <View style={styles.readStatus}>
              {item.read ? (
                <MaterialIcons name="done-all" size={14} color="#64B5F6" />
              ) : (
                <MaterialIcons name="done" size={14} color="#757575" />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // Render profile modal
  const renderProfileModal = () => {
    if (!studentData) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Profile</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {studentData.name.split(' ').map(word => word[0]).join('')}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <ProfileItem 
                icon="person" 
                label="Name" 
                value={studentData.name} 
              />
              <ProfileItem 
                icon="badge" 
                label="PRN" 
                value={studentData.parentNumber} 
              />
              <ProfileItem 
                icon="email" 
                label="Email" 
                value={studentData.email} 
              />
              <ProfileItem 
                icon="school" 
                label="Branch" 
                value={studentData.branch} 
              />
              <ProfileItem 
                icon="groups" 
                label="Division" 
                value={studentData.division} 
              />
              <ProfileItem 
                icon="calendar-today" 
                label="Year" 
                value={studentData.admissionYear} 
              />
              <ProfileItem 
                icon="phone" 
                label="Parent Contact" 
                value={studentData.prn} 
              />

               <TouchableOpacity
                style={{
                  marginTop: 24,
                  backgroundColor: '#2196F3',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() => {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Logout', 
                        onPress: () => {
                          navigation.reset({
                            index: 0,
                            routes: [{ name: 'ParentLogin' }]
                          });
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Loading indicator
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Render empty messages state
  const renderEmptyMessages = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="message" size={64} color="#2196F3" />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptyText}>Start a conversation with the admin</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Messages</Text>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          <MaterialIcons name="person" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Messages Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          ListEmptyComponent={renderEmptyMessages}
          contentContainerStyle={
            messages.length === 0 
              ? { flex: 1, justifyContent: 'center' } 
              : { paddingVertical: 16 }
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={showImagePicker}
            disabled={imageLoading}
          >
            <MaterialIcons 
              name="camera-alt" 
              size={24} 
              color={imageLoading ? "#B0BEC5" : "#2196F3"} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            editable={!imageLoading}
          />
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={newMessage.trim() === '' || imageLoading}
          >
            {imageLoading ? (
              <ActivityIndicator size={20} color="#B0BEC5" />
            ) : (
              <MaterialIcons 
                name="send" 
                size={24} 
                color={newMessage.trim() === '' ? '#B0BEC5' : '#2196F3'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Profile Modal */}
      {renderProfileModal()}
    </SafeAreaView>
  );
};

const ParentDashboard = ({ route }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Admin') {
            iconName = 'admin-panel-settings';
          } else if (route.name === 'Teachers') {
            iconName = 'people';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Admin" 
        component={AdminChatScreen} 
        initialParams={{ studentData: route.params?.studentData }}
      />
      <Tab.Screen 
        name="Teachers" 
        component={ParentsTeacherChat}
      />
    </Tab.Navigator>
  );
};

// Helper component for profile items
const ProfileItem = ({ icon, label, value }) => (
  <View style={styles.profileItem}>
    <MaterialIcons name={icon} size={20} color="#2196F3" />
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      <Text style={styles.profileItemValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#424242',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  profileButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  emptyText: {
    color: '#757575',
    marginTop: 8,
  },
  messageItem: {
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
    elevation: 1,
  },
  parentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3F2FD',
    borderBottomRightRadius: 4,
  },
  teacherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#424242',
    marginBottom: 4,
  },
  messageText: {
    color: '#333',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 5,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
  },
  readStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 40,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  profileItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#757575',
  },
  profileItemValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  }
});

export default ParentDashboard;