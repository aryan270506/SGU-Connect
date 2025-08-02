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
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const TeacherLoginScreen = () => {
  const navigation = useNavigation();
  
  const [teacherName, setTeacherName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(100))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const inputAnim = useState([
    new Animated.Value(0),
    new Animated.Value(0)
  ])[0];
  const buttonAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Check for existing session when component mounts
    checkExistingSession();
});



  // Function to check if user has a valid session
  const checkExistingSession = async () => {
    try {
      console.log('Checking existing session...');
      
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

      // Clean userRole by removing extra quotes if they exist
      let cleanUserRole = userRole;
      if (typeof userRole === 'string') {
        cleanUserRole = userRole.replace(/^["'](.*)["']$/, '$1');
      }

      // Check if we have valid session data
      if (userData && cleanUserRole === 'teacher' && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        const now = new Date();
        
        console.log('Session expiry:', expiryDate);
        console.log('Current time:', now);
        console.log('Session valid:', expiryDate > now);

        // If session is still valid, navigate to dashboard
        if (expiryDate > now) {
          const parsedUserData = JSON.parse(userData);
          console.log('Valid session found, navigating to dashboard with data:', parsedUserData);
          
          navigation.reset({
            index: 0,
            routes: [{
              name: 'TeacherDashboard',
              params: parsedUserData
            }]
          });
          return; // Don't start animations or show login form
        } else {
          console.log('Session expired, clearing data');
          // Session expired, clear it
          await AsyncStorage.multiRemove(['userData', 'userRole', 'sessionExpiry']);
        }
      }

      // No valid session found, show login form
      setIsCheckingSession(false);
      startAnimations();
      
    } catch (error) {
      console.error('Error checking existing session:', error);
      setIsCheckingSession(false);
      startAnimations();
    }
  };

  const startAnimations = () => {
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
      Animated.stagger(200, [
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
  };

  // Function to store session data with proper structure
  const storeSessionData = async (teacherData) => {
    try {
      const sessionData = {
        teacherId: teacherData.employee_id,
        employeeId: teacherData.employee_id,
        teacherName: teacherData.name,
        course: teacherData.subjects?.e || 'N/A',
        selectedBranches: teacherData.course_codes ? [{ id: teacherData.course_codes.e, name: teacherData.course_codes.e }] : [],
        // PRESERVE ORIGINAL STRUCTURE:
        divisions: teacherData.divisions || {},  // Keep as object
        years: teacherData.years || {},          // Keep as object
        subjects: teacherData.subjects ? Object.values(teacherData.subjects) : [],
        role: teacherData.role || 'Teacher',
        loginTime: new Date().toISOString(),
        // Add additional fields for better session management
        originalData: teacherData // Store original data for reference
      };

      // Calculate session expiry (24 hours from now)
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // FIX: Store userRole as plain string without quotes
      await Promise.all([
        AsyncStorage.setItem('userData', JSON.stringify(sessionData)),
        AsyncStorage.setItem('userRole', 'teacher'), // Store as plain string, not JSON
        AsyncStorage.setItem('sessionExpiry', expiryTime),
        AsyncStorage.setItem('lastLoginTime', new Date().toISOString())
      ]);
      
      console.log('Session data stored successfully:', {
        sessionData: sessionData,
        userRole: 'teacher', // Log the clean role
        expiryTime: expiryTime
      });
      
      return sessionData;
    } catch (error) {
      console.error('Error storing session data:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!teacherName || !employeeId) {
      Alert.alert('Error', 'Please enter your Teacher Name and Password.');
      return;
    }

    setLoading(true);
    try {
      const database = getDatabase();
      const teachersRef = ref(database, 'Faculty');
      
      onValue(teachersRef, async (snapshot) => {
        const teachersData = snapshot.val();
        let teacherFound = null;

        // Search for teacher
        for (const key in teachersData) {
          if (teachersData[key].name.toLowerCase() === teacherName.toLowerCase() && 
              teachersData[key].employee_id === employeeId) {
            teacherFound = teachersData[key];
            break;
          }
        }

        if (teacherFound) {
          try {
            console.log('Teacher found:', teacherFound);
            
            // Clear any existing session data first
            await AsyncStorage.multiRemove(['userData', 'userRole', 'sessionExpiry']);
            
            // Store new session data
            const sessionData = await storeSessionData(teacherFound);
            
            console.log('Login successful, navigating to dashboard');
            
            // Navigate to teacher dashboard with session data
            navigation.reset({
              index: 0,
              routes: [{
                name: 'TeacherDashboard',
                params: sessionData
              }]
            });
            
          } catch (sessionError) {
            console.error('Error storing session:', sessionError);
            Alert.alert('Error', 'Failed to save session. Please try again.');
          }
        } else {
          Alert.alert('Error', 'Invalid teacher name or password');
        }
        setLoading(false);
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
      setLoading(false);
    }
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

  // Show loading screen while checking session
  if (isCheckingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0F2027', '#203A43', '#2C5364']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Icon name="loading" size={50} color="#64FFDA" style={styles.spinIcon} />
            <Text style={styles.loadingText}>Checking session...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
              <Icon name="account-tie" size={28} color="#64FFDA" /> FACULTY ACCESS
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
            {/* Teacher Name Input */}
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
                  placeholder="Teacher Name"
                  placeholderTextColor="#64FFDA80"
                  value={teacherName}
                  onChangeText={setTeacherName}
                  autoCapitalize="words"
                />
              </View>
            </Animated.View>

            {/* Password Input */}
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
                  placeholder="Password"
                  placeholderTextColor="#64FFDA80"
                  secureTextEntry={true}
                  value={employeeId}
                  onChangeText={setEmployeeId}
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

            {/* Forgot Password */}
            <Animated.View
              style={{
                width: '100%',
                alignItems: 'center',
                marginTop: 20,
                opacity: buttonAnim
              }}
            >
             <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Please contact your administrator to reset your password.')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64FFDA',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  spinIcon: {
    // Add rotation animation in component if needed
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
    marginVertical: 8,
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

export default TeacherLoginScreen;