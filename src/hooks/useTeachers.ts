import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { teacherService } from "../api/userService";
import apiClient from "../api/axiosConfig";
import type { ApiError, Teacher, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from "../types";
import { useAuth } from "../context";

// Helper function to generate pagination links for teacher modals
const generateTeacherModalPaginationLinks = (currentPage: number, lastPage: number) => {
  const links = [];
  
  // Previous button
  if (currentPage > 1) {
    links.push({
      url: null, // Modal pagination doesn't use URLs
      label: "&laquo; Previous",
      active: false
    });
  }
  
  // Compact pagination for modal (show fewer pages)
  if (lastPage <= 5) {
    // Show all pages if there are 5 or fewer
    for (let i = 1; i <= lastPage; i++) {
      links.push({
        url: null,
        label: i.toString(),
        active: i === currentPage
      });
    }
  } else {
    // Show first page
    links.push({
      url: null,
      label: "1",
      active: currentPage === 1
    });
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      links.push({
        url: null,
        label: "...",
        active: false
      });
    }
    
    // Show current page and surrounding pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      links.push({
        url: null,
        label: i.toString(),
        active: i === currentPage
      });
    }
    
    // Show ellipsis if needed
    if (currentPage < lastPage - 2) {
      links.push({
        url: null,
        label: "...",
        active: false
      });
    }
    
    // Show last page
    if (lastPage > 1) {
      links.push({
        url: null,
        label: lastPage.toString(),
        active: currentPage === lastPage
      });
    }
  }
  
  // Next button
  if (currentPage < lastPage) {
    links.push({
      url: null, // Modal pagination doesn't use URLs
      label: "Next &raquo;",
      active: false
    });
  }
  
  return links;
};


// Fetch all teachers
export const useAllTeachers = () => {
  return useQuery<Teacher[], AxiosError>({
    queryKey: ["all-teachers"],
    queryFn: async () => {
      const response = await teacherService.getAll({ all: true });
      return response.data;
    },
    retry: false,
  });
};

// Role-based teachers fetching (Manager sees all, others restricted)
export const useRoleBasedTeachers = (page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["teachers", page];
    enabled = true;
  }

  return useQuery<PaginatedResponse<Teacher>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get(`/teachers?page=${page}&per_page=8`);
        return response.data;
      }
      throw new Error("Unauthorized role");
    },
    enabled,
    retry: false,
  });
};

// Fetch paginated teachers (Manager only)
export const useFetchTeachers = (page: number = 1) => {
  return useQuery<PaginatedResponse<Teacher>, AxiosError>({
    queryKey: ["teachers", page],
    queryFn: async () => {
      return await teacherService.getAll({ page, per_page: 8 });
    },
    retry: false,
  });
};

