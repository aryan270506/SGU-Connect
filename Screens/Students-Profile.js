import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentProfile = ({ studentData: propStudentData, navigation }) => {
  const [studentData, setStudentData] = useState(propStudentData || null);
  const [loading, setLoading] = useState(!propStudentData);

  useEffect(() => {
    // Only load from AsyncStorage if no data was passed as props
    if (!propStudentData) {
      loadStudentData();
    } else {
      setStudentData(propStudentData);
      setLoading(false);
    }
  }, [propStudentData]);

  const loadStudentData = async () => {
    try {
      console.log('Loading student data from AsyncStorage in Profile');
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        console.log('Retrieved data from AsyncStorage in Profile:', data);
        setStudentData(normalizeStudentData(data));
      } else {
        console.log('No student data available in Profile');
        Alert.alert('Error', 'No student data available');
      }
    } catch (error) {
      console.error('Error loading student data in Profile:', error);
      Alert.alert('Error', `Failed to load student data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeStudentData = (data) => {
    console.log('Normalizing student data:', data);
    return {
      Name: data.Name || data.name || data.full_id || 'Not available',
      PRN: data.PRN || data.prn || data.id || 'Not available',
      Email: data.Email || data.email || 'Not available',
      Branch: data.Branch || data.branch || 'Not specified',
      Division: data.Division || data.division || 'Not specified',
      Year: data.Year || data.year || 'Not specified',
      password: data.password || '',
      ...data
    };
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              
              // Clear AsyncStorage data
              await AsyncStorage.multiRemove(['userData', 'userRole']);
              
              // Sign out from Firebase if there's an active session
              if (auth.currentUser) {
                await auth.signOut();
              }
              
              console.log('Logout successful, navigating to Login');
              
              // Navigate to main login screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Logout Error', error.message);
            }
          },
        },
      ]
    );
  };

  const ProfileField = ({ iconName, label, value }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Ionicons name={iconName} size={20} color="#2563eb" />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6f42c1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!studentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>Unable to load student data</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadStudentData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color="#ffffff" />
            {studentData.Name && (
              <Text style={styles.avatarText}>
                {studentData.Name.split(' ')
                  .filter(name => name.length > 0)
                  .map(name => name[0])
                  .join('')}
              </Text>
            )}
          </View>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <Text style={styles.headerSubtitle}>Year: {studentData.Year}</Text>
        </View>

        <View style={styles.profileCard}>
          <ProfileField
            iconName="person-outline"
            label="Full Name"
            value={studentData.Name}
          />
          
          <ProfileField
            iconName="calendar-outline"
            label="Class Year"
            value={studentData.Year}
          />
          
          <ProfileField
            iconName="library-outline"
            label="Division"
            value={studentData.Division}
          />
          
          <ProfileField
            iconName="school-outline"
            label="Branch"
            value={studentData.Branch}
          />
          
          <ProfileField
            iconName="card-outline"
            label="PRN Number"
            value={studentData.PRN}
          />
          
          <ProfileField
            iconName="mail-outline"
            label="Email Address"
            value={studentData.Email}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Session ID: {auth.currentUser?.uid || 'Active Session'}
          </Text>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6f42c1',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6f42c1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#ffffff',
    position: 'relative',
  },
  avatarText: {
    position: 'absolute',
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1f2937',
    paddingLeft: 28,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6f42c1',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#dc2626',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6f42c1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentProfile;