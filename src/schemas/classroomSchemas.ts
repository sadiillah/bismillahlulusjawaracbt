import { z } from 'zod';

// File validation helper
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 2MB')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported'
  );

// Create classroom schema
export const createClassroomSchema = z.object({
  name: z
    .string()
    .min(1, 'Classroom name is required')
    .min(2, 'Classroom name must be at least 2 characters')
    .max(100, 'Classroom name must not exceed 100 characters'),
  grade: z
    .number({
      message: 'Grade must be a number',
    })
    .min(1, 'Grade must be at least 1')
    .max(12, 'Grade cannot exceed 12'),
  photo: imageFileSchema.optional(),
});

// Update classroom schema (all fields optional)
export const updateClassroomSchema = z.object({
  name: z
    .string()
    .min(2, 'Classroom name must be at least 2 characters')
    .max(100, 'Classroom name must not exceed 100 characters')
    .optional(),
  grade: z
    .number({
      message: 'Grade must be a number',
    })
    .min(1, 'Grade must be at least 1')
    .max(12, 'Grade cannot exceed 12')
    .optional(),
  photo: imageFileSchema.optional(),
});

// Type definitions
export type CreateClassroomFormData = z.infer<typeof createClassroomSchema>;
export type UpdateClassroomFormData = z.infer<typeof updateClassroomSchema>;