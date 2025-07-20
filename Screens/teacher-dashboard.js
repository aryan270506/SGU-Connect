import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import YearDivisionSelector from './teacher-student-year-div';
import TeacherProfileScreen from './Teacher-Profile';
import StudentChatScreen from './teacher-parent-chat';
import DoubtStudentList from './teacher-student-doubt';
import RoleSelectionScreen from './Teacher-Admin';
import AssignmentYearDivisionSelector from './teacher-student-assignment-div-year';
import { ScrollView } from 'react-native';
import TeacherParentsYearDivisionSelector from './Teacher-Parents-year-div'; 
import TeacherTeacherYearDivisionSelector from './Teacher-Teacher-year-div';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get teacher data from route params
  const {
    teacherId,
    employeeId,
    teacherName,
    course,
    selectedBranches,
    selectedDivisions,
    subjects,
    years
  } = route.params || {};

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Students':
        return <YearDivisionSelector />;
      case 'Profile':
        return (
          <TeacherProfileScreen 
            teacherId={teacherId}
            employeeId={employeeId}
            teacherName={teacherName}
            course={course}
            selectedBranches={selectedBranches}
            selectedDivisions={selectedDivisions}
            subjects={subjects}
            years={years}
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
              {teacherName ? `Welcome, ${teacherName}` : 'Teacher Dashboard'}
            </Text>
            <Text style={styles.subHeaderText}>
              {employeeId ? `ID: ${employeeId}` : 'No messages yet'}
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
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-around' }}>
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

  {/* New Assignments Tab */}
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
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  welcomeSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  statusCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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