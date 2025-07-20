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
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';


import { getDatabase, ref, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const firebaseConfig = {
  apiKey: "AIzaSyDXEiZQktAonvaVtdJieOgjrjfoY5Bh86Y",
  authDomain: "sgu-manager.firebaseapp.com",
  databaseURL: "https://sgu-manager-default-rtdb.firebaseio.com",
  projectId: "sgu-manager",
  storageBucket: "sgu-manager.firebasestorage.app",
  messagingSenderId: "932163150484",
  appId: "1:932163150484:web:ba157a636701bd2479ca81",
  measurementId: "G-5GHEQMJHMS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const StudentLoginScreen = () => {
  const navigation = useNavigation();
  
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
  }, []);

  const handleLogin = async () => {
    if (!rollNumber || !password) {
      Alert.alert('Error', 'Please enter your Roll Number and Password.');
      return;
    }

    setLoading(true);

    try {
      // In your database, the students are stored with numeric indices (0, 1, etc.)
      // We need to search through all students to find the one with matching PRN
      const studentsRef = ref(db, 'students');
      const snapshot = await get(studentsRef);
      
      if (!snapshot.exists()) {
        Alert.alert('Error', 'Student database not found.');
        setLoading(false);
        return;
      }
      
      // Find the student with matching PRN
      let foundStudent = null;
      let studentKey = null;
      
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.PRN === rollNumber) {
          foundStudent = data;
          studentKey = childSnapshot.key;
          return true; // Break the forEach loop
        }
      });
      
      if (!foundStudent) {
        Alert.alert('Error', 'Student not found. Please check your Roll Number.');
        setLoading(false);
        return;
      }

      // Check if password matches
      if (password !== foundStudent.password) {
        Alert.alert('Error', 'Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      // If password matches, try to authenticate with Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, foundStudent.Email, password);
      } catch (loginError) {
        // If user doesn't exist in Auth (first login), create the account
        try {
          await createUserWithEmailAndPassword(auth, foundStudent.Email, password);
        } catch (createError) {
          Alert.alert('Authentication Error', createError.message);
          setLoading(false);
          return;
        }
      }

      // Login successful, navigate to dashboard with student data
            navigation.navigate('StudentDashboard', {
              studentData: {
                PRN: foundStudent.PRN,
                Name: foundStudent.Name,
                Email: foundStudent.Email,
                Division: foundStudent.Division,
                Branch: foundStudent.Branch,
                Year: foundStudent.Year || '',
                password: password
              }
            });
      
    } catch (error) {
      Alert.alert('Error', 'Login failed: ' + error.message);
    } finally {
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
              <Icon name="school" size={28} color="#64FFDA" /> STUDENT ACCESS
            </Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="keyboard-backspace" size={24} color="#64FFDA" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.inputContainer}
            contentContainerStyle={styles.inputContainerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Roll Number Input */}
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
                <Icon name="identifier" size={20} color="#64FFDA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Roll Number"
                  placeholderTextColor="#64FFDA80"
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  autoCapitalize="none"
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
                  value={password}
                  onChangeText={setPassword}
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
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View> <Animated.View
              style={{
                width: '100%',
                alignItems: 'center',
                marginTop: 20,
                opacity: buttonAnim
              }}
            >
              <TouchableOpacity>
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

export default StudentLoginScreen;