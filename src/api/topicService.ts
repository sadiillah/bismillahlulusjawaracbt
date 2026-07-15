import apiClient from './axiosConfig';
import type { Topic, CreateTopicRequest, UpdateTopicRequest, PaginatedResponse, ApiResponse } from '../types';
import { AxiosError } from 'axios';
import csrfClient from './csrfClient';

export const topicService = {
  // Manager only routes
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Topic>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Topic>>('/topics', { params });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch topics.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async search(query: string): Promise<Topic[]> {
    try {
      const response = await apiClient.get<Topic[]>(`/topics/search?q=${query}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to search topics.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async create(data: CreateTopicRequest): Promise<Topic> {
    try {
      await csrfClient.get('/sanctum/csrf-cookie');

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('about', data.about);
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await apiClient.post<ApiResponse<Topic>>('/topics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create topic.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async update(id: number, data: UpdateTopicRequest): Promise<Topic> {
    try {
      await csrfClient.get('/sanctum/csrf-cookie');

      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('about', data.about || '');
      formData.append('_method', 'PUT');
      
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await apiClient.post<ApiResponse<Topic>>(`/topics/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update topic.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  async delete(id: number): Promise<void> {
    await csrfClient.get('/sanctum/csrf-cookie');
    await apiClient.delete(`/topics/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await csrfClient.get('/sanctum/csrf-cookie');
      await apiClient.delete('/topics/bulk-destroy', { data: { ids } });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete topics.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },

  // Shared routes (all roles)
  async getById(id: number): Promise<Topic> {
    try {
      const response = await apiClient.get<ApiResponse<Topic>>(`/topics/${id}`);
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch topic.');
      }
      throw new Error('Unexpected error. Please try again.');
    }
  },
};