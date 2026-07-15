import { z } from "zod";

// Subject Exam schemas (based on subject_exams table migration)
const baseExamSchema = {
  name: z.string().min(1, "Exam name is required"), // UNIQUE with subject_id in migration
  about: z.string().min(1, "Exam description is required"), // REQUIRED field in migration
};

export const createSubjectExamSchema = z.object({
  ...baseExamSchema,
  subject_id: z.number().min(1, "Subject is required"), // Foreign key to subjects
  started_at: z.string().min(1, "Start date is required").refine((date) => {
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid start date format",
  }),
  ended_at: z.string().min(1, "End date is required").refine((date) => {
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid end date format",
  }),
}).refine((data) => {
  const startDate = new Date(data.started_at);
  const endDate = new Date(data.ended_at);
  const now = new Date();
  
  // Create date without time components for fair comparison
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start date can be today or in the future (not in the past)
  if (startDateOnly < todayOnly) {
    return false;
  }
  
  // End date must be after start date
  return endDate > startDate;
}, {
  message: "End date must be after start date and start date cannot be in the past (today is allowed)",
  path: ["ended_at"],
});

export const updateSubjectExamSchema = z.object({
  ...baseExamSchema,
  subject_id: z.number().min(1, "Subject is required"),
  started_at: z.string().min(1, "Start date is required").refine((date) => {
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid start date format",
  }),
  ended_at: z.string().min(1, "End date is required").refine((date) => {
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid end date format",
  }),
}).refine((data) => {
  const startDate = new Date(data.started_at);
  const endDate = new Date(data.ended_at);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["ended_at"],
});

// Legacy aliases for backward compatibility
export const createExamSchema = createSubjectExamSchema;
export const updateExamSchema = updateSubjectExamSchema;

// Question Option schemas (based on question_options table migration)
export const createQuestionOptionSchema = z.object({
  name: z.string().min(1, "Option text is required"), // REQUIRED field in migration
  is_correct: z.boolean().default(false), // BOOLEAN with default false in migration
});

export const updateQuestionOptionSchema = createQuestionOptionSchema;

// Exam Question schemas (based on exam_questions table migration)
const baseQuestionSchema = {
  name: z.string().min(1, "Question text is required"), // REQUIRED field in migration
  timer: z.coerce.number().min(0, "Timer must be non-negative").max(3600, "Timer cannot exceed 1 hour"), // INTEGER field in migration
  type: z.enum(["multiple_choice", "essay"]), // STRING field in migration
  points: z.coerce.number().min(1, "Points must be at least 1").max(100, "Points cannot exceed 100"), // INTEGER field in migration
};

export const createExamQuestionSchema = z.object({
  ...baseQuestionSchema,
  subject_exam_id: z.coerce.number().min(1, "Exam is required"), // Foreign key to subject_exams
  options: z.array(createQuestionOptionSchema).optional(),
}).refine((data) => {
  if (data.type === "multiple_choice") {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: "Multiple choice questions must have at least 2 options",
  path: ["options"],
}).refine((data) => {
  if (data.type === "multiple_choice" && data.options) {
    const correctOptions = data.options.filter(option => option.is_correct);
    return correctOptions.length === 1;
  }
  return true;
}, {
  message: "Multiple choice questions must have exactly one correct answer",
  path: ["options"],
}).refine((data) => {
  if (data.type === "essay") {
    return !data.options || data.options.length === 0;
  }
  return true;
}, {
  message: "Essay questions cannot have options",
  path: ["options"],
});

export const updateExamQuestionSchema = z.object({
  ...baseQuestionSchema,
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  options: z.array(updateQuestionOptionSchema).optional(),
}).refine((data) => {
  if (data.type === "multiple_choice") {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: "Multiple choice questions must have at least 2 options",
  path: ["options"],
}).refine((data) => {
  if (data.type === "multiple_choice" && data.options) {
    const correctOptions = data.options.filter(option => option.is_correct);
    return correctOptions.length === 1;
  }
  return true;
}, {
  message: "Multiple choice questions must have exactly one correct answer",
  path: ["options"],
});

// Legacy aliases for backward compatibility
export const createQuestionSchema = createExamQuestionSchema;
export const updateQuestionSchema = updateExamQuestionSchema;

// Question Answer schemas (based on question_answers table migration)
export const submitMultipleChoiceAnswerSchema = z.object({
  exam_question_id: z.coerce.number().min(1, "Question is required"), // Foreign key to exam_questions
  selected_option_id: z.coerce.number().min(1, "Please select an option"),
});

export const submitEssayAnswerSchema = z.object({
  exam_question_id: z.coerce.number().min(1, "Question is required"), // Foreign key to exam_questions  
  answer_text: z.string().min(1, "Answer is required"), // TEXT field in migration (nullable but required for submission)
});

// Generic answer submission schema
export const submitQuestionAnswerSchema = z.object({
  exam_question_id: z.coerce.number().min(1, "Question is required"),
  answer_text: z.string().optional(), // For essay questions
  selected_option_id: z.coerce.number().optional(), // For multiple choice questions
}).refine((data) => {
  // Either answer_text or selected_option_id must be provided
  return data.answer_text || data.selected_option_id;
}, {
  message: "Either answer text or selected option is required",
  path: ["answer_text"],
});

// Legacy discriminated union for backward compatibility
export const submitAnswerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("multiple_choice") }).merge(submitMultipleChoiceAnswerSchema),
  z.object({ type: z.literal("essay") }).merge(submitEssayAnswerSchema),
]);

