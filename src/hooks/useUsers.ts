import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Teacher, Student, CreateUserRequest, UpdateUserRequest, PaginatedResponse } from '../types';
import { teacherService, studentService } from '../api/userService';
import combinedUserService from '../api/userService';

export const useTeachers = (params?: Record<string, unknown>) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Teacher>, 'data'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (fetchParams = params) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await teacherService.getAll(fetchParams);
      setTeachers(response.data);
      setPagination({
        links: response.links,
        meta: response.meta,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to fetch teachers';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const createTeacher = async (data: CreateUserRequest): Promise<Teacher> => {
    try {
      const newTeacher = await teacherService.create(data);
      await fetchTeachers();
      return newTeacher;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to create teacher';
      throw new Error(errorMessage);
    }
  };

  const updateTeacher = async (id: number, data: UpdateUserRequest): Promise<Teacher> => {
    try {
      const updatedTeacher = await teacherService.update(id, data);
      await fetchTeachers();
      return updatedTeacher;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to update teacher';
      throw new Error(errorMessage);
    }
  };

  const deleteTeacher = async (id: number): Promise<void> => {
    try {
      await teacherService.delete(id);
      await fetchTeachers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to delete teacher';
      throw new Error(errorMessage);
    }
  };

  const bulkDeleteTeachers = async (ids: number[]): Promise<void> => {
    try {
      await teacherService.bulkDelete(ids);
      await fetchTeachers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to delete teachers';
      throw new Error(errorMessage);
    }
  };

  const searchTeachers = async (query: string): Promise<Teacher[]> => {
    try {
      return await teacherService.search(query);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to search teachers';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    pagination,
    isLoading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    bulkDeleteTeachers,
    searchTeachers,
    refetch: fetchTeachers,
  };
};

export const useStudents = (params?: Record<string, unknown>) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Student>, 'data'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async (fetchParams = params) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentService.getAll(fetchParams);
      setStudents(response.data);
      setPagination({
        links: response.links,
        meta: response.meta,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to fetch students';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const createStudent = async (data: CreateUserRequest): Promise<Student> => {
    try {
      const newStudent = await studentService.create(data);
      await fetchStudents();
      return newStudent;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to create student';
      throw new Error(errorMessage);
    }
  };

  const updateStudent = async (id: number, data: UpdateUserRequest): Promise<Student> => {
    try {
      const updatedStudent = await studentService.update(id, data);
      await fetchStudents();
      return updatedStudent;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to update student';
      throw new Error(errorMessage);
    }
  };

  const deleteStudent = async (id: number): Promise<void> => {
    try {
      await studentService.delete(id);
      await fetchStudents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to delete student';
      throw new Error(errorMessage);
    }
  };

  const bulkDeleteStudents = async (ids: number[]): Promise<void> => {
    try {
      await studentService.bulkDelete(ids);
      await fetchStudents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to delete students';
      throw new Error(errorMessage);
    }
  };

  const searchStudents = async (query: string): Promise<Student[]> => {
    try {
      return await studentService.search(query);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to search students';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    pagination,
    isLoading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkDeleteStudents,
    searchStudents,
    refetch: fetchStudents,
  };
};

export const useTeacherProfile = () => {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const teacherProfile = await teacherService.getProfile();
      setProfile(teacherProfile);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to fetch teacher profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};

export const useStudentProfile = () => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const studentProfile = await studentService.getProfile();
      setProfile(studentProfile);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to fetch student profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};

export const useTeacherStudentProfile = (studentId: number | null) => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const studentProfile = await teacherService.getStudentProfile(studentId);
      setProfile(studentProfile);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : 'Failed to fetch student profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};

// Combined users hook (import already added above)

/**
 * Hook to fetch paginated users (teachers + students combined)
 */
export const usePaginatedUsers = (page: number = 1, perPage: number = 10) => {
  return useQuery({
    queryKey: ["users", page, perPage],
    queryFn: () => combinedUserService.getUsers(page, perPage),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
