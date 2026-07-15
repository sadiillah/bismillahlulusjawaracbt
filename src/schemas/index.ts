// Barrel export for all schema modules
// This allows clean imports like: import { loginSchema, createUserSchema } from '../schemas'

// File validation utilities
export * from './fileValidationSchemas';

// Authentication schemas
export * from './authSchemas';

// User management schemas  
export * from './userSchemas';

// Academic structure schemas (Topics, Subjects, ClassRooms)
export * from './academicSchemas';

// Exam and question schemas
export * from './examSchemas';

// Classroom management schemas (enrollment, assignments)
export * from './classManagementSchemas';

// Exam attempt and workflow schemas
export * from './attemptSchemas';

// Permission and role management schemas
export * from './permissionSchemas';

// Re-export commonly used schemas with descriptive names for easier discovery

// Authentication schemas
export {
  loginSchema as LOGIN_SCHEMA,
  registerSchema as REGISTER_SCHEMA,
  forgotPasswordSchema as FORGOT_PASSWORD_SCHEMA,
  resetPasswordSchema as RESET_PASSWORD_SCHEMA,
  changePasswordSchema as CHANGE_PASSWORD_SCHEMA,
} from './authSchemas';

// User schemas
export {
  createUserSchema as CREATE_USER_SCHEMA,
  updateUserSchema as UPDATE_USER_SCHEMA,
  createTeacherSchema as CREATE_TEACHER_SCHEMA,
  createStudentSchema as CREATE_STUDENT_SCHEMA,
  createManagerSchema as CREATE_MANAGER_SCHEMA,
} from './userSchemas';

// Academic schemas
export {
  createTopicSchema as CREATE_TOPIC_SCHEMA,
  updateTopicSchema as UPDATE_TOPIC_SCHEMA,
  createSubjectSchema as CREATE_SUBJECT_SCHEMA,
  updateSubjectSchema as UPDATE_SUBJECT_SCHEMA,
  createClassRoomSchema as CREATE_CLASSROOM_SCHEMA,
  updateClassRoomSchema as UPDATE_CLASSROOM_SCHEMA,
} from './academicSchemas';

// Exam schemas
export {
  createSubjectExamSchema as CREATE_EXAM_SCHEMA,
  updateSubjectExamSchema as UPDATE_EXAM_SCHEMA,
  createExamQuestionSchema as CREATE_QUESTION_SCHEMA,
  updateExamQuestionSchema as UPDATE_QUESTION_SCHEMA,
  createQuestionOptionSchema as CREATE_OPTION_SCHEMA,
  submitMultipleChoiceAnswerSchema as SUBMIT_MC_ANSWER_SCHEMA,
  submitEssayAnswerSchema as SUBMIT_ESSAY_ANSWER_SCHEMA,
  gradeQuestionAnswerSchema as GRADE_ANSWER_SCHEMA,
  bulkGradeAnswersSchema as BULK_GRADE_SCHEMA,
} from './examSchemas';

// Class Management schemas
export {
  enrollStudentSchema as ENROLL_STUDENT_SCHEMA,
  bulkEnrollStudentsSchema as BULK_ENROLL_STUDENTS_SCHEMA,
  assignSubjectToClassSchema as ASSIGN_SUBJECT_SCHEMA,
  bulkAssignSubjectsSchema as BULK_ASSIGN_SUBJECTS_SCHEMA,
  uploadStudentRapportSchema as UPLOAD_RAPPORT_SCHEMA,
  updateStudentStatusSchema as UPDATE_STUDENT_STATUS_SCHEMA,
} from './classManagementSchemas';

// Attempt schemas
export {
  startExamAttemptSchema as START_ATTEMPT_SCHEMA,
  completeExamAttemptSchema as COMPLETE_ATTEMPT_SCHEMA,
  updateExamProgressSchema as UPDATE_PROGRESS_SCHEMA,
} from './attemptSchemas';

// Permission schemas
export {
  assignRoleSchema as ASSIGN_ROLE_SCHEMA,
  createRoleSchema as CREATE_ROLE_SCHEMA,
  createPermissionSchema as CREATE_PERMISSION_SCHEMA,
  bulkAssignRolesSchema as BULK_ASSIGN_ROLES_SCHEMA,
} from './permissionSchemas';

// File validation utilities
export {
  photoFieldRequired as PHOTO_REQUIRED,
  photoFieldOptional as PHOTO_OPTIONAL,
  pdfFieldRequired as PDF_REQUIRED,
  pdfFieldOptional as PDF_OPTIONAL,
  rapportFieldRequired as RAPPORT_REQUIRED,
  rapportFieldOptional as RAPPORT_OPTIONAL,
} from './fileValidationSchemas';

// Export schema categories for organized imports
export const AUTH_SCHEMAS = {
  login: 'loginSchema',
  register: 'registerSchema',
  forgotPassword: 'forgotPasswordSchema',
  resetPassword: 'resetPasswordSchema',
  changePassword: 'changePasswordSchema',
  verifyEmail: 'verifyEmailSchema',
  updateProfile: 'updateProfileSchema',
} as const;

export const USER_SCHEMAS = {
  create: 'createUserSchema',
  update: 'updateUserSchema', 
  createTeacher: 'createTeacherSchema',
  createStudent: 'createStudentSchema',
  createManager: 'createManagerSchema',
  changePassword: 'changePasswordSchema',
} as const;

export const ACADEMIC_SCHEMAS = {
  topic: {
    create: 'createTopicSchema',
    update: 'updateTopicSchema',
    filter: 'topicFilterSchema',
  },
  subject: {
    create: 'createSubjectSchema',
    update: 'updateSubjectSchema',
    filter: 'subjectFilterSchema',
  },
  classroom: {
    create: 'createClassRoomSchema',
    update: 'updateClassRoomSchema',
    filter: 'classRoomFilterSchema',
  },
} as const;

export const EXAM_SCHEMAS = {
  exam: {
    create: 'createSubjectExamSchema',
    update: 'updateSubjectExamSchema',
    filter: 'examFilterSchema',
  },
  question: {
    create: 'createExamQuestionSchema',
    update: 'updateExamQuestionSchema',
    filter: 'questionFilterSchema',
  },
  option: {
    create: 'createQuestionOptionSchema',
    update: 'updateQuestionOptionSchema',
  },
  answer: {
    submitMC: 'submitMultipleChoiceAnswerSchema',
    submitEssay: 'submitEssayAnswerSchema',
    grade: 'gradeQuestionAnswerSchema',
    bulkGrade: 'bulkGradeAnswersSchema',
    filter: 'answerFilterSchema',
  },
} as const;

export const CLASS_MANAGEMENT_SCHEMAS = {
  enrollment: {
    single: 'enrollStudentSchema',
    bulk: 'bulkEnrollStudentsSchema',
    remove: 'removeStudentFromClassSchema',
    updateStatus: 'updateStudentStatusSchema',
    uploadRapport: 'uploadStudentRapportSchema',
  },
  subjects: {
    assign: 'assignSubjectToClassSchema',
    bulkAssign: 'bulkAssignSubjectsSchema',
    remove: 'removeSubjectFromClassSchema',
  },
  transfer: {
    students: 'transferStudentsSchema',
    subjects: 'copySubjectsSchema',
  },
} as const;

export const ATTEMPT_SCHEMAS = {
  start: 'startExamAttemptSchema',
  complete: 'completeExamAttemptSchema',
  resume: 'resumeExamAttemptSchema',
  retry: 'retryExamAttemptSchema',
  updateProgress: 'updateExamProgressSchema',
  session: 'examSessionSchema',
  stats: 'attemptStatsFilterSchema',
} as const;

export const PERMISSION_SCHEMAS = {
  role: {
    create: 'createRoleSchema',
    update: 'updateRoleSchema',
    assign: 'assignRoleSchema',
    remove: 'removeRoleSchema',
    sync: 'syncUserRolesSchema',
    filter: 'roleFilterSchema',
  },
  permission: {
    create: 'createPermissionSchema',
    update: 'updatePermissionSchema',
    assignToUser: 'assignPermissionToUserSchema',
    assignToRole: 'assignPermissionToRoleSchema',
    removeFromUser: 'removePermissionFromUserSchema',
    removeFromRole: 'removePermissionFromRoleSchema',
    filter: 'permissionFilterSchema',
  },
  bulk: {
    assignRoles: 'bulkAssignRolesSchema',
    assignPermissionsToUsers: 'bulkAssignPermissionsToUsersSchema',
    assignPermissionsToRoles: 'bulkAssignPermissionsToRolesSchema',
  },
} as const;

export const FILE_VALIDATION = {
  photo: {
    required: 'photoFieldRequired',
    optional: 'photoFieldOptional',
  },
  pdf: {
    required: 'pdfFieldRequired', 
    optional: 'pdfFieldOptional',
  },
  rapport: {
    required: 'rapportFieldRequired',
    optional: 'rapportFieldOptional',
  },
  limits: 'FILE_SIZE_LIMITS',
  types: 'ACCEPTED_FILE_TYPES',
} as const;

// Type definitions for schema categories
export type SchemaCategory = 
  | 'auth'
  | 'user' 
  | 'academic'
  | 'exam'
  | 'classManagement'
  | 'attempt'
  | 'permission'
  | 'fileValidation';

// Helper type to get all schema names
export type AllSchemaNames = 
  | keyof typeof AUTH_SCHEMAS
  | keyof typeof USER_SCHEMAS
  | keyof typeof ACADEMIC_SCHEMAS['topic']
  | keyof typeof ACADEMIC_SCHEMAS['subject']
  | keyof typeof ACADEMIC_SCHEMAS['classroom']
  | keyof typeof EXAM_SCHEMAS['exam']
  | keyof typeof EXAM_SCHEMAS['question']
  | keyof typeof EXAM_SCHEMAS['option']
  | keyof typeof EXAM_SCHEMAS['answer']
  | keyof typeof CLASS_MANAGEMENT_SCHEMAS['enrollment']
  | keyof typeof CLASS_MANAGEMENT_SCHEMAS['subjects']
  | keyof typeof CLASS_MANAGEMENT_SCHEMAS['transfer']
  | keyof typeof ATTEMPT_SCHEMAS
  | keyof typeof PERMISSION_SCHEMAS['role']
  | keyof typeof PERMISSION_SCHEMAS['permission']
  | keyof typeof PERMISSION_SCHEMAS['bulk']
  | keyof typeof FILE_VALIDATION['photo']
  | keyof typeof FILE_VALIDATION['pdf']
  | keyof typeof FILE_VALIDATION['rapport'];