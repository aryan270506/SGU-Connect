// DataPreloader.js - Service to preload all data after login
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get } from 'firebase/database';

class DataPreloader {
  constructor() {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.listeners = [];
  }

  // Add listener for loading progress updates
  addProgressListener(listener) {
    this.listeners.push(listener);
  }

  // Remove listener
  removeProgressListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners about progress
  notifyProgress(step, total, message) {
    this.loadingProgress = (step / total) * 100;
    this.listeners.forEach(listener => 
      listener({
        step,
        total,
        progress: this.loadingProgress,
        message,
        isComplete: step === total
      })
    );
  }

  // Main preload function
  async preloadAllData(studentData) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const totalSteps = 4;
    let currentStep = 0;

    try {
      console.log('Starting data preload for student:', studentData);
      
      // Step 1: Store student data
      currentStep++;
      this.notifyProgress(currentStep, totalSteps, 'Saving student session...');
      await this.storeStudentData(studentData);
      
      // Step 2: Preload teachers data
      currentStep++;
      this.notifyProgress(currentStep, totalSteps, 'Loading your teachers...');
      await this.preloadTeachersData(studentData);
      
      // Step 3: Preload assignments data
      currentStep++;
      this.notifyProgress(currentStep, totalSteps, 'Loading assignments...');
      await this.preloadAssignmentsData(studentData);
      
      // Step 4: Cache additional data
      currentStep++;
      this.notifyProgress(currentStep, totalSteps, 'Finalizing...');
      await this.cacheAdditionalData(studentData);
      
      console.log('Data preload completed successfully');
      
    } catch (error) {
      console.error('Error during data preload:', error);
      // Don't throw error, let the app continue with fallback loading
    } finally {
      this.isLoading = false;
    }
  }

  // Store student data in AsyncStorage
  async storeStudentData(studentData) {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(studentData));
      await AsyncStorage.setItem('userRole', 'student');
      await AsyncStorage.setItem('lastDataUpdate', new Date().toISOString());
    } catch (error) {
      console.error('Error storing student data:', error);
      throw error;
    }
  }

  // Store teachers data in AsyncStorage (NEW METHOD)
  async storeTeachersData(teachersData) {
    try {
      await AsyncStorage.setItem('teachersData', JSON.stringify(teachersData));
      await AsyncStorage.setItem('lastDataUpdate', new Date().toISOString());
      console.log('Teachers data stored in cache:', teachersData.length, 'teachers');
    } catch (error) {
      console.error('Error storing teachers data:', error);
      throw error;
    }
  }

  // Preload filtered teachers data
  async preloadTeachersData(studentData) {
    try {
      const db = getDatabase();
      const facultyRef = ref(db, 'Faculty');
      const snapshot = await get(facultyRef);
      
      if (!snapshot.exists()) {
        console.log('No faculty data found');
        await AsyncStorage.setItem('teachersData', JSON.stringify([]));
        return;
      }
      
      const facultyData = snapshot.val();
      const filteredTeachers = this.filterTeachersForStudent(facultyData, studentData);
      
      // Store filtered teachers data
      await this.storeTeachersData(filteredTeachers);
      
      console.log(`Preloaded ${filteredTeachers.length} teachers for student`);
      
    } catch (error) {
      console.error('Error preloading teachers data:', error);
      // Store empty array as fallback
      await AsyncStorage.setItem('teachersData', JSON.stringify([]));
    }
  }

  // Filter teachers based on student's year and division
  filterTeachersForStudent(facultyData, studentData) {
    const teachersList = [];
    
    if (!studentData.Year || !studentData.Division) {
      return teachersList;
    }
    
    Object.keys(facultyData).forEach(key => {
      const faculty = facultyData[key];
      
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
      let years = [];
      if (faculty.years) {
        if (typeof faculty.years === 'object') {
          years = Object.values(faculty.years).map(year => year.toString().trim());
        } else if (Array.isArray(faculty.years)) {
          years = faculty.years.map(year => year.toString().trim());
        }
      }
      
      // Get divisions they teach
      let divisions = [];
      if (faculty.divisions) {
        if (typeof faculty.divisions === 'object') {
          divisions = Object.values(faculty.divisions).map(div => div.toString().trim());
        } else if (Array.isArray(faculty.divisions)) {
          divisions = faculty.divisions.map(div => div.toString().trim());
        }
      }
      
      // Normalize student year and division
      const studentYear = studentData.Year.toString().replace(' Year', '').trim().toLowerCase();
      const studentDivision = studentData.Division.toString().trim().toLowerCase();
      
      // Check if teacher teaches the student's year and division
      const teachesStudentYear = years.some(year => 
        year.toLowerCase().includes(studentYear)
      );
      const teachesStudentDivision = divisions.some(division => 
        division.toLowerCase() === studentDivision
      );
      
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
      }
    });
    
    return teachersList;
  }

  // Preload assignments data (mock data for now)
  async preloadAssignmentsData(studentData) {
    try {
      // Generate mock assignments based on student data
      const assignments = this.generateMockAssignments(studentData);
      await AsyncStorage.setItem('assignmentsData', JSON.stringify(assignments));
      
      console.log(`Preloaded ${assignments.length} assignments`);
      
    } catch (error) {
      console.error('Error preloading assignments:', error);
      await AsyncStorage.setItem('assignmentsData', JSON.stringify([]));
    }
  }

  // Generate mock assignments (replace with real data loading later)
  generateMockAssignments(studentData) {
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];
    const teachers = ['Mrs. Sharma', 'Mr. Patel', 'Ms. Kumar', 'Mr. Singh', 'Mrs. Verma', 'Mr. Tech'];
    
    return subjects.map((subject, index) => ({
      id: String(index + 1),
      title: `${subject} Assignment - Chapter ${index + 1}`,
      subject: subject,
      description: `Complete the ${subject} assignment for ${studentData.Year} ${studentData.Division}. Show your working and submit neat solutions.`,
      teacherName: teachers[index] || 'Unknown Teacher',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: ['1.5 hours', '2 hours', '2.5 hours', '3 hours', '4 hours'][Math.floor(Math.random() * 5)],
      maxMarks: [20, 25, 30, 35, 40, 50][Math.floor(Math.random() * 6)],
      imageHeight: [180, 200, 220, 240, 250][Math.floor(Math.random() * 5)],
    }));
  }

  // Cache additional data that might be needed
  async cacheAdditionalData(studentData) {
    try {
      // Cache metadata
      const metadata = {
        studentId: studentData.PRN,
        dataVersion: '1.0',
        lastUpdate: new Date().toISOString(),
        year: studentData.Year,
        division: studentData.Division,
        branch: studentData.Branch
      };
      
      await AsyncStorage.setItem('appMetadata', JSON.stringify(metadata));
      
      // Cache any other data that might be needed
      // Add more data caching here as needed
      
    } catch (error) {
      console.error('Error caching additional data:', error);
    }
  }

  // Method to get cached data
  async getCachedData(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cached data for ${key}:`, error);
      return null;
    }
  }

  // Method to check if data is fresh (within 1 hour)
  async isDataFresh() {
    try {
      const lastUpdate = await AsyncStorage.getItem('lastDataUpdate');
      if (!lastUpdate) return false;
      
      const updateTime = new Date(lastUpdate);
      const now = new Date();
      const hoursDiff = (now - updateTime) / (1000 * 60 * 60);
      
      return hoursDiff < 1; // Data is fresh if updated within 1 hour
    } catch (error) {
      return false;
    }
  }

  // Method to force refresh data
  async refreshData(studentData) {
    await AsyncStorage.multiRemove([
      'teachersData',
      'assignmentsData',
      'appMetadata',
      'lastDataUpdate'
    ]);
    
    await this.preloadAllData(studentData);
  }

  // Method to clear all cached data
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        'userData',
        'userRole',
        'teachersData',
        'assignmentsData',
        'appMetadata',
        'lastDataUpdate'
      ]);
      console.log('All cached data cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Method to get cache size info
  async getCacheInfo() {
    try {
      const keys = ['userData', 'teachersData', 'assignmentsData', 'appMetadata'];
      const cacheInfo = {};
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        cacheInfo[key] = {
          exists: !!data,
          size: data ? data.length : 0,
          itemCount: data ? JSON.parse(data).length || 1 : 0
        };
      }
      
      const lastUpdate = await AsyncStorage.getItem('lastDataUpdate');
      cacheInfo.lastUpdate = lastUpdate;
      cacheInfo.isDataFresh = await this.isDataFresh();
      
      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }

  // Method to warm up cache on app start
  async warmUpCache(studentData) {
    try {
      const isDataFresh = await this.isDataFresh();
      const cachedTeachers = await this.getCachedData('teachersData');
      
      // If data is stale or missing, preload in background
      if (!isDataFresh || !cachedTeachers) {
        console.log('Cache warming: Data is stale or missing, preloading...');
        // Don't await this, let it run in background
        this.preloadAllData(studentData).catch(error => {
          console.error('Background cache warm-up failed:', error);
        });
      } else {
        console.log('Cache warming: Data is fresh, no preload needed');
      }
    } catch (error) {
      console.error('Error warming up cache:', error);
    }
  }
} // <-- Add this closing brace for the class

// Export singleton instance
export default new DataPreloader();
