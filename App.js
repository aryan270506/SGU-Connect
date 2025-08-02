// App.js - Fixed version
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
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
  const [initialRoute, setInitialRoute] = useState('Login');
  const [initialParams, setInitialParams] = useState(null);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      console.log('App starting - checking for existing session...');
      
      const [userData, userRole, sessionExpiry] = await Promise.all([
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('sessionExpiry')
      ]);

      console.log('Session check results:', {
        hasUserData: !!userData,
        userRole: userRole,
        hasExpiry: !!sessionExpiry
      });

      // Check if we have a valid session
      if (userData && userRole && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        const now = new Date();
        
        console.log('Session expiry:', expiryDate);
        console.log('Current time:', now);
        console.log('Session valid:', expiryDate > now);

        if (expiryDate > now) {
          // Valid session exists
          const parsedUserData = JSON.parse(userData);
          
          // FIX: Clean the userRole by removing extra quotes
          let cleanUserRole = userRole;
          if (typeof userRole === 'string') {
            // Remove surrounding quotes if they exist
            cleanUserRole = userRole.replace(/^["'](.*)["']$/, '$1');
          }
          
          console.log('Raw user role:', userRole);
          console.log('Clean user role:', cleanUserRole);
          console.log('Valid session found for user role:', cleanUserRole);
          console.log('User data:', parsedUserData);
          
          // Set initial route based on user role
          switch (cleanUserRole) {
            case 'teacher':
              console.log('Setting initial route to TeacherDashboard');
              setInitialRoute('TeacherDashboard');
              setInitialParams(parsedUserData);
              break;
            case 'student':
              console.log('Setting initial route to StudentDashboard');
              setInitialRoute('StudentDashboard');
              setInitialParams({ studentData: parsedUserData });
              break;
            case 'admin':
              console.log('Setting initial route to AdminDashboard');
              setInitialRoute('AdminDashboard');
              setInitialParams(parsedUserData);
              break;
            case 'parent':
              console.log('Setting initial route to ParentDashboard');
              setInitialRoute('ParentDashboard');
              setInitialParams(parsedUserData);
              break;
            default:
              console.log('Unknown user role:', cleanUserRole, ', going to login');
              setInitialRoute('Login');
              break;
          }
        } else {
          console.log('Session expired, clearing and going to login');
          // Session expired, clear it
          await AsyncStorage.multiRemove(['userData', 'userRole', 'sessionExpiry', 'lastLoginTime']);
          setInitialRoute('Login');
        }
      } else {
        console.log('No valid session found, going to login');
        setInitialRoute('Login');
      }

      // Also check Firebase auth state for additional validation
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Firebase auth state:', firebaseUser ? 'Authenticated' : 'Not authenticated');
        // Firebase auth state can be used for additional validation if needed
      });

      // Clean up the auth listener
      setTimeout(() => {
        unsubscribe();
      }, 1000);

    } catch (error) {
      console.error('Error checking initial route:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  // Global function to clear session (can be called from anywhere)
  const clearAppSession = async () => {
    try {
      console.log('Clearing global app session...');
      
      const keysToRemove = [
        'userData',
        'userRole', 
        'sessionExpiry',
        'lastLoginTime',
        // Teacher specific data
        'teacherData',
        'teacherMetadata',
        'assignedStudents',
        'facultyData',
        'teacherAssignments',
        'lastTeacherDataUpdate',
        // Student specific data (if any)
        'studentData',
        // Admin specific data (if any)
        'adminData',
        // Parent specific data (if any)
        'parentData'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Sign out from Firebase if there's an active session
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      console.log('Global session cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing global session:', error);
      return false;
    }
  };

  // Expose clearSession function globally
  useEffect(() => {
    global.clearAppSession = clearAppSession;
    
    return () => {
      delete global.clearAppSession;
    };
  }, []);

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6f42c1" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  console.log('Rendering NavigationContainer with initial route:', initialRoute);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false // Prevent swipe back gestures that might cause navigation issues
        }}
      >
        {/* Login Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
        
        {/* Dashboard Screens with initial params */}
        <Stack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard}
          initialParams={initialRoute === 'StudentDashboard' ? initialParams : undefined}
          options={{
            gestureEnabled: false // Prevent going back to login
          }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard}
          initialParams={initialRoute === 'AdminDashboard' ? initialParams : undefined}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="ParentDashboard" 
          component={ParentDashboard}
          initialParams={initialRoute === 'ParentDashboard' ? initialParams : undefined}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="TeacherDashboard" 
          component={TeacherDashboard}
          initialParams={initialRoute === 'TeacherDashboard' ? initialParams : undefined}
          options={{
            gestureEnabled: false
          }}
        />
        
        {/* Communication Screens */}
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="TeachersList" component={TeachersListScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="StudentChat" component={StudentChatScreen} />
        <Stack.Screen name="DoubtStudentList" component={DoubtStudentList} />
        <Stack.Screen name="TeacherAdminChat" component={teacheradminChatScreen} />
        <Stack.Screen name="TeacherTeacherChat" component={teacherteacherChatScreen} />
        <Stack.Screen name="AdminStudentsChat" component={ClassSelectionScreen} />
        <Stack.Screen name="AdminTeacherChat" component={TeacherSelectionScreen} />
        <Stack.Screen name="AdminParentsChat" component={AdminParentsChat} />
        <Stack.Screen name="ParentsTeacherChat" component={ParentsTeacherChat} />
        <Stack.Screen name="TeacherStudentSender" component={TeacherStudentSenderPage} />
        <Stack.Screen name="TeacherChatScreen" component={TeacherChatScreen} />
        <Stack.Screen name="AdminChatScreen" component={AdminChatScreen} />
        <Stack.Screen name="TeacherStudentDoubtReply" component={TeacherStudentDoubtReply} />
        
        {/* Profile Screens */}
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfile} /> 
        <Stack.Screen name="AdminProfile" component={AdminProfile} />
        
        {/* Selection and Navigation Screens */}
        <Stack.Screen name="YearDivisionSelector" component={YearDivisionSelector} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="AssignmentYearDivisionSelector" component={AssignmentYearDivisionSelector} />
        <Stack.Screen name="TeacherParentsYearDivisionSelector" component={TeacherParentsYearDivisionSelector} />
        <Stack.Screen name="TeacherTeacherYearDivisionSelector" component={TeacherTeacherYearDivisionSelector} />
        
        {/* Assignment Screens */}
        <Stack.Screen name="AddAssignments" component={AddAssignmentsScreen} />
        <Stack.Screen name="SubjectsScreen" component={SubjectsScreen} />
        <Stack.Screen name="StudentAssignments" component={StudentAssignmentsScreen} />
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6f42c1',
    fontWeight: '500',
  },
});

export default App;