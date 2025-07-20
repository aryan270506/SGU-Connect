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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StudentChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello Mrs. Johnson! I have a question about the homework.',
      sender: 'student',
      time: '10:30 AM',
      studentName: 'Emma Watson',
      studentAvatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    {
      id: '2',
      text: 'Hi Emma! What would you like to know?',
      sender: 'teacher',
      time: '10:32 AM'
    },
    {
      id: '3',
      text: 'I\'m not sure about problem #5 in the math assignment.',
      sender: 'student',
      time: '10:33 AM',
      studentName: 'Emma Watson',
      studentAvatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    
    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'teacher',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isTeacher = item.sender === 'teacher';
    
    return (
      <View style={[
        styles.messageContainer,
        isTeacher ? styles.teacherMessage : styles.studentMessage
      ]}>
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
          <Text style={isTeacher ? styles.teacherText : styles.studentText}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
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
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
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
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a8cff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentChatScreen;