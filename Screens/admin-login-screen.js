import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase, database } from './firebase'; // Import the firebase database

const { width } = Dimensions.get('window');

const AdminLoginScreen = () => {
  const navigation = useNavigation();
  const [adminName, setAdminName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(100))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const inputAnim = useState([
    new Animated.Value(0),
    new Animated.Value(0),
  ])[0];
  const buttonAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.timing(inputAnim[0], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(inputAnim[1], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  const handleLogin = () => {
    if (!adminName || !employeeId) {
      Alert.alert('Error', 'Please enter both name and employee ID');
      return;
    }

    setLoading(true);
    
    // Reference to the admin collection in Firebase
    const adminRef = database.ref('Admin');
    
    // Query the database to find a matching employee by ID
    adminRef.orderByChild('employee_id').equalTo(employeeId).once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          let isAuthenticated = false;
          let adminData = null;
          
          // Check if name also matches
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.name === adminName) {
              isAuthenticated = true;
              adminData = {
                id: childSnapshot.key,
                name: data.name,
                department: data.department,
                employee_id: data.employee_id,
                role: data.role
              };
            }
          });
          
          if (isAuthenticated && adminData) {
            console.log('Authentication successful:', adminData);
            
            // Navigate to AdminDashboard with credentials
            navigation.navigate('AdminDashboard', {
              adminId: adminData.id,
              adminName: adminData.name,
              adminDepartment: adminData.department,
              adminEmployeeId: adminData.employee_id,
              adminRole: adminData.role
            });
          } else {
            Alert.alert('Authentication Failed', 'Invalid name or employee ID');
          }
        } else {
          Alert.alert('Authentication Failed', 'Employee ID not found');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Login error:', error);
        Alert.alert('Error', 'Failed to authenticate. Please try again.');
        setLoading(false);
      });
  };

  // Login button animation pulse effect
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.background}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.imageContainer, 
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.universityText}>
            <Icon name="school-outline" size={30} color="#64FFDA" /> UNIVERSITY
          </Text>
          
          {/* Tech-themed image */}
          <View style={styles.glowContainer}>
            <Image
              source={require('../assets/Picsart_25-01-24_22-35-11-038.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.glow} />
          </View>
        </Animated.View>

        {/* Login Form */}
        <Animated.View 
          style={[
            styles.loginContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerSection}>
            <Text style={styles.loginHeaderText}>
              <Icon name="shield-account" size={28} color="#64FFDA" /> ADMIN ACCESS
            </Text>
            <TouchableOpacity 
              style={styles.backButton}
               onPress={() => navigation.navigate('Login')}
            >
              <Icon name="keyboard-backspace" size={24} color="#64FFDA" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.inputContainer}
            contentContainerStyle={styles.inputContainerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Admin Name */}
            <Animated.View 
              style={{
                width: '100%',
                opacity: inputAnim[0],
                transform: [{ translateX: inputAnim[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })}]
              }}
            >
              <View style={styles.inputWrapper}>
                <Icon name="account" size={20} color="#64FFDA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="NAME"
                  placeholderTextColor="#64FFDA80"
                  value={adminName}
                  onChangeText={setAdminName}
                />
              </View>
            </Animated.View>

            {/* Employee ID (Password) */}
            <Animated.View 
              style={{
                width: '100%',
                opacity: inputAnim[1],
                transform: [{ translateX: inputAnim[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })}]
              }}
            >
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#64FFDA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="EMPLOYEE ID"
                  placeholderTextColor="#64FFDA80"
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  secureTextEntry
                />
              </View>
            </Animated.View>

            {/* Login Button */}
            <Animated.View
              style={{
                width: '100%',
                alignItems: 'center',
                opacity: buttonAnim,
                transform: [
                  { translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  },
                  { scale: loading ? pulseAnim : 1 }
                ]
              }}
            >
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={loading ? ['#203A43', '#2C5364'] : ['#2C5364', '#203A43']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Icon name="loading" size={24} color="#64FFDA" style={styles.spinIcon} />
                      <Text style={styles.loginButtonText}>AUTHENTICATING</Text>
                    </View>
                  ) : (
                    <View style={styles.loginButtonContent}>
                      <Icon name="login" size={20} color="#64FFDA" style={{marginRight: 10}} />
                      <Text style={styles.loginButtonText}>LOGIN</Text>
                    </View>
                  )}
                </LinearGradient>
                
              </TouchableOpacity>
             
             
            </Animated.View>
          </ScrollView>

          {/* Security Note */}
          <Text style={styles.securityNote}>
            <Icon name="shield-check" size={12} color="#64FFDA60" /> Secure Authentication
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  imageContainer: {
    height: '35%',
    alignItems: 'center',
    paddingTop: 20,
  },
  universityText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  glowContainer: {
    position: 'relative',
  },
  image: {
    width: width * 0.85,
    height: width * 0.5,
    borderRadius: 15,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#64FFDA',
    shadowColor: '#64FFDA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: 'rgba(18, 30, 39, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  loginHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 20, 28, 0.7)',
    borderWidth: 1,
    borderColor: '#64FFDA30',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainerContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 20, 28, 0.7)',
    borderRadius: 12,
    marginVertical: 9,
    width: '90%',
    borderWidth: 1,
    borderColor: '#64FFDA30',
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  loginButton: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#64FFDA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinIcon: {
    marginRight: 10,
    transform: [{ rotate: '0deg' }],  // Will be animated in the component
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  forgotPasswordText: {
    color: '#64FFDA',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'monospace',
    paddingTop: 30,
  },
  securityNote: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    color: '#64FFDA60',
    fontSize: 12,
    fontFamily: 'monospace',
  }
});

export default AdminLoginScreen;