// Grading schemas (based on question_answers table fields)
export const gradeQuestionAnswerSchema = z.object({
  points_earned: z.coerce.number().min(0, "Points must be non-negative").default(0), // INTEGER with default 0 in migration
  has_passed: z.boolean().default(false), // BOOLEAN with default false in migration
  feedback: z.string().optional(), // TEXT field added in migration (nullable)
});

export const bulkGradeAnswersSchema = z.object({
  answers: z.array(z.object({
    id: z.coerce.number().min(1, "Answer ID is required"),
    points_earned: z.coerce.number().min(0, "Points must be non-negative"),
    has_passed: z.boolean(),
    feedback: z.string().optional(),
  })).min(1, "At least one answer must be selected"),
});

// Teacher grading workflow schema
export const teacherGradeSchema = z.object({
  question_answer_id: z.coerce.number().min(1, "Answer ID is required"),
  points_earned: z.coerce.number().min(0, "Points must be non-negative"),
  feedback: z.string().min(1, "Feedback is required").optional(),
}).refine((data) => {
  // If points are 0, feedback should be provided
  if (data.points_earned === 0 && !data.feedback) {
    return false;
  }
  return true;
}, {
  message: "Feedback is recommended when giving zero points",
  path: ["feedback"],
});

// Legacy aliases for backward compatibility
export const gradeAnswerSchema = gradeQuestionAnswerSchema;
export const bulkGradeSchema = bulkGradeAnswersSchema;

// Search and filter schemas
export const examFilterSchema = z.object({
  subject_id: z.coerce.number().optional(),
  status: z.enum(["upcoming", "active", "ended"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const questionFilterSchema = z.object({
  subject_exam_id: z.coerce.number().optional(),
  type: z.enum(["multiple_choice", "essay"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

export const answerFilterSchema = z.object({
  exam_question_id: z.coerce.number().optional(),
  student_id: z.coerce.number().optional(),
  has_passed: z.boolean().optional(),
  needs_grading: z.boolean().optional(),
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
});

// Exam statistics schema
export const examStatisticsSchema = z.object({
  subject_exam_id: z.coerce.number().min(1, "Exam is required"),
  include_details: z.boolean().optional(),
});

// Export form data types
export type CreateSubjectExamFormData = z.infer<typeof createSubjectExamSchema>;
export type UpdateSubjectExamFormData = z.infer<typeof updateSubjectExamSchema>;
export type CreateExamQuestionFormData = z.infer<typeof createExamQuestionSchema>;
export type UpdateExamQuestionFormData = z.infer<typeof updateExamQuestionSchema>;
export type CreateQuestionOptionFormData = z.infer<typeof createQuestionOptionSchema>;
export type UpdateQuestionOptionFormData = z.infer<typeof updateQuestionOptionSchema>;
export type SubmitMultipleChoiceAnswerFormData = z.infer<typeof submitMultipleChoiceAnswerSchema>;
export type SubmitEssayAnswerFormData = z.infer<typeof submitEssayAnswerSchema>;
export type SubmitQuestionAnswerFormData = z.infer<typeof submitQuestionAnswerSchema>;
export type SubmitAnswerFormData = z.infer<typeof submitAnswerSchema>;
export type GradeQuestionAnswerFormData = z.infer<typeof gradeQuestionAnswerSchema>;
export type BulkGradeAnswersFormData = z.infer<typeof bulkGradeAnswersSchema>;
export type TeacherGradeFormData = z.infer<typeof teacherGradeSchema>;
export type ExamFilterFormData = z.infer<typeof examFilterSchema>;
export type QuestionFilterFormData = z.infer<typeof questionFilterSchema>;
export type AnswerFilterFormData = z.infer<typeof answerFilterSchema>;
export type ExamStatisticsFormData = z.infer<typeof examStatisticsSchema>;

// Legacy aliases for backward compatibility
export type CreateExamFormData = CreateSubjectExamFormData;
export type UpdateExamFormData = UpdateSubjectExamFormData;
export type CreateQuestionFormData = CreateExamQuestionFormData;
export type UpdateQuestionFormData = UpdateExamQuestionFormData;
export type GradeAnswerFormData = GradeQuestionAnswerFormData;
export type BulkGradeFormData = BulkGradeAnswersFormData;