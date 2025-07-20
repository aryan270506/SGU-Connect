import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Animated, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { onAuthStateChanged } from 'firebase/auth';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(100))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const buttonAnim = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ])[0];

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
        Animated.timing(buttonAnim[0], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim[1], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim[2], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim[3], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

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
          
          {/* Tech-themed image or illustration */}
          <View style={styles.glowContainer}>
            <Image
              source={require('../assets/Picsart_25-01-24_22-35-11-038.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.glow} />
          </View>
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View 
            style={[
              styles.loginContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.loginHeaderText}>
              <Icon name="login-variant" size={28} color="#64FFDA" /> ACCESS PORTAL
            </Text>
            
            <View style={styles.textView}>
              <Text style={styles.textText}>
                "Connect to your digital campus ecosystem"
              </Text>
            </View>

            {/* Role Selection */}
            <View style={styles.rolesContainer}>
              {['student', 'teacher', 'parent'].map((role, index) => (
                <Animated.View 
                  key={role}
                  style={{ 
                    opacity: buttonAnim[index],
                    transform: [{ scale: buttonAnim[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })}]
                  }}
                >
                  <TouchableOpacity 
                    style={styles.roleButton}
                    onPress={() => navigation.navigate(`${role.charAt(0).toUpperCase() + role.slice(1)}Login`)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#203A43', '#2C5364']}
                      style={styles.roleIconContainer}
                    >
                      <Icon 
                        name={
                          role === 'student' ? 'school' : 
                          role === 'teacher' ? 'account-tie' : 'account-child'
                        } 
                        size={30} 
                        color="#64FFDA" 
                      />
                    </LinearGradient>
                    <Text style={styles.roleText}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}s
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* Admin Login Button */}
            <Animated.View
              style={{
                width: '100%',
                alignItems: 'center',
                opacity: buttonAnim[3],
                transform: [{ translateY: buttonAnim[3].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}]
              }}
            >
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate('AdminLogin')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#203A43', '#2C5364']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.adminGradient}
                >
                  <Icon name="shield-account" size={20} color="#64FFDA" style={styles.adminIcon} />
                  <Text style={styles.adminButtonText}>Admin Access</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Version info */}
            <Text style={styles.versionText}>v2.0.5</Text>
          </Animated.View>
        </ScrollView>
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
    height: '40%',
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
    width: width *.85,
    height: width * 0.63,
    borderRadius: 15,padding: 50,
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
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  loginContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 30, 39, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  loginHeaderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  textView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 15,
    padding: 20,
    width: '90%',
    backgroundColor: 'rgba(10, 20, 28, 0.5)',
    borderWidth: 1,
    borderColor: '#64FFDA20',
  },
  textText: {
    color: '#BFE9DB',
    fontSize: 16,
    fontWeight: '400',
    alignContent: 'center',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 30,
  },
  roleButton: {
    alignItems: 'center',
    width: width / 4,
  },
  roleIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#64FFDA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#64FFDA30',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  adminButton: {
    marginTop: 20,
    width: '60%',
    shadowColor: '#64FFDA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  adminGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#64FFDA40',
  },
  adminIcon: {
    marginRight: 8,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  versionText: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    color: '#64FFDA60',
    fontSize: 10,
    fontFamily: 'monospace',
  }
});

export default LoginScreen;