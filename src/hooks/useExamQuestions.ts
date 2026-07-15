import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { examQuestionService } from "../api/examQuestionService";
import type { 
  ApiError, 
  ExamQuestion, 
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  PaginatedResponse 
} from "../types";

// Fetch all questions for a specific exam
export const useFetchExamQuestions = (examId: number) => {
  return useQuery<ExamQuestion[], AxiosError>({
    queryKey: ["exam-questions", examId],
    queryFn: async () => {
      return await examQuestionService.getByExam(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch paginated questions for a specific exam
export const useFetchExamQuestionsPaginated = (examId: number, page: number = 1) => {
  return useQuery<PaginatedResponse<ExamQuestion>, AxiosError>({
    queryKey: ["exam-questions-paginated", examId, page],
    queryFn: async () => {
      return await examQuestionService.getByExamPaginated(examId, { page });
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch single question by ID
export const useFetchExamQuestion = (id: number) => {
  return useQuery<ExamQuestion, AxiosError>({
    queryKey: ["exam-question", id],
    queryFn: async () => {
      return await examQuestionService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Search questions within an exam
export const useSearchExamQuestions = (examId: number, query: string) => {
  return useQuery<ExamQuestion[], AxiosError>({
    queryKey: ["exam-questions-search", examId, query],
    queryFn: async () => {
      return await examQuestionService.search(examId, query);
    },
    enabled: !!examId && !!query && query.length > 0,
    retry: false,
  });
};

// Create new question
export const useCreateExamQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamQuestion, AxiosError<ApiError>, CreateQuestionRequest>({
    mutationFn: async (data: CreateQuestionRequest) => {
      return await examQuestionService.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions", variables.subject_exam_id] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", variables.subject_exam_id] });
      queryClient.invalidateQueries({ queryKey: ["subject-exam", variables.subject_exam_id] });
    },
  });
};

// Update existing question
export const useUpdateExamQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExamQuestion,
    AxiosError<ApiError>,
    { id: number } & UpdateQuestionRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateQuestionRequest) => {
      return await examQuestionService.update(id, data);
    },
    onSuccess: (result, { id, subject_exam_id }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-question", id] });
      if (subject_exam_id) {
        queryClient.invalidateQueries({ queryKey: ["exam-questions", subject_exam_id] });
        queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", subject_exam_id] });
        queryClient.invalidateQueries({ queryKey: ["subject-exam", subject_exam_id] });
      }
      // Also invalidate the exam containing this question
      queryClient.invalidateQueries({ queryKey: ["exam-questions", result.subject_exam_id] });
    },
  });
};

// Delete question
export const useDeleteExamQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { id: number; examId: number }>({
    mutationFn: async ({ id }) => {
      await examQuestionService.delete(id);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-exam", examId] });
    },
  });
};

// Bulk delete questions
export const useBulkDeleteExamQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { ids: number[]; examId: number }>({
    mutationFn: async ({ ids }) => {
      await examQuestionService.bulkDelete(ids);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-exam", examId] });
    },
  });
};

// Duplicate question
export const useDuplicateExamQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamQuestion, AxiosError<ApiError>, { id: number; examId: number }>({
    mutationFn: async ({ id }) => {
      return await examQuestionService.duplicate(id);
    },
    onSuccess: (_result, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-exam", examId] });
    },
  });
};

// Reorder questions within an exam
export const useReorderExamQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { examId: number; questionIds: number[] }>({
    mutationFn: async ({ examId, questionIds }) => {
      await examQuestionService.reorder(examId, questionIds);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions-paginated", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-exam", examId] });
    },
  });
};