import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import MessagesScreen from './student-teacher-chat';
import TeachersListScreen from './student-teacher-doubt';
import StudentProfile from './Students-Profile';
import SubjectsScreen from './student-assignment-subject-screen'; // Importing the SubjectsScreen
const Tab = createBottomTabNavigator();

const StudentDashboard = () => {
  const route = useRoute();
  const studentData = route.params?.studentData;

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
          }
          else if (route.name === 'Assignments') {
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