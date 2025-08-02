// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Screens/firebase';

import LoginScreen from './Screens/LoginPage.js';                               
import AdminLoginScreen from './Screens/admin-login-screen.js';       
import ParentLoginScreen from './Screens/parent-login-screen.js';               
import StudentLoginScreen from './Screens/StudentLoginScreen.js';                     
import TeacherLoginScreen from './Screens/teacher-login-screen.js';                 
import StudentDashboard from './Screens/Students-Dashboard.js';
import TeacherDashboard from './Screens/teacher-dashboard.js';
import  MessagesScreen from './Screens/student-teacher-chat.js'; 
import TeachersListScreen from './Screens/student-teacher-doubt.js';
import StudentProfile from './Screens/Students-Profile.js'; 
import ChatScreen from './Screens/student-teacher-doubt-in.js';
import TeacherProfile from './Screens/Teacher-Profile.js'; 
import YearDivisionSelector from './Screens/teacher-student-year-div.js'; 
import StudentChatScreen from './Screens/teacher-parent-chat.js';
import DoubtStudentList from './Screens/teacher-student-doubt.js';
import RoleSelectionScreen from './Screens/Teacher-Admin.js'; 
import teacheradminChatScreen from './Screens/teacher-admin-chat.js';
import teacherteacherChatScreen from './Screens/Teacher-Teacher-chat.js';
import TeacherStudentSenderPage from './Screens/Teacher-Student-Sender-Screen.js';
import ClassSelectionScreen from './Screens/AdminStudentsChat.js';
import TeacherSelectionScreen from './Screens/AdminTeacherChat.js';
import AdminParentsChat from './Screens/AdminParentsChat.js';
import AdminProfile from './Screens/AdminProfile.js';
import AdminDashboard from './Screens/admin-dashboard.js'; 
import ParentsTeacherChat from './Screens/ParentsTeacherChat.js';
import ParentDashboard from './Screens/parent-chat.js';
import TeacherChatScreen from './Screens/Teacher-student-after-year-div.js';
import AdminChatScreen from './Screens/admin-student-chat-in.js';
import AssignmentYearDivisionSelector from './Screens/teacher-student-assignment-div-year.js';
import AddAssignmentsScreen from './Screens/teacher-add-assignment-screen.js';
import SubjectsScreen from './Screens/student-assignment-subject-screen.js'; 
import StudentAssignmentsScreen from './Screens/Students-Assignments-Screen.js'; 
import TeacherParentsYearDivisionSelector from './Screens/Teacher-Parents-year-div.js'; 
import TeacherTeacherYearDivisionSelector from './Screens/Teacher-Teacher-year-div.js';
import TeacherStudentDoubtReply from './Screens/teacher-doubt-reply-student.js'; 

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      
      // Check if user data exists in AsyncStorage
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserRole = await AsyncStorage.getItem('userRole');
      
      console.log('Stored user data:', storedUserData ? 'Found' : 'Not found');
      console.log('Stored user role:', storedUserRole);
      
      if (storedUserData && storedUserRole) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setUserRole(storedUserRole);
        setSessionActive(true);
        
        console.log('Session restored:', {
          role: storedUserRole,
          userData: parsedUserData
        });
      }
      
      // Listen to Firebase Auth state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Firebase auth state changed:', firebaseUser ? 'Authenticated' : 'Not authenticated');
        setUser(firebaseUser);
        setIsLoading(false);
      });
      
      // If no AsyncStorage data, still listen to Firebase but don't set session as active
      if (!storedUserData || !storedUserRole) {
        setIsLoading(false);
      }
      
      return unsubscribe;
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  };

  // Function to clear session (called from logout)
  const clearSession = async () => {
    console.log('Clearing session...');
    try {
      await AsyncStorage.multiRemove(['userData', 'userRole']);
      setUserData(null);
      setUserRole(null);
      setSessionActive(false);
      
      // Sign out from Firebase if there's an active session
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Expose clearSession function globally so logout can call it
  useEffect(() => {
    global.clearAppSession = clearSession;
    
    return () => {
      delete global.clearAppSession;
    };
  }, []);

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6f42c1" />
      </View>
    );
  }

  // Determine initial route based on session state
  const getInitialRouteName = () => {
    console.log('Determining initial route:', {
      sessionActive,
      userRole,
      hasUserData: !!userData
    });

    // Only navigate to dashboard if we have an active session with both role and data
    if (sessionActive && userRole && userData) {
      switch (userRole) {
        case 'student':
          console.log('Navigating to StudentDashboard');
          return 'StudentDashboard';
        case 'teacher':
          console.log('Navigating to TeacherDashboard');
          return 'TeacherDashboard';
        case 'admin':
          console.log('Navigating to AdminDashboard');
          return 'AdminDashboard';
        case 'parent':
          console.log('Navigating to ParentDashboard');
          return 'ParentDashboard';
        default:
          console.log('Unknown role, navigating to Login');
          return 'Login';
      }
    }
    
    console.log('No active session, navigating to Login');
    return 'Login';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={getInitialRouteName()} 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
        
        {/* Dashboard Screens */}
        <Stack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard}
          initialParams={{ studentData: userData }}
        />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        
        {/* Other Screens */}
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="TeachersList" component={TeachersListScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfile} /> 
        <Stack.Screen name="YearDivisionSelector" component={YearDivisionSelector} />
        <Stack.Screen name="StudentChat" component={StudentChatScreen} />
        <Stack.Screen name="DoubtStudentList" component={DoubtStudentList} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="TeacherAdminChat" component={teacheradminChatScreen} />
        <Stack.Screen name="TeacherTeacherChat" component={teacherteacherChatScreen} />
        <Stack.Screen name="AdminStudentsChat" component={ClassSelectionScreen} />
        <Stack.Screen name="AdminTeacherChat" component={TeacherSelectionScreen} />
        <Stack.Screen name="AdminParentsChat" component={AdminParentsChat} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} />
        <Stack.Screen name="ParentsTeacherChat" component={ParentsTeacherChat} />
        <Stack.Screen name="TeacherStudentSender" component={TeacherStudentSenderPage} />
        <Stack.Screen name="TeacherChatScreen" component={TeacherChatScreen} />
        <Stack.Screen name="AdminChatScreen" component={AdminChatScreen} />
        <Stack.Screen name="AssignmentYearDivisionSelector" component={AssignmentYearDivisionSelector} />
        <Stack.Screen name="AddAssignments" component={AddAssignmentsScreen} />
        <Stack.Screen name="SubjectsScreen" component={SubjectsScreen} />
        <Stack.Screen name="StudentAssignments" component={StudentAssignmentsScreen} />
        <Stack.Screen name="TeacherParentsYearDivisionSelector" component={TeacherParentsYearDivisionSelector} />
        <Stack.Screen name="TeacherTeacherYearDivisionSelector" component={TeacherTeacherYearDivisionSelector} />
        <Stack.Screen name="TeacherStudentDoubtReply" component={TeacherStudentDoubtReply} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

export default App;