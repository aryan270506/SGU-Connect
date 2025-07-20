import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminChatScreen = ({ year, division, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [adminName, setAdminName] = useState('Admin');

  // Generate a unique ID for messages
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: generateId(),
      text: message,
      year: year,
      division: division,
      year_division: `${year}_${division}`,
      sender: adminName,
      senderType: 'admin',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.senderType === 'admin' && styles.adminMessageContainer
    ]}>
      <View style={styles.messageContent}>
        {item.senderType === 'admin' && (
          <Text style={styles.senderName}>{item.sender}</Text>
        )}
        <View style={[
          styles.messageBubble,
          item.senderType === 'admin' ? styles.adminMessageBubble : styles.studentMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={styles.messageTime}>
          {`${item.timestamp.getHours()}:${String(item.timestamp.getMinutes()).padStart(2, '0')}`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.chatSafeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={`Message to ${year} Year, Division ${division}`}
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="white" />
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