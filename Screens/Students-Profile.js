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
import { auth, database } from './firebase';

const StudentProfile = ({ route, navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false since we have props data

  useEffect(() => {
    console.log('Route params:', route.params); // Debug log
    console.log('Props student data:', route.params?.studentData); // Debug log

    // First check if we have student data in props
    if (route.params?.studentData) {
      console.log('Using student data from props');
      setStudentData(normalizeStudentData(route.params.studentData));
    } else {
      console.log('No student data in props, fetching from Firebase');
      fetchStudentData();
    }
  }, [route.params]);

  const normalizeStudentData = (data) => {
    console.log('Normalizing student data:', data); // Debug log
    return {
      Name: data.Name || data.name || 'Not available',
      PRN: data.PRN || data.prn || 'Not available',
      Email: data.Email || data.email || 'Not available',
      Branch: data.Branch || data.branch || 'Not specified',
      Division: data.Division || data.division || 'Not specified',
      Year: data.Year || data.year || 'Not specified',
      password: data.password || '',
      ...data
    };
  };

  const fetchStudentData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (!user?.email) {
      Alert.alert('Error', 'No authenticated user found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching student data for email:', user.email); // Debug log
      const snapshot = await database.ref('students').once('value');
      
      if (!snapshot.exists()) {
        Alert.alert('Error', 'No student data available in database');
        setLoading(false);
        return;
      }

      let foundStudent = null;
      
      snapshot.forEach((childSnapshot) => {
        const student = childSnapshot.val();
        console.log('Checking student:', student.Email); // Debug log
        if (
  (student.Email && student.Email.toLowerCase() === user.email.toLowerCase()) ||
  (student.email && student.email.toLowerCase() === user.email.toLowerCase())
) { // Case-insensitive check
          foundStudent = student;
          return true; // Break the loop
        }
      });

      if (foundStudent) {
        console.log('Found student data:', foundStudent); // Debug log
        setStudentData(normalizeStudentData(foundStudent));
      } else {
        Alert.alert('Error', `No student found with email: ${user.email}`);
        console.log('Available emails:', 
          Object.values(snapshot.val()).map(s => s.Email || s.email)); // Debug log
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch data: ${error.message}`);
      console.error('Fetch error:', error); // Debug log
    } finally {
      setLoading(false);
    }
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
              
              await auth.signOut();
              navigation.navigate('StudentLogin');
            } catch (error) {
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
            onPress={fetchStudentData}
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
            User ID: {auth.currentUser?.uid || 'N/A'}
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