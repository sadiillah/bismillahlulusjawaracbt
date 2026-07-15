import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import type { 
  ApiError, 
  Subject, 
  CreateSubjectRequest, 
  UpdateSubjectRequest,
  PaginatedResponse 
} from "../types";
import { subjectService } from "../api/subjectService";
import { useAuth } from "../context";


// Fetch all subjects
export const useAllSubjects = (enabled: boolean = true) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const response = await subjectService.getAll({ all: true });
      return response.data;
    },
    enabled,
    retry: false,
  });
};

// Role-based subjects fetching (Manager sees all, Teacher sees assigned)
export const useRoleBasedSubjects = (page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["subjects", page];
    enabled = true;
  } else if (role === "teacher") {
    queryKey = ["teacher-subjects", page];
    enabled = true;
  }

  return useQuery<PaginatedResponse<Subject>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get(`/subjects?page=${page}&per_page=6`);
        return response.data;
      } else if (role === "teacher") {
        const response = await apiClient.get(`/teacher/subjects?page=${page}&per_page=6`);
        return response.data;
      }
      throw new Error("Unauthorized role");
    },
    enabled,
    retry: false,
  });
};

// Fetch paginated subjects (Manager only)
export const useFetchSubjects = (page: number = 1) => {
  return useQuery<PaginatedResponse<Subject>, AxiosError>({
    queryKey: ["subjects", page],
    queryFn: async () => {
      return await subjectService.getAll({ page, per_page: 6 });
    },
    retry: false,
  });
};

// Fetch a single subject
export const useFetchSubject = (id: number) => {
  return useQuery<Subject, AxiosError>({
    queryKey: ["subject", id],
    queryFn: async () => {
      return await subjectService.getById(id);
    },
    enabled: !!id,
  });
};

// Role-based search subjects
export const useRoleBasedSearchSubjects = (query: string, page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["subjects-search", query, page];
    enabled = !!query && query.length > 0;
  } else if (role === "teacher") {
    queryKey = ["teacher-subjects-search", query, page];
    enabled = !!query && query.length > 0;
  }

  return useQuery<PaginatedResponse<Subject>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get('/subjects', { 
          params: { search: query, page, per_page: 6 } 
        });
        return response.data;
      } else if (role === "teacher") {
        const response = await apiClient.get('/teacher/subjects', { 
          params: { search: query, page, per_page: 6 } 
        });
        return response.data;
      }
      throw new Error("Unauthorized role");
    },
    enabled,
    retry: false,
  });
};

// Search subjects (Manager only) - kept for backward compatibility
export const useSearchSubjects = (query: string) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ["subjects-search", query],
    queryFn: async () => {
      return await subjectService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

// Create a new subject (Manager only)
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation<Subject, AxiosError<ApiError>, CreateSubjectRequest>({
    mutationFn: async (data: CreateSubjectRequest) => {
      return await subjectService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["all-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Update an existing subject (Manager only)
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Subject,
    AxiosError<ApiError>,
    { id: number } & UpdateSubjectRequest
  >({
    mutationFn: async ({ id, ...data }) => {
      return await subjectService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["all-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Delete a subject (Manager only)
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: async (id: number) => {
      await subjectService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["all-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Note: bulkDelete not available in subjectService yet
// export const useBulkDeleteSubjects = () => {
//   const queryClient = useQueryClient();
//   return useMutation<void, AxiosError<ApiError>, number[]>({
//     mutationFn: async (ids: number[]) => {
//       await subjectService.bulkDelete(ids);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["subjects"] });
//       queryClient.invalidateQueries({ queryKey: ["all-subjects"] });
//       queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
//     },
//   });
// };