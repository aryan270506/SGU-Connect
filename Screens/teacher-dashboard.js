import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YearDivisionSelector from './teacher-student-year-div';
import TeacherProfileScreen from './Teacher-Profile';
import DoubtStudentList from './teacher-student-doubt';
import RoleSelectionScreen from './Teacher-Admin';
import AssignmentYearDivisionSelector from './teacher-student-assignment-div-year';
import TeacherParentsYearDivisionSelector from './Teacher-Parents-year-div'; 
import TeacherTeacherYearDivisionSelector from './Teacher-Teacher-year-div';
import DataPreloaderTeacher from './DataPreloaderTeacher';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [teacherData, setTeacherData] = useState(null);
  const [preloading, setPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadMessage, setPreloadMessage] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    loadTeacherData();
  }, []);

  useEffect(() => {
    if (teacherData) {
      startDataPreloading();
    }
  }, [teacherData]);

  // Function to check session expiry
  const checkSessionExpiry = async () => {
    try {
      const expiry = await AsyncStorage.getItem('sessionExpiry');
      if (!expiry) return false;
      return new Date() < new Date(expiry);
    } catch (error) {
      console.error('Error checking session expiry:', error);
      return false;
    }
  };

  const startDataPreloading = async () => {
    if (!teacherData) return;
    
    setPreloading(true);
    setPreloadMessage('Preparing your data...');
    
    // Add progress listener
    DataPreloaderTeacher.addProgressListener((progress) => {
      setPreloadProgress(progress.progress);
      setPreloadMessage(progress.message);
    });
    
    try {
      await DataPreloaderTeacher.preloadAllData(teacherData);
    } catch (error) {
      console.error('Preloading failed:', error);
    } finally {
      setPreloading(false);
      // Remove listener after preloading
      DataPreloaderTeacher.removeProgressListener();
    }
  };

  const loadTeacherData = async () => {
    try {
      // First check session expiry
      const isSessionValid = await checkSessionExpiry();
      if (!isSessionValid) {
        await AsyncStorage.multiRemove(['userData', 'userRole', 'sessionExpiry']);
        navigation.reset({
          index: 0,
          routes: [{ name: 'TeacherLogin' }]
        });
        return;
      }

      // Then try to get data from route params
      const routeParams = route.params;
      
      if (routeParams && routeParams.teacherId) {
        console.log('Using teacher data from route params');
        setTeacherData(routeParams);
        return;
      }

      // If no route params, try to get from AsyncStorage
      console.log('Loading teacher data from AsyncStorage');
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserRole = await AsyncStorage.getItem('userRole');
      
      if (storedUserData && storedUserRole === 'teacher') {
        const parsedData = JSON.parse(storedUserData);
        console.log('Teacher data loaded from storage:', parsedData);
        setTeacherData(parsedData);
      } else {
        console.log('No valid teacher session found, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'TeacherLogin' }]
        });
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'TeacherLogin' }]
      });
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  const renderContent = () => {
    if (!teacherData || preloading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>
            {preloadMessage || 'Loading your data...'}
          </Text>
          {preloadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${preloadProgress}%` }]} />
              <Text style={styles.progressText}>{Math.round(preloadProgress)}%</Text>
            </View>
          )}
        </View>
      );
    }

    switch (activeTab) {
      case 'Students':
        return <YearDivisionSelector />;
      case 'Profile':
        return (
          <TeacherProfileScreen 
            teacherId={teacherData.teacherId}
            employeeId={teacherData.employeeId}
            teacherName={teacherData.teacherName}
            course={teacherData.course}
            selectedBranches={teacherData.selectedBranches}
            selectedDivisions={teacherData.selectedDivisions}
            subjects={teacherData.subjects}
            years={teacherData.years}
          />
        );
      case 'Doubts':
        return <DoubtStudentList />;
      case 'Teachers':
        return <RoleSelectionScreen />;
      case 'Assignments':
        return <AssignmentYearDivisionSelector />;
      case 'Parents':
        return <TeacherParentsYearDivisionSelector />;
      default:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{activeTab} Section</Text>
            <Text style={styles.tabText}>Content coming soon</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header - Only shown for non-student/non-profile tabs */}
      {!['Students', 'Profile'].includes(activeTab) && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>
              {teacherData?.teacherName ? `Welcome, ${teacherData.teacherName}` : 'Teacher Dashboard'}
            </Text>
            <Text style={styles.subHeaderText}>
              {teacherData?.employeeId ? `ID: ${teacherData.employeeId}` : 'No messages yet'}
            </Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigator */}
      <View style={styles.bottomNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.navScrollContent}>
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Students' && styles.activeNavItem]}
            onPress={() => handleTabPress('Students')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Students' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="people" 
                size={24} 
                color={activeTab === 'Students' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Students' && styles.activeNavText]}>
              Students
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Doubts' && styles.activeNavItem]}
            onPress={() => handleTabPress('Doubts')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Doubts' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="help-circle" 
                size={24} 
                color={activeTab === 'Doubts' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Doubts' && styles.activeNavText]}>
              Doubts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Assignments' && styles.activeNavItem]}
            onPress={() => handleTabPress('Assignments')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Assignments' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="document-text" 
                size={24} 
                color={activeTab === 'Assignments' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Assignments' && styles.activeNavText]}>
              Assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Parents' && styles.activeNavItem]}
            onPress={() => handleTabPress('Parents')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Parents' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="people-circle" 
                size={24} 
                color={activeTab === 'Parents' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Parents' && styles.activeNavText]}>
              Parents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Teachers' && styles.activeNavItem]}
            onPress={() => handleTabPress('Teachers')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Teachers' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="person" 
                size={24} 
                color={activeTab === 'Teachers' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Teachers' && styles.activeNavText]}>
              Teachers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Profile' && styles.activeNavItem]}
            onPress={() => handleTabPress('Profile')}
          >
            <View style={[styles.navIconContainer, activeTab === 'Profile' && styles.activeNavIconContainer]}>
              <Ionicons 
                name="settings" 
                size={24} 
                color={activeTab === 'Profile' ? '#2563eb' : '#9ca3af'} 
              />
            </View>
            <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>
              Profile
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
    marginTop: 15,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: '600',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subHeaderText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomNav: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-around',
    minWidth: '100%',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#eff6ff',
  },
  navIconContainer: {
    padding: 4,
  },
  activeNavIconContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default TeacherDashboard;