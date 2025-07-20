import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DoubtStudentList = () => {
  const [searchText, setSearchText] = useState('');
  
  // Sample student data
  const students = [
    {
      id: '1',
      name: 'Emma Watson',
      lastQuestion: 'Can you explain problem #5?',
      time: '2:30 PM',
      unread: true
    },
    {
      id: '2',
      name: 'John Smith',
      lastQuestion: 'Thanks for the help!',
      time: 'Yesterday',
      unread: false
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      lastQuestion: 'I need help with the assignment',
      time: 'Yesterday',
      unread: true
    },
    {
      id: '4',
      name: 'Michael Brown',
      lastQuestion: 'When is the exam?',
      time: 'Monday',
      unread: false
    },
  ];

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.lastQuestion.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.studentItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0)}
              </Text>
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text 
                style={styles.question}
                numberOfLines={1}
              >
                {item.lastQuestion}
              </Text>
            </View>
            
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 10
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  studentItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a8cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  textContainer: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  time: {
    color: '#999',
    fontSize: 12
  },
  question: {
    color: '#666',
    fontSize: 14
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4a8cff',
    marginLeft: 10
  }
});

export default DoubtStudentList;