import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const USER_CREDENTIALS = {
  admin: {
    id: 'admin',
    password: 'Admin123',
    dashboard: 'AdminDashboard',
  },
  teacher: {
    id: 'teacher',
    password: 'Teacher123',
    dashboard: 'TeacherDashboard',
  },
  student: {
    id: 'student',
    password: 'Student123',
    dashboard: 'StudentDashboard',
  },
  parents:{
    id: 'parents',
    password: 'Parents123',
    dashboard: 'ParentDashboard',
  }
};

const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [userIdFocused, setUserIdFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputSlideLeft = useRef(new Animated.Value(-30)).current;
  const inputSlideRight = useRef(new Animated.Value(-30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Floating particles animation
  const particle1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const particle2 = useRef(new Animated.ValueXY({ x: width * 0.8, y: height * 0.1 })).current;
  const particle3 = useRef(new Animated.ValueXY({ x: width * 0.2, y: height * 0.8 })).current;
  const particleOpacity1 = useRef(new Animated.Value(0)).current;
  const particleOpacity2 = useRef(new Animated.Value(0)).current;
  const particleOpacity3 = useRef(new Animated.Value(0)).current;

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateParticles = () => {
    // Animate particle 1
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(particle1, {
            toValue: { x: width * 0.2, y: height * 0.2 },
            duration: 15000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity1, {
            toValue: 0.7,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle1, {
            toValue: { x: width * 0.8, y: height * 0.5 },
            duration: 20000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity1, {
            toValue: 0.3,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle1, {
            toValue: { x: 0, y: 0 },
            duration: 18000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity1, {
            toValue: 0.5,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Animate particle 2
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(particle2, {
            toValue: { x: width * 0.2, y: height * 0.5 },
            duration: 18000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity2, {
            toValue: 0.5,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle2, {
            toValue: { x: width * 0.5, y: height * 0.2 },
            duration: 22000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity2, {
            toValue: 0.2,
            duration: 7000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle2, {
            toValue: { x: width * 0.8, y: height * 0.1 },
            duration: 20000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity2, {
            toValue: 0.4,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Animate particle 3
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(particle3, {
            toValue: { x: width * 0.8, y: height * 0.4 },
            duration: 16000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity3, {
            toValue: 0.6,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle3, {
            toValue: { x: width * 0.3, y: height * 0.3 },
            duration: 19000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity3, {
            toValue: 0.3,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle3, {
            toValue: { x: width * 0.2, y: height * 0.8 },
            duration: 17000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacity3, {
            toValue: 0.5,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

   useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 30,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(150, [
        Animated.spring(inputSlideLeft, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(inputSlideRight, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      startPulseAnimation();
      animateParticles();
    });
  }, []);

  const handleLogin = async () => {
    if (!userId.trim()) {
      shakeAnimation();
      Alert.alert('Error', 'Please enter your ID');
      return;
    }
    if (!password) {
      shakeAnimation();
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    // Button press animation
     Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      // Get reference to your database
      const dbRef = ref(database, '/');
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        let userFound = false;

        // Iterate through all users in the database
        for (const key in users) {
          const user = users[key];
          
          // Check if this user matches the credentials
          if ((user.id === userId || user.PRN === userId || user.Email === userId || user.email === userId) && 
              (user.password === password || user.Password === password)) {
            
            userFound = true;
            
            // Determine the dashboard based on role
            let dashboard;
            switch (user.Role) {
              case 'admin':
                dashboard = 'AdminDashboard';
                break;
              case 'teacher':
                dashboard = 'TeacherDashboard';
                break;
              case 'student':
                dashboard = 'StudentDashboard';
                break;
              case 'parent':
                dashboard = 'ParentDashboard';
                break;
              default:
                dashboard = 'StudentDashboard'; // Default fallback
            }

            Alert.alert('Success', 'Welcome to SGU Connect!', [
              {
                text: 'OK',
                onPress: () => navigation.navigate(dashboard, { userData: user }),
              },
            ]);
            break;
          }
        }

        if (!userFound) {
          shakeAnimation();
          Alert.alert('Error', 'Invalid credentials');
        }
      } else {
        shakeAnimation();
        Alert.alert('Error', 'No users found in database');
      }
    } catch (error) {
      console.error('Login error:', error);
      shakeAnimation();
      Alert.alert('Error', 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

    // Check credentials for all user types
 

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const shakeAnimation = () => {
    const shake = new Animated.Value(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    return shake;
  };

   return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Animated background particles (keep existing particle animations) */}
      
      <LinearGradient
        colors={['#1a237e', '#283593', '#3949ab']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo and Header (keep existing) */}
          
          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>User ID/Email/PRN</Text>
            <Animated.View style={[
              styles.inputContainer,
              userIdFocused && styles.inputContainerFocused,
              { transform: [{ translateX: inputSlideLeft }] }
            ]}>
              <TextInput
                style={styles.input}
                value={userId}
                onChangeText={setUserId}
                placeholder="Enter your ID, Email or PRN"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="none"
                keyboardType="default"
                onFocus={() => setUserIdFocused(true)}
                onBlur={() => setUserIdFocused(false)}
              />
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>👤</Text>
              </View>
            </Animated.View>

            <Text style={styles.inputLabel}>Password</Text>
            <Animated.View style={[
              styles.inputContainer,
              passwordFocused && styles.inputContainerFocused,
              { transform: [{ translateX: inputSlideRight }] }
            ]}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry={secureTextEntry}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity 
                onPress={toggleSecureEntry} 
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIconText}>{secureTextEntry ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.forgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#3949ab', '#5c6bc0', '#3949ab']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer (keep existing) */}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};