import { z } from "zod";
import { photoFieldRequired, photoFieldOptional } from "./fileValidationSchemas";

// Reusable base user fields based on users table migration
const baseUserSchema = {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["male", "female"]), // REQUIRED in migration
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(8, "Please confirm your password"),
};

// Create user schema (photo required based on migration)
export const createUserSchema = z
  .object({
    ...baseUserSchema,
    photo: photoFieldRequired, // REQUIRED field in users migration
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Update user schema (photo optional for updates)
export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    gender: z.enum(["male", "female"]).optional(),
    photo: photoFieldOptional,
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((data) => {
    // Only validate password length if password is provided and not empty
    if (data.password && data.password.trim() && data.password.length < 8) {
      return false;
    }
    return true;
  }, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  })
  .refine((data) => {
    // Only validate password confirmation if password is provided and not empty
    if (data.password && data.password.trim() && !data.password_confirmation) {
      return false;
    }
    if (data.password && data.password.trim() && data.password_confirmation) {
      return data.password === data.password_confirmation;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Teacher creation schema (extends base with role)
export const createTeacherSchema = z
  .object({
    ...baseUserSchema,
    photo: photoFieldRequired,
    role: z.literal("teacher"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Student creation schema (extends base with role)
export const createStudentSchema = z
  .object({
    ...baseUserSchema,
    photo: photoFieldRequired,
    role: z.literal("student"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Manager creation schema (extends base with role)
export const createManagerSchema = z
  .object({
    ...baseUserSchema,
    photo: photoFieldRequired,
    role: z.literal("manager"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Generic user role schema
export const createUserWithRoleSchema = z
  .object({
    ...baseUserSchema,
    photo: photoFieldRequired,
    role: z.enum(["manager", "teacher", "student"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Update schemas for specific roles
export const updateTeacherSchema = updateUserSchema;
export const updateStudentSchema = updateUserSchema;
export const updateManagerSchema = updateUserSchema;

// Note: changePasswordSchema is in authSchemas.ts to avoid duplication

// Types
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type CreateManagerFormData = z.infer<typeof createManagerSchema>;
export type CreateUserWithRoleFormData = z.infer<typeof createUserWithRoleSchema>;
export type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;
export type UpdateManagerFormData = z.infer<typeof updateManagerSchema>;
// Note: ChangePasswordFormData is in authSchemas.ts