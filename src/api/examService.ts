import { apiClient } from './axiosConfig';
import { AxiosError } from 'axios';
import type { 
  SubjectExam, 
  ExamQuestion, 
  QuestionAnswer, 
  ExamAttempt,
  CreateExamRequest,
  UpdateExamRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ExamProgress,
  ExamResult,
  ExamStats,
  TeacherDashboardStats,
  Student,
  StudentExamDetails,
  StudentExamData,
  TeacherAnswerResponse,
  TeacherExamDetailsResponse,
  ManagerAnswerResponse,
  ManagerApiResponse,
  OptionTransform,
  PartialExamAttempt,
  PaginatedResponse, 
  ApiResponse,
  LaravelErrorResponse
} from '../types';

// Type guard functions for better type safety

function isManagerApiResponse(data: unknown): data is ManagerApiResponse {
  return data !== null && 
         typeof data === 'object' && 
         'answers' in data && 
         Array.isArray((data as ManagerApiResponse).answers) && 
         'summary' in data && 
         typeof (data as ManagerApiResponse).summary === 'object';
}

// Helper function to create partial exam attempt
function createPartialExamAttempt(summary?: { total_possible_points: number; total_points_earned: number; percentage: number }): PartialExamAttempt {
  return {
    is_completed: true,
    has_passed: summary ? summary.percentage >= 60 : false,
    total_points: summary?.total_possible_points || 0,
    points_earned: summary?.total_points_earned || 0,
    total_questions: summary?.total_possible_points || 0, // Approximating from points
    answered_questions: summary?.total_possible_points || 0, // Assuming all answered if completed
    score_percentage: summary?.percentage || 0,
    completion_percentage: 100, // Assuming completed
    completed_at: new Date().toISOString()
  };
}

