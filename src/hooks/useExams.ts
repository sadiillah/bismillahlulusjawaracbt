import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { 
  SubjectExam, 
  ExamAttempt, 
  QuestionAnswer, 
  ExamQuestion,
  CreateExamRequest,
  UpdateExamRequest, 
  CreateQuestionRequest,
  UpdateQuestionRequest,
  PaginatedResponse,
  ExamStats,
  ExamProgress,
  ExamResult,
  StudentExamDetails,
  StudentExamData,
  ApiError
} from '../types';
import { examService, questionService } from '../api/examService';
import { useAuth } from '../context/AuthContext';

// Fetch all exams (Manager only)
export const useFetchAllExams = () => {
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["all-exams"],
    queryFn: async () => {
      const response = await examService.getAll({ all: true });
      return response.data;
    },
    retry: false,
  });
};

// Fetch paginated exams
export const useFetchExams = (page: number = 1) => {
  return useQuery<PaginatedResponse<SubjectExam>, AxiosError>({
    queryKey: ["exams", page],
    queryFn: async () => {
      return await examService.getAll({ page });
    },
    retry: false,
  });
};

// Role-based exams (Manager/Teacher/Student)
export const useRoleBasedExams = (page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  // Handle manager role separately since it needs pagination
  const managerQuery = useFetchExams(page);
  
  // For teacher and student roles, use single query with conditional config
  let queryKey: (string | number)[] = [];
  let queryFn: (() => Promise<SubjectExam[]>) | undefined;
  
  if (role === "teacher") {
    queryKey = ["teacher-exams"];
    queryFn = () => examService.getTeacherExams();
  } else if (role === "student") {
    queryKey = ["student-exams", user?.id || 0];
    queryFn = () => examService.getStudentExams();
  }

  const roleBasedQuery = useQuery<SubjectExam[], AxiosError>({
    queryKey,
    queryFn: queryFn!,
    enabled: !!queryFn,
    retry: false,
  });

  // Return appropriate query based on role
  if (role === "manager") {
    return managerQuery;
  } else if (role === "teacher" || role === "student") {
    return roleBasedQuery;
  }

  // Default fallback for unknown roles
  return roleBasedQuery;
};

// Search exams
export const useSearchExams = (query: string) => {
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["exams-search", query],
    queryFn: async () => {
      return await examService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

// Create exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation<SubjectExam, AxiosError<ApiError>, CreateExamRequest>({
    mutationFn: async (data: CreateExamRequest) => {
      return await examService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Update exam
export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubjectExam,
    AxiosError<ApiError>,
    { id: number } & UpdateExamRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateExamRequest) => {
      return await examService.update(id, data);
    },
    onSuccess: (_: SubjectExam, { id }: { id: number } & UpdateExamRequest) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", id] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Delete exam
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await examService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Bulk delete exams
export const useBulkDeleteExams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await examService.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Duplicate exam
export const useDuplicateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await examService.duplicate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Fetch single exam by ID
export const useFetchExam = (id: number) => {
  return useQuery<SubjectExam, AxiosError>({
    queryKey: ["exam", id],
    queryFn: async () => {
      return await examService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Fetch student exam details for teacher/manager review (role-based)
export const useFetchStudentExamDetails = (examId: number, studentId: number, userRole?: string) => {
  return useQuery<StudentExamDetails, AxiosError>({
    queryKey: ["student-exam-details", examId, studentId, userRole],
    queryFn: async () => {
      console.log(`Fetching student exam details for examId: ${examId}, studentId: ${studentId}, role: ${userRole}`);
      try {
        const result = await examService.getStudentExamDetails(examId, studentId, userRole);
        console.log('Hook received result:', result);
        return result;
      } catch (error) {
        console.error('Error in useFetchStudentExamDetails:', error);
        throw error;
      }
    },
    enabled: !!examId && !!studentId && !!userRole,
    retry: false,
  });
};

// Fetch exams by subject ID
export const useFetchExamsBySubject = (subjectId: number) => {
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["subject-exams", subjectId],
    queryFn: async () => {
      return await examService.getExamsBySubject(subjectId);
    },
    enabled: !!subjectId,
    retry: false,
  });
};

// Fetch student exams by subject ID (student-specific endpoint)
export const useFetchStudentExamsBySubject = (subjectId: number) => {
  const { user } = useAuth();
  
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["student-subject-exams", subjectId, user?.id],
    queryFn: async () => {
      return await examService.getStudentExamsBySubject(subjectId);
    },
    enabled: !!subjectId && !!user?.id,
    retry: false,
  });
};

// Fetch exam statistics
export const useFetchExamStatistics = (id: number) => {
  return useQuery<ExamStats, AxiosError>({
    queryKey: ["exam-statistics", id],
    queryFn: async () => {
      return await examService.getStatistics(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Fetch exam status
export const useFetchExamStatus = (id: number) => {
  return useQuery<Record<string, unknown>, AxiosError>({
    queryKey: ["exam-status", id],
    queryFn: async () => {
      return await examService.getStatus(id);
    },
    enabled: !!id,
    retry: false,
  });
};

// Fetch teacher exams
export const useFetchTeacherExams = () => {
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["teacher-exams"],
    queryFn: async () => {
      return await examService.getTeacherExams();
    },
    retry: false,
  });
};

// Create teacher exam
export const useCreateTeacherExam = () => {
  const queryClient = useQueryClient();

  return useMutation<SubjectExam, AxiosError<ApiError>, CreateExamRequest>({
    mutationFn: async (data: CreateExamRequest) => {
      return await examService.createTeacherExam(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    },
  });
};

// Fetch student exams
export const useFetchStudentExams = () => {
  const { user } = useAuth();
  
  return useQuery<SubjectExam[], AxiosError>({
    queryKey: ["student-exams", user?.id],
    queryFn: async () => {
      return await examService.getStudentExams();
    },
    retry: false,
  });
};

// Fetch student exam (for taking exams)
export const useFetchStudentExam = (examId: number) => {
  const { user } = useAuth();
  
  return useQuery<SubjectExam, AxiosError>({
    queryKey: ["student-exam", examId, user?.id],
    queryFn: async () => {
      return await examService.getStudentExam(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch student exam info (for guidelines page)
export const useFetchStudentExamInfo = (examId: number) => {
  const { user } = useAuth();
  
  return useQuery<StudentExamData, AxiosError>({
    queryKey: ["student-exam-info", examId, user?.id],
    queryFn: async () => {
      return await examService.getStudentExamForTaking(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch exam progress for student
export const useFetchExamProgress = (examId: number) => {
  const { user } = useAuth();
  
  return useQuery<ExamProgress, AxiosError>({
    queryKey: ["exam-progress", examId, user?.id],
    queryFn: async () => {
      return await examService.getExamProgress(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch exam results for student (legacy - uses getExamResults)
export const useFetchExamResults = (examId: number) => {
  const { user } = useAuth();
  
  return useQuery<ExamResult, AxiosError>({
    queryKey: ["exam-results", examId, user?.id],
    queryFn: async () => {
      return await examService.getExamResults(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Fetch student exam results (for results page - uses correct endpoint)
export const useFetchStudentExamResults = (examId: number) => {
  const { user } = useAuth();
  
  return useQuery<ExamResult, AxiosError>({
    queryKey: ["student-exam-results", examId, user?.id],
    queryFn: async () => {
      return await examService.getStudentExamResults(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Start exam (creates attempt)
export const useStartExam = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamAttempt, AxiosError<ApiError>, number>({
    mutationFn: async (examId: number) => {
      return await examService.startExam(examId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-progress"] });
      queryClient.invalidateQueries({ queryKey: ["student-exam"] });
    },
  });
};

// Submit answer
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { examId: number; questionId: number; answer: { answer_text?: string | null; selected_option_id?: number } }>({
    mutationFn: async ({ examId, questionId, answer }) => {
      await examService.submitAnswer(examId, questionId, answer);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam-progress", examId] });
    },
  });
};

// Complete exam
export const useCompleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: async (examId: number) => {
      await examService.completeExam(examId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-progress"] });
      queryClient.invalidateQueries({ queryKey: ["exam-results"] });
      queryClient.invalidateQueries({ queryKey: ["student-exam"] });
      queryClient.invalidateQueries({ queryKey: ["student-exams"] });
      queryClient.invalidateQueries({ queryKey: ["student-subject-exams"] });
    },
  });
};

// Fetch answers that need grading (Teacher only)
export const useFetchAnswersNeedingGrading = () => {
  return useQuery<QuestionAnswer[], AxiosError>({
    queryKey: ["answers-needing-grading"],
    queryFn: async () => {
      return await questionService.getNeedsGrading();
    },
    retry: false,
  });
};

// Grade single answer
export const useGradeAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { answerId: number; points: number; feedback?: string }>({
    mutationFn: async ({ answerId, points, feedback }) => {
      await questionService.gradeAnswer(answerId, points, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers-needing-grading"] });
    },
  });
};

// Bulk grade answers
export const useBulkGradeAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { answers: { id: number; points: number; feedback?: string }[] }>({
    mutationFn: async ({ answers }) => {
      await questionService.bulkGrade(answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers-needing-grading"] });
    },
  });
};

// Fetch total questions count for dashboard (Manager only)
export const useFetchTotalQuestionsCount = () => {
  const { user } = useAuth();
  const isManager = user?.roles?.[0] === 'manager';
  
  return useQuery<number, AxiosError>({
    queryKey: ["total-questions-count"],
    queryFn: async () => {
      console.log('Fetching total questions count...');
      try {
        const questions = await questionService.getAllQuestions();
        console.log('Questions fetched:', questions);
        console.log('Questions count:', questions?.length);
        return questions?.length || 0;
      } catch (error) {
        console.error('Error fetching questions count:', error);
        throw error;
      }
    },
    enabled: isManager, // Only run for managers
    retry: false,
  });
};

// Question Management Hooks

// Create question
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamQuestion, AxiosError<ApiError>, CreateQuestionRequest>({
    mutationFn: async (data: CreateQuestionRequest) => {
      console.log("useCreateQuestion - mutationFn called with data:", data);
      try {
        const result = await questionService.createQuestion(data);
        console.log("useCreateQuestion - API call successful:", result);
        return result;
      } catch (error) {
        console.error("useCreateQuestion - API call failed:", error);
        throw error;
      }
    },
    onSuccess: (result, { subject_exam_id }) => {
      console.log("useCreateQuestion - onSuccess called:", result);
      console.log("useCreateQuestion - invalidating cache for exam:", subject_exam_id);
      queryClient.invalidateQueries({ queryKey: ["exam", subject_exam_id] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions", subject_exam_id] });
      console.log("useCreateQuestion - cache invalidation completed");
      
      // Also invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["all-exams"] });
    },
    onError: (error, variables) => {
      console.error("useCreateQuestion - onError called:", error, variables);
    },
  });
};

// Update question
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExamQuestion,
    AxiosError<ApiError>,
    { id: number } & UpdateQuestionRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateQuestionRequest) => {
      return await questionService.updateQuestion(id, data);
    },
    onSuccess: (question) => {
      if (question.subject_exam_id) {
        queryClient.invalidateQueries({ queryKey: ["exam", question.subject_exam_id] });
        queryClient.invalidateQueries({ queryKey: ["exam-questions", question.subject_exam_id] });
      }
    },
  });
};

// Delete question
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, { id: number; examId: number }>({
    mutationFn: async ({ id }) => {
      await questionService.deleteQuestion(id);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
    },
  });
};

// Fetch questions by exam
export const useFetchQuestionsByExam = (examId: number) => {
  return useQuery<ExamQuestion[], AxiosError>({
    queryKey: ["exam-questions", examId],
    queryFn: async () => {
      return await questionService.getQuestionsByExam(examId);
    },
    enabled: !!examId,
    retry: false,
  });
};

// Bulk create questions
export const useBulkCreateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { created_count: number; error_count: number; created: ExamQuestion[]; errors: string[] },
    AxiosError<ApiError>,
    CreateQuestionRequest[]
  >({
    mutationFn: async (questions: CreateQuestionRequest[]) => {
      return await questionService.bulkCreateQuestions(questions);
    },
    onSuccess: (_, questions) => {
      // Invalidate all affected exams
      const examIds = [...new Set(questions.map(q => q.subject_exam_id))];
      examIds.forEach(examId => {
        queryClient.invalidateQueries({ queryKey: ["exam", examId] });
        queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      });
    },
  });
};

// Bulk delete questions
export const useBulkDeleteQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { deleted_count: number; errors: string[] },
    AxiosError<ApiError>,
    { ids: number[]; examId: number }
  >({
    mutationFn: async ({ ids }) => {
      return await questionService.bulkDeleteQuestions(ids);
    },
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
    },
  });
};

// Duplicate question
export const useDuplicateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExamQuestion,
    AxiosError<ApiError>,
    { id: number; targetExamId: number }
  >({
    mutationFn: async ({ id, targetExamId }) => {
      return await questionService.duplicateQuestion(id, targetExamId);
    },
    onSuccess: (_, { targetExamId }) => {
      queryClient.invalidateQueries({ queryKey: ["exam", targetExamId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions", targetExamId] });
    },
  });
};

