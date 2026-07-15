import apiClient from './axiosConfig';
import type { 
  ExamQuestion, 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  PaginatedResponse, 
  ApiResponse 
} from '../types';

export const examQuestionService = {
  // Get all questions for a specific exam
  async getByExam(examId: number, params?: Record<string, unknown>): Promise<ExamQuestion[]> {
    const response = await apiClient.get<ApiResponse<ExamQuestion[]>>(`/subject-exams/${examId}/questions`, { params });
    return response.data.data;
  },

  // Get paginated questions for a specific exam
  async getByExamPaginated(examId: number, params?: Record<string, unknown>): Promise<PaginatedResponse<ExamQuestion>> {
    const response = await apiClient.get<PaginatedResponse<ExamQuestion>>(`/subject-exams/${examId}/questions/paginated`, { params });
    return response.data;
  },

  // Get single question by ID
  async getById(id: number): Promise<ExamQuestion> {
    const response = await apiClient.get<ApiResponse<ExamQuestion>>(`/exam-questions/${id}`);
    return response.data.data;
  },

  // Create new question
  async create(data: CreateQuestionRequest): Promise<ExamQuestion> {
    const formData = new FormData();
    formData.append('subject_exam_id', data.subject_exam_id.toString());
    formData.append('name', data.name);
    formData.append('timer', data.timer.toString());
    formData.append('type', data.type);
    formData.append('points', data.points.toString());

    // Add options if provided (for multiple choice questions)
    if (data.options && data.options.length > 0) {
      data.options.forEach((option, index) => {
        formData.append(`options[${index}][name]`, option.name);
        formData.append(`options[${index}][is_correct]`, option.is_correct.toString());
      });
    }

    const response = await apiClient.post<ApiResponse<ExamQuestion>>('/exam-questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Update existing question
  async update(id: number, data: UpdateQuestionRequest): Promise<ExamQuestion> {
    const formData = new FormData();
    
    if (data.subject_exam_id !== undefined) formData.append('subject_exam_id', data.subject_exam_id.toString());
    if (data.name) formData.append('name', data.name);
    if (data.timer !== undefined) formData.append('timer', data.timer.toString());
    if (data.type) formData.append('type', data.type);
    if (data.points !== undefined) formData.append('points', data.points.toString());
    
    // Add options if provided
    if (data.options && data.options.length > 0) {
      data.options.forEach((option, index) => {
        formData.append(`options[${index}][name]`, option.name);
        formData.append(`options[${index}][is_correct]`, option.is_correct.toString());
      });
    }
    
    formData.append('_method', 'PUT');

    const response = await apiClient.post<ApiResponse<ExamQuestion>>(`/exam-questions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Delete question
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/exam-questions/${id}`);
  },

  // Bulk delete questions
  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/exam-questions/bulk-destroy', { data: { ids } });
  },

  // Search questions within an exam
  async search(examId: number, query: string): Promise<ExamQuestion[]> {
    const response = await apiClient.get<ApiResponse<ExamQuestion[]>>(`/subject-exams/${examId}/questions/search`, {
      params: { q: query }
    });
    return response.data.data;
  },

  // Duplicate question (useful for teachers)
  async duplicate(id: number): Promise<ExamQuestion> {
    const response = await apiClient.post<ApiResponse<ExamQuestion>>(`/exam-questions/${id}/duplicate`);
    return response.data.data;
  },

  // Reorder questions within an exam
  async reorder(examId: number, questionIds: number[]): Promise<void> {
    await apiClient.put(`/subject-exams/${examId}/questions/reorder`, {
      question_ids: questionIds
    });
  }
};