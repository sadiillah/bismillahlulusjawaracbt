import type { UserRole } from './auth';

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  photo: string; // Required field from users migration
  gender?: string | null; // Optional/nullable field to match API response
  email_verified_at?: string | null; // Optional field from API response
  created_at: string | null;
  updated_at: string | null;
}

export interface Teacher extends User {
  subjects?: Subject[];
  subjects_count?: number;
}

export interface Student extends User {
  classrooms?: ClassRoom[];
  classrooms_summary?: ClassroomSummary[];
  exam_statistics?: ExamStatistics;
  class_students_count?: number;
}

// Forward declarations for circular dependency resolution
interface Subject {
  id: number;
  name: string;
  tagline: string;
  photo: string;
  about: string;
  topic_id: number;
  teacher_id: number;
  created_at: string;
  updated_at: string;
}

interface ClassRoom {
  id: number;
  name: string;
  photo: string;
  grade: number;
  created_at: string;
  updated_at: string;
  students_count?: number;
}

// Enhanced classroom summary for student details
export interface ClassroomSummary {
  classroom_id: number;
  classroom_name: string;
  total_students: number;
  total_subjects: number;
}

// Enhanced exam statistics for student details
export interface ExamStatistics {
  total_exams_available: number;
  total_exams_completed: number;
}

// User Request Types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  photo: File; // Required based on migration
  gender: string; // Required based on migration
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  photo?: File;
  gender?: string;
}

// Teacher-specific request types
export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  photo: File; // Required field from users migration
  gender: string; // Required field from users migration
}

export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  photo?: File;
  gender?: string;
}

// Student-specific request types
export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  photo: File; // Required field from users migration
  gender: string; // Required field from users migration
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  photo?: File;
  gender?: string;
}

// Student statistics type
export interface StudentStatistics {
  total_exams: number;
  completed_exams: number;
  passed_exams: number;
  average_score: number;
  enrolled_classrooms: number;
}