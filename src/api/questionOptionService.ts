import { apiClient } from './axiosConfig';
import type { 
  QuestionOption, 
  CreateOptionRequest, 
  UpdateOptionRequest,
  ApiResponse 
} from '../types';

export const questionOptionService = {
  // Get all options for a specific question
  async getByQuestion(questionId: number): Promise<QuestionOption[]> {
    const response = await apiClient.get<ApiResponse<QuestionOption[]>>(`/exam-questions/${questionId}/options`);
    return response.data.data;
  },

  // Get single option by ID
  async getById(id: number): Promise<QuestionOption> {
    const response = await apiClient.get<ApiResponse<QuestionOption>>(`/question-options/${id}`);
    return response.data.data;
  },

  // Create new option for a question
  async create(questionId: number, data: CreateOptionRequest): Promise<QuestionOption> {
    const formData = new FormData();
    formData.append('exam_question_id', questionId.toString());
    formData.append('name', data.name);
    formData.append('is_correct', data.is_correct.toString());

    const response = await apiClient.post<ApiResponse<QuestionOption>>('/question-options', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Update existing option
  async update(id: number, data: UpdateOptionRequest): Promise<QuestionOption> {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.is_correct !== undefined) formData.append('is_correct', data.is_correct.toString());
    
    formData.append('_method', 'PUT');

    const response = await apiClient.post<ApiResponse<QuestionOption>>(`/question-options/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Delete option
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/question-options/${id}`);
  },

  // Bulk create options for a question (useful when creating multiple choice questions)
  async bulkCreate(questionId: number, options: CreateOptionRequest[]): Promise<QuestionOption[]> {
    const formData = new FormData();
    formData.append('exam_question_id', questionId.toString());
    
    options.forEach((option, index) => {
      formData.append(`options[${index}][name]`, option.name);
      formData.append(`options[${index}][is_correct]`, option.is_correct.toString());
    });

    const response = await apiClient.post<ApiResponse<QuestionOption[]>>('/question-options/bulk-create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Bulk update options for a question
  async bulkUpdate(questionId: number, options: Array<UpdateOptionRequest & { id?: number }>): Promise<QuestionOption[]> {
    const formData = new FormData();
    formData.append('exam_question_id', questionId.toString());
    
    options.forEach((option, index) => {
      if (option.id) formData.append(`options[${index}][id]`, option.id.toString());
      if (option.name) formData.append(`options[${index}][name]`, option.name);
      if (option.is_correct !== undefined) formData.append(`options[${index}][is_correct]`, option.is_correct.toString());
    });
    
    formData.append('_method', 'PUT');

    const response = await apiClient.post<ApiResponse<QuestionOption[]>>(`/exam-questions/${questionId}/options/bulk-update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Delete all options for a question (useful when changing question type)
  async deleteByQuestion(questionId: number): Promise<void> {
    await apiClient.delete(`/exam-questions/${questionId}/options`);
  },

  // Reorder options within a question
  async reorder(questionId: number, optionIds: number[]): Promise<void> {
    await apiClient.put(`/exam-questions/${questionId}/options/reorder`, {
      option_ids: optionIds
    });
  }
};