import { apiClient } from './axiosConfig';
import type { ClassRoom, Student, Subject, CreateClassRoomRequest, UpdateClassRoomRequest, ClassRoomStatistics, PaginatedResponse, ApiResponse, StudentEnrollment } from '../types';

export const classroomService = {
  // Manager only routes
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<ClassRoom>> {
    const response = await apiClient.get<PaginatedResponse<ClassRoom>>('/class-rooms', { params });
    return response.data;
  },

  async search(query: string): Promise<ClassRoom[]> {
    const response = await apiClient.get<ClassRoom[]>(`/class-rooms/search?q=${query}`);
    return response.data;
  },

  async create(data: CreateClassRoomRequest): Promise<ClassRoom> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('grade', data.grade.toString());
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiClient.post<ApiResponse<ClassRoom>>('/class-rooms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async update(id: number, data: UpdateClassRoomRequest): Promise<ClassRoom> {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('grade', data.grade?.toString() || '');
    formData.append('_method', 'PUT');
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiClient.post<ApiResponse<ClassRoom>>(`/class-rooms/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/class-rooms/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/class-rooms/bulk-destroy', { data: { ids } });
  },

  // Student management
  async getStudents(id: number): Promise<Student[]> {
    const response = await apiClient.get<Student[]>(`/class-rooms/${id}/students`);
    return response.data;
  },

  async getAvailableStudents(id: number): Promise<Student[]> {
    const response = await apiClient.get<Student[]>(`/class-rooms/${id}/available-students`);
    return response.data;
  },

  async enrollStudent(classRoomId: number, studentId: number): Promise<void> {
    await apiClient.post(`/class-rooms/${classRoomId}/enroll-student`, { student_id: studentId });
  },

  async unenrollStudent(classRoomId: number, studentId: number): Promise<void> {
    await apiClient.delete(`/class-rooms/${classRoomId}/students/${studentId}`);
  },

  async updateStudentStatus(classRoomId: number, studentId: number, hasPassed: boolean, rapport?: string): Promise<void> {
    await apiClient.put(`/class-rooms/${classRoomId}/students/${studentId}/status`, {
      has_passed: hasPassed,
      rapport,
    });
  },

  async updateStudentRapport(studentId: number, classRoomId: number, hasPassed: boolean, rapportFile?: File): Promise<void> {
    const formData = new FormData();
    formData.append('has_passed', hasPassed.toString());
    
    if (rapportFile) {
      formData.append('rapport', rapportFile);
    }

    await apiClient.post(`/students/${studentId}/classrooms/${classRoomId}/rapport`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },


  async getAvailableStudentsPaginated(_id: number, page: number = 1, perPage: number = 6, search: string = ''): Promise<{
    data: Student[];
    total: number;
    current_page: number;
    per_page: number;
    has_more: boolean;
  }> {
    const params: { page: number; limit: number; q?: string } = { page, limit: perPage };
    if (search) {
      params.q = search;
    }
    const response = await apiClient.get<{ 
      success: boolean; 
      data: Student[];
      total: number;
      current_page: number;
      per_page: number;
      has_more: boolean;
    }>(`/students/search`, { params });
    return {
      data: response.data.data,
      total: response.data.total,
      current_page: response.data.current_page,
      per_page: response.data.per_page,
      has_more: response.data.has_more
    };
  },

  async bulkEnrollStudents(classRoomId: number, studentIds: number[]): Promise<void> {
    await apiClient.post(`/classrooms/${classRoomId}/bulk-enroll`, { 
      student_ids: studentIds 
    });
  },

  // Subject management
  async getSubjects(id: number): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>(`/class-rooms/${id}/subjects`);
    return response.data;
  },

  async getAvailableSubjects(id: number): Promise<Subject[]> {
    const response = await apiClient.get<{ success: boolean; data: Subject[] }>(`/classrooms/${id}/available-subjects`);
    return response.data.data;
  },

  async getAvailableSubjectsPaginated(_id: number, page: number = 1, perPage: number = 6, search: string = ''): Promise<{
    data: Subject[];
    total: number;
    current_page: number;
    per_page: number;
    has_more: boolean;
  }> {
    const params: { page: number; limit: number; q?: string } = { page, limit: perPage };
    if (search) {
      params.q = search;
    }
    const response = await apiClient.get<{ 
      success: boolean; 
      data: Subject[];
      total: number;
      current_page: number;
      per_page: number;
      has_more: boolean;
    }>(`/subjects/search`, { params });
    return {
      data: response.data.data,
      total: response.data.total,
      current_page: response.data.current_page,
      per_page: response.data.per_page,
      has_more: response.data.has_more
    };
  },

  async assignSubject(classRoomId: number, subjectId: number): Promise<void> {
    await apiClient.post(`/class-rooms/${classRoomId}/assign-subject`, { subject_id: subjectId });
  },

  async bulkAssignSubjects(classRoomId: number, subjectIds: number[]): Promise<void> {
    await apiClient.post(`/classrooms/${classRoomId}/bulk-assign-subjects`, { 
      subject_ids: subjectIds 
    });
  },

  async unassignSubject(classRoomId: number, subjectId: number): Promise<void> {
    await apiClient.delete(`/class-rooms/${classRoomId}/subjects/${subjectId}`);
  },

  async getStatistics(id: number): Promise<ClassRoomStatistics> {
    const response = await apiClient.get<ClassRoomStatistics>(`/class-rooms/${id}/statistics`);
    return response.data;
  },

  // Shared routes (all roles)
  async getById(id: number): Promise<ClassRoom> {
    const response = await apiClient.get<ApiResponse<ClassRoom>>(`/class-rooms/${id}`);
    return response.data.data;
  },

  // Student routes
  async getStudentClassrooms(): Promise<ClassRoom[]> {
    const response = await apiClient.get<{ success: boolean; data: StudentEnrollment[] }>('/student/classrooms');
    // Extract classroom data from enrollment records
    return response.data.data.map((enrollment: StudentEnrollment) => enrollment.class_room).filter(Boolean);
  },

  // Teacher routes
  async getTeacherClassrooms(): Promise<ClassRoom[]> {
    const response = await apiClient.get<{ success: boolean; data: ClassRoom[] }>('/teacher/classrooms');
    return response.data.data;
  },
};