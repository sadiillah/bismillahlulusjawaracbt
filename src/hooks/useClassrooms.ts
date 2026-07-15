import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ClassRoom, Student, Subject, CreateClassRoomRequest, UpdateClassRoomRequest, PaginatedResponse, ClassRoomStatistics, ApiError, ManageStudentRequest } from '../types';
import { classroomService } from '../api/classroomService';
import { useAuth } from '../context/AuthContext';

export const useFetchAllClassrooms = () => {
  return useQuery<ClassRoom[], AxiosError>({
    queryKey: ["all-classrooms"],
    queryFn: async () => {
      const response = await classroomService.getAll({ all: true });
      return response.data;
    },
    retry: false,
  });
};

export const useFetchClassrooms = (page: number = 1) => {
  return useQuery<PaginatedResponse<ClassRoom>, AxiosError>({
    queryKey: ["classrooms", page],
    queryFn: async () => {
      return await classroomService.getAll({ page, per_page: 6 });
    },
    retry: false,
  });
};

export const useRoleBasedClassrooms = (page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];

  // Always call all queries but only enable the one for the current role
  const managerQuery = useQuery<PaginatedResponse<ClassRoom>, AxiosError>({
    queryKey: ["classrooms", page],
    queryFn: async () => {
      return await classroomService.getAll({ page, per_page: 6 });
    },
    enabled: role === "manager",
    retry: false,
  });

  const teacherQuery = useQuery<ClassRoom[], AxiosError>({
    queryKey: ["teacher-classrooms"],
    queryFn: () => classroomService.getTeacherClassrooms(),
    enabled: role === "teacher",
    retry: false,
  });

  const studentQuery = useQuery<ClassRoom[], AxiosError>({
    queryKey: ["student-classrooms"],
    queryFn: () => classroomService.getStudentClassrooms(),
    enabled: role === "student",
    retry: false,
  });

  // Return appropriate query based on role
  if (role === "manager") {
    return managerQuery;
  } else if (role === "teacher") {
    return teacherQuery;
  } else if (role === "student") {
    return studentQuery;
  }

  // Default fallback - return a mock query for unknown roles
  return {
    data: undefined,
    isLoading: false,
    error: null,
    isError: false,
  } as typeof studentQuery;
};

