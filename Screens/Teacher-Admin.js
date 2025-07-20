import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import TeacherAdminChatScreen from './teacher-admin-chat';
import TeacherTeacherChatScreen from './Teacher-Teacher-chat';
import TeacherTeacherYearDivisionSelector from './Teacher-Teacher-year-div.js'; // Assuming this is the correct path for the year division selector screen

const RoleSelectionScreen = () => {
  const [selectedOption, setSelectedOption] = useState('Admin');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with toggle buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === 'Admin' && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption('Admin')}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === 'Admin' && styles.selectedText,
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === 'Teachers' && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption('Teachers')}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === 'Teachers' && styles.selectedText,
            ]}
          >
            Teachers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content area that toggles between screens */}
      <View style={styles.content}>
        {selectedOption === 'Admin' ? (
          <TeacherAdminChatScreen />
        ) : (
          <TeacherTeacherYearDivisionSelector />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 40,
    borderRadius: 200,
  },
  selectedOption: {
    backgroundColor: '#6200ee',
  },
  optionText: {
    fontSize: 16,
    color: '#757575',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,  // This will make the content area take up remaining space
  },
});

export default RoleSelectionScreen;