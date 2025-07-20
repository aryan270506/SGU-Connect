import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { firebase, database } from './firebase'; // Import firebase

const AdminProfile = () => {
  // State to store admin data
  const [adminData, setAdminData] = useState({
    name: "",
    department: "",
    employeeId: "",
    role: ""
  });

  // Get route params that were passed from login screen
  const route = useRoute();
  
  useEffect(() => {
    // If we have params from navigation, use them
    if (route.params) {
      setAdminData({
        name: route.params.adminName || "",
        department: route.params.adminDepartment || "",
        employeeId: route.params.adminEmployeeId || "",
        role: route.params.adminRole || ""
      });
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
            }
          })
          .catch(error => {
            console.error("Error fetching admin data:", error);
          });
      }
    }
  }, [route]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#003366', '#0066cc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Administrator Profile</Text>
        <Text style={styles.headerSubtitle}>{adminData.role}</Text>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Department Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Administrator Information</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{adminData.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{adminData.department}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employee ID:</Text>
              <Text style={styles.infoValue}>{adminData.employeeId}</Text>
            </View>
            
            <View style={[styles.infoRow, styles.noBorder]}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{adminData.role}</Text>
            </View>
          </View>
        </View>
        
        {/* Decorative Element */}
        <View style={styles.decorationBar}>
          <View style={[styles.decorationSegment, { backgroundColor: '#003366' }]} />
          <View style={[styles.decorationSegment, { backgroundColor: '#0066cc' }]} />
          <View style={[styles.decorationSegment, { backgroundColor: '#3399ff' }]} />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>{adminData.department}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 160,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 10,
  },
  cardHeader: {
    backgroundColor: '#003366',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  decorationBar: {
    flexDirection: 'row',
    height: 8,
    marginTop: 30,
    marginHorizontal: 40,
  },
  decorationSegment: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  }
});

export default AdminProfile;