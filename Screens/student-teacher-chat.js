import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = ({ studentYear = "2nd Year", studentDiv = "A" })  => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Student Dashboard</Text>
      <View style={styles.studentInfo}>
        <Text style={styles.studentYear}>{studentYear}</Text>
        <Text style={styles.divider}>•</Text>
        <Text style={styles.studentDiv}>Division {studentDiv}</Text>
      </View>
    </View>
  </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
       
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>Your messages will appear here</Text>
      </View>

      {/* Compose Button (Floating) */}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6f42c1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    divider: {
    fontSize: 16,
    color: '#ffffff',
    marginHorizontal: 8,
    opacity: 0.8,
    },
      studentDiv: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  studentYear: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  composeButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default MessagesScreen;