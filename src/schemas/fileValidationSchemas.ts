import { z } from "zod";

// File validation utilities following your established pattern

// Image validation for photos (PNG, JPEG, JPG)
export const photoFieldRequired = z
  .custom<File>((file) => file instanceof File, "Photo is required")
  .refine((file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type), {
    message: "Invalid image format. Use PNG or JPEG.",
  })
  .refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "Image must be under 2MB.",
  });

export const photoFieldOptional = z
  .custom<File | undefined>()
  .optional()
  .refine((file) => !file || ["image/png", "image/jpeg", "image/jpg"].includes(file.type), {
    message: "Invalid image format. Use PNG or JPEG.",
  })
  .refine((file) => !file || file.size <= 2 * 1024 * 1024, {
    message: "Image must be under 2MB.",
  });

// PDF validation for reports, submissions, and documents
export const pdfFieldRequired = z
  .custom<File>((file) => file instanceof File, "PDF file is required")
  .refine((file) => file.type === "application/pdf", {
    message: "Only PDF format is allowed.",
  })
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    message: "PDF must be under 10MB.",
  });

export const pdfFieldOptional = z
  .custom<File | undefined>()
  .optional()
  .refine((file) => !file || file.type === "application/pdf", {
    message: "Only PDF format is allowed.",
  })
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
    message: "PDF must be under 10MB.",
  });

// Rapport validation (specific for class_students.rapport field)
export const rapportFieldRequired = z
  .custom<File>((file) => file instanceof File, "Rapport file is required")
  .refine((file) => file.type === "application/pdf", {
    message: "Rapport must be in PDF format.",
  })
  .refine((file) => file.size <= 3 * 1024 * 1024, {
    message: "Rapport file must be under 3MB.",
  });

export const rapportFieldOptional = z
  .custom<File | undefined>()
  .optional()
  .refine((file) => !file || file.type === "application/pdf", {
    message: "Rapport must be in PDF format.",
  })
  .refine((file) => !file || file.size <= 3 * 1024 * 1024, {
    message: "Rapport file must be under 3MB.",
  });

// General file validation helpers
export const createFileValidator = (
  acceptedTypes: string[],
  maxSizeBytes: number,
  fieldName: string
) => ({
  required: z
    .custom<File>((file) => file instanceof File, `${fieldName} is required`)
    .refine((file) => acceptedTypes.includes(file.type), {
      message: `Invalid file format. Accepted: ${acceptedTypes.join(", ")}.`,
    })
    .refine((file) => file.size <= maxSizeBytes, {
      message: `File must be under ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`,
    }),
  
  optional: z
    .custom<File | undefined>()
    .optional()
    .refine((file) => !file || acceptedTypes.includes(file.type), {
      message: `Invalid file format. Accepted: ${acceptedTypes.join(", ")}.`,
    })
    .refine((file) => !file || file.size <= maxSizeBytes, {
      message: `File must be under ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`,
    }),
});

// Common file size constants
export const FILE_SIZE_LIMITS = {
  IMAGE: 2 * 1024 * 1024, // 2MB
  PDF: 10 * 1024 * 1024,   // 10MB
  RAPPORT: 3 * 1024 * 1024, // 3MB
} as const;

// Common file type constants
export const ACCEPTED_FILE_TYPES = {
  IMAGE: ["image/png", "image/jpeg", "image/jpg"],
  PDF: ["application/pdf"],
} as const;