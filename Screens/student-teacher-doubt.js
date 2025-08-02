import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database } from './firebase';

const TeachersListScreen = ({ studentData: propStudentData }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // Get student data from props or navigation params
  useEffect(() => {
    console.log('Route params:', route.params);
    console.log('Props student data:', propStudentData);
    
    if (propStudentData) {
      setStudentData(propStudentData);
    } else if (route.params?.studentData) {
      setStudentData(route.params.studentData);
    }
  }, [route.params, propStudentData]);

  // Fetch ONLY teachers who teach the student's year and division
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch teachers for student:', studentData);
        
        // Don't fetch if we don't have student data
        if (!studentData || !studentData.Year || !studentData.Division) {
          console.log('Missing student data, cannot filter teachers');
          setTeachers([]);
          setLoading(false);
          return;
        }
        
        // Test database connection
        const testRef = database.ref();
        const testSnapshot = await testRef.once('value');
        console.log('Database connection test - data exists:', testSnapshot.exists());
        
        const facultyRef = database.ref('Faculty');
        const snapshot = await facultyRef.once('value');
        
        console.log('Faculty snapshot exists:', snapshot.exists());
        
        if (snapshot.exists()) {
          const facultyData = snapshot.val();
          console.log('Raw faculty data:', facultyData);
          const teachersList = [];
          
          // Filter teachers based on student's year and division
          Object.keys(facultyData).forEach(key => {
            const faculty = facultyData[key];
            console.log(`Processing faculty ${key}:`, faculty);
            
            // Get subject names
            let subjects = [];
            if (faculty.subjects) {
              if (typeof faculty.subjects === 'object') {
                subjects = Object.values(faculty.subjects);
              } else if (Array.isArray(faculty.subjects)) {
                subjects = faculty.subjects;
              }
            }
            
            // Get course codes
            let courseCodes = [];
            if (faculty.course_codes) {
              if (typeof faculty.course_codes === 'object') {
                courseCodes = Object.values(faculty.course_codes);
              } else if (Array.isArray(faculty.course_codes)) {
                courseCodes = faculty.course_codes;
              }
            }
            
            // Get years they teach
           // Replace the years and divisions processing with this:
let years = [];
if (faculty.years) {
  if (typeof faculty.years === 'object') {
    // Handle Firebase object structure
    years = Object.values(faculty.years).map(year => year.toString().trim());
  } else if (Array.isArray(faculty.years)) {
    years = faculty.years.map(year => year.toString().trim());
  }
}

let divisions = [];
if (faculty.divisions) {
  if (typeof faculty.divisions === 'object') {
    // Handle Firebase object structure
    divisions = Object.values(faculty.divisions).map(div => div.toString().trim());
  } else if (Array.isArray(faculty.divisions)) {
    divisions = faculty.divisions.map(div => div.toString().trim());
  }
}

// Normalize student year (remove "Year" from "1st Year")
const studentYear = studentData.Year.toString().replace(' Year', '').trim().toLowerCase();
const studentDivision = studentData.Division.toString().trim().toLowerCase();

// Check if teacher teaches the student's year
const teachesStudentYear = years.some(year => 
  year.toLowerCase().includes(studentYear)
);

// Check if teacher teaches the student's division
const teachesStudentDivision = divisions.some(division => 
  division.toLowerCase() === studentDivision
);
            
            console.log(`Teacher ${faculty.name}:`, {
              teachesStudentYear,
              teachesStudentDivision,
              teacherYears: years,
              teacherDivisions: divisions,
              studentYear,
              studentDivision
            });
            
            // Only add teacher if they teach BOTH the student's year AND division
            if (teachesStudentYear && teachesStudentDivision) {
              teachersList.push({
                id: key,
                name: faculty.name || 'Unknown Teacher',
                employee_id: faculty.employee_id || 'N/A',
                email: faculty.email || 'No email',
                password: faculty.password || '',
                role: faculty.role || 'Teacher',
                subjects: subjects,
                courseCodes: courseCodes,
                divisions: divisions,
                years: years,
                status: 'Active'
              });
              console.log(`Added teacher: ${faculty.name}`);
            } else {
              console.log(`Filtered out teacher: ${faculty.name} (Year: ${teachesStudentYear}, Division: ${teachesStudentDivision})`);
            }
          });
          
          console.log('Final filtered teachers list:', teachersList);
          setTeachers(teachersList);
        } else {
          console.log('No faculty data found');
          Alert.alert('Info', 'No faculty data found in database');
          setTeachers([]);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        Alert.alert('Error', 'Failed to fetch teachers data: ' + error.message);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when we have student data
    if (studentData) {
      fetchTeachers();
    }
  }, [studentData]); // Dependency on studentData so it refetches when student data changes

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

      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Your Teachers: {teachers.length}</Text>
        <Text style={styles.debugText}>
          Filtered for Year: {studentData?.Year || 'N/A'}, Division: {studentData?.Division || 'N/A'}
        </Text>
      </View>

      <FlatList
        data={teachers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TeacherListItem teacher={item} onPress={() => handleTeacherPress(item)} />
        )}
        contentContainerStyle={styles.listContainer}
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
          </View>
        }
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
    <Ionicons name="chevron-forward" size={20} color="#999" />
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
  debugContainer: {
    backgroundColor: '#d1ecf1',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#b8daff',
  },
  debugText: {
    fontSize: 12,
    color: '#0c5460',
    fontWeight: '500',
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
  teacherEmployeeId: { fontSize: 12, color: '#999', marginBottom: 2 },
  courseCodes: { fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 2 },
  teacherDivisions: { fontSize: 12, color: '#666', marginBottom: 2 },
  teacherYears: { fontSize: 12, color: '#666', marginBottom: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeBadge: { backgroundColor: '#e3f7e8' },
  leaveBadge: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#333', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
});

export default TeachersListScreen;