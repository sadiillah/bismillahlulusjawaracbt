import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { questionOptionService } from "../api/questionOptionService";
import type { 
  ApiError, 
  QuestionOption, 
  CreateOptionRequest, 
  UpdateOptionRequest 
} from "../types";

// Fetch all options for a specific question
export const useFetchQuestionOptions = (questionId: number) => {
  return useQuery<QuestionOption[], AxiosError>({
    queryKey: ["question-options", questionId],
    queryFn: async () => {
      return await questionOptionService.getByQuestion(questionId);
    },
    enabled: !!questionId,
    retry: false,
  });
};

// Fetch single option by ID
export const useFetchQuestionOption = (id: number) => {
  return useQuery<QuestionOption, AxiosError>({
    queryKey: ["question-option", id],
    queryFn: async () => {
      return await questionOptionService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Create new option for a question
export const useCreateQuestionOption = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionOption, AxiosError<ApiError>, { questionId: number } & CreateOptionRequest>({
    mutationFn: async ({ questionId, ...data }) => {
      return await questionOptionService.create(questionId, data);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Update existing option
export const useUpdateQuestionOption = () => {
  const queryClient = useQueryClient();

  return useMutation<
    QuestionOption,
    AxiosError<ApiError>,
    { id: number; questionId: number } & UpdateOptionRequest
  >({
    mutationFn: async ({ id, ...data }) => {
      return await questionOptionService.update(id, data);
    },
    onSuccess: (result, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-option", result.id] });
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Delete option
export const useDeleteQuestionOption = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { id: number; questionId: number }>({
    mutationFn: async ({ id }) => {
      await questionOptionService.delete(id);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Bulk create options for a question (useful when creating multiple choice questions)
export const useBulkCreateQuestionOptions = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionOption[], AxiosError<ApiError>, { questionId: number; options: CreateOptionRequest[] }>({
    mutationFn: async ({ questionId, options }) => {
      return await questionOptionService.bulkCreate(questionId, options);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Bulk update options for a question
export const useBulkUpdateQuestionOptions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    QuestionOption[], 
    AxiosError<ApiError>, 
    { questionId: number; options: Array<UpdateOptionRequest & { id?: number }> }
  >({
    mutationFn: async ({ questionId, options }) => {
      return await questionOptionService.bulkUpdate(questionId, options);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Delete all options for a question (useful when changing question type from multiple choice to essay)
export const useDeleteAllQuestionOptions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { questionId: number }>({
    mutationFn: async ({ questionId }) => {
      await questionOptionService.deleteByQuestion(questionId);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};

// Reorder options within a question
export const useReorderQuestionOptions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { questionId: number; optionIds: number[] }>({
    mutationFn: async ({ questionId, optionIds }) => {
      await questionOptionService.reorder(questionId, optionIds);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-options", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-question", questionId] });
    },
  });
};