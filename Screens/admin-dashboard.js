import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminStudentsChat from './AdminStudentsChat';
import AdminTeacherChat from './AdminTeacherChat';
import AdminParentsChat from './AdminParentsChat';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();

  // Check session and load admin data when component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkAdminSession();
    }, [])
  );

  const checkAdminSession = async () => {
    try {
      console.log('AdminDashboard: Checking admin session...');
      console.log('Route params:', route.params);

      // First, check if we have route params (from fresh login)
      if (route.params && route.params.fromLogin) {
        console.log('Fresh login detected, using route params');
        const adminInfo = {
          id: route.params.adminId,
          name: route.params.adminName,
          department: route.params.adminDepartment || '',
          employee_id: route.params.adminEmployeeId,
          role: route.params.adminRole || 'Administrator'
        };
        setAdminData(adminInfo);
        setLoading(false);
        return;
      }

      // Check session validity
      const [userData, userRole, sessionExpiry] = await AsyncStorage.multiGet([
        'userData', 
        'userRole', 
        'sessionExpiry'
      ]);

      console.log('Session check results:', {
        hasUserData: !!userData[1],
        userRole: userRole[1],
        hasExpiry: !!sessionExpiry[1]
      });

      if (userData[1] && userRole[1] === 'admin' && sessionExpiry[1]) {
        const expiryDate = new Date(sessionExpiry[1]);
        const now = new Date();

        console.log('Session expiry:', expiryDate);
        console.log('Current time:', now);
        console.log('Session valid:', expiryDate > now);

        if (expiryDate > now) {
          // Valid session - load admin data
          const parsedUserData = JSON.parse(userData[1]);
          console.log('Loading admin data from session:', parsedUserData);
          setAdminData(parsedUserData);
        } else {
          console.log('Session expired, redirecting to login');
          await handleSessionExpired();
          return;
        }
      } else {
        // Try to get admin data from route params as fallback
        if (route.params) {
          console.log('No valid session, but route params available');
          const adminInfo = {
            id: route.params.adminId,
            name: route.params.adminName,
            department: route.params.adminDepartment || '',
            employee_id: route.params.adminEmployeeId,
            role: route.params.adminRole || 'Administrator'
          };
          setAdminData(adminInfo);
        } else {
          console.log('No session and no route params, redirecting to login');
          await handleSessionExpired();
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking admin session:', error);
      await handleSessionExpired();
    }
  };

  const handleSessionExpired = async () => {
    try {
      console.log('Handling session expiry...');
      
      // Clear all session data
      const keysToRemove = [
        'userData',
        'userRole',
        'sessionExpiry',
        'lastLoginTime',
        'adminId',
        'adminName',
        'adminDepartment',
        'adminEmployeeId',
        'adminRole'
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Also use global session clear if available
      if (global.clearAppSession) {
        await global.clearAppSession();
      }

      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error handling session expiry:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <AdminStudentsChat adminData={adminData} />;
      case 'teachers':
        return <AdminTeacherChat adminData={adminData} />;
      case 'parents':
        return <AdminParentsChat adminData={adminData} />;
      case 'profile':
        return (
          <AdminProfile 
            adminData={adminData}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="admin-panel-settings" size={50} color="#2196F3" />
          <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no admin data
  if (!adminData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={50} color="#FF4757" />
          <Text style={styles.errorText}>Failed to load admin data</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            })}
          >
            <Text style={styles.retryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      
      {/* Header with admin info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="admin-panel-settings" size={24} color="white" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {adminData.name}</Text>
          </View>
        </View>
      </View>
      
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FF4757',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default AdminDashboard;