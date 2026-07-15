import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { examAttemptService } from "../api/examAttemptService";
import type { 
  ApiError, 
  ExamAttempt, 
  PaginatedResponse 
} from "../types";

// Fetch all attempts for a specific exam (Manager/Teacher only)
export const useFetchExamAttempts = (examId: number) => {
  return useQuery<ExamAttempt[], AxiosError>({
    queryKey: ["exam-attempts", examId],
    queryFn: async () => {
      return await examAttemptService.getByExam(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch paginated attempts for a specific exam
export const useFetchExamAttemptsPaginated = (examId: number, page: number = 1) => {
  return useQuery<PaginatedResponse<ExamAttempt>, AxiosError>({
    queryKey: ["exam-attempts-paginated", examId, page],
    queryFn: async () => {
      return await examAttemptService.getByExamPaginated(examId, { page });
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch single attempt by ID
export const useFetchExamAttempt = (id: number) => {
  return useQuery<ExamAttempt, AxiosError>({
    queryKey: ["exam-attempt", id],
    queryFn: async () => {
      return await examAttemptService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Fetch student's attempts for a specific exam (Teacher/Manager view)
export const useFetchStudentAttempts = (examId: number, studentId: number) => {
  return useQuery<ExamAttempt[], AxiosError>({
    queryKey: ["student-attempts", examId, studentId],
    queryFn: async () => {
      return await examAttemptService.getStudentAttempts(examId, studentId);
    },
    enabled: !!examId && !!studentId,
    retry: false,
  });
};

// Fetch student's own attempts (Student only)
export const useFetchMyAttempts = (examId: number) => {
  return useQuery<ExamAttempt[], AxiosError>({
    queryKey: ["my-attempts", examId],
    queryFn: async () => {
      return await examAttemptService.getMyAttempts(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch current active attempt for student
export const useFetchCurrentAttempt = (examId: number) => {
  return useQuery<ExamAttempt | null, AxiosError>({
    queryKey: ["current-attempt", examId],
    queryFn: async () => {
      return await examAttemptService.getCurrentAttempt(examId);
    },
    enabled: !!examId,
    retry: false,
    refetchInterval: 30000, // Refetch every 30 seconds during active exam
  });
};

// Fetch attempt statistics for an exam
export const useFetchExamAttemptStats = (examId: number) => {
  return useQuery<{
    total_attempts: number;
    completed_attempts: number;
    in_progress_attempts: number;
    average_completion_time: number;
    completion_rate: number;
  }, AxiosError>({
    queryKey: ["exam-attempt-stats", examId],
    queryFn: async () => {
      return await examAttemptService.getExamAttemptStats(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch all active attempts (Teacher/Manager - for monitoring)
export const useFetchActiveAttempts = () => {
  return useQuery<ExamAttempt[], AxiosError>({
    queryKey: ["active-attempts"],
    queryFn: async () => {
      return await examAttemptService.getActiveAttempts();
    },
    retry: false,
    refetchInterval: 60000, // Refetch every minute for live monitoring
  });
};

// Start new exam attempt (Student only)
export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamAttempt, AxiosError<ApiError>, number>({
    mutationFn: async (examId: number) => {
      return await examAttemptService.start(examId);
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["my-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["current-attempt", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats", examId] });
      queryClient.invalidateQueries({ queryKey: ["active-attempts"] });
    },
  });
};

// Complete exam attempt (Student only)
export const useCompleteExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamAttempt, AxiosError<ApiError>, number>({
    mutationFn: async (examId: number) => {
      return await examAttemptService.complete(examId);
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["my-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["current-attempt", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats", examId] });
      queryClient.invalidateQueries({ queryKey: ["active-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["exam-results", examId] });
    },
  });
};

// Update attempt metadata (rarely used)
export const useUpdateExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExamAttempt, 
    AxiosError<ApiError>, 
    { id: number; data: { total_attempts?: number; is_completed?: boolean }; examId: number }
  >({
    mutationFn: async ({ id, data }) => {
      return await examAttemptService.update(id, data);
    },
    onSuccess: (result, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempt", result.id] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats", examId] });
    },
  });
};

// Delete attempt (Admin only - for cleanup)
export const useDeleteExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { id: number; examId: number }>({
    mutationFn: async ({ id }) => {
      await examAttemptService.delete(id);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats", examId] });
    },
  });
};

// Bulk complete attempts (Admin - emergency function)
export const useBulkCompleteAttempts = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamAttempt[], AxiosError<ApiError>, number[]>({
    mutationFn: async (attemptIds: number[]) => {
      return await examAttemptService.bulkComplete(attemptIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats"] });
      queryClient.invalidateQueries({ queryKey: ["active-attempts"] });
    },
  });
};

// Reset student's attempt (Teacher/Manager only - allow retake)
export const useResetStudentAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { examId: number; studentId: number }>({
    mutationFn: async ({ examId, studentId }) => {
      await examAttemptService.resetStudentAttempt(examId, studentId);
    },
    onSuccess: (_, { examId, studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["student-attempts", examId, studentId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-attempt-stats", examId] });
    },
  });
};