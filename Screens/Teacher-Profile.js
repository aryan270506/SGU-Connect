import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Easing,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const TeacherProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get teacher info from navigation params
  const { teacherId, employeeId } = route.params || {};

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (employeeId) {
      fetchTeacherData();
    } else {
      // Try to get teacher data from AsyncStorage if not in params
      loadTeacherFromStorage();
    }
  }, [employeeId]);

  const loadTeacherFromStorage = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData.employeeId) {
          fetchTeacherDataById(parsedData.employeeId);
        } else {
          setLoading(false);
          Alert.alert('Error', 'No teacher data found');
        }
      } else {
        setLoading(false);
        Alert.alert('Error', 'No session data found');
      }
    } catch (error) {
      console.error('Error loading teacher from storage:', error);
      setLoading(false);
    }
  };


    const checkSessionExpiry = async () => {
    try {
      const expiry = await AsyncStorage.getItem('sessionExpiry');
      if (!expiry) return false;
      return new Date() < new Date(expiry);
    } catch (error) {
      console.error('Error checking session expiry:', error);
      return false;
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      const isValid = await checkSessionExpiry();
      if (!isValid) {
        Alert.alert('Session Expired', 'Your session has expired. Please login again.');
        await clearSession();
        navigation.reset({
          index: 0,
          routes: [{ name: 'TeacherLogin' }]
        });
        return;
      }

      if (employeeId) {
        fetchTeacherData();
      } else {
        // Try to get teacher data from AsyncStorage if not in params
        loadTeacherFromStorage();
      }
    };

    verifySession();
  }, [employeeId]);


  const fetchTeacherDataById = (id) => {
    const database = getDatabase();
    const teachersRef = ref(database, 'Faculty');
    
    const unsubscribe = onValue(teachersRef, (snapshot) => {
      const facultyData = snapshot.val();
      let foundTeacher = null;

      // Find the teacher with matching employee_id
      for (const key in facultyData) {
        if (facultyData[key].employee_id === id) {
          foundTeacher = {
            id: key,
            ...facultyData[key]
          };
          break;
        }
      }

      if (foundTeacher) {
        setTeacherData(foundTeacher);
        startAnimations();
      } else {
        Alert.alert('Error', 'Teacher data not found');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching teacher data:', error);
      Alert.alert('Error', 'Failed to load teacher data');
      setLoading(false);
    });

    return () => off(teachersRef, 'value', unsubscribe);
  };

  const fetchTeacherData = () => {
    const database = getDatabase();
    const teachersRef = ref(database, 'Faculty');
    
    const unsubscribe = onValue(teachersRef, (snapshot) => {
      const facultyData = snapshot.val();
      let foundTeacher = null;

      // Find the teacher with matching employee_id
      for (const key in facultyData) {
        if (facultyData[key].employee_id === employeeId) {
          foundTeacher = {
            id: key,
            ...facultyData[key]
          };
          break;
        }
      }

      if (foundTeacher) {
        setTeacherData(foundTeacher);
        startAnimations();
      } else {
        Alert.alert('Error', 'Teacher data not found');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching teacher data:', error);
      Alert.alert('Error', 'Failed to load teacher data');
      setLoading(false);
    });

    return () => off(teachersRef, 'value', unsubscribe);
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const clearSession = async () => {
    try {
      console.log('Clearing teacher session...');
      
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['userData', 'userRole']);
      
      // Clear global session if available
      if (global.clearAppSession) {
        await global.clearAppSession();
      }
      
      console.log('Teacher session cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            const sessionCleared = await clearSession();
            
            if (sessionCleared) {
              // Reset navigation stack and go to teacher login
              navigation.reset({
                index: 0,
                routes: [{ name: 'TeacherLogin' }]
              });
            } else {
              Alert.alert('Error', 'Failed to logout completely. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Edit Profile', 'Profile editing feature will be available soon!');
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'T';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  };

  const formatDivisions = (divisions) => {
    if (!divisions) return 'N/A';
    return Object.values(divisions).join(', ');
  };

  const formatSubjects = (subjects) => {
    if (!subjects) return 'N/A';
    return Object.values(subjects).join(', ');
  };

  const formatYears = (years) => {
    if (!years) return 'N/A';
    return Object.values(years).join(', ');
  };

  const formatCourseCodes = (courseCodes) => {
    if (!courseCodes) return 'N/A';
    return Object.values(courseCodes).join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!teacherData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={50} color="#FF4757" />
          <Text style={styles.errorText}>Failed to load teacher data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTeacherData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* Profile Header with Back Button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Teacher Profile</Text>
          </View>

          {/* Profile Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getAvatarInitials(teacherData.name)}
              </Text>
            </View>
            <Text style={styles.name}>{teacherData.name || 'N/A'}</Text>
            <Text style={styles.position}>
              {teacherData.role || 'Teacher'} ID: {teacherData.employee_id}
            </Text>
          </View>

          {/* Profile Information Cards */}
          <View style={styles.infoSection}>
            <InfoCard 
              icon="school" 
              title="Academic Information" 
              items={[
                { label: 'Employee ID', value: teacherData.employee_id || 'N/A' },
                { label: 'Role', value: teacherData.role || 'Teacher' },
                { label: 'Course Codes', value: formatCourseCodes(teacherData.course_codes) },
                { label: 'Years Teaching', value: formatYears(teacherData.years) }
              ]} 
            />

            <InfoCard 
              icon="book" 
              title="Teaching Details" 
              items={[
                { label: 'Subjects', value: formatSubjects(teacherData.subjects) },
                { label: 'Divisions', value: formatDivisions(teacherData.divisions) },
              ]} 
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#FFF" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Info Card Component
const InfoCard = ({ icon, title, items }) => (
  <View style={cardStyles.container}>
    <View style={cardStyles.header}>
      <MaterialIcons name={icon} size={20} color="#6C63FF" />
      <Text style={cardStyles.title}>{title}</Text>
    </View>
    <View style={cardStyles.divider} />
    {items.map((item, index) => (
      <View key={index} style={cardStyles.item}>
        <Text style={cardStyles.label}>{item.label}</Text>
        <Text style={cardStyles.value}>{item.value}</Text>
      </View>
    ))}
  </View>
);

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#2F2F2F',
    fontWeight: '600',
    textAlign: 'right',
    flex: 2,
    flexWrap: 'wrap',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#2F2F2F',
  },
  editButton: {
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#6C63FF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F2F2F',
    marginBottom: 4,
    textAlign: 'center',
  },
  position: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF4757',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFF',
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
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF4757',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeacherProfileScreen;