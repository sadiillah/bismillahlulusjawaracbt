import { z } from "zod";

// Exam Attempt schemas (based on exam_attempts table migration)
// Note: migrations show fields were modified - completed_at is nullable, total_attempts was added

// Start exam attempt
export const startExamAttemptSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"), // Foreign key to subject_exams
  student_id: z.coerce.number().min(1, "Student is required"), // Foreign key to users (students)
}).refine(async () => {
  // Note: This would typically check if exam is active and student has access
  // For now, we'll do basic validation
  // Additional validation logic would go here (exam timing, permissions, etc.)
  return true;
}, {
  message: "Cannot start exam at this time",
});

// Update exam attempt progress
export const updateExamProgressSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  total_questions: z.coerce.number().min(1, "Total questions must be at least 1").default(0), // INTEGER with default 0 in migration
  answered_questions: z.coerce.number().min(0, "Answered questions cannot be negative").default(0), // INTEGER with default 0 in migration
}).refine((data) => {
  return data.answered_questions <= data.total_questions;
}, {
  message: "Answered questions cannot exceed total questions",
  path: ["answered_questions"],
});

// Complete exam attempt
export const completeExamAttemptSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  is_completed: z.boolean().default(true), // BOOLEAN with default false in migration
  completed_at: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid completion date format",
  }),
});

// Resume exam attempt (for incomplete attempts)
export const resumeExamAttemptSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
}).refine(async () => {
  // Validation logic to check if attempt exists and is not completed
  return true;
}, {
  message: "Cannot resume this exam attempt",
});

// Retry exam attempt (increment total_attempts)
export const retryExamAttemptSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  reset_progress: z.boolean().default(true), // Whether to reset answered_questions count
}).refine(async () => {
  // Would check exam retry policies, maximum attempts, etc.
  return true;
}, {
  message: "Cannot retry this exam",
});

// Track exam timing and session
export const examSessionSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  session_start: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid session start time",
  }),
  session_end: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid session end time",
  }),
  time_spent: z.coerce.number().min(0, "Time spent cannot be negative").optional(), // In seconds
}).refine((data) => {
  if (data.session_end) {
    const start = new Date(data.session_start);
    const end = new Date(data.session_end);
    return end > start;
  }
  return true;
}, {
  message: "Session end time must be after start time",
  path: ["session_end"],
});

// Exam attempt validation for teachers/managers
export const validateExamAttemptSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  is_valid: z.boolean(),
  validation_notes: z.string().optional(),
  validated_by: z.coerce.number().min(1, "Validator is required"), // Teacher/Manager ID
});

// Bulk operations for exam attempts
export const bulkCompleteAttemptsSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_ids: z.array(z.coerce.number()).min(1, "At least one student must be selected"),
  force_complete: z.boolean().default(false), // Force completion even if not all questions answered
});

export const bulkResetAttemptsSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_ids: z.array(z.coerce.number()).min(1, "At least one student must be selected"),
  reset_all_data: z.boolean().default(false), // Reset answers and progress completely
});

// Exam attempt statistics and monitoring
export const attemptStatsFilterSchema = z.object({
  subject_exam_id: z.coerce.number().optional(),
  student_id: z.coerce.number().optional(),
  is_completed: z.boolean().optional(),
  date_range: z.object({
    start_date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    end_date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  }).optional(),
  min_attempts: z.coerce.number().min(1).optional(),
  max_attempts: z.coerce.number().min(1).optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
}).refine((data) => {
  if (data.date_range) {
    const start = new Date(data.date_range.start_date);
    const end = new Date(data.date_range.end_date);
    return end > start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["date_range", "end_date"],
}).refine((data) => {
  if (data.min_attempts && data.max_attempts) {
    return data.max_attempts >= data.min_attempts;
  }
  return true;
}, {
  message: "Maximum attempts must be greater than or equal to minimum attempts",
  path: ["max_attempts"],
});

// Student exam attempt history
export const studentAttemptHistorySchema = z.object({
  student_id: z.coerce.number().min(1, "Student is required"),
  subject_exam_id: z.coerce.number().optional(),
  subject_id: z.coerce.number().optional(),
  include_incomplete: z.boolean().default(true),
  limit: z.coerce.number().min(1).max(50).optional(),
});

// Teacher monitoring schema
export const teacherMonitoringSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  real_time: z.boolean().default(false), // For live monitoring during exam
  include_progress: z.boolean().default(true),
  include_timing: z.boolean().default(false),
});

// Exam attempt security and integrity
export const attemptIntegritySchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  student_id: z.coerce.number().min(1, "Student is required"),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  screen_resolution: z.string().optional(),
  browser_info: z.string().optional(),
  suspicious_activity: z.boolean().default(false),
  integrity_notes: z.string().optional(),
});

// Export form data types
export type StartExamAttemptFormData = z.infer<typeof startExamAttemptSchema>;
export type UpdateExamProgressFormData = z.infer<typeof updateExamProgressSchema>;
export type CompleteExamAttemptFormData = z.infer<typeof completeExamAttemptSchema>;
export type ResumeExamAttemptFormData = z.infer<typeof resumeExamAttemptSchema>;
export type RetryExamAttemptFormData = z.infer<typeof retryExamAttemptSchema>;
export type ExamSessionFormData = z.infer<typeof examSessionSchema>;
export type ValidateExamAttemptFormData = z.infer<typeof validateExamAttemptSchema>;
export type BulkCompleteAttemptsFormData = z.infer<typeof bulkCompleteAttemptsSchema>;
export type BulkResetAttemptsFormData = z.infer<typeof bulkResetAttemptsSchema>;
export type AttemptStatsFilterFormData = z.infer<typeof attemptStatsFilterSchema>;
export type StudentAttemptHistoryFormData = z.infer<typeof studentAttemptHistorySchema>;
export type TeacherMonitoringFormData = z.infer<typeof teacherMonitoringSchema>;
export type AttemptIntegrityFormData = z.infer<typeof attemptIntegritySchema>;