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
import { firebase, auth, database } from './firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ParentLoginScreen = () => {
  const navigation = useNavigation();
  
  const [parentId, setParentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

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

  // Function to log and display debug information
  const logDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => prev + "\n" + message);
  };

  const handleLogin = async () => {
    if (!parentId || !password) {
      Alert.alert('Error', 'Please enter Parent ID and Password');
      return;
    }

    setLoading(true);
    
    try {
      const cleanParentId = parentId.trim().replace(/[^0-9]/g, '');
      const cleanPassword = password.trim();

      logDebug(`Searching for parent with ID: ${cleanParentId}`);
      
      // Query the Parents node
      let snapshot = await database.ref('Parents')
        .orderByChild('id')
        .equalTo(cleanParentId)
        .once('value');
      
      // If not found in 'Parents', try the root path (fallback)
      if (!snapshot.exists()) {
        logDebug('Not found in /Parents, trying root path');
        snapshot = await database.ref('/')
          .orderByChild('id')
          .equalTo(cleanParentId)
          .once('value');
      }

      if (snapshot.exists()) {
        logDebug('Found matching record(s)');
        let loginSuccess = false;

        snapshot.forEach((childSnapshot) => {
          const parentData = childSnapshot.val();
          console.log("Parent data found:", JSON.stringify(parentData));
          
          if (parentData.password === cleanPassword) {
            loginSuccess = true;
            
            // Create a properly formatted student data object
            const studentData = {
              name: parentData.full_id || 'N/A',
              prn: parentData.id || 'N/A',
              email: parentData.email || 'N/A',
              branch: parentData.branch || 'N/A',
              division: parentData.division || 'N/A',
              admissionYear: parentData.year || 'N/A',
              // Add any other fields that might be needed
            };
            
            console.log("Navigating to ParentDashboard with student data:", JSON.stringify(studentData));
            
            navigation.navigate('ParentDashboard', { 
              studentData: studentData
            });
          }
        });

        if (!loginSuccess) {
          Alert.alert('Error', 'Invalid Password');
        }
      } else {
        Alert.alert('Error', 'No account found with this Parent ID');
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert('Error', `Login failed: ${error.message}`);
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
              <Icon name="account-child-circle" size={28} color="#64FFDA" /> PARENT ACCESS
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
            {/* Parent ID Input */}
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
                  placeholder="Parent ID"
                  placeholderTextColor="#64FFDA80"
                  value={parentId}
                  onChangeText={setParentId}
                  keyboardType="numeric"
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
                  placeholder="Enter Password"
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
            </Animated.View>

            {/* Debug Info - Only shown in development */}
            {__DEV__ && debugInfo ? (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>{debugInfo}</Text>
              </View>
            ) : null}
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
  debugContainer: {
    backgroundColor: 'rgba(10, 20, 28, 0.7)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#64FFDA30',
    width: '90%',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#64FFDA',
    fontFamily: 'monospace',
  },
  debugText: {
    fontSize: 12,
    color: '#FFFFFF',
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

export default ParentLoginScreen;