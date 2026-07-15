import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { studentService } from "../api/userService";
import apiClient from "../api/axiosConfig";
import type { ApiError, Student, PaginatedResponse, CreateUserRequest, UpdateUserRequest, StudentStatistics } from "../types";
import { useAuth } from "../context";


export const useFetchAllStudents = () => {
  return useQuery<Student[], AxiosError>({
    queryKey: ["all-students"],
    queryFn: async () => {
      const response = await studentService.getAll({ all: true });
      return response.data;
    },
    retry: false,
  });
};

export const useFetchStudents = (page: number = 1) => {
  return useQuery<PaginatedResponse<Student>, AxiosError>({
    queryKey: ["students", page],
    queryFn: async () => {
      return await studentService.getAll({ page, per_page: 8 });
    },
    retry: false,
  });
};

export const useFetchStudent = (id: number) => {
  return useQuery<Student, AxiosError>({
    queryKey: ["student", id],
    queryFn: async () => {
      return await studentService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useFetchStudentWithStats = (id: number) => {
  return useQuery<Student, AxiosError>({
    queryKey: ["student", id, "with-stats"],
    queryFn: async () => {
      return await studentService.getById(id, true);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useSearchStudents = (query: string) => {
  return useQuery<Student[], AxiosError>({
    queryKey: ["students-search", query],
    queryFn: async () => {
      return await studentService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

export const useStudentStatistics = (id: number) => {
  return useQuery<StudentStatistics, AxiosError>({
    queryKey: ["student-statistics", id],
    queryFn: async () => {
      return await studentService.getStatistics(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useStudentProfile = () => {
  return useQuery<Student, AxiosError>({
    queryKey: ["student-profile"],
    queryFn: async () => {
      return await studentService.getProfile();
    },
    retry: false,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<Student, AxiosError<ApiError>, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest) => {
      return await studentService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Student,
    AxiosError<ApiError>,
    { id: number } & UpdateUserRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateUserRequest) => {
      return await studentService.update(id, data);
    },
    onSuccess: (_: Student, { id }: { id: number } & UpdateUserRequest) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await studentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useBulkDeleteStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await studentService.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Role-based students fetching (Manager only - but structured for future role expansion)
export const useRoleBasedStudents = (page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["students", page];
    enabled = true;
  }

  return useQuery<PaginatedResponse<Student>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get(`/students?page=${page}&per_page=8`);
        return response.data;
      }
      throw new Error("Unauthorized role");
    },
    enabled,
    retry: false,
  });
};

// Role-based search students
export const useRoleBasedSearchStudents = (query: string, page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["students-search", query, page];
    enabled = !!query && query.length > 0;
  }

  return useQuery<PaginatedResponse<Student>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get('/students', { 
          params: { search: query, page, per_page: 8 } 
        });
        return response.data;
      }
      throw new Error("Unauthorized role");
    },
    enabled,
    retry: false,
  });
};

