import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Using Expo vector icons
import AdminStudentsChat from './AdminStudentsChat'
import AdminTeacherChat from './AdminTeacherChat'
import AdminParentsChat from './AdminParentsChat'
import AdminProfile from './AdminProfile'
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');

const renderContent = () => {
  switch (activeTab) {
     case 'students':
    return <AdminStudentsChat />;
    case 'teachers':
      return <AdminTeacherChat />;
    case 'parents':
      return <AdminParentsChat/>
    case 'profile':
      return <AdminProfile/>
    default:
      return null;
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      
      {/* Header */}
      
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('students')}
        >
          <MaterialIcons 
            name="people" 
            size={24} 
            color={activeTab === 'students' ? '#2196F3' : '#757575'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'students' ? '#2196F3' : '#757575' }
            ]}
          >
            Students
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('teachers')}
        >
          <MaterialIcons 
            name="school" 
            size={24} 
            color={activeTab === 'teachers' ? '#2196F3' : '#757575'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'teachers' ? '#2196F3' : '#757575' }
            ]}
          >
            Teachers
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('parents')}
        >
          <MaterialIcons 
            name="family-restroom" 
            size={24} 
            color={activeTab === 'parents' ? '#2196F3' : '#757575'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'parents' ? '#2196F3' : '#757575' }
            ]}
          >
            Parents
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('profile')}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={activeTab === 'profile' ? '#2196F3' : '#757575'} 
          />
          <Text 
            style={[
              styles.navText, 
              { color: activeTab === 'profile' ? '#2196F3' : '#757575' }
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  contentText: {
    color: '#757575',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default AdminDashboard;
