// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
 // Assuming this is the correct path for the admin-student sender screen
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




const Stack = createStackNavigator();

const App = () => {
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
       <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
       <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
      <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
     
      <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
    
      <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
    
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      
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
      

   
      

      
      

      {/* Add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>

  );
};

export default App;



StudentChatScreen