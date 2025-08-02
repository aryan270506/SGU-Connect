import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataPreloader from './datapreloderstudent.js';

const TeachersListScreen = ({ studentData: propStudentData }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentData, setStudentData] = useState(null);

  // Get student data from props or navigation params
  useEffect(() => {
    console.log('Route params:', route.params);
    console.log('Props student data:', propStudentData);
    
    if (propStudentData) {
      setStudentData(propStudentData);
    } else if (route.params?.studentData) {
      setStudentData(route.params.studentData);
    } else {
      // Try to get from AsyncStorage
      loadStudentDataFromStorage();
    }
  }, [route.params, propStudentData]);

  const loadStudentDataFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setStudentData(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading student data from storage:', error);
    }
  };

  // Load teachers data from cache or fetch fresh data
  useEffect(() => {
    if (studentData) {
      loadTeachersData();
    }
  }, [studentData]);

  const loadTeachersData = async () => {
    try {
      setLoading(true);
      
      // First, try to get cached data
      const cachedTeachers = await DataPreloader.getCachedData('teachersData');
      
      if (cachedTeachers && cachedTeachers.length > 0) {
        console.log(`Loaded ${cachedTeachers.length} teachers from cache`);
        setTeachers(cachedTeachers);
        setLoading(false);
        return;
      }
      
      // If no cached data, show message and try to refresh
      console.log('No cached teachers data found, attempting refresh...');
      Alert.alert(
        'Loading Teachers',
        'Teachers data is being loaded. This might take a moment.',
        [{ text: 'OK' }]
      );
      
      // Attempt to refresh data
      if (studentData) {
        await DataPreloader.preloadAllData(studentData);
        const refreshedTeachers = await DataPreloader.getCachedData('teachersData');
        setTeachers(refreshedTeachers || []);
      }
      
    } catch (error) {
      console.error('Error loading teachers data:', error);
      Alert.alert('Error', 'Failed to load teachers data. Please try refreshing.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!studentData) return;
    
    setRefreshing(true);
    try {
      // Force refresh data
      await DataPreloader.refreshData(studentData);
      const refreshedTeachers = await DataPreloader.getCachedData('teachersData');
      setTeachers(refreshedTeachers || []);
    } catch (error) {
      console.error('Error refreshing teachers data:', error);
      Alert.alert('Refresh Failed', 'Unable to refresh teachers data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTeacherPress = (teacher) => {
    navigation.navigate('ChatScreen', { teacher, studentData });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Student Dashboard</Text>
            <View style={styles.studentInfo}>
              <Text style={styles.studentYear}>{studentData?.Year || "N/A"}</Text>
              <Text style={styles.divider}>•</Text>
              <Text style={styles.studentDiv}>Division {studentData?.Division || "N/A"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6f42c1" />
          <Text style={styles.loadingText}>Loading your teachers...</Text>
          <Text style={styles.loadingSubText}>This should be faster next time!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Student Dashboard</Text>
          <View style={styles.studentInfo}>
            <Text style={styles.studentYear}>{studentData?.Year || "N/A"}</Text>
            <Text style={styles.divider}>•</Text>
            <Text style={styles.studentDiv}>Division {studentData?.Division || "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color="#0c5460" />
        <Text style={styles.infoBannerText}>
          Showing {teachers.length} teachers for your year and division
        </Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons 
            name="refresh" 
            size={16} 
            color={refreshing ? "#999" : "#0c5460"} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teachers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TeacherListItem teacher={item} onPress={() => handleTeacherPress(item)} />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6f42c1']}
            title="Pull to refresh teachers"
            titleColor="#6f42c1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Teachers Found</Text>
            <Text style={styles.emptySubtitle}>
              {studentData ? 
                `No teachers found for Year ${studentData.Year}, Division ${studentData.Division}` :
                'Student data not available'
              }
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={true}
        bounces={true}
      />
    </SafeAreaView>
  );
};

// Teacher List Item Component
const TeacherListItem = ({ teacher, onPress }) => (
  <TouchableOpacity style={styles.teacherItem} onPress={onPress}>
    <View style={styles.teacherAvatar}>
      <Ionicons name="person" size={32} color="#555" />
    </View>
    <View style={styles.teacherInfo}>
      <Text style={styles.teacherName}>{teacher.name}</Text>
      <View style={styles.subjectContainer}>
        <Text style={styles.teacherSubject}>
          {teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'No subjects'}
        </Text>
        <View style={[styles.statusBadge, teacher.status === 'Active' ? styles.activeBadge : styles.leaveBadge]}>
          <Text style={styles.statusText}>{teacher.status}</Text>
        </View>
      </View>
      <Text style={styles.teacherEmail}>{teacher.email}</Text>
      
      {teacher.courseCodes.length > 0 && (
        <Text style={styles.courseCodes}>
          Courses: {teacher.courseCodes.join(', ')}
        </Text>
      )}
      <Text style={styles.teacherDivisions}>
        Divisions: {teacher.divisions.join(', ') || 'None'}
      </Text>
      <Text style={styles.teacherYears}>
        Years: {teacher.years.join(', ') || 'None'}
      </Text>
    </View>
    <View style={styles.chevronContainer}>
      <Ionicons name="chevron-forward" size={20} color="#999" />
      <View style={styles.cachedIndicator}>
        <Ionicons name="flash" size={12} color="#4ade80" />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#6f42c1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  studentYear: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  divider: { fontSize: 16, color: '#ffffff', marginHorizontal: 8, opacity: 0.8 },
  studentDiv: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  infoBanner: {
    backgroundColor: '#d1ecf1',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b8daff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#0c5460',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  listContainer: { padding: 16 },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  teacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 4 },
  subjectContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  teacherSubject: { fontSize: 14, color: '#666', marginRight: 8, flex: 1 },
  teacherEmail: { fontSize: 13, color: '#888', marginBottom: 2 },
  courseCodes: { fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 2 },
  teacherDivisions: { fontSize: 12, color: '#666', marginBottom: 2 },
  teacherYears: { fontSize: 12, color: '#666', marginBottom: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeBadge: { backgroundColor: '#e3f7e8' },
  leaveBadge: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 12, fontWeight: '500' },
  chevronContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cachedIndicator: {
    marginTop: 2,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24,
    minHeight: 400,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '500', 
    color: '#333', 
    marginTop: 16, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6f42c1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TeachersListScreen;