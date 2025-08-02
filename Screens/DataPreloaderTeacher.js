import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get } from 'firebase/database';

class DataPreloaderTeacher {
  constructor() {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.listeners = [];
    this.cache = new Map();
    this.lastCacheUpdate = null;
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    
    // Pre-compiled regex for better performance
    this.yearRegex = /\d+/;
    this.cleanYearRegex = /year|yr|st|nd|rd|th/gi;
    this.cleanDivisionRegex = /division|div/gi;
    this.spaceRegex = /\s+/g;
  }

  addProgressListener(listener) {
    this.listeners.push(listener);
  }

  removeProgressListener(listener) {
    if (listener) {
      this.listeners = this.listeners.filter(l => l !== listener);
    } else {
      this.listeners = []; // Clear all if no specific listener
    }
  }

  notifyProgress(step, total, message) {
    this.loadingProgress = (step / total) * 100;
    const progressData = {
      step,
      total,
      progress: this.loadingProgress,
      message,
      isComplete: step === total
    };
    
    // Use requestIdleCallback for non-blocking notifications
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.listeners.forEach(listener => listener(progressData));
      });
    } else {
      // Fallback for environments without requestIdleCallback
      setTimeout(() => {
        this.listeners.forEach(listener => listener(progressData));
      }, 0);
    }
  }

  isCacheValid(key) {
    if (!this.cache.has(key) || !this.lastCacheUpdate) return false;
    return (Date.now() - this.lastCacheUpdate) < this.CACHE_DURATION;
  }

  async getCachedDataFast(key) {
    try {
      // Memory cache first (instant)
      if (this.isCacheValid(key)) {
        return this.cache.get(key);
      }

      // AsyncStorage fallback (background load)
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = JSON.parse(data);
        this.cache.set(key, parsedData);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error(`Cache error for ${key}:`, error);
      return null;
    }
  }

  setCachedDataFast(key, data) {
    // Immediate memory cache
    this.cache.set(key, data);
    this.lastCacheUpdate = Date.now();
    
    // Background AsyncStorage (non-blocking)
    setImmediate(() => {
      AsyncStorage.setItem(key, JSON.stringify(data)).catch(error => {
        console.warn(`AsyncStorage error for ${key}:`, error);
      });
    });
  }

  // ULTRA-FAST preload with maximum optimization
  async preloadAllData(teacherData) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const startTime = Date.now();
    
    try {
      // STEP 1: Immediate session save (0ms delay)
      this.notifyProgress(1, 3, 'Initializing...');
      this.storeTeacherDataInstant(teacherData);
      
      // STEP 2: Parallel data loading with aggressive optimization
      this.notifyProgress(2, 3, 'Loading data...');
      
      const db = getDatabase();
      
      // Create all Firebase refs immediately
      const [studentsRef, facultyRef, assignmentsRef] = [
        ref(db, 'Students'),
        ref(db, 'Faculty'), 
        ref(db, 'Assignments')
      ];
      
      // Ultra-fast parallel loading with Promise.allSettled for fault tolerance
      const dataPromises = [
        this.ultraFastStudentsLoad(studentsRef, teacherData),
        this.ultraFastFacultyLoad(facultyRef),
        this.ultraFastAssignmentsLoad(assignmentsRef, teacherData)
      ];
      
      const results = await Promise.allSettled(dataPromises);
      
      // Log failures but don't block
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const types = ['students', 'faculty', 'assignments'];
          console.warn(`Fast load failed for ${types[index]}:`, result.reason);
        }
      });
      
      // STEP 3: Instant metadata cache
      this.notifyProgress(3, 3, 'Finalizing...');
      this.cacheMetadataInstant(teacherData);
      
      const loadTime = Date.now() - startTime;
      console.log(`🚀 ULTRA-FAST preload completed in ${loadTime}ms`);
      
    } catch (error) {
      console.error('Ultra-fast preload error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // INSTANT teacher data storage (no await)
  storeTeacherDataInstant(teacherData) {
    const timestamp = Date.now().toString(); // Faster than ISO string
    
    // All instant memory cache
    this.setCachedDataFast('teacherData', teacherData);
    this.setCachedDataFast('userRole', 'teacher');
    this.setCachedDataFast('lastTeacherDataUpdate', timestamp);
  }

  // ULTRA-FAST students loading with streaming optimization
  async ultraFastStudentsLoad(studentsRef, teacherData) {
    try {
      const snapshot = await get(studentsRef);
      
      if (!snapshot.exists()) {
        this.setCachedDataFast('assignedStudents', []);
        return;
      }
      
      const allStudents = snapshot.val();
      
      // HYPER-OPTIMIZED filtering with pre-processing
      const assignedStudents = this.hyperOptimizedStudentFilter(allStudents, teacherData);
      
      this.setCachedDataFast('assignedStudents', assignedStudents);
      console.log(`⚡ Ultra-fast filtered ${assignedStudents.length} students`);
      
    } catch (error) {
      console.error('Ultra-fast students load error:', error);
      this.setCachedDataFast('assignedStudents', []);
    }
  }

  // HYPER-OPTIMIZED student filtering (minimal operations)
async hyperOptimizedStudentFilter(allStudents, teacherData) {

    // Quick exit conditions
    if (!teacherData.divisions || !teacherData.years) return [];
    
    // Pre-process teacher data once with caching
    const teacherYears = this.fastNormalizeData(teacherData.years);
    const teacherDivisions = this.fastNormalizeData(teacherData.divisions);
    
    if (!teacherYears.length || !teacherDivisions.length) return [];
    
    // Create optimized lookup maps
    const yearMap = new Map();
    const divisionSet = new Set();
    
    // Pre-compute all possible year matches
    teacherYears.forEach(year => {
      const normalized = this.ultraFastNormalizeYear(year);
      yearMap.set(normalized, true);
      
      // Add number-only version for flexible matching
      const yearNum = this.yearRegex.exec(year);
      if (yearNum) {
        yearMap.set(yearNum[0], true);
      }
    });
    
    // Pre-compute division matches
    teacherDivisions.forEach(div => {
      divisionSet.add(this.ultraFastNormalizeDivision(div));
    });
    
    // STREAM PROCESSING: Process students in chunks to avoid blocking
    const assignedStudents = [];
    const entries = Object.entries(allStudents);
    const chunkSize = 1000; // Process 1000 students at a time
    
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      
      // Process chunk with optimized matching
      chunk.forEach(([key, student]) => {
        if (this.ultraFastMatch(student, yearMap, divisionSet)) {
          assignedStudents.push({ id: key, ...student });
        }
      });
      
      // Yield control every chunk to prevent blocking
      if (i % (chunkSize * 5) === 0 && i > 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    return assignedStudents;
  }

  // ULTRA-FAST matching with minimal operations
  ultraFastMatch(student, yearMap, divisionSet) {
    // Fast year check
    const studentYear = student.Year;
    if (studentYear) {
      const normalizedYear = this.ultraFastNormalizeYear(studentYear);
      if (!yearMap.has(normalizedYear)) {
        const yearNum = this.yearRegex.exec(studentYear);
        if (!yearNum || !yearMap.has(yearNum[0])) {
          return false;
        }
      }
    } else {
      return false;
    }
    
    // Fast division check
    const studentDivision = student.Division;
    if (studentDivision) {
      return divisionSet.has(this.ultraFastNormalizeDivision(studentDivision));
    }
    
    return false;
  }

  // ULTRA-FAST normalization (minimal regex)
  ultraFastNormalizeYear(year) {
    if (!year) return '';
    return year.toString()
      .toLowerCase()
      .replace(this.spaceRegex, '')
      .replace(this.cleanYearRegex, '');
  }

  ultraFastNormalizeDivision(division) {
    if (!division) return '';
    return division.toString()
      .toLowerCase()
      .replace(this.spaceRegex, '')
      .replace(this.cleanDivisionRegex, '');
  }

  // FAST data normalization with caching
  fastNormalizeData(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return Object.values(data);
    return [data];
  }

  // ULTRA-FAST faculty loading
  async ultraFastFacultyLoad(facultyRef) {
    try {
      const snapshot = await get(facultyRef);
      
      if (!snapshot.exists()) {
        this.setCachedDataFast('facultyData', []);
        return;
      }
      
      // Stream processing for large faculty data
      const facultyData = snapshot.val();
      const facultyList = [];
      
      // Optimized object iteration
      for (const [key, value] of Object.entries(facultyData)) {
        facultyList.push({ id: key, ...value });
      }
      
      this.setCachedDataFast('facultyData', facultyList);
      console.log(`⚡ Ultra-fast loaded ${facultyList.length} faculty`);
      
    } catch (error) {
      console.error('Ultra-fast faculty load error:', error);
      this.setCachedDataFast('facultyData', []);
    }
  }

  // ULTRA-FAST assignments loading
  async ultraFastAssignmentsLoad(assignmentsRef, teacherData) {
    try {
      const snapshot = await get(assignmentsRef);
      
      if (!snapshot.exists()) {
        this.setCachedDataFast('teacherAssignments', []);
        return;
      }
      
      const teacherId = teacherData.employeeId || teacherData.employee_id;
      const allAssignments = snapshot.val();
      
      // Optimized filtering with early exit
      const teacherAssignments = [];
      for (const [key, assignment] of Object.entries(allAssignments)) {
        if (assignment.teacherId === teacherId) {
          teacherAssignments.push({ id: key, ...assignment });
        }
      }
      
      this.setCachedDataFast('teacherAssignments', teacherAssignments);
      console.log(`⚡ Ultra-fast loaded ${teacherAssignments.length} assignments`);
      
    } catch (error) {
      console.error('Ultra-fast assignments load error:', error);
      this.setCachedDataFast('teacherAssignments', []);
    }
  }

  // INSTANT metadata caching
  cacheMetadataInstant(teacherData) {
    const divisions = teacherData.divisions || {};
    const years = teacherData.years || {};
    
    const metadata = {
      employeeId: teacherData.employeeId || teacherData.employee_id,
      dataVersion: '3.0', // Ultra-fast version
      lastUpdate: Date.now(), // Faster than ISO string
      divisions,
      years,
      subjects: teacherData.subjects || {},
      hasDivisions: this.fastHasData(divisions),
      hasYears: this.fastHasData(years)
    };
    
    this.setCachedDataFast('teacherMetadata', metadata);
  }

  // FAST data existence check
  fastHasData(data) {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return !!data;
  }

  // OPTIMIZED methods for external use
  async getCachedData(key) {
    return await this.getCachedDataFast(key);
  }

  async isDataFresh() {
    // Check memory cache first (instant)
    if (this.lastCacheUpdate) {
      return (Date.now() - this.lastCacheUpdate) < (60 * 60 * 1000); // 1 hour
    }
    
    // Quick AsyncStorage check
    try {
      const lastUpdate = await AsyncStorage.getItem('lastTeacherDataUpdate');
      if (!lastUpdate) return false;
      
      const updateTime = parseInt(lastUpdate);
      return (Date.now() - updateTime) < (60 * 60 * 1000);
    } catch {
      return false;
    }
  }

  async refreshData(teacherData) {
    // Instant cache clear
    this.cache.clear();
    this.lastCacheUpdate = null;
    
    // Background AsyncStorage clear
    const keysToRemove = [
      'assignedStudents', 'facultyData', 'teacherAssignments',
      'teacherMetadata', 'lastTeacherDataUpdate'
    ];
    
    setImmediate(() => {
      AsyncStorage.multiRemove(keysToRemove).catch(console.warn);
    });
    
    // Immediate fresh data load
    await this.preloadAllData(teacherData);
  }

  async clearCache() {
    this.cache.clear();
    this.lastCacheUpdate = null;
    
    const keysToRemove = [
      'teacherData', 'userRole', 'assignedStudents', 'facultyData',
      'teacherAssignments', 'teacherMetadata', 'lastTeacherDataUpdate'
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
  }

  // INSTANT division/year getters
  async getAvailableDivisions() {
    try {
      const metadata = await this.getCachedDataFast('teacherMetadata');
      if (!metadata?.divisions) return [];
      
      const divisions = this.fastNormalizeData(metadata.divisions);
      return divisions
        .filter(value => value && value.toString().trim())
        .map((value, index) => ({
          id: index.toString(),
          label: `Division ${value}`,
          value: value,
          isAssigned: true
        }));
    } catch (error) {
      console.error('Error getting divisions:', error);
      return [];
    }
  }

  async getAvailableYears() {
    try {
      const metadata = await this.getCachedDataFast('teacherMetadata');
      if (!metadata?.years) return [];
      
      const years = this.fastNormalizeData(metadata.years);
      return years
        .filter(value => value && value.toString().trim())
        .map((value, index) => ({
          id: index.toString(),
          label: value,
          value: value,
          isAssigned: true
        }));
    } catch (error) {
      console.error('Error getting years:', error);
      return [];
    }
  }

  // INSTANT data availability
  hasImmediateData() {
    return this.cache.has('teacherData') && 
           this.cache.has('teacherMetadata') && 
           this.isCacheValid('teacherData');
  }

  getImmediateData() {
    if (this.hasImmediateData()) {
      return {
        teacherData: this.cache.get('teacherData'),
        metadata: this.cache.get('teacherMetadata'),
        students: this.cache.get('assignedStudents') || [],
        faculty: this.cache.get('facultyData') || []
      };
    }
    return null;
  }

  // PERFORMANCE monitoring
  startPerformanceMonitoring() {
    console.log('🚀 Ultra-Fast DataPreloader initialized');
    console.log(`Cache size: ${this.cache.size} items`);
    console.log(`Memory usage: ${JSON.stringify(process.memoryUsage?.() || 'N/A')}`);
  }
}

// Export singleton with performance monitoring
const instance = new DataPreloaderTeacher();
instance.startPerformanceMonitoring();

export default instance;