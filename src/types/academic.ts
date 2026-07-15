// Import types from users module to avoid duplication
import type { Teacher, Student } from './users';

// Academic Structure Types
export interface Topic {
  id: number;
  name: string;
  about: string;
  photo: string; // Required field from topics migration
  created_at: string;
  updated_at: string;
  subjects_count?: number;
}

export interface Subject {
  id: number;
  name: string;
  tagline: string;
  photo: string; // Required field from subjects migration
  content?: string; // PDF content file path
  about?: string | null; // Optional field to match API response
  topic_id: number;
  teacher_id: number;
  topic?: Topic;
  teacher?: Teacher;
  subject_exams_count?: number; // Additional field from API response
  class_subjects_count?: number; // Additional field from API response
  created_at: string | null;
  updated_at: string | null;
}

export interface ClassRoom {
  id: number;
  name: string;
  photo: string; // Required field from class_rooms migration
  grade: number;
  created_at: string;
  updated_at: string;
  students_count?: number;
  subjects_count?: number;
  class_students_count?: number;
  class_subjects_count?: number;
  class_students?: ClassStudent[];
  class_subjects?: ClassSubject[];
}

// Junction Table Types
export interface ClassStudent {
  id: number;
  student_id: number;
  class_room_id: number;
  has_passed: boolean;
  rapport: string; // Required field from class_students migration
  student?: Student;
  class_room?: ClassRoom;
  created_at: string;
  updated_at: string;
}

export interface ClassSubject {
  id: number;
  class_room_id: number;
  subject_id: number;
  class_room?: ClassRoom;
  subject?: Subject;
  created_at: string;
  updated_at: string;
}

// Request Types
export interface CreateTopicRequest {
  name: string;
  about: string;
  photo: File; // Required based on migration
}

export interface UpdateTopicRequest {
  name?: string;
  about?: string;
  photo?: File;
}

export interface CreateSubjectRequest {
  name: string;
  tagline: string;
  about: string;
  photo: File; // Required based on migration
  content: File; // Required PDF content
  topic_id: number;
  teacher_id: number;
}

export interface UpdateSubjectRequest {
  name?: string;
  tagline?: string;
  about?: string;
  photo?: File;
  content?: File; // Optional PDF content for updates
  topic_id?: number;
  teacher_id?: number;
}

export interface CreateClassRoomRequest {
  name: string;
  photo?: File; // Optional to match form schema
  grade: number;
}

export interface UpdateClassRoomRequest {
  name?: string;
  photo?: File;
  grade?: number;
}

// Rapport management types (based on class_students table)
export interface UploadRapportRequest {
  studentId: number;
  classRoomId: number;
  rapport: File; // PDF file for class_students.rapport field
}

export interface RapportInfo {
  exists: boolean;
  filename?: string;
  uploaded_at?: string;
  size?: number;
}

// Student Management Types
export type StudentStatus = 'passed' | 'in_progress';

export interface ManageStudentRequest {
  studentId: number;
  classRoomId: number;
  status: StudentStatus;
  rapport?: File; // Optional new rapport file
}

export interface ManageStudentModalData {
  student: Student;
  classStudent: ClassStudent;
  rapportInfo?: {
    exists: boolean;
    filename?: string;
    size?: string;
    url?: string;
  };
}

// Enrollment Types
export interface StudentEnrollment {
  id: number;
  student_id: number;
  class_room_id: number;
  has_passed: boolean;
  rapport: string;
  class_room: ClassRoom;
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface ClassRoomStatistics {
  total_students: number;
  active_students: number;
  passed_students: number;
  total_subjects: number;
  total_exams: number;
  average_completion_rate: number;
  subjects_count?: number;
  students_count?: number;
  pass_rate?: number;
}