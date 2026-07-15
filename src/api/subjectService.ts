import apiClient from './axiosConfig';
import type { Subject, CreateSubjectRequest, UpdateSubjectRequest, PaginatedResponse, ApiResponse } from '../types';
import { AxiosError } from 'axios';
import csrfClient from './csrfClient';

export const subjectService = {
  // Manager only routes
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Subject>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Subject>>('/subjects', { params });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch subjects.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async search(query: string): Promise<Subject[]> {
    try {
      const response = await apiClient.get<Subject[]>(`/subjects/search?q=${query}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to search subjects.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async create(data: CreateSubjectRequest): Promise<Subject> {
    try {
      await csrfClient.get('/sanctum/csrf-cookie');

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('tagline', data.tagline);
      formData.append('about', data.about);
      formData.append('topic_id', data.topic_id.toString());
      formData.append('teacher_id', data.teacher_id.toString());
      formData.append('photo', data.photo);
      formData.append('content', data.content);

      const response = await apiClient.post<ApiResponse<Subject>>('/subjects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create subject.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async update(id: number, data: UpdateSubjectRequest): Promise<Subject> {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('tagline', data.tagline || '');
    formData.append('about', data.about || '');
    formData.append('topic_id', (data.topic_id || 0).toString());
    formData.append('teacher_id', (data.teacher_id || 0).toString());
    formData.append('_method', 'PUT');
    
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.content) {
      formData.append('content', data.content);
    }

    const response = await apiClient.post<ApiResponse<Subject>>(`/subjects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  },

  // Teacher routes
  async getTeacherSubjects(params?: Record<string, unknown>): Promise<PaginatedResponse<Subject>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Subject>>('/teacher/subjects', { params });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch teacher subjects.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  // Shared routes (all roles)
  async getById(id: number): Promise<Subject> {
    try {
      const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch subject.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },
};