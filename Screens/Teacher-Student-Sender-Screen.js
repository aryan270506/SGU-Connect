import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';

const TeacherStudentSenderPage = ({ route, navigation }) => {
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [classInfo, setClassInfo] = useState('');

  // Get the selected year and division from navigation params
  useEffect(() => {
    if (route.params) {
      const { selectedYear, selectedDivision, classInfo: receivedClassInfo } = route.params;
      setClassInfo(receivedClassInfo || `${selectedYear?.label} - ${selectedDivision?.label}`);
    }
  }, [route.params]);

  const sendMessage = () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      classInfo: classInfo
    };

    setSentMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Show success message
    Alert.alert('Success', `Message sent to ${classInfo}!`);
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.classInfo}>To: {item.classInfo}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    </View>
  );

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Send Messages</Text>
          <Text style={styles.headerSubtitle}>
            {classInfo ? `To: ${classInfo}` : 'Select class first'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={sentMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Empty State */}
      {sentMessages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No messages sent yet</Text>
          <Text style={styles.emptyStateSubtext}>
            {classInfo ? `Start typing to send your first message to ${classInfo}` : 'Select a class first'}
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={`Type your message to ${classInfo}...`}
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
          editable={!!classInfo}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { opacity: (message.trim() && classInfo) ? 1 : 0.5 }
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || !classInfo}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  messageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '80%',
    minWidth: 60,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 5,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontStyle: 'italic',
    marginRight: 10,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeacherStudentSenderPage;