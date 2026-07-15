import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { topicService } from "../api/topicService";
import type { 
  ApiError, 
  Topic, 
  CreateTopicRequest, 
  UpdateTopicRequest,
  PaginatedResponse 
} from "../types";


// Fetch paginated topics (Manager only)
export const useFetchTopics = (page: number = 1) => {
  return useQuery<PaginatedResponse<Topic>, AxiosError>({
    queryKey: ["topics", page],
    queryFn: async () => {
      return await topicService.getAll({ page, per_page: 6 });
    },
    retry: false,
  });
};

// Fetch topics with pagination for modals/selection
export const useFetchTopicsPaginated = (page: number = 1, perPage: number = 6, search: string = '') => {
  return useQuery<{
    data: Topic[];
    total: number;
    current_page: number;
    per_page: number;
    has_more: boolean;
  }, AxiosError>({
    queryKey: ["topics-paginated", page, perPage, search],
    queryFn: async () => {
      const params: { page: number; limit: number; q?: string } = { page, limit: perPage };
      if (search) {
        params.q = search;
      }
      const response = await apiClient.get<{ 
        success: boolean; 
        data: Topic[];
        total: number;
        current_page: number;
        per_page: number;
        has_more: boolean;
      }>(`/topics/search`, { params });
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

// Fetch all topics
export const useAllTopics = () => {
  return useQuery<Topic[], AxiosError>({
    queryKey: ["all-topics"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Topic[];
      }>('/topics/search?q=');
      return response.data.data;
    },
    retry: false,
  });
};

// Fetch a single topic (Shared access - Manager/Teacher/Student)
export const useFetchTopic = (id: number) => {
  return useQuery<Topic, AxiosError>({
    queryKey: ["topic", id],
    queryFn: async () => {
      return await topicService.getById(id);
    },
    enabled: !!id,
  });
};

// Search topics with pagination (Manager only)
export const useSearchTopicsWithPagination = (query: string, page: number = 1) => {
  return useQuery<PaginatedResponse<Topic>, AxiosError>({
    queryKey: ["topics-search", query, page],
    queryFn: async () => {
      return await topicService.getAll({ search: query, page, per_page: 6 });
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

// Search topics (Manager only) - kept for backward compatibility
export const useSearchTopics = (query: string) => {
  return useQuery<Topic[], AxiosError>({
    queryKey: ["topics-search", query],
    queryFn: async () => {
      return await topicService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

// Create a new topic (Manager only)
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<Topic, AxiosError<ApiError>, CreateTopicRequest>({
    mutationFn: async (data: CreateTopicRequest) => {
      return await topicService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["all-topics"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Update an existing topic (Manager only)
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Topic,
    AxiosError<ApiError>,
    { id: number } & UpdateTopicRequest
  >({
    mutationFn: async ({ id, ...data }) => {
      return await topicService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["all-topics"] });
      queryClient.invalidateQueries({ queryKey: ["topic", id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Delete a topic (Manager only)
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: async (id: number) => {
      await topicService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["all-topics"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

// Bulk delete topics (Manager only)
export const useBulkDeleteTopics = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, number[]>({
    mutationFn: async (ids: number[]) => {
      await topicService.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["all-topics"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};