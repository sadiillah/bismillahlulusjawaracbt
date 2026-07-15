import { z } from "zod";
import { photoFieldRequired } from "./fileValidationSchemas";

// Login schema
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema (based on users table migration requirements)
export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Please confirm your password"),
    gender: z.enum(["male", "female"]), // REQUIRED in migration
    photo: photoFieldRequired, // REQUIRED field in users migration
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

// Reset password schema (with token)
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Change password schema (for authenticated users)
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })
  .refine((data) => data.current_password !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
  });

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: z.email("Invalid email address"),
});

// Resend verification email schema
export const resendVerificationSchema = z.object({
  email: z.email("Invalid email address"),
});

// Update profile schema (for authenticated users)
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  gender: z.enum(["male", "female"]),
});

// Two-factor authentication schemas (if implemented)
export const enable2FASchema = z.object({
  password: z.string().min(1, "Password is required to enable 2FA"),
});

export const verify2FASchema = z.object({
  code: z.string().length(6, "2FA code must be 6 digits"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required to disable 2FA"),
  code: z.string().length(6, "2FA code must be 6 digits"),
});

// Session management schemas
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export const revokeTokenSchema = z.object({
  token_id: z.coerce.number().min(1, "Token ID is required").optional(),
  all_tokens: z.boolean().default(false), // Revoke all user tokens
});

// Login attempt security
export const secureLoginSchema = loginSchema.extend({
  remember_me: z.boolean().default(false),
  device_info: z.object({
    user_agent: z.string().optional(),
    ip_address: z.string().optional(),
    device_name: z.string().optional(),
  }).optional(),
});

// Export form data types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type Enable2FAFormData = z.infer<typeof enable2FASchema>;
export type Verify2FAFormData = z.infer<typeof verify2FASchema>;
export type Disable2FAFormData = z.infer<typeof disable2FASchema>;
export type RefreshTokenFormData = z.infer<typeof refreshTokenSchema>;
export type RevokeTokenFormData = z.infer<typeof revokeTokenSchema>;
export type SecureLoginFormData = z.infer<typeof secureLoginSchema>;