// Fetch teachers with pagination for modals/selection
export const useFetchTeachersPaginated = (page: number = 1, perPage: number = 6, search: string = '') => {
  return useQuery<{
    data: Teacher[];
    total: number;
    current_page: number;
    per_page: number;
    has_more: boolean;
  }, AxiosError>({
    queryKey: ["teachers-paginated", page, perPage, search],
    queryFn: async () => {
      const params: { page: number; limit: number; q?: string } = { page, limit: perPage };
      if (search) {
        params.q = search;
      }
      const response = await apiClient.get<{ 
        success: boolean; 
        data: Teacher[];
        total: number;
        current_page: number;
        per_page: number;
        has_more: boolean;
      }>(`/teachers/search`, { params });
      return {
        data: response.data.data,
        total: response.data.total,
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        has_more: response.data.has_more
      };
    },
    enabled: true,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchAllTeachers = () => {
  return useQuery<Teacher[], AxiosError>({
    queryKey: ["all-teachers"],
    queryFn: async () => {
      const response = await teacherService.getAll({ all: true });
      return response.data;
    },
    retry: false,
  });
};

export const useFetchTeacher = (id: number) => {
  return useQuery<Teacher, AxiosError>({
    queryKey: ["teacher", id],
    queryFn: async () => {
      return await teacherService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Role-based search teachers
export const useRoleBasedSearchTeachers = (query: string, page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  let queryKey: (string | number)[] = [];
  let enabled = false;

  if (role === "manager") {
    queryKey = ["teachers-search", query, page];
    enabled = !!query && query.length > 0;
  }

  return useQuery<PaginatedResponse<Teacher>, AxiosError>({
    queryKey,
    queryFn: async () => {
      if (role === "manager") {
        const response = await apiClient.get('/teachers', { 
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

export const useSearchTeachers = (query: string) => {
  return useQuery<Teacher[], AxiosError>({
    queryKey: ["teachers-search", query],
    queryFn: async () => {
      return await teacherService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

export const useTeacherProfile = () => {
  return useQuery<Teacher, AxiosError>({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      return await teacherService.getProfile();
    },
    retry: false,
  });
};

export const useTeacherStudentProfile = (studentId: number) => {
  return useQuery<Teacher, AxiosError>({
    queryKey: ["teacher-student", studentId],
    queryFn: async () => {
      return await teacherService.getStudentProfile(studentId);
    },
    enabled: !!studentId,
    retry: false,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation<Teacher, AxiosError<ApiError>, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest) => {
      return await teacherService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["all-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Teacher,
    AxiosError<ApiError>,
    { id: number } & UpdateUserRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateUserRequest) => {
      return await teacherService.update(id, data);
    },
    onSuccess: (_: Teacher, { id }: { id: number } & UpdateUserRequest) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["all-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await teacherService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["all-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useBulkDeleteTeachers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await teacherService.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["all-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Modal-specific teacher hooks
// Fetch teachers for modal with specific pagination (initial load) - latest first using search endpoint
export const useModalTeachers = (page: number = 1, limit: number = 10, enabled: boolean = true) => {
  return useQuery<PaginatedResponse<Teacher>, AxiosError>({
    queryKey: ["modal-teachers", page, limit],
    queryFn: async () => {
      // Use search endpoint without query to get latest teachers
      const response = await apiClient.get(`/teachers/search?page=${page}&limit=${limit}`);
      const responseData = response.data;
      
      // The search endpoint returns: { success: true, data: [...], total, current_page, per_page, has_more }
      // Transform search response to match regular pagination format
      const lastPage = Math.ceil(responseData.total / responseData.per_page);
      return {
        data: responseData.data, // Teachers array is directly in responseData.data
        links: {
          first: `${window.location.origin}${window.location.pathname}?page=1`,
          last: `${window.location.origin}${window.location.pathname}?page=${lastPage}`,
          prev: responseData.current_page > 1 ? `${window.location.origin}${window.location.pathname}?page=${responseData.current_page - 1}` : null,
          next: responseData.current_page < lastPage ? `${window.location.origin}${window.location.pathname}?page=${responseData.current_page + 1}` : null,
        },
        meta: {
          current_page: responseData.current_page,
          from: ((responseData.current_page - 1) * responseData.per_page) + 1,
          last_page: lastPage,
          per_page: responseData.per_page,
          to: Math.min(responseData.current_page * responseData.per_page, responseData.total),
          total: responseData.total,
          links: generateTeacherModalPaginationLinks(responseData.current_page, lastPage)
        }
      };
    },
    enabled,
    retry: false,
  });
};

// Search teachers for modal with pagination
export const useModalTeacherSearch = (query: string, page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedResponse<Teacher>, AxiosError>({
    queryKey: ["modal-teachers-search", query, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/teachers/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      const responseData = response.data;
      
      // The search endpoint returns: { success: true, data: [...], total, current_page, per_page, has_more }
      // Transform search response to match regular pagination format
      const lastPage = Math.ceil(responseData.total / responseData.per_page);
      return {
        data: responseData.data, // Teachers array is directly in responseData.data
        links: {
          first: `${window.location.origin}${window.location.pathname}?page=1`,
          last: `${window.location.origin}${window.location.pathname}?page=${lastPage}`,
          prev: responseData.current_page > 1 ? `${window.location.origin}${window.location.pathname}?page=${responseData.current_page - 1}` : null,
          next: responseData.current_page < lastPage ? `${window.location.origin}${window.location.pathname}?page=${responseData.current_page + 1}` : null,
        },
        meta: {
          current_page: responseData.current_page,
          from: ((responseData.current_page - 1) * responseData.per_page) + 1,
          last_page: lastPage,
          per_page: responseData.per_page,
          to: Math.min(responseData.current_page * responseData.per_page, responseData.total),
          total: responseData.total,
          links: generateTeacherModalPaginationLinks(responseData.current_page, lastPage)
        }
      };
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};