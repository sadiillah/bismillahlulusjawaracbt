// Import Student and Teacher types to avoid conflicts with forward declarations
import type { Student, Teacher } from './users';

// Forward declarations for circular dependency resolution
interface Topic {
  id: number;
  name: string;
  about: string;
  photo: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
  tagline: string;
  photo: string;
  about: string;
  topic_id: number;
  teacher_id: number;
  topic?: Topic;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

// Exam Types
export interface SubjectExam {
  id: number;
  subject_id: number;
  name: string;
  about: string;
  total_points: number;
  started_at: string;
  ended_at: string;
  subject?: Subject;
  exam_questions?: ExamQuestion[];
  attempts?: ExamAttempt[];
  student_status?: string;
  exam_questions_count?: number;
  attempts_count?: number;
  completed_count?: number;
  in_progress_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: number;
  subject_exam_id: number;
  name: string;
  timer: number;
  type: 'multiple_choice' | 'essay';
  points: number;
  question_options?: QuestionOption[];
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: number;
  exam_question_id: number;
  is_correct: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswer {
  id: number;
  exam_question_id: number;
  student_id: number;
  answer_text?: string; // Renamed from 'answer' to match migration
  selected_option_id?: number;
  has_passed: boolean;
  points_earned: number;
  feedback?: string; // Added from 2025_08_06_015134 migration
  question?: ExamQuestion;
  exam_question?: ExamQuestion;
  student?: Student;
  selected_option?: QuestionOption;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: number;
  student_id: number;
  subject_exam_id: number;
  is_completed: boolean;
  total_questions: number;
  answered_questions: number;
  total_points: number;
  points_earned: number;
  has_passed: boolean;
  score_percentage: number;
  completion_percentage: number;
  completed_at?: string; // Nullable from 2025_08_05_112847 migration
  student?: Student;
  subject_exam?: SubjectExam;
  created_at: string;
  updated_at: string;
}

// Exam Request Types
export interface CreateExamRequest {
  subject_id: number;
  name: string;
  about: string;
  started_at: string;
  ended_at: string;
}

export interface UpdateExamRequest {
  subject_id?: number;
  name?: string;
  about?: string;
  started_at?: string;
  ended_at?: string;
}

export interface CreateQuestionRequest {
  subject_exam_id: number;
  name: string;
  timer: number;
  type: 'multiple_choice' | 'essay';
  points: number;
  options?: CreateOptionRequest[];
}

export interface UpdateQuestionRequest {
  subject_exam_id?: number;
  name?: string;
  timer?: number;
  type?: 'multiple_choice' | 'essay';
  points?: number;
  options?: CreateOptionRequest[];
}

export interface CreateOptionRequest {
  name: string;
  is_correct: boolean;
}

export interface UpdateOptionRequest {
  name?: string;
  is_correct?: boolean;
}

// Exam-related utility types
export interface ExamProgress {
  attempt?: ExamAttempt;
  progress: {
    answered_questions: number;
    total_questions: number;
    percentage_complete: number;
  };
  answers: QuestionAnswer[];
}

export interface ExamResult {
  exam: {
    id: number;
    name: string;
    subject: Subject;
    started_at: string;
    ended_at: string;
  };
  attempt: ExamAttempt;
  results: {
    total_points_earned: number;
    total_possible_points: number;
    percentage: number;
    grade: string;
    passed: boolean;
    completed_at: string;
  };
  answers: QuestionAnswer[];
}

export interface ExamStats {
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  pass_rate: number;
}

// Student Exam Response Types (for examService)
export interface StudentExamDetails {
  exam: SubjectExam;
  student: Student;
  answers: QuestionAnswer[];
  attempt: ExamAttempt | null;
  summary?: {
    total_questions: number;
    total_possible_points: number;
    total_points_earned: number;
    percentage: number;
  };
}

export interface StudentExamData {
  exam: SubjectExam;
  questions: ExamQuestion[];
  can_take: boolean;
  metadata?: {
    can_start: boolean;
    time_remaining?: number;
    attempts_left?: number;
  };
}

// Teacher API response interface (different from standard QuestionAnswer)
export interface TeacherAnswerResponse {
  answer_id: number;
  question?: {
    id: number;
    text: string;
    type: string;
    points: number;
    timer: number;
    options?: OptionTransform[];
  };
  student_answer: string;
  has_passed?: boolean;
  is_correct?: boolean;
  points_earned?: number;
  feedback?: string;
  answered_at: string;
}

// Teacher API response interface (what teacher endpoint actually returns)
export interface TeacherExamDetailsResponse {
  exam?: SubjectExam;
  student?: Student;
  answers: TeacherAnswerResponse[];
  attempt?: ExamAttempt;
}

// Manager API response interface (different structure)
export interface ManagerAnswerResponse {
  answers: QuestionAnswer[];
  summary?: {
    total_questions: number;
    total_possible_points: number;
    total_points_earned: number;
    percentage: number;
  };
}

export interface OptionTransform {
  id: number;
  text: string;
  is_correct: boolean;
  is_student_answer?: boolean;
}

// Partial ExamAttempt type for cases where we don't have complete data
export type PartialExamAttempt = Omit<ExamAttempt, 'id' | 'student_id' | 'subject_exam_id' | 'created_at' | 'updated_at'>;

// Type guard utilities
export interface ApiResponseData<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// Union response types for better type safety
export type ExamDetailsResponse = TeacherExamDetailsResponse | ManagerAnswerResponse;

// Manager API response with proper typing
export interface ManagerApiResponse {
  answers: QuestionAnswer[];
  summary: {
    total_questions: number;
    total_possible_points: number;
    total_points_earned: number;
    percentage: number;
  };
}

// Grading-related types
export interface GradeAnswerRequest {
  points_earned: number;
  feedback?: string;
  has_passed?: boolean;
}

export interface BulkGradeRequest {
  answers: Array<{
    id: number;
    points_earned: number;
    feedback?: string;
    has_passed?: boolean;
  }>;
}