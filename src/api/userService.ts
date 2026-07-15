import apiClient from './axiosConfig';
import type { Teacher, Student, CreateUserRequest, UpdateUserRequest, StudentStatistics, PaginatedResponse, ApiResponse as TypesApiResponse } from '../types';

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string;
  gender: string;
  created_at: string | null;
  updated_at: string | null;
  email_verified_at: string | null;
  roles: string[]; // Array of role names
}

export interface PaginatedUsersResponse {
  data: User[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const userService = {
  /**
   * Get paginated users (teachers + students combined)
   * @param page - Page number
   * @param perPage - Number of users per page
   * @returns Paginated list of users
   */
  async getUsers(page: number = 1, perPage: number = 10): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<PaginatedUsersResponse>(
      `/users?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },
};

export const teacherService = {
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Teacher>> {
    const response = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params });
    return response.data;
  },

  async getPaginated(page: number = 1, perPage: number = 10, search?: string): Promise<PaginatedResponse<Teacher>> {
    const params: Record<string, unknown> = {
      page,
      per_page: perPage
    };
    
    if (search && search.trim()) {
      params.search = search.trim();
    }
    
    const response = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params });
    return response.data;
  },

  async search(query: string): Promise<Teacher[]> {
    const params = { search: query.trim() };
    const response = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params });
    return response.data.data;
  },

  async searchWithPagination(query: string = '', page: number = 1, limit: number = 8): Promise<{
    data: Teacher[];
    total: number;
    current_page: number;
    per_page: number;
    has_more: boolean;
  }> {
    const params: Record<string, unknown> = {
      page,
      per_page: limit
    };
    
    if (query.trim()) {
      params.search = query.trim();
    }
    
    const response = await apiClient.get('/teachers', { params });
    const data = response.data;
    return {
      data: data.data,
      total: data.meta.total,
      current_page: data.meta.current_page,
      per_page: data.meta.per_page,
      has_more: data.meta.current_page < data.meta.last_page
    };
  },

  async create(data: CreateUserRequest): Promise<Teacher> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('role', 'teacher');
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }

    const response = await apiClient.post<TypesApiResponse<Teacher>>('/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getById(id: number): Promise<Teacher> {
    const response = await apiClient.get<TypesApiResponse<Teacher>>(`/teachers/${id}`);
    return response.data.data;
  },

  async update(id: number, data: UpdateUserRequest): Promise<Teacher> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.gender) formData.append('gender', data.gender);
    formData.append('_method', 'PUT');
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiClient.post<TypesApiResponse<Teacher>>(`/teachers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/teachers/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/teachers/bulk-destroy', { data: { ids } });
  },

  async getProfile(): Promise<Teacher> {
    const response = await apiClient.get<TypesApiResponse<Teacher>>('/teacher/profile');
    return response.data.data;
  },

  async getStudentProfile(studentId: number): Promise<Student> {
    const response = await apiClient.get<TypesApiResponse<Student>>(`/teacher/students/${studentId}/profile`);
    return response.data.data;
  },
};

export const studentService = {
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<Student>> {
    const response = await apiClient.get<PaginatedResponse<Student>>('/students', { params });
    return response.data;
  },

  async search(query: string): Promise<Student[]> {
    const response = await apiClient.get<PaginatedResponse<Student>>(`/students`, { params: { search: query } });
    return response.data.data;
  },

  async create(data: CreateUserRequest): Promise<Student> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('role', 'student');
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }

    const response = await apiClient.post<TypesApiResponse<Student>>('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async update(id: number, data: UpdateUserRequest): Promise<Student> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.gender) formData.append('gender', data.gender);
    formData.append('_method', 'PUT');
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiClient.post<TypesApiResponse<Student>>(`/students/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getById(id: number, withClassroomStats: boolean = false): Promise<Student> {
    const params = withClassroomStats ? { with_classroom_stats: 'true' } : undefined;
    const response = await apiClient.get<TypesApiResponse<Student>>(`/students/${id}`, { params });
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/students/bulk-destroy', { data: { ids } });
  },

  async getStatistics(id: number): Promise<StudentStatistics> {
    const response = await apiClient.get<StudentStatistics>(`/students/${id}/statistics`);
    return response.data;
  },

  async getProfile(): Promise<Student> {
    const response = await apiClient.get<TypesApiResponse<Student>>('/student/profile');
    return response.data.data;
  },
};

export default userService;