import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { database } from './firebase';
import { ref, onValue, push, set, off, query, orderByChild, equalTo } from 'firebase/database';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const AdminTeacherChat = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('All Teachers');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [teacherGroups, setTeacherGroups] = useState({
    'All Teachers': [],
    '1st Year': [],
    '2nd Year': [],
    '3rd Year': [],
  });
  
  // Fetch teachers from Firebase
  useEffect(() => {
    const teachersRef = ref(database, 'Faculty');
    
    const fetchTeachers = onValue(teachersRef, (snapshot) => {
      const teachersData = snapshot.val();
      const allTeachers = [];
      const firstYearTeachers = [];
      const secondYearTeachers = [];
      const thirdYearTeachers = [];
      
      if (teachersData) {
        Object.keys(teachersData).forEach(key => {
          const teacher = teachersData[key];
          const teacherObj = {
            id: teacher.employee_id,
            name: teacher.name,
            year: teacher.years ? teacher.years.e || '1st Year' : '1st Year',
            subjects: teacher.subjects ? teacher.subjects.e : '',
            division: teacher.divisions ? teacher.divisions.e : 'A'
          };
          
          allTeachers.push(teacherObj);
          
          if (teacherObj.year.includes('1st')) {
            firstYearTeachers.push(teacherObj);
          } else if (teacherObj.year.includes('2nd')) {
            secondYearTeachers.push(teacherObj);
          } else if (teacherObj.year.includes('3rd')) {
            thirdYearTeachers.push(teacherObj);
          }
        });
      }
      
      setTeacherGroups({
        'All Teachers': allTeachers,
        '1st Year': firstYearTeachers,
        '2nd Year': secondYearTeachers,
        '3rd Year': thirdYearTeachers,
      });
    }, (error) => {
      console.error('Error fetching teachers:', error);
      setConnectionStatus('error');
    });
    
    return () => {
      off(teachersRef);
    };
  }, []);

  // Listen for messages when group is selected (not for individual teachers)
  useEffect(() => {
    if (!selectedGroup) return;
    
    const year = selectedGroup.split(' ')[0];
    const messagesRef = ref(database, `chats/year_${year}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      const formattedMessages = [];
      
      if (messagesData) {
        Object.keys(messagesData).forEach(key => {
          const msg = messagesData[key];
          formattedMessages.push({
            id: key,
            text: msg.text,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
          });
        });
      }
      
      const chatKey = getCurrentChatKey();
      setMessages(prev => ({
        ...prev,
        [chatKey]: formattedMessages,
      }));
    }, (error) => {
      console.error('Error fetching messages:', error);
      setConnectionStatus('error');
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedGroup]);

  // Send message - only to Firebase for groups, local state for teachers
  const sendMessage = async () => {
    if (currentMessage.trim() === '') return;
    
    const chatKey = getCurrentChatKey();
    const newMessage = {
      id: Date.now().toString(), // Temporary ID for local messages
      text: currentMessage,
      sender: 'Admin',
      timestamp: new Date(),
    };

    if (selectedTeacher) {
      // For teacher chats - store locally only
      setMessages(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), newMessage],
      }));
    } else if (selectedGroup) {
      // For group chats - send to Firebase
      try {
        const year = selectedGroup.split(' ')[0];
        const messagesRef = ref(database, `chats/year_${year}`);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
          ...newMessage,
          timestamp: newMessage.timestamp.getTime(), // Convert to timestamp number
        });
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
        return;
      }
    }
    
    setCurrentMessage('');
  };

  // Animation for drawer
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  
  // Toggle drawer
  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Go back to teacher list view
  const goBackToTeacherList = () => {
    setSelectedTeacher(null);
    setSelectedGroup(null);
  };

  // Render teacher item
  const renderTeacherItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.teacherItem}
      onPress={() => {
        setSelectedTeacher(item);
        setSelectedGroup(null);
        // Initialize empty messages array for this teacher if not exists
        if (!messages[item.id]) {
          setMessages(prev => ({ ...prev, [item.id]: [] }));
        }
      }}
    >
      <View style={styles.teacherAvatar}>
        <Text style={styles.teacherInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render message item
  const renderMessageItem = ({ item }) => {
    const isSent = item.sender === 'Admin';
    const timestamp = item.timestamp instanceof Date ? 
      item.timestamp : 
      new Date(item.timestamp);
    
    return (
      <View style={[
        styles.messageContainer,
        isSent ? styles.sentMessageContainer : styles.receivedMessageContainer
      ]}>
        <View style={[
          styles.messageContent,
          isSent ? styles.sentMessageContent : styles.receivedMessageContent
        ]}>
          <View style={[
            styles.messageBubble,
            isSent ? styles.sentMessageBubble : styles.receivedMessageBubble
          ]}>
            <Text style={isSent ? styles.sentMessageText : styles.receivedMessageText}>
              {item.text}
            </Text>
          </View>
          <Text style={[
            styles.messageTime,
            isSent ? styles.sentMessageTime : styles.receivedMessageTime
          ]}>
            {`${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}`}
          </Text>
        </View>
      </View>
    );
  };

  // Get current chat key (teacher id or group name)
  const getCurrentChatKey = () => {
    if (selectedTeacher) return selectedTeacher.id;
    if (selectedGroup) return selectedGroup;
    return null;
  };

  // Get current chat title
  const getCurrentChatTitle = () => {
    if (selectedTeacher) return selectedTeacher.name;
    if (selectedGroup) return `${selectedGroup} Group`;
    return activeSection === 'All Teachers' ? 'All Teachers' : `${activeSection} Teachers`;
  };

  // Get placeholder text for message input
  const getInputPlaceholder = () => {
    if (selectedTeacher) return `Message to ${selectedTeacher.name}`;
    if (selectedGroup) return `Message to ${selectedGroup} Group`;
    return 'Type a message';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4a6fa5" barStyle="light-content" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {selectedTeacher || selectedGroup ? (
            <>
              <TouchableOpacity onPress={goBackToTeacherList} style={styles.menuButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{getCurrentChatTitle()}</Text>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                <Ionicons name="menu" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{getCurrentChatTitle()}</Text>
            </>
          )}
        </View>
        
        {!selectedTeacher && !selectedGroup ? (
          /* Teacher List View */
          <FlatList
            style={styles.teacherListContainer}
            data={teacherGroups[activeSection]}
            renderItem={renderTeacherItem}
            keyExtractor={item => `teacher_${item.id}`}
            ListHeaderComponent={
              <Text style={styles.teacherListHeader}>
                {activeSection === 'All Teachers' 
                  ? `All Teachers (${teacherGroups[activeSection].length})` 
                  : `${activeSection} Teachers (${teacherGroups[activeSection].length})`}
              </Text>
            }
          />
        ) : (
          /* Chat View (Individual or Group) */
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {/* Messages List */}
            {!messages[getCurrentChatKey()] || messages[getCurrentChatKey()].length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={80} color="#c5c5c5" />
                <Text style={styles.emptyStateText}>No messages yet</Text>
                <Text style={styles.emptyStateSubText}>
                  {selectedTeacher 
                    ? `Start a conversation with ${selectedTeacher.name}`
                    : `Start a conversation with ${selectedGroup} Group`}
                </Text>
              </View>
            ) : (
              <FlatList
                data={messages[getCurrentChatKey()]}
                renderItem={renderMessageItem}
                keyExtractor={item => `message_${item.id}`}
                contentContainerStyle={styles.messagesList}
              />
            )}
            
            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={currentMessage}
                onChangeText={setCurrentMessage}
                placeholder={getInputPlaceholder()}
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={sendMessage}
                disabled={currentMessage.trim() === ''}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={currentMessage.trim() === '' ? '#b8c7d9' : 'white'} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
      
      {/* Drawer Overlay */}
      {drawerOpen && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        />
      )}
      
      {/* Side Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX }] }
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Admin Chat</Text>
        </View>
        
        <ScrollView style={styles.drawerContent}>
          <View style={styles.drawerSection}>
            <Text style={styles.drawerSectionTitle}>CHAT ROOMS</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.drawerItem, activeSection === 'All Teachers' && styles.activeDrawerItem]}
            onPress={() => {
              setActiveSection('All Teachers');
              setSelectedGroup(null);
              setSelectedTeacher(null);
              toggleDrawer();
            }}
          >
            <Ionicons 
              name="school" 
              size={24} 
              color={activeSection === 'All Teachers' ? '#4a6fa5' : '#555'} 
            />
            <Text 
              style={[
                styles.drawerItemText, 
                activeSection === 'All Teachers' && styles.activeDrawerItemText
              ]}
            >
              All Teachers
            </Text>
          </TouchableOpacity>
          
          <View style={styles.drawerSection}>
            <Text style={styles.drawerSectionTitle}>TEACHER GROUPS</Text>
          </View>
          
          {['1st Year', '2nd Year', '3rd Year'].map((year) => (
            <TouchableOpacity 
              key={year}
              style={[styles.drawerItem, activeSection === year && styles.activeDrawerItem]}
              onPress={() => {
                setActiveSection(year);
                setSelectedTeacher(null);
                setSelectedGroup(year);
                toggleDrawer();
              }}
            >
              <Ionicons 
                name="people" 
                size={24} 
                color={activeSection === year ? '#4a6fa5' : '#555'} 
              />
              <Text 
                style={[
                  styles.drawerItemText, 
                  activeSection === year && styles.activeDrawerItemText
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
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
  },
  teacherListContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teacherListHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a6fa5',
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a6fa5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teacherInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  teacherSubject: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'white',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  drawerHeader: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  drawerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  activeDrawerItem: {
    backgroundColor: '#e6f0fa',
    borderLeftWidth: 4,
    borderLeftColor: '#4a6fa5',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 32,
    color: '#555',
  },
  activeDrawerItemText: {
    color: '#4a6fa5',
    fontWeight: '600',
  },
  drawerSection: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 5,
  },
  drawerSectionTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
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
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
  },
  receivedMessageContainer: {
    alignItems: 'flex-start',
  },

  // Message content styles
  messageContent: {
    maxWidth: '80%',
  },
  sentMessageContent: {
    alignItems: 'flex-end',
  },
  receivedMessageContent: {
    alignItems: 'flex-start',
  },

  // Message bubble styles
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sentMessageBubble: {
    backgroundColor: '#4a6fa5',
    borderBottomRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },

  // Message text styles
  sentMessageText: {
    color: 'white',
    fontSize: 16,
  },
  receivedMessageText: {
    color: 'black',
    fontSize: 16,
  },

  // Message time styles
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    marginRight: 4,
  },
  sentMessageTime: {
    color: '#777',
    alignSelf: 'flex-end',
  },
  receivedMessageTime: {
    color: '#777',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
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

export default AdminTeacherChat;