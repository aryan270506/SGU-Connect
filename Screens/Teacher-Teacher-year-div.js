import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue } from 'firebase/database';

const TeacherTeacherYearDivisionSelector = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  const route = useRoute();
  const navigation = useNavigation();
  
  // Get teacher data from route params or navigation state
  const {
    teacherId,
    employeeId,
    teacherName,
    years,
    selectedDivisions
  } = route.params || {};

  useEffect(() => {
    if (employeeId) {
      fetchTeacherData();
    }
  }, [employeeId]);

  const fetchTeacherData = async () => {
    try {
      const database = getDatabase();
      const teachersRef = ref(database, 'Faculty');
      
      onValue(teachersRef, (snapshot) => {
        const teachersData = snapshot.val();
        let foundTeacher = null;

        // Find the teacher by employee_id
        for (const key in teachersData) {
          if (teachersData[key].employee_id === employeeId) {
            foundTeacher = teachersData[key];
            break;
          }
        }

        if (foundTeacher) {
          setTeacherData(foundTeacher);
          
          // Process years data
          const yearsData = foundTeacher.years || {};
          const yearsArray = Object.entries(yearsData).map(([key, value]) => ({
            id: key,
            label: `${value} Year`,
            value: value
          }));
          setAvailableYears(yearsArray);

          // Process divisions data
          const divisionsData = foundTeacher.divisions || {};
          const divisionsArray = Object.entries(divisionsData).map(([key, value]) => ({
            id: key,
            label: `Division ${value}`,
            value: value
          }));
          setAvailableDivisions(divisionsArray);
        } else {
          Alert.alert('Error', 'Teacher data not found');
        }
        setLoading(false);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      Alert.alert('Error', 'Failed to load teacher data');
      setLoading(false);
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division);
  };

  const handleSubmit = () => {
    if (selectedYear && selectedDivision) {
      // Navigate to chat screen with selected data
      navigation.navigate('TeacherTeacherChat', {
        selectedYear,
        selectedDivision,
        teacherId,
        employeeId,
        teacherName
      });
    } else {
      Alert.alert('Incomplete Selection', 'Please select both year and division');
    }
  };

  const renderYearOptions = () => {
    if (availableYears.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No years assigned to this teacher</Text>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year.id}
            style={[
              styles.optionButton,
              selectedYear?.id === year.id && styles.selectedOption,
            ]}
            onPress={() => handleYearSelect(year)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedYear?.id === year.id && styles.selectedOptionText,
              ]}
            >
              {year.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDivisionOptions = () => {
    if (availableDivisions.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No divisions assigned to this teacher</Text>
        </View>
      );
    }

    return (
      <View style={styles.divisionsContainer}>
        {availableDivisions.map((division) => (
          <TouchableOpacity
            key={division.id}
            style={[
              styles.divisionButton,
              selectedDivision?.id === division.id && styles.selectedOption,
            ]}
            onPress={() => handleDivisionSelect(division)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedDivision?.id === division.id && styles.selectedOptionText,
              ]}
            >
              {division.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading teacher data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
    

      <View style={styles.content}>
        {/* Year Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Year</Text>
          {renderYearOptions()}
        </View>

        {/* Division Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Division</Text>
          {renderDivisionOptions()}
        </View>

        {/* Selection Display */}
        {(selectedYear || selectedDivision) && (
          <View style={styles.selectionDisplay}>
            <Text style={styles.selectionTitle}>Your Selection:</Text>
            <Text style={styles.selectionText}>
              {selectedYear ? `Year: ${selectedYear.label}` : ''}
              {selectedYear && selectedDivision ? ' | ' : ''}
              {selectedDivision ? `Division: ${selectedDivision.value}` : ''}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedYear || !selectedDivision) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!selectedYear || !selectedDivision}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Teacher Info */}
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#667eea',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  teacherName: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  divisionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  divisionButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  selectionDisplay: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  teacherInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  teacherInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  teacherInfoText: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 4,
  },
});

export default TeacherTeacherYearDivisionSelector;