export const useFetchClassroom = (id: number) => {
  return useQuery<ClassRoom, AxiosError>({
    queryKey: ["classroom", id],
    queryFn: async () => {
      return await classroomService.getById(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useSearchClassrooms = (query: string) => {
  return useQuery<ClassRoom[], AxiosError>({
    queryKey: ["classrooms-search", query],
    queryFn: async () => {
      return await classroomService.search(query);
    },
    enabled: !!query && query.length > 0,
    retry: false,
  });
};

// Search classrooms with pagination (Manager only)
export const useSearchClassroomsWithPagination = (query: string, page: number = 1) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];
  
  return useQuery<PaginatedResponse<ClassRoom>, AxiosError>({
    queryKey: ["classrooms-search", query, page],
    queryFn: async () => {
      return await classroomService.getAll({ search: query, page, per_page: 6 });
    },
    enabled: role === "manager" && !!query && query.length > 0,
    retry: false,
  });
};

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation<ClassRoom, AxiosError<ApiError>, CreateClassRoomRequest>({
    mutationFn: async (data: CreateClassRoomRequest) => {
      return await classroomService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ClassRoom,
    AxiosError<ApiError>,
    { id: number } & UpdateClassRoomRequest
  >({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateClassRoomRequest) => {
      return await classroomService.update(id, data);
    },
    onSuccess: (_: ClassRoom, { id }: { id: number } & UpdateClassRoomRequest) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["classroom", id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await classroomService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useBulkDeleteClassrooms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await classroomService.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
};

export const useFetchClassroomStudents = (id: number) => {
  return useQuery<Student[], AxiosError>({
    queryKey: ["classroom-students", id],
    queryFn: async () => {
      return await classroomService.getStudents(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useFetchClassroomSubjects = (id: number) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ["classroom-subjects", id],
    queryFn: async () => {
      return await classroomService.getSubjects(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useFetchAvailableSubjects = (id: number) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ["available-subjects", id],
    queryFn: async () => {
      return await classroomService.getAvailableSubjects(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export interface AvailableSubjectsPaginatedResponse {
  data: Subject[];
  total: number;
  current_page: number;
  per_page: number;
  has_more: boolean;
}

export interface AvailableStudentsPaginatedResponse {
  data: Student[];
  total: number;
  current_page: number;
  per_page: number;
  has_more: boolean;
}

export const useFetchAvailableSubjectsPaginated = (id: number, page: number = 1, perPage: number = 6, search: string = '') => {
  return useQuery<AvailableSubjectsPaginatedResponse, AxiosError>({
    queryKey: ["all-subjects-paginated", page, perPage, search],
    queryFn: async () => {
      return await classroomService.getAvailableSubjectsPaginated(id, page, perPage, search);
    },
    enabled: true, // Always enabled since we're fetching all subjects
    retry: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new pages
  });
};

export const useFetchClassroomStatistics = (id: number) => {
  return useQuery<ClassRoomStatistics, AxiosError>({
    queryKey: ["classroom-statistics", id],
    queryFn: async () => {
      return await classroomService.getStatistics(id);
    },
    enabled: !!id,
    retry: false,
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, studentId }: { classroomId: number; studentId: number }) => {
      await classroomService.enrollStudent(classroomId, studentId);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-students", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, studentId }: { classroomId: number; studentId: number }) => {
      await classroomService.unenrollStudent(classroomId, studentId);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-students", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useAssignSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, subjectId }: { classroomId: number; subjectId: number }) => {
      await classroomService.assignSubject(classroomId, subjectId);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-subjects", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useUnassignSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, subjectId }: { classroomId: number; subjectId: number }) => {
      await classroomService.unassignSubject(classroomId, subjectId);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-subjects", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useBulkAssignSubjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, subjectIds }: { classroomId: number; subjectIds: number[] }) => {
      await classroomService.bulkAssignSubjects(classroomId, subjectIds);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-subjects", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["available-subjects", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useFetchAvailableStudentsPaginated = (id: number, page: number = 1, perPage: number = 6, search: string = '') => {
  return useQuery<AvailableStudentsPaginatedResponse, AxiosError>({
    queryKey: ["available-students-paginated", id, page, perPage, search],
    queryFn: async () => {
      return await classroomService.getAvailableStudentsPaginated(id, page, perPage, search);
    },
    enabled: !!id,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useBulkEnrollStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, studentIds }: { classroomId: number; studentIds: number[] }) => {
      await classroomService.bulkEnrollStudents(classroomId, studentIds);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-students", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["available-students", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classroomId] });
      // Invalidate classroom lists to update counts in cards
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classroomId, studentId, hasPassed, rapport }: { classroomId: number; studentId: number; hasPassed: boolean; rapport?: string }) => {
      await classroomService.updateStudentStatus(classroomId, studentId, hasPassed, rapport);
    },
    onSuccess: (_, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-students", classroomId] });
    },
  });
};

export const useManageStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, ManageStudentRequest>({
    mutationFn: async ({ studentId, classRoomId, status, rapport }: ManageStudentRequest) => {
      const hasPassed = status === 'passed';
      
      // Update student rapport (includes both status and optional file upload)
      await classroomService.updateStudentRapport(studentId, classRoomId, hasPassed, rapport);
    },
    onSuccess: (_, { classRoomId }) => {
      queryClient.invalidateQueries({ queryKey: ["classroom-students", classRoomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classRoomId] });
      queryClient.invalidateQueries({ queryKey: ["classroom-statistics", classRoomId] });
    },
  });
};


export const useFetchTeacherClassrooms = () => {
  return useQuery<ClassRoom[], AxiosError>({
    queryKey: ["teacher-classrooms"],
    queryFn: async () => {
      return await classroomService.getTeacherClassrooms();
    },
    retry: false,
  });
};

export const useFetchStudentClassrooms = () => {
  return useQuery<ClassRoom[], AxiosError>({
    queryKey: ["student-classrooms"],
    queryFn: async () => {
      return await classroomService.getStudentClassrooms();
    },
    retry: false,
  });
};