// Dashboard and Statistics Types
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_subjects: number;
  total_classrooms: number;
  total_exams: number;
  active_exams: number;
}

export interface TeacherDashboardStats {
  total_subjects: number;
  total_exams: number;
  active_exams: number;
  pending_grading: number;
  total_students: number;
}

export interface StudentDashboardStats {
  enrolled_classrooms: number;
  available_exams: number;
  completed_exams: number;
  pending_exams: number;
  average_score: number;
}