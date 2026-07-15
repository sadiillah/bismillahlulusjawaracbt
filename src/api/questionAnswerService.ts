import { apiClient } from './axiosConfig';
import type { 
  QuestionAnswer, 
  GradeAnswerRequest, 
  BulkGradeRequest,
  PaginatedResponse, 
  ApiResponse 
} from '../types';

export const questionAnswerService = {
  // Get all answers for a specific question (Teacher/Manager only)
  async getByQuestion(questionId: number, params?: Record<string, unknown>): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer[]>>(`/exam-questions/${questionId}/answers`, { params });
    return response.data.data;
  },

  // Get paginated answers for a specific question
  async getByQuestionPaginated(questionId: number, params?: Record<string, unknown>): Promise<PaginatedResponse<QuestionAnswer>> {
    const response = await apiClient.get<PaginatedResponse<QuestionAnswer>>(`/exam-questions/${questionId}/answers/paginated`, { params });
    return response.data;
  },

  // Get all answers for a specific exam (Teacher/Manager only)
  async getByExam(examId: number, params?: Record<string, unknown>): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer[]>>(`/subject-exams/${examId}/answers`, { params });
    return response.data.data;
  },

  // Get single answer by ID
  async getById(id: number): Promise<QuestionAnswer> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer>>(`/question-answers/${id}`);
    return response.data.data;
  },

  // Submit answer (Student only - during exam)
  async submit(examQuestionId: number, data: { answer_text?: string; selected_option_id?: number }): Promise<QuestionAnswer> {
    const formData = new FormData();
    formData.append('exam_question_id', examQuestionId.toString());
    
    if (data.answer_text) {
      formData.append('answer_text', data.answer_text);
    }
    if (data.selected_option_id) {
      formData.append('selected_option_id', data.selected_option_id.toString());
    }

    const response = await apiClient.post<ApiResponse<QuestionAnswer>>('/question-answers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Update answer (Student only - during exam, before submission)
  async update(id: number, data: { answer_text?: string; selected_option_id?: number }): Promise<QuestionAnswer> {
    const formData = new FormData();
    
    if (data.answer_text !== undefined) formData.append('answer_text', data.answer_text);
    if (data.selected_option_id !== undefined) formData.append('selected_option_id', data.selected_option_id.toString());
    
    formData.append('_method', 'PUT');

    const response = await apiClient.post<ApiResponse<QuestionAnswer>>(`/question-answers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Grade answer (Teacher only)
  async grade(id: number, data: GradeAnswerRequest): Promise<QuestionAnswer> {
    const response = await apiClient.post<ApiResponse<QuestionAnswer>>(`/question-answers/${id}/grade`, data);
    return response.data.data;
  },

  // Bulk grade answers (Teacher/Manager only)
  async bulkGrade(data: BulkGradeRequest): Promise<QuestionAnswer[]> {
    const response = await apiClient.post<ApiResponse<QuestionAnswer[]>>('/question-answers/bulk-grade', data);
    return response.data.data;
  },

  // Get answers needing grading (Teacher/Manager only)
  async getNeedingGrading(params?: Record<string, unknown>): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer[]>>('/question-answers/needs-grading', { params });
    return response.data.data;
  },

  // Get student's answers for an exam
  async getStudentAnswers(examId: number, studentId: number): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer[]>>(`/subject-exams/${examId}/students/${studentId}/answers`);
    return response.data.data;
  },

  // Get student's own answers for an exam (Student only)
  async getMyAnswers(examId: number): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<ApiResponse<QuestionAnswer[]>>(`/student/exams/${examId}/my-answers`);
    return response.data.data;
  },

  // Auto-grade multiple choice answers (System function)
  async autoGrade(examId: number): Promise<{ graded_count: number; total_answers: number }> {
    const response = await apiClient.post<{ graded_count: number; total_answers: number }>(`/subject-exams/${examId}/auto-grade`);
    return response.data;
  },

  // Get grading statistics for an exam
  async getGradingStats(examId: number): Promise<{
    total_answers: number;
    graded_answers: number;
    pending_answers: number;
    auto_graded: number;
    manual_graded: number;
    average_score: number;
  }> {
    const response = await apiClient.get<{
      total_answers: number;
      graded_answers: number;
      pending_answers: number;
      auto_graded: number;
      manual_graded: number;
      average_score: number;
    }>(`/subject-exams/${examId}/grading-stats`);
    return response.data;
  },

  // Delete answer (Admin only - for data cleanup)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/question-answers/${id}`);
  }
};