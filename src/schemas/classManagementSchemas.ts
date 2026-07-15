import { z } from "zod";
import { rapportFieldRequired, rapportFieldOptional } from "./fileValidationSchemas";

// Class Student Management (based on class_students table migration)

// Enroll single student in classroom
export const enrollStudentSchema = z.object({
  student_id: z.coerce.number().min(1, "Student is required"),
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  has_passed: z.boolean().default(false), // BOOLEAN with default false in migration
  rapport: rapportFieldOptional, // REQUIRED field in migration but optional during enrollment
});

// Bulk enroll multiple students in a classroom
export const bulkEnrollStudentsSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  student_ids: z.array(z.coerce.number()).min(1, "At least one student must be selected"),
  has_passed: z.boolean().default(false),
});

// Update student status in classroom
export const updateStudentStatusSchema = z.object({
  student_id: z.coerce.number().min(1, "Student is required"),
  class_room_id: z.coerce.number().min(1, "Classroom is required"), 
  has_passed: z.boolean(), // Required for status update
  rapport: rapportFieldOptional, // Can update rapport file
});

// Upload rapport for student (based on class_students.rapport field)
export const uploadStudentRapportSchema = z.object({
  student_id: z.coerce.number().min(1, "Student is required"),
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  rapport: rapportFieldRequired, // REQUIRED rapport field as PDF
});

// Remove student from classroom
export const removeStudentFromClassSchema = z.object({
  student_id: z.coerce.number().min(1, "Student is required"),
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
});

// Class Subject Management (based on class_subjects table migration)

// Assign single subject to classroom
export const assignSubjectToClassSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  subject_id: z.coerce.number().min(1, "Subject is required"),
});

// Bulk assign multiple subjects to a classroom
export const bulkAssignSubjectsSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  subject_ids: z.array(z.coerce.number()).min(1, "At least one subject must be selected"),
});

// Remove subject from classroom
export const removeSubjectFromClassSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  subject_id: z.coerce.number().min(1, "Subject is required"),
});

// Transfer students between classrooms
export const transferStudentsSchema = z.object({
  from_class_room_id: z.coerce.number().min(1, "Source classroom is required"),
  to_class_room_id: z.coerce.number().min(1, "Destination classroom is required"),
  student_ids: z.array(z.coerce.number()).min(1, "At least one student must be selected"),
  transfer_rapport: z.boolean().default(true), // Whether to transfer rapport files
}).refine((data) => {
  return data.from_class_room_id !== data.to_class_room_id;
}, {
  message: "Source and destination classrooms must be different",
  path: ["to_class_room_id"],
});

// Copy subjects between classrooms
export const copySubjectsSchema = z.object({
  from_class_room_id: z.coerce.number().min(1, "Source classroom is required"),
  to_class_room_id: z.coerce.number().min(1, "Destination classroom is required"),
  subject_ids: z.array(z.coerce.number()).min(1, "At least one subject must be selected"),
}).refine((data) => {
  return data.from_class_room_id !== data.to_class_room_id;
}, {
  message: "Source and destination classrooms must be different", 
  path: ["to_class_room_id"],
});

// Bulk operations
export const bulkUpdateStudentStatusSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  updates: z.array(z.object({
    student_id: z.coerce.number().min(1, "Student ID is required"),
    has_passed: z.boolean(),
  })).min(1, "At least one student must be selected"),
});

export const bulkRemoveStudentsSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  student_ids: z.array(z.coerce.number()).min(1, "At least one student must be selected"),
});

export const bulkRemoveSubjectsSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  subject_ids: z.array(z.coerce.number()).min(1, "At least one subject must be selected"),
});

// Search and filter schemas for classroom management
export const classStudentFilterSchema = z.object({
  class_room_id: z.coerce.number().optional(),
  has_passed: z.boolean().optional(),
  has_rapport: z.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const classSubjectFilterSchema = z.object({
  class_room_id: z.coerce.number().optional(),
  teacher_id: z.coerce.number().optional(),
  topic_id: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const availableStudentsFilterSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"), // To exclude already enrolled students
  grade_level: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const availableSubjectsFilterSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"), // To exclude already assigned subjects
  topic_id: z.coerce.number().optional(),
  teacher_id: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

// Classroom statistics and reports
export const classroomStatsFilterSchema = z.object({
  class_room_id: z.coerce.number().min(1, "Classroom is required"),
  include_student_details: z.boolean().default(false),
  include_subject_details: z.boolean().default(false),
});

// Export form data types
export type EnrollStudentFormData = z.infer<typeof enrollStudentSchema>;
export type BulkEnrollStudentsFormData = z.infer<typeof bulkEnrollStudentsSchema>;
export type UpdateStudentStatusFormData = z.infer<typeof updateStudentStatusSchema>;
export type UploadStudentRapportFormData = z.infer<typeof uploadStudentRapportSchema>;
export type RemoveStudentFromClassFormData = z.infer<typeof removeStudentFromClassSchema>;
export type AssignSubjectToClassFormData = z.infer<typeof assignSubjectToClassSchema>;
export type BulkAssignSubjectsFormData = z.infer<typeof bulkAssignSubjectsSchema>;
export type RemoveSubjectFromClassFormData = z.infer<typeof removeSubjectFromClassSchema>;
export type TransferStudentsFormData = z.infer<typeof transferStudentsSchema>;
export type CopySubjectsFormData = z.infer<typeof copySubjectsSchema>;
export type BulkUpdateStudentStatusFormData = z.infer<typeof bulkUpdateStudentStatusSchema>;
export type BulkRemoveStudentsFormData = z.infer<typeof bulkRemoveStudentsSchema>;
export type BulkRemoveSubjectsFormData = z.infer<typeof bulkRemoveSubjectsSchema>;
export type ClassStudentFilterFormData = z.infer<typeof classStudentFilterSchema>;
export type ClassSubjectFilterFormData = z.infer<typeof classSubjectFilterSchema>;
export type AvailableStudentsFilterFormData = z.infer<typeof availableStudentsFilterSchema>;
export type AvailableSubjectsFilterFormData = z.infer<typeof availableSubjectsFilterSchema>;
export type ClassroomStatsFilterFormData = z.infer<typeof classroomStatsFilterSchema>;