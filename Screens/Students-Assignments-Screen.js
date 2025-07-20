import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

// Import the single image to be used for all assignments
const assignmentImage = require('../assets/Picsart_25-01-24_22-35-11-038.jpg');

const { width, height } = Dimensions.get('window');

const StudentAssignmentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [assignments, setAssignments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);

  // Get data from navigation params
  const {
    studentId,
    studentName,
    year,
    division,
    rollNumber
  } = route.params || {};

  // Mock assignments data with the same image for all
  const mockAssignments = [
    {
      id: '1',
      title: 'Mathematics Assignment - Chapter 5',
      subject: 'Mathematics',
      description: 'Solve all problems from Chapter 5: Algebra. Show your working for each problem and submit neat handwritten solutions.',
      teacherName: 'Mrs. Sharma',
      image: assignmentImage,
      createdAt: '2025-07-15T10:30:00Z',
      estimatedTime: '2 hours',
      maxMarks: 25,
      imageHeight: 200,
    },
    {
      id: '2',
      title: 'Science Project - Solar System',
      subject: 'Science',
      description: 'Create a detailed model of the solar system. Include all planets with their relative sizes and distances. Add interesting facts about each planet.',
      teacherName: 'Mr. Patel',
      image: assignmentImage,
      createdAt: '2025-07-16T14:15:00Z',
      estimatedTime: '4 hours',
      maxMarks: 50,
      imageHeight: 250,
    },
    {
      id: '3',
      title: 'English Essay - Creative Writing',
      subject: 'English',
      description: 'Write a creative essay about your favorite book character. Minimum 500 words. Include proper grammar and vocabulary.',
      teacherName: 'Ms. Kumar',
      image: assignmentImage,
      createdAt: '2025-07-10T09:00:00Z',
      estimatedTime: '1.5 hours',
      maxMarks: 20,
      imageHeight: 180,
    },
    {
      id: '4',
      title: 'History Timeline - Ancient India',
      subject: 'History',
      description: 'Create a comprehensive timeline of Ancient Indian civilizations. Include major events, rulers, and cultural developments.',
      teacherName: 'Mr. Singh',
      image: assignmentImage,
      createdAt: '2025-07-14T16:45:00Z',
      estimatedTime: '3 hours',
      maxMarks: 35,
      imageHeight: 220,
    },
    {
      id: '5',
      title: 'Geography Map Work',
      subject: 'Geography',
      description: 'Draw and label a detailed map of India showing all states, capitals, and major rivers. Use different colors for different regions.',
      teacherName: 'Mrs. Verma',
      image: assignmentImage,
      createdAt: '2025-07-17T12:00:00Z',
      estimatedTime: '2.5 hours',
      maxMarks: 30,
      imageHeight: 240,
    },
    {
      id: '6',
      title: 'Computer Programming - Python Basics',
      subject: 'Computer Science',
      description: 'Complete the Python programming exercises from Chapter 3. Include proper comments and documentation in your code.',
      teacherName: 'Mr. Tech',
      image: assignmentImage,
      createdAt: '2025-07-18T10:15:00Z',
      estimatedTime: '3 hours',
      maxMarks: 40,
      imageHeight: 200,
    }
  ];

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    setAssignments(mockAssignments);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAssignmentPress = (assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentDetail(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': '#4f46e5',
      'Science': '#059669',
      'English': '#dc2626',
      'History': '#7c3aed',
      'Geography': '#0891b2',
      'Computer Science': '#1e40af',
    };
    return colors[subject] || '#6b7280';
  };

  const renderAssignmentCard = (assignment) => (
    <TouchableOpacity
      key={assignment.id}
      style={styles.assignmentCard}
      onPress={() => handleAssignmentPress(assignment)}
      activeOpacity={0.7}
    >
      <Image 
        source={assignment.image} 
        style={[
          styles.assignmentImage, 
          { height: assignment.imageHeight || 200 }
        ]} 
        resizeMode="cover"
      />
      
      <View style={styles.assignmentContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.subjectBadge, { backgroundColor: getSubjectColor(assignment.subject) }]}>
            {assignment.subject}
          </Text>
          <Text style={styles.teacherName}>{assignment.teacherName}</Text>
        </View>
        
        <Text style={styles.assignmentTitle} numberOfLines={2}>
          {assignment.title}
        </Text>
        
        <Text style={styles.assignmentDescription} numberOfLines={3}>
          {assignment.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{assignment.estimatedTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Marks:</Text>
              <Text style={styles.infoValue}>{assignment.maxMarks}</Text>
            </View>
          </View>
          
          <Text style={styles.dateText}>
            Sent: {formatDate(assignment.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📚</Text>
      <Text style={styles.emptyStateTitle}>No assignments yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your teachers haven't sent any assignments yet. Check back later!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Assignments</Text>
        <Text style={styles.headerSubtitle}>
          {studentName} • {year} {division} • Roll: {rollNumber}
        </Text>
      </View>

      {/* Assignments Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''} from Teachers
        </Text>
      </View>

      {/* Assignments Vertical Scroll */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {assignments.length > 0 ? (
          assignments.map(renderAssignmentCard)
        ) : (
          renderEmptyState()
        )}
        
        {/* Extra padding at bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Assignment Detail Modal */}
      <Modal
        visible={showAssignmentDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAssignmentDetail(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assignment Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {selectedAssignment && (
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <Image 
                source={selectedAssignment.image} 
                style={[
                  styles.modalImage,
                  { height: selectedAssignment.imageHeight || 250 }
                ]}
                resizeMode="cover"
              />
              
              <View style={styles.modalDetails}>
                <View style={styles.modalSubjectHeader}>
                  <Text style={[styles.modalSubjectBadge, { backgroundColor: getSubjectColor(selectedAssignment.subject) }]}>
                    {selectedAssignment.subject}
                  </Text>
                  <Text style={styles.modalTeacherName}>{selectedAssignment.teacherName}</Text>
                </View>
                
                <Text style={styles.modalAssignmentTitle}>{selectedAssignment.title}</Text>
                
                <View style={styles.modalMetaContainer}>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.modalMetaLabel}>Estimated Time:</Text>
                    <Text style={styles.modalMetaValue}>{selectedAssignment.estimatedTime}</Text>
                  </View>
                  
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.modalMetaLabel}>Max Marks:</Text>
                    <Text style={styles.modalMetaValue}>{selectedAssignment.maxMarks}</Text>
                  </View>
                  
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.modalMetaLabel}>Sent Date:</Text>
                    <Text style={styles.modalMetaValue}>{formatDate(selectedAssignment.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Assignment Description:</Text>
                  <Text style={styles.descriptionText}>{selectedAssignment.description}</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    fontWeight: '400',
  },
  countContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexGrow: 1,
  },
  bottomPadding: {
    height: 30,
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  assignmentImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  assignmentContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  teacherName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSpacer: {
    minWidth: 60,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  modalDetails: {
    padding: 20,
  },
  modalSubjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSubjectBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTeacherName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  modalAssignmentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 32,
  },
  modalMetaContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalMetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalMetaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  modalMetaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  descriptionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
});

export default StudentAssignmentsScreen;