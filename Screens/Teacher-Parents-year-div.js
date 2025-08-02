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
import DataPreloaderTeacher from './DataPreloaderTeacher';

const AssignmentYearDivisionSelector = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [usingCachedData, setUsingCachedData] = useState(false);

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
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // First, try to load cached data from preloader
      const cachedTeacherData = await DataPreloaderTeacher.getCachedData('teacherData');
      const cachedMetadata = await DataPreloaderTeacher.getCachedData('teacherMetadata');
      
      if (cachedTeacherData && cachedMetadata && await DataPreloaderTeacher.isDataFresh()) {
        console.log('Using cached teacher data for assignment selector');
        setUsingCachedData(true);
        
        // Use cached data to populate the selector
        setupTeacherDataFromCache(cachedTeacherData, cachedMetadata);
        setLoading(false);
      } else {
        console.log('Cached data not available or stale, fetching from Firebase');
        setUsingCachedData(false);
        
        // Fallback to Firebase if cached data is not available or stale
        if (employeeId) {
          await fetchTeacherDataFromFirebase();
        } else {
          Alert.alert('Error', 'No teacher information available');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      // Fallback to Firebase on error
      if (employeeId) {
        await fetchTeacherDataFromFirebase();
      } else {
        Alert.alert('Error', 'Failed to load teacher data');
        setLoading(false);
      }
    }
  };

  const setupTeacherDataFromCache = (cachedTeacherData, cachedMetadata) => {
    try {
      setTeacherData(cachedTeacherData);
      
      // Use metadata for years and divisions if available
      const yearsData = cachedMetadata.years || cachedTeacherData.years || {};
      const divisionsData = cachedMetadata.divisions || cachedTeacherData.divisions || {};
      
      // Process years data
      const yearsArray = Object.entries(yearsData).map(([key, value]) => ({
        id: key,
        label: `${value} Year`,
        value: value
      }));
      setAvailableYears(yearsArray);

      // Process divisions data
      const divisionsArray = Object.entries(divisionsData).map(([key, value]) => ({
        id: key,
        label: `Division ${value}`,
        value: value
      }));
      setAvailableDivisions(divisionsArray);
      
      console.log(`Loaded from cache: ${yearsArray.length} years, ${divisionsArray.length} divisions`);
    } catch (error) {
      console.error('Error setting up cached data:', error);
      // Fallback to Firebase on error
      fetchTeacherDataFromFirebase();
    }
  };

  const fetchTeacherDataFromFirebase = async () => {
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
          
          console.log(`Loaded from Firebase: ${yearsArray.length} years, ${divisionsArray.length} divisions`);
        } else {
          Alert.alert('Error', 'Teacher data not found');
        }
        setLoading(false);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error fetching teacher data from Firebase:', error);
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
      navigation.navigate('AddAssignments', {
        selectedYear,
        selectedDivision,
        teacherId,
        employeeId,
        teacherName,
        usingCachedData // Pass this info to the next screen
      });
    } else {
      Alert.alert('Incomplete Selection', 'Please select both year and division');
    }
  };

  const handleRefreshData = async () => {
    if (!teacherData) return;
    
    setLoading(true);
    try {
      console.log('Refreshing teacher data...');
      
      // Force refresh the preloaded data
      await DataPreloaderTeacher.refreshData(teacherData);
      
      // Reload data from cache
      await initializeData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
      setLoading(false);
    }
  };

  const renderDataSourceIndicator = () => {
    if (loading) return null;
    
    return (
      <View style={styles.dataSourceContainer}>
        <Text style={styles.dataSourceText}>
          {usingCachedData ? '📱 Using cached data' : '🌐 Live data from server'}
        </Text>
        {usingCachedData && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefreshData}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Text style={styles.loadingText}>
            {usingCachedData ? 'Loading cached data...' : 'Fetching teacher data...'}
          </Text>
          <Text style={styles.loadingSubText}>
            This will be faster next time with cached data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Year & Division</Text>
        {teacherName && (
          <Text style={styles.teacherName}>Welcome, {teacherName}</Text>
        )}
      </View>

      {/* Data Source Indicator */}
      {renderDataSourceIndicator()}

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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
  dataSourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e8f4fd',
    borderBottomWidth: 1,
    borderBottomColor: '#d1ecf1',
  },
  dataSourceText: {
    fontSize: 14,
    color: '#0c5460',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
});

export default AssignmentYearDivisionSelector;