export const examService = {
  // Manager only routes
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<SubjectExam>> {
    // Include subject and topic relations for dashboard display
    const queryParams = {
      ...params,
      include: 'subject.topic'
    };
    const response = await apiClient.get<PaginatedResponse<SubjectExam>>('/subject-exams', { params: queryParams });
    return response.data;
  },

  async search(query: string): Promise<SubjectExam[]> {
    const response = await apiClient.get<SubjectExam[]>(`/subject-exams/search?q=${query}`);
    return response.data;
  },

  async create(data: CreateExamRequest): Promise<SubjectExam> {
    const response = await apiClient.post<ApiResponse<SubjectExam>>('/subject-exams', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateExamRequest): Promise<SubjectExam> {
    const response = await apiClient.put<ApiResponse<SubjectExam>>(`/subject-exams/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/subject-exams/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    await apiClient.delete('/subject-exams/bulk-destroy', { data: { ids } });
  },

  async duplicate(id: number): Promise<SubjectExam> {
    const response = await apiClient.post<ApiResponse<SubjectExam>>(`/subject-exams/${id}/duplicate`);
    return response.data.data;
  },

  async getStatistics(id: number): Promise<ExamStats> {
    const response = await apiClient.get<ExamStats>(`/subject-exams/${id}/statistics`);
    return response.data;
  },

  async getStatus(id: number): Promise<{ status: string; is_active: boolean }> {
    const response = await apiClient.get<{ status: string; is_active: boolean }>(`/subject-exams/${id}/status`);
    return response.data;
  },

  async checkStudentAccess(examId: number, studentId: number): Promise<{ has_access: boolean; reason?: string }> {
    const response = await apiClient.get<{ has_access: boolean; reason?: string }>(`/subject-exams/${examId}/students/${studentId}/check-access`);
    return response.data;
  },

  // Teacher routes
  async getTeacherExams(): Promise<SubjectExam[]> {
    const response = await apiClient.get<SubjectExam[]>('/teacher/subject-exams');
    return response.data;
  },

  async createTeacherExam(data: CreateExamRequest): Promise<SubjectExam> {
    const response = await apiClient.post<ApiResponse<SubjectExam>>('/teacher/subject-exams', data);
    return response.data.data;
  },

  async getExamAnswers(id: number): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<QuestionAnswer[]>(`/teacher/subject-exams/${id}/answers`);
    return response.data;
  },

  async getExamStudentsStatus(id: number): Promise<ExamAttempt[]> {
    const response = await apiClient.get<ExamAttempt[]>(`/teacher/exams/${id}/students`);
    return response.data;
  },

  async getTeacherStatistics(_teacherId: number): Promise<TeacherDashboardStats> {
    const response = await apiClient.get<TeacherDashboardStats>(`/teachers/${_teacherId}/exam-statistics`);
    return response.data;
  },

  async getActiveExamsCount(_teacherId: number): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`/teachers/${_teacherId}/active-exams-count`);
    return response.data.count;
  },

  // Get student exam details for teacher/manager review (role-based endpoints)
  async getStudentExamDetails(examId: number, studentId: number, userRole?: string): Promise<StudentExamDetails> {
    let endpoint: string;
    
    if (userRole === 'manager') {
      // Managers use the dedicated manager/teacher endpoint for student answers
      endpoint = `/students/${studentId}/exams/${examId}/answers`;
      console.log(`Manager API call to: ${endpoint}`);
    } else {
      // Teachers use the teacher-specific endpoint
      endpoint = `/teacher/exams/${examId}/students/${studentId}`;
      console.log(`Teacher API call to: ${endpoint}`);
    }
    
    try {
      const response = await apiClient.get<ApiResponse<TeacherExamDetailsResponse | ManagerAnswerResponse>>(endpoint);
      console.log('API response:', response.data);
      
      // Handle different response structures based on role
      if (userRole === 'manager') {
        // Manager endpoint returns: { success: true, data: { answers: [...], summary: {...} } }
        const managerData = response.data.data || response.data;
        
        if (isManagerApiResponse(managerData)) {
          // Transform manager response to match expected structure
          // We need to fetch exam and student details separately for manager since the answers endpoint doesn't include full data
          try {
            const [examResponse, studentResponse] = await Promise.all([
              apiClient.get<ApiResponse<SubjectExam>>(`/subject-exams/${examId}`),
              apiClient.get<ApiResponse<Student>>(`/students/${studentId}`)
            ]);
            
            const examData = examResponse.data.data;
            const studentData = studentResponse.data.data;
            
            return {
              exam: examData,
              student: studentData,
              answers: managerData.answers,
              summary: managerData.summary, // Include summary for total questions count
              attempt: {
                ...createPartialExamAttempt(managerData.summary),
                id: 0, // Default for created partial attempt
                student_id: studentId,
                subject_exam_id: examId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as ExamAttempt
            };
          } catch (examError) {
            console.error('Failed to fetch exam/student details for manager:', examError);
            // Return with minimal data if fetch fails
            return {
              exam: { id: examId, name: '', about: '', total_points: 0, started_at: '', ended_at: '', subject_id: 0, created_at: '', updated_at: '' },
              student: { id: studentId, name: '', email: '', photo: '', gender: '', created_at: '', updated_at: '' },
              answers: managerData.answers,
              summary: managerData.summary, // Include summary even in fallback
              attempt: null
            };
          }
        }
      } else {
        // Teacher endpoint returns different structure, need to transform it
        const teacherData = response.data.data as TeacherExamDetailsResponse || response.data;
        
        // Transform teacher response to match expected structure
        if (teacherData && teacherData.answers) {
          const transformedAnswers = teacherData.answers.map((answer: TeacherAnswerResponse) => ({
            id: answer.answer_id,
            exam_question_id: answer.question?.id || 0,
            student_id: studentId,
            answer_text: answer.student_answer || '',
            selected_option_id: answer.question?.options?.find((opt: OptionTransform) => opt.is_student_answer)?.id,
            has_passed: answer.has_passed || answer.is_correct || false,
            points_earned: answer.points_earned || 0,
            feedback: answer.feedback,
            question: {
              id: answer.question?.id || 0,
              subject_exam_id: 0, // Required by ExamQuestion interface
              name: answer.question?.text || '', // Transform 'text' to 'name'
              type: (answer.question?.type as 'multiple_choice' | 'essay') || 'multiple_choice',
              points: answer.question?.points || 0,
              timer: answer.question?.timer || 0,
              question_options: answer.question?.options?.map((opt: OptionTransform) => ({
                id: opt.id,
                exam_question_id: answer.question?.id || 0,
                name: opt.text, // Transform 'text' to 'name'
                is_correct: opt.is_correct,
                created_at: '',
                updated_at: ''
              })) || [],
              created_at: '',
              updated_at: ''
            },
            created_at: answer.answered_at,
            updated_at: answer.answered_at
          }));
          
          return {
            exam: teacherData.exam || { id: 0, name: '', about: '', total_points: 0, started_at: '', ended_at: '', subject_id: 0, created_at: '', updated_at: '' },
            student: teacherData.student || { id: studentId, name: '', email: '', photo: '', gender: '', created_at: '', updated_at: '' },
            answers: transformedAnswers,
            attempt: teacherData.attempt || null
          };
        }
        
        // Return a properly structured fallback
        return {
          exam: teacherData?.exam || { id: examId, name: '', about: '', total_points: 0, started_at: '', ended_at: '', subject_id: 0, created_at: '', updated_at: '' },
          student: teacherData?.student || { id: studentId, name: '', email: '', photo: '', gender: '', created_at: '', updated_at: '' },
          answers: [],
          attempt: teacherData?.attempt || null
        };
      }
      
      // Fallback - return empty structure if nothing matches
      return {
        exam: { id: examId, name: '', about: '', total_points: 0, started_at: '', ended_at: '', subject_id: 0, created_at: '', updated_at: '' },
        student: { id: studentId, name: '', email: '', photo: '', gender: '', created_at: '', updated_at: '' },
        answers: [],
        attempt: null
      };
    } catch (error) {
      console.error('Error in getStudentExamDetails:', error);
      const axiosError = error as AxiosError<LaravelErrorResponse>;
      console.error('Error response:', axiosError?.response?.data);
      console.error('Error status:', axiosError?.response?.status);
      
      // If 404 and using teacher endpoint, try fallback to alternative endpoints
      if (axiosError?.response?.status === 404 && userRole === 'teacher') {
        console.log('Teacher endpoint failed, trying fallback approach with subject-exams endpoint');
        try {
          // Fallback to existing separate calls
          const [examResponse, answersResponse] = await Promise.all([
            apiClient.get<ApiResponse<SubjectExam>>(`/subject-exams/${examId}`),
            apiClient.get<ApiResponse<QuestionAnswer[]>>(`/subject-exams/${examId}/students/${studentId}/answers`)
          ]);
          
          return {
            exam: examResponse.data.data,
            answers: answersResponse.data.data,
            student: { id: studentId, name: '', email: '', photo: '', gender: '', created_at: '', updated_at: '' },
            attempt: null
          };
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
      
      throw error;
    }
  },

  // Student routes
  async getStudentExams(): Promise<SubjectExam[]> {
    const response = await apiClient.get<SubjectExam[]>('/student/exams');
    return response.data;
  },

  async getStudentExam(examId: number): Promise<SubjectExam> {
    const response = await apiClient.get<ApiResponse<{ exam: SubjectExam; questions: ExamQuestion[] }>>(`/student/exams/${examId}`);
    const { exam, questions } = response.data.data;
    
    // Merge questions into exam object to match component expectations
    return {
      ...exam,
      exam_questions: questions || []
    };
  },

  async getStudentExamForTaking(examId: number): Promise<StudentExamData> {
    const response = await apiClient.get<ApiResponse<StudentExamData>>(`/student/exams/${examId}`);
    return response.data.data; // Return full response with exam, questions, metadata
  },

  async startExam(examId: number): Promise<ExamAttempt> {
    const response = await apiClient.post<ApiResponse<ExamAttempt>>(`/student/exams/${examId}/start`);
    return response.data.data;
  },

  async submitAnswer(examId: number, questionId: number, answer: { answer_text?: string | null; selected_option_id?: number }): Promise<void> {
    await apiClient.post(`/student/exams/${examId}/questions/${questionId}/answer`, answer);
  },

  async completeExam(examId: number): Promise<void> {
    await apiClient.post(`/student/exams/${examId}/complete`);
  },

  async getExamProgress(examId: number): Promise<ExamProgress> {
    const response = await apiClient.get<ApiResponse<ExamProgress>>(`/student/exams/${examId}/progress`);
    return response.data.data;
  },

  async getExamResults(examId: number): Promise<ExamResult> {
    const response = await apiClient.get<ApiResponse<ExamResult>>(`/student/exams/${examId}/results`);
    console.log('getExamResults response:', response.data);
    return response.data.data;
  },

  async getStudentExamResults(examId: number): Promise<ExamResult> {
    const response = await apiClient.get<ApiResponse<ExamResult>>(`/student/exams/${examId}/results`);
    console.log('getStudentExamResults response:', response.data);
    return response.data.data;
  },

  async getStudentExamsBySubject(subjectId: number): Promise<SubjectExam[]> {
    const response = await apiClient.get<ApiResponse<SubjectExam[]>>(`/student/subjects/${subjectId}/exams`);
    return response.data.data || [];
  },

  // Shared routes (all roles)
  async getById(id: number): Promise<SubjectExam> {
    const response = await apiClient.get<ApiResponse<SubjectExam>>(`/subject-exams/${id}`);
    return response.data.data;
  },

  // Get exams by subject
  async getExamsBySubject(subjectId: number): Promise<SubjectExam[]> {
    const response = await apiClient.get<ApiResponse<SubjectExam[]>>('/subject-exams', {
      params: { subject_id: subjectId }
    });
    return response.data.data || [];
  },
};

// Question service for exam questions management
export const questionService = {
  async createQuestion(data: CreateQuestionRequest): Promise<ExamQuestion> {
    console.log("questionService.createQuestion - called with data:", data);
    try {
      console.log("questionService.createQuestion - making POST request to /exam-questions");
      const response = await apiClient.post('/exam-questions', data);
      console.log("questionService.createQuestion - response:", response);
      console.log("questionService.createQuestion - response.data:", response.data);
      
      // Laravel returns: {success: true, message: "...", data: ExamQuestion}
      if (response.data.success && response.data.data) {
        console.log("questionService.createQuestion - success, returning:", response.data.data);
        return response.data.data;
      } else {
        console.error("questionService.createQuestion - unexpected response format:", response.data);
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("questionService.createQuestion - error:", error);
      const axiosError = error as AxiosError<LaravelErrorResponse>;
      console.error("questionService.createQuestion - error.response:", axiosError?.response);
      console.error("questionService.createQuestion - error.response.data:", axiosError?.response?.data);
      
      // Handle Laravel validation errors
      if (axiosError?.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        console.error("questionService.createQuestion - validation errors:", validationErrors);
        throw new Error(Object.values(validationErrors).flat().join(', '));
      }
      
      // Handle Laravel error messages
      if (axiosError?.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      throw error;
    }
  },

  async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<ExamQuestion> {
    try {
      const response = await apiClient.put<ApiResponse<ExamQuestion>>(`/exam-questions/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error("questionService.updateQuestion - error:", error);
      const axiosError = error as AxiosError<LaravelErrorResponse>;
      console.error("questionService.updateQuestion - error.response:", axiosError?.response);
      console.error("questionService.updateQuestion - error.response.data:", axiosError?.response?.data);
      
      // Handle Laravel validation errors
      if (axiosError?.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        console.error("questionService.updateQuestion - validation errors:", validationErrors);
        throw new Error(Object.values(validationErrors).flat().join(', '));
      }
      
      // Handle Laravel error messages
      if (axiosError?.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      throw error;
    }
  },

  async deleteQuestion(id: number): Promise<void> {
    await apiClient.delete(`/exam-questions/${id}`);
  },

  async getQuestionsByExam(subjectExamId: number): Promise<ExamQuestion[]> {
    const response = await apiClient.get<ApiResponse<ExamQuestion[]>>(`/subject-exams/${subjectExamId}/questions`);
    return response.data.data;
  },

  async bulkCreateQuestions(questions: CreateQuestionRequest[]): Promise<{ created_count: number; error_count: number; created: ExamQuestion[]; errors: string[] }> {
    const response = await apiClient.post<ApiResponse<{ created_count: number; error_count: number; created: ExamQuestion[]; errors: string[] }>>('/exam-questions/bulk-create', { questions });
    return response.data.data;
  },

  async bulkDeleteQuestions(ids: number[]): Promise<{ deleted_count: number; errors: string[] }> {
    const response = await apiClient.delete<ApiResponse<{ deleted_count: number; errors: string[] }>>('/exam-questions/bulk-destroy', { data: { ids } });
    return response.data.data;
  },

  async duplicateQuestion(id: number, targetExamId: number): Promise<ExamQuestion> {
    const response = await apiClient.post<ApiResponse<ExamQuestion>>(`/exam-questions/${id}/duplicate`, { subject_exam_id: targetExamId });
    return response.data.data;
  },

  async getAllQuestions(): Promise<ExamQuestion[]> {
    const response = await apiClient.get<{data: ExamQuestion[]}>('/exam-questions', {
      params: { all: true }
    });
    return response.data.data;
  },

  async searchQuestions(query: string, perPage: number = 6): Promise<ExamQuestion[]> {
    const response = await apiClient.get<ExamQuestion[]>('/exam-questions/search', { 
      params: { query, per_page: perPage } 
    });
    return response.data;
  },

  async getExamStatistics(subjectExamId: number): Promise<Record<string, unknown>> {
    const response = await apiClient.get<Record<string, unknown>>(`/subject-exams/${subjectExamId}/questions/statistics`);
    return response.data;
  },

  async gradeAnswer(_answerId: number, points: number, feedback?: string): Promise<void> {
    await apiClient.post(`/question-answers/${_answerId}/grade`, {
      points_earned: points,
      feedback,
    });
  },

  async bulkGrade(answers: Array<{ id: number; points: number; feedback?: string }>): Promise<void> {
    await apiClient.post('/question-answers/bulk-grade', { answers });
  },

  async getNeedsGrading(): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<QuestionAnswer[]>('/question-answers/needs-grading');
    return response.data;
  },

  async getStudentAnswers(_studentId: number, _examId: number): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<QuestionAnswer[]>(`/students/${_studentId}/exams/${_examId}/answers`);
    return response.data;
  },
};