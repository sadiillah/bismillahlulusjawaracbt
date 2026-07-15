import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { questionAnswerService } from "../api/questionAnswerService";
import type { 
  ApiError, 
  QuestionAnswer, 
  GradeAnswerRequest, 
  BulkGradeRequest,
  PaginatedResponse 
} from "../types";

// Fetch all answers for a specific question (Teacher/Manager only)
export const useFetchQuestionAnswers = (questionId: number) => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["question-answers", questionId],
    queryFn: async () => {
      return await questionAnswerService.getByQuestion(questionId);
    },
    enabled: !!questionId,
    retry: false,
  });
};

// Fetch paginated answers for a specific question
export const useFetchQuestionAnswersPaginated = (questionId: number, page: number = 1) => {
  return useQuery<PaginatedResponse<QuestionAnswer>, AxiosError>({
    queryKey: ["question-answers-paginated", questionId, page],
    queryFn: async () => {
      return await questionAnswerService.getByQuestionPaginated(questionId, { page });
    },
    enabled: !!questionId,
    retry: false,
  });
};

// Fetch all answers for a specific exam (Teacher/Manager only)
export const useFetchExamAnswers = (examId: number) => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["exam-answers", examId],
    queryFn: async () => {
      return await questionAnswerService.getByExam(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch single answer by ID
export const useFetchQuestionAnswer = (id: number) => {
  return useQuery<QuestionAnswer, AxiosError>({
    queryKey: ["question-answer", id],
    queryFn: async () => {
      return await questionAnswerService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Fetch student's answers for an exam (Teacher/Manager view)
export const useFetchStudentAnswers = (examId: number, studentId: number) => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["student-answers", examId, studentId],
    queryFn: async () => {
      return await questionAnswerService.getStudentAnswers(examId, studentId);
    },
    enabled: !!examId && !!studentId,
    retry: false,
  });
};

// Fetch student's own answers for an exam (Student only)
export const useFetchMyAnswers = (examId: number) => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["my-answers", examId],
    queryFn: async () => {
      return await questionAnswerService.getMyAnswers(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch answers needing grading (Teacher/Manager only)
export const useFetchAnswersNeedingGrading = () => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["answers-needing-grading"],
    queryFn: async () => {
      return await questionAnswerService.getNeedingGrading();
    },
    retry: false,
  });
};

// Fetch grading statistics for an exam
export const useFetchGradingStats = (examId: number) => {
  return useQuery<{
    total_answers: number;
    graded_answers: number;
    pending_answers: number;
    auto_graded: number;
    manual_graded: number;
    average_score: number;
  }, AxiosError>({
    queryKey: ["grading-stats", examId],
    queryFn: async () => {
      return await questionAnswerService.getGradingStats(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Submit answer (Student only - during exam)
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    QuestionAnswer, 
    AxiosError<ApiError>, 
    { examQuestionId: number; data: { answer_text?: string; selected_option_id?: number }; examId: number }
  >({
    mutationFn: async ({ examQuestionId, data }) => {
      return await questionAnswerService.submit(examQuestionId, data);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["my-answers", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-progress", examId] });
    },
  });
};

// Update answer (Student only - during exam, before submission)
export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<
    QuestionAnswer, 
    AxiosError<ApiError>, 
    { id: number; data: { answer_text?: string; selected_option_id?: number }; examId: number }
  >({
    mutationFn: async ({ id, data }) => {
      return await questionAnswerService.update(id, data);
    },
    onSuccess: (result, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-answer", result.id] });
      queryClient.invalidateQueries({ queryKey: ["my-answers", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-progress", examId] });
    },
  });
};

// Grade answer (Teacher/Manager only)
export const useGradeAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionAnswer, AxiosError<ApiError>, { id: number; data: GradeAnswerRequest; examId: number; studentId: number; userRole?: string }>({
    mutationFn: async ({ id, data }) => {
      return await questionAnswerService.grade(id, data);
    },
    onSuccess: (result, { examId, studentId, userRole }) => {
      queryClient.invalidateQueries({ queryKey: ["question-answer", result.id] });
      queryClient.invalidateQueries({ queryKey: ["answers-needing-grading"] });
      queryClient.invalidateQueries({ queryKey: ["question-answers", result.exam_question_id] });
      queryClient.invalidateQueries({ queryKey: ["grading-stats"] });
      
      // Invalidate exam queries to refresh student scores on exam details page
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      
      // Invalidate student exam details - always invalidate both specific and general queries
      queryClient.invalidateQueries({ queryKey: ["student-exam-details", examId, studentId, userRole] });
      queryClient.invalidateQueries({ queryKey: ["student-exam-details"] });
      
      // Invalidate exam results for students to refresh badges
      queryClient.invalidateQueries({ queryKey: ["exam-results", examId] });
      queryClient.invalidateQueries({ queryKey: ["student-exam-results", examId] });
    },
  });
};

// Bulk grade answers (Teacher/Manager only)
export const useBulkGradeAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionAnswer[], AxiosError<ApiError>, BulkGradeRequest>({
    mutationFn: async (data: BulkGradeRequest) => {
      return await questionAnswerService.bulkGrade(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers-needing-grading"] });
      queryClient.invalidateQueries({ queryKey: ["question-answers"] });
      queryClient.invalidateQueries({ queryKey: ["grading-stats"] });
    },
  });
};

// Auto-grade multiple choice answers (System function)
export const useAutoGradeAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { graded_count: number; total_answers: number }, 
    AxiosError<ApiError>, 
    number
  >({
    mutationFn: async (examId: number) => {
      return await questionAnswerService.autoGrade(examId);
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["answers-needing-grading"] });
      queryClient.invalidateQueries({ queryKey: ["exam-answers", examId] });
      queryClient.invalidateQueries({ queryKey: ["grading-stats", examId] });
    },
  });
};

// Delete answer (Admin only - for data cleanup)
export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { id: number; examId: number; questionId: number }>({
    mutationFn: async ({ id }) => {
      await questionAnswerService.delete(id);
    },
    onSuccess: (_, { examId, questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-answers", questionId] });
      queryClient.invalidateQueries({ queryKey: ["exam-answers", examId] });
      queryClient.invalidateQueries({ queryKey: ["grading-stats", examId] });
    },
  });
};