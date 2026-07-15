import { z } from "zod";
import { photoFieldRequired, photoFieldOptional, pdfFieldRequired, pdfFieldOptional } from "./fileValidationSchemas";

// Topic schemas (based on topics table migration)
const baseTopicSchema = {
  name: z.string().min(1, "Topic name is required"), // UNIQUE constraint in migration
  about: z.string().min(1, "Topic description is required"), // REQUIRED field in migration
};

export const createTopicSchema = z.object({
  ...baseTopicSchema,
  photo: photoFieldRequired, // REQUIRED field in topics migration
});

export const updateTopicSchema = z.object({
  ...baseTopicSchema,
  photo: photoFieldOptional, // Optional for updates
});

// Subject schemas (based on subjects table migration)
const baseSubjectSchema = {
  name: z.string().min(1, "Subject name is required"), // UNIQUE constraint in migration
  tagline: z.string().min(1, "Subject tagline is required"), // REQUIRED field in migration
  about: z.string().min(1, "Subject description is required"), // REQUIRED field in migration
  topic_id: z.coerce.number().min(1, "Topic is required"), // Foreign key to topics
  teacher_id: z.coerce.number().min(1, "Teacher is required"), // Foreign key to users
};

export const createSubjectSchema = z.object({
  ...baseSubjectSchema,
  photo: photoFieldRequired, // REQUIRED field in subjects migration
  content: pdfFieldRequired, // REQUIRED PDF content field
});

export const updateSubjectSchema = z.object({
  ...baseSubjectSchema,
  photo: photoFieldOptional, // Optional for updates
  content: pdfFieldOptional, // Optional PDF content for updates
});

// Classroom schemas (based on class_rooms table migration)
const baseClassRoomSchema = {
  name: z.string().min(1, "Classroom name is required"), // UNIQUE constraint in migration
  grade: z.coerce.number().min(1, "Grade level is required").max(12, "Grade level cannot exceed 12"), // INTEGER field in migration
};

export const createClassRoomSchema = z.object({
  ...baseClassRoomSchema,
  photo: photoFieldRequired, // REQUIRED field in class_rooms migration
});

export const updateClassRoomSchema = z.object({
  ...baseClassRoomSchema,
  photo: photoFieldOptional, // Optional for updates
});

// Basic assignment schemas (simple cases - complex ones are in classManagementSchemas)
export const assignSubjectSchema = z.object({
  subject_id: z.coerce.number().min(1, "Subject is required"),
});

// Simple bulk operation schemas (complex ones are in classManagementSchemas)
export const bulkDeleteSchema = z.object({
  ids: z.array(z.coerce.number()).min(1, "At least one item must be selected"),
});

// Search and filter schemas
export const topicFilterSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const subjectFilterSchema = z.object({
  search: z.string().optional(),
  topic_id: z.coerce.number().optional(),
  teacher_id: z.coerce.number().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const classRoomFilterSchema = z.object({
  search: z.string().optional(),
  grade: z.coerce.number().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

// Export form data types
export type CreateTopicFormData = z.infer<typeof createTopicSchema>;
export type UpdateTopicFormData = z.infer<typeof updateTopicSchema>;
export type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectFormData = z.infer<typeof updateSubjectSchema>;
export type CreateClassRoomFormData = z.infer<typeof createClassRoomSchema>;
export type UpdateClassRoomFormData = z.infer<typeof updateClassRoomSchema>;
export type AssignSubjectFormData = z.infer<typeof assignSubjectSchema>;
export type BulkDeleteFormData = z.infer<typeof bulkDeleteSchema>;
export type TopicFilterFormData = z.infer<typeof topicFilterSchema>;
export type SubjectFilterFormData = z.infer<typeof subjectFilterSchema>;
export type ClassRoomFilterFormData = z.infer<typeof classRoomFilterSchema>;