// optimized_parent_chat.js with AsyncStorage-first logic to reduce startup delay

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from './firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParentsTeacherChat from './ParentsTeacherChat';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const ProfileItem = ({ icon, label, value }) => (
  <View style={styles.profileItem}>
    <MaterialIcons name={icon} size={20} color="#2196F3" />
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      <Text style={styles.profileItemValue}>{value}</Text>
    </View>
  </View>
);

const ParentAdminChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [parentData, setParentData] = useState(null);

  const navigation = useNavigation();
  const routeStudentData = route.params?.studentData;
  const prn = routeStudentData?.prn;
  const flatListRef = useRef(null);

  const clearSessionData = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userRole');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          setLoading(true);
          await clearSessionData();
          setMessages([]);
          setStudentData(null);
          setParentData(null);
          setNewMessage('');
          setProfileModalVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'ParentLogin' }] });
          setLoading(false);
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('userData');
        let parsed = cached ? JSON.parse(cached) : null;

        if (!parsed && routeStudentData) {
          parsed = routeStudentData;
          await AsyncStorage.setItem('userData', JSON.stringify(parsed));
        }

        if (parsed) {
          setStudentData(parsed);
          setParentData({ number: parsed.parentNumber || parsed.parentPassword || 'N/A' });
        } else {
          Alert.alert("Session Expired", "Please log in again.");
          navigation.reset({ index: 0, routes: [{ name: 'ParentLogin' }] });
        }
      } catch (error) {
        console.error('AsyncStorage error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === '' || !studentData) return;
    const msg = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      isAdmin: false,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const sendImage = async (uri) => {
    if (!studentData) return;
    setImageLoading(true);
    const imgMsg = {
      id: Date.now().toString(),
      imageUri: uri,
      isAdmin: false,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'image',
    };
    setMessages((prev) => [...prev, imgMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    Alert.alert('Success', 'Image sent');
    setImageLoading(false);
  };

  const showImagePicker = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: () => openCamera() },
      { text: 'Choose from Library', onPress: () => openGallery() },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) sendImage(result.assets[0].uri);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) sendImage(result.assets[0].uri);
  };

  const renderMessage = ({ item }) => {
    const isParent = !item.isAdmin;
    return (
      <View style={[styles.messageItem, isParent ? styles.parent : styles.admin]}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.imageUri }} style={{ width: 200, height: 150 }} />
        ) : (
          <Text>{item.text}</Text>
        )}
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    );
  };

  const renderProfileModal = () => {
    if (!studentData) return null;
    return (
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Student Profile</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setProfileModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <ProfileItem icon="person" label="Name" value={studentData.name} />
            <ProfileItem icon="badge" label="PRN" value={studentData.parentPassword} />
            <ProfileItem icon="email" label="Email" value={studentData.email} />
            <ProfileItem icon="school" label="Branch" value={studentData.branch} />
            <ProfileItem icon="groups" label="Division" value={studentData.division} />
            <ProfileItem icon="calendar-today" label="Year" value={studentData.admissionYear} />
            <ProfileItem icon="phone" label="Parent Contact" value={studentData.prn} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}><ActivityIndicator size="large" /><Text>Loading...</Text></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Messages</Text>
        <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
          <MaterialIcons name="person" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={showImagePicker}>
            <MaterialIcons name="camera-alt" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type message"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity onPress={sendMessage}>
            <MaterialIcons name="send" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {renderProfileModal()}
    </SafeAreaView>
  );
};

const ParentDashboard = ({ route }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = route.name === 'Admin' ? 'admin-panel-settings' : 'people';
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Admin" component={ParentAdminChatScreen} initialParams={{ studentData: route.params?.studentData }} />
    <Tab.Screen name="Teachers" component={ParentsTeacherChat} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#2196F3', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', padding: 8, alignItems: 'center', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, marginHorizontal: 8 },
  messageItem: { margin: 10, padding: 10, borderRadius: 10 },
  parent: { backgroundColor: '#E3F2FD', alignSelf: 'flex-end' },
  admin: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  timestamp: { fontSize: 10, color: '#666', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  profileItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  profileItemContent: { marginLeft: 10 },
  profileItemLabel: { fontSize: 12, color: '#757575' },
  profileItemValue: { fontSize: 14, fontWeight: 'bold' },
  logoutButton: { marginTop: 20, flexDirection: 'row', backgroundColor: '#F44336', padding: 10, borderRadius: 6, justifyContent: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold', marginLeft: 6 },
});

export default ParentDashboard;
