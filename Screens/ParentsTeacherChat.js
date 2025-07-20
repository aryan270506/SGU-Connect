import React, { useState, useCallback } from 'react';
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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for initial messages
const initialMessages = [
  { id: '1', text: 'Hello, how is my child doing?', sender: 'parent' },
  { id: '2', text: 'Hi there! Your child is performing well in class.', sender: 'teacher' },
];

const ParentsTeacherChat = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const sendMessage = useCallback(() => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: `${messages.length + 1}`,
      text: inputText,
      sender: 'parent' // In a real app, this would be dynamically set
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
  }, [inputText, messages.length]);

  const renderMessage = useCallback(({ item }) => (
    <View style={[
      styles.messageContainer, 
      item.sender === 'parent' ? styles.parentMessage : styles.teacherMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
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
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline={true}
            maxHeight={100}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={inputText.trim() === '' ? '#ccc' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    alignItems: 'center',
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
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  parentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  teacherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ParentsTeacherChat;