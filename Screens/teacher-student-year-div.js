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
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataPreloaderTeacher from './DataPreloaderTeacher'; // Adjust path as needed

const YearDivisionSelector = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadMessage, setPreloadMessage] = useState('');

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
    loadTeacherData();
    
    // Set up preloader progress listener
    const progressListener = (progress) => {
      setPreloadProgress(progress.progress);
      setPreloadMessage(progress.message);
      setIsPreloading(!progress.isComplete);
    };
    
    DataPreloaderTeacher.addProgressListener(progressListener);
    
    return () => {
      DataPreloaderTeacher.removeProgressListener(progressListener);
    };
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // First try to load from cached data (AsyncStorage)
      const cachedTeacherData = await DataPreloaderTeacher.getCachedData('teacherData');
      const isDataFresh = await DataPreloaderTeacher.isDataFresh();
      
      if (cachedTeacherData && isDataFresh) {
        console.log('Using cached teacher data');
        await setupTeacherData(cachedTeacherData);
        setLoading(false);
        return;
      }
      
      // If no cached data or data is stale, fetch from Firebase
      if (employeeId) {
        await fetchTeacherDataFromFirebase();
      } else {
        // Try to get from stored session data
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          if (parsedData.employeeId) {
            await fetchTeacherDataFromFirebaseById(parsedData.employeeId);
          } else {
            Alert.alert('Error', 'No teacher data found in session');
            setLoading(false);
          }
        } else {
          Alert.alert('Error', 'No session data found');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
      Alert.alert('Error', 'Failed to load teacher data');
      setLoading(false);
    }
  };

  const fetchTeacherDataFromFirebase = async () => {
    try {
      const database = getDatabase();
      const teachersRef = ref(database, 'Faculty');
      
      onValue(teachersRef, async (snapshot) => {
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
          await setupTeacherData(foundTeacher);
          
          // Trigger preloading in the background
          setIsPreloading(true);
          try {
            await DataPreloaderTeacher.preloadAllData(foundTeacher);
          } catch (preloadError) {
            console.error('Error during preloading:', preloadError);
            // Don't show error to user as this is background process
          }
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

  const fetchTeacherDataFromFirebaseById = async (id) => {
    try {
      const database = getDatabase();
      const teachersRef = ref(database, 'Faculty');
      
      onValue(teachersRef, async (snapshot) => {
        const teachersData = snapshot.val();
        let foundTeacher = null;

        // Find the teacher by employee_id
        for (const key in teachersData) {
          if (teachersData[key].employee_id === id) {
            foundTeacher = teachersData[key];
            break;
          }
        }

        if (foundTeacher) {
          await setupTeacherData(foundTeacher);
          
          // Trigger preloading in the background
          setIsPreloading(true);
          try {
            await DataPreloaderTeacher.preloadAllData(foundTeacher);
          } catch (preloadError) {
            console.error('Error during preloading:', preloadError);
          }
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

  const setupTeacherData = async (foundTeacher) => {
    try {
      setTeacherData(foundTeacher);
      
      // Use DataPreloader methods to get available years and divisions
      const years = await DataPreloaderTeacher.getAvailableYears();
      const divisions = await DataPreloaderTeacher.getAvailableDivisions();
      
      // If preloader methods return empty, fall back to direct processing
      if (years.length === 0 && foundTeacher.years) {
        const yearsData = foundTeacher.years || {};
        const yearsArray = Object.entries(yearsData).map(([key, value]) => ({
          id: key,
          label: `${value} Year`,
          value: value
        }));
        setAvailableYears(yearsArray);
      } else {
        setAvailableYears(years);
      }

      if (divisions.length === 0 && foundTeacher.divisions) {
        const divisionsData = foundTeacher.divisions || {};
        const divisionsArray = Object.entries(divisionsData).map(([key, value]) => ({
          id: key,
          label: `Division ${value}`,
          value: value
        }));
        setAvailableDivisions(divisionsArray);
      } else {
        setAvailableDivisions(divisions);
      }

      console.log('Teacher data setup complete:', {
        years: years.length > 0 ? years : Object.keys(foundTeacher.years || {}),
        divisions: divisions.length > 0 ? divisions : Object.keys(foundTeacher.divisions || {})
      });
    } catch (error) {
      console.error('Error setting up teacher data:', error);
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division);
  };

  const handleSubmit = async () => {
    if (selectedYear && selectedDivision) {
      // Get cached students data for better performance
      const cachedStudents = await DataPreloaderTeacher.getCachedData('assignedStudents');
      
      // Navigate to chat screen with selected data and cached students
      navigation.navigate('TeacherChatScreen', {
        selectedYear,
        selectedDivision,
        teacherId: teacherData?.employee_id || employeeId,
        employeeId: teacherData?.employee_id || employeeId,
        teacherName: teacherData?.name || teacherName,
        cachedStudents: cachedStudents || [],
        teacherData: teacherData
      });
    } else {
      Alert.alert('Incomplete Selection', 'Please select both year and division');
    }
  };

  const handleRefreshData = async () => {
    if (!teacherData) return;
    
    setLoading(true);
    setIsPreloading(true);
    
    try {
      await DataPreloaderTeacher.refreshData(teacherData);
      await setupTeacherData(teacherData);
      Alert.alert('Success', 'Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const renderYearOptions = () => {
    if (availableYears.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No years assigned to this teacher</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefreshData}
            disabled={loading || isPreloading}
          >
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
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
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefreshData}
            disabled={loading || isPreloading}
          >
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
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

  const renderPreloadProgress = () => {
    if (!isPreloading) return null;

    return (
      <View style={styles.preloadContainer}>
        <Text style={styles.preloadTitle}>Preparing Data...</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${preloadProgress}%` }]} />
        </View>
        <Text style={styles.preloadMessage}>{preloadMessage}</Text>
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
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Year & Division</Text>
        {(teacherData?.name || teacherName) && (
          <Text style={styles.teacherName}>Welcome, {teacherData?.name || teacherName}</Text>
        )}
      </View>

      {renderPreloadProgress()}

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
          disabled={!selectedYear || !selectedDivision || loading || isPreloading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isPreloading ? 'Preparing...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Data Status */}

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
  preloadContainer: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  preloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  preloadMessage: {
    fontSize: 14,
    color: '#1565c0',
    textAlign: 'center',
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
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

export default YearDivisionSelector;