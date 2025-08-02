import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessagesScreen from './student-teacher-chat';
import TeachersListScreen from './student-teacher-doubt';
import StudentProfile from './Students-Profile';
import SubjectsScreen from './student-assignment-subject-screen';

const Tab = createBottomTabNavigator();

const StudentDashboard = () => {
  const route = useRoute();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Always try to get data from AsyncStorage first
      const storedData = await AsyncStorage.getItem('userData');
      
      if (storedData) {
        const data = JSON.parse(storedData);
        setStudentData(data);
        setLoading(false);
        return;
      }

      // If no stored data, check route params (from login)
      if (route.params?.studentData) {
        const data = route.params.studentData;
        setStudentData(data);
        // Save to AsyncStorage for future app restarts
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await AsyncStorage.setItem('userRole', 'student');
      } else {
        // No data available at all
        console.log('No student data available');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!studentData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No student data found. Please login again.</Text>
      </SafeAreaView>
    );
  }

  // Create wrapper components to pass student data
  const TeachersScreenWrapper = (props) => (
    <TeachersListScreen {...props} studentData={studentData} />
  );

  const MessagesScreenWrapper = (props) => (
    <MessagesScreen {...props} studentData={studentData} />
  );

  const StudentProfileWrapper = (props) => (
    <StudentProfile {...props} studentData={studentData} />
  );

  const SubjectsScreenWrapper = (props) => (
    <SubjectsScreen {...props} studentData={studentData} />
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Teachers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Doubts') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Assignments') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6f42c1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Teachers" component={MessagesScreenWrapper} />
      <Tab.Screen name="Doubts" component={TeachersScreenWrapper} />
      <Tab.Screen name="Assignments" component={SubjectsScreenWrapper} />
      <Tab.Screen name="Profile" component={StudentProfileWrapper} />
    </Tab.Navigator>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#6f42c1',
    fontWeight: '600',
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
  studentYear: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6f42c1',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});

export default StudentDashboard;