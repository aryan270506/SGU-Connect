import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ClassSelectionScreen = ({ onChatEnter }) => {
  // Predefined years and divisions
  const years = ['1st', '2nd', '3rd'];
  const divisions = ['A', 'B', 'C'];
  
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedDivision, setSelectedDivision] = useState(divisions[0]);

const handleChatEnter = () => {
  // Change 'AdminChat' to 'AdminChatScreen' to match your navigator
  navigation.navigate('AdminChatScreen', {
    year: selectedYear,
    division: selectedDivision,
  });
};
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.selectionSafeArea}>
      <View style={styles.selectionContainer}>
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionTitle}>Select Class</Text>
        </View>

        <View style={styles.selectionContent}>
          {/* Year Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Year</Text>
            <View style={styles.optionsGrid}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionButton,
                    selectedYear === year && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedYear === year && styles.selectedOptionText,
                    ]}
                  >
                    {year} Year
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Division Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Division</Text>
            <View style={styles.optionsGrid}>
              {divisions.map(division => (
                <TouchableOpacity
                  key={division}
                  style={[
                    styles.optionButton,
                    selectedDivision === division && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedDivision(division)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedDivision === division && styles.selectedOptionText,
                    ]}
                  >
                    Division {division}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary and Button */}
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText}>
              Selected: {selectedYear} Year, Division {selectedDivision}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.enterChatButton}
           onPress={handleChatEnter}
          >
            <Text style={styles.enterChatText}>Enter Chat Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  selectionSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  selectionContainer: {
    flex: 1,
  },
  selectionHeader: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  selectionContent: {
    flex: 1,
    padding: 20,
  },
  selectionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '30%',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#4a6fa5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
  },
  selectionSummary: {
    backgroundColor: '#e8eef3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  enterChatButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  enterChatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ClassSelectionScreen;