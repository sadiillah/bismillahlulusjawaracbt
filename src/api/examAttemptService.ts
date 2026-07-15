import { apiClient } from './axiosConfig';
import type { 
  ExamAttempt, 
  ExamResult,
  PaginatedResponse, 
  ApiResponse 
} from '../types';

export const examAttemptService = {
  // Get all attempts for a specific exam (Manager/Teacher only)
  async getByExam(examId: number, params?: Record<string, unknown>): Promise<ExamAttempt[]> {
    const response = await apiClient.get<ApiResponse<ExamAttempt[]>>(`/subject-exams/${examId}/attempts`, { params });
    return response.data.data;
  },

  // Get paginated attempts for a specific exam
  async getByExamPaginated(examId: number, params?: Record<string, unknown>): Promise<PaginatedResponse<ExamAttempt>> {
    const response = await apiClient.get<PaginatedResponse<ExamAttempt>>(`/subject-exams/${examId}/attempts/paginated`, { params });
    return response.data;
  },

  // Get single attempt by ID
  async getById(id: number): Promise<ExamAttempt> {
    const response = await apiClient.get<ApiResponse<ExamAttempt>>(`/exam-attempts/${id}`);
    return response.data.data;
  },

  // Get student's attempts for a specific exam
  async getStudentAttempts(examId: number, studentId: number): Promise<ExamAttempt[]> {
    const response = await apiClient.get<ApiResponse<ExamAttempt[]>>(`/subject-exams/${examId}/students/${studentId}/attempts`);
    return response.data.data;
  },

  // Get student's own attempts (Student only) - Use results endpoint since my-attempts doesn't exist
  async getMyAttempts(examId: number): Promise<ExamAttempt[]> {
    try {
      // Try to get exam results which contains attempt data
      const response = await apiClient.get<ApiResponse<ExamResult>>(`/student/exams/${examId}/results`);
      const resultsData = response.data.data;
      
      // Transform results data to ExamAttempt format if attempt exists
      if (resultsData?.attempt) {
        return [resultsData.attempt];
      }
      
      // If no attempt data, return empty array
      return [];
    } catch (error) {
      // If results endpoint fails (exam not completed), return empty array
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return [];
        }
      }
      throw error;
    }
  },

  // Get current active attempt for student
  async getCurrentAttempt(examId: number): Promise<ExamAttempt | null> {
    const response = await apiClient.get<ApiResponse<ExamAttempt | null>>(`/student/exams/${examId}/current-attempt`);
    return response.data.data;
  },

  // Start new exam attempt (Student only)
  async start(examId: number): Promise<ExamAttempt> {
    const response = await apiClient.post<ApiResponse<ExamAttempt>>(`/student/exams/${examId}/start`);
    return response.data.data;
  },

  // Complete exam attempt (Student only)
  async complete(examId: number): Promise<ExamAttempt> {
    const response = await apiClient.post<ApiResponse<ExamAttempt>>(`/student/exams/${examId}/complete`);
    return response.data.data;
  },

  // Update attempt metadata (rarely used)
  async update(id: number, data: { total_attempts?: number; is_completed?: boolean }): Promise<ExamAttempt> {
    const response = await apiClient.put<ApiResponse<ExamAttempt>>(`/exam-attempts/${id}`, data);
    return response.data.data;
  },

  // Delete attempt (Admin only - for cleanup)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/exam-attempts/${id}`);
  },

  // Get attempt statistics for an exam
  async getExamAttemptStats(examId: number): Promise<{
    total_attempts: number;
    completed_attempts: number;
    in_progress_attempts: number;
    average_completion_time: number;
    completion_rate: number;
  }> {
    const response = await apiClient.get<{
      total_attempts: number;
      completed_attempts: number;
      in_progress_attempts: number;
      average_completion_time: number;
      completion_rate: number;
    }>(`/subject-exams/${examId}/attempt-stats`);
    return response.data;
  },

  // Get all active attempts (Teacher/Manager - for monitoring)
  async getActiveAttempts(params?: Record<string, unknown>): Promise<ExamAttempt[]> {
    const response = await apiClient.get<ApiResponse<ExamAttempt[]>>('/exam-attempts/active', { params });
    return response.data.data;
  },

  // Bulk complete attempts (Admin - emergency function)
  async bulkComplete(attemptIds: number[]): Promise<ExamAttempt[]> {
    const response = await apiClient.post<ApiResponse<ExamAttempt[]>>('/exam-attempts/bulk-complete', {
      attempt_ids: attemptIds
    });
    return response.data.data;
  },

  // Reset student's attempt (Teacher/Manager only - allow retake)
  async resetStudentAttempt(examId: number, studentId: number): Promise<void> {
    await apiClient.delete(`/subject-exams/${examId}/students/${studentId}/reset-attempt`);
  }
};