import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { database } from './firebase';
import * as Haptics from 'expo-haptics';

const AdminProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // State to store admin data
  const [adminData, setAdminData] = useState({
    name: "",
    department: "",
    employeeId: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchAdminData();
  }, [route]);

  const fetchAdminData = () => {
    // If we have params from navigation, use them
    if (route.params) {
      setAdminData({
        name: route.params.adminName || "",
        department: route.params.adminDepartment || "",
        employeeId: route.params.adminEmployeeId || "",
        role: route.params.adminRole || ""
      });
      setLoading(false);
      startAnimations();
    } else {
      // If no params, try to get currently authenticated user from Firebase
      const currentUser = firebase.auth().currentUser;
      
      if (currentUser) {
        // Get user data from the database
        database.ref(`Admin/${currentUser.uid}`).once('value')
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setAdminData({
                name: data.name || "",
                department: data.department || "",
                employeeId: data.employee_id || "",
                role: data.role || ""
              });
              startAnimations();
            } else {
              Alert.alert('Error', 'Admin data not found');
            }
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching admin data:", error);
            Alert.alert('Error', 'Failed to load admin data');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
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

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            firebase.auth().signOut().then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'AdminLogin' }] // Adjust route name as needed
              });
            });
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
    if (!name) return 'A';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!adminData.name && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={50} color="#FF4757" />
          <Text style={styles.errorText}>Failed to load admin data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAdminData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
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
          {/* Profile Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Administrator Profile</Text>
          </View>

          {/* Profile Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getAvatarInitials(adminData.name)}
              </Text>
            </View>
            <Text style={styles.name}>{adminData.name || 'N/A'}</Text>
            <Text style={styles.position}>
              {adminData.role || 'Administrator'} ID: {adminData.employeeId}
            </Text>
          </View>

          {/* Profile Information Cards */}
          <View style={styles.infoSection}>
            <InfoCard 
              icon="admin-panel-settings" 
              title="Administrative Information" 
              items={[
                { label: 'Employee ID', value: adminData.employeeId || 'N/A' },
                { label: 'Role', value: adminData.role || 'Administrator' },
                { label: 'Department', value: adminData.department || 'N/A' }
              ]} 
            />

            <InfoCard 
              icon="business" 
              title="Department Details" 
              items={[
                { label: 'Department', value: adminData.department || 'N/A' },
                { label: 'Access Level', value: 'Full Administrative Access' },
                { label: 'Status', value: 'Active' }
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2F2F2F',
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

export default AdminProfile;