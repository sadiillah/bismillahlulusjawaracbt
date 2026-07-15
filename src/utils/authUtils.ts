import type { AuthUser, Subject } from '../types';

/**
 * Authorization utilities for checking resource ownership and permissions
 */

/**
 * Check if a teacher owns a specific subject
 * @param user - Current authenticated user
 * @param subject - Subject to check ownership for
 * @returns boolean indicating if teacher owns the subject
 */
export const canTeacherManageSubject = (user: AuthUser | null, subject: Subject | null): boolean => {
  if (!user || !subject) return false;
  
  const userRole = user.roles?.[0];
  
  // Only teachers can manage subjects, and only their own subjects
  if (userRole === 'teacher') {
    return subject.teacher_id === user.id;
  }
  
  return false;
};

/**
 * Check if current user can access exam management for a subject
 * @param user - Current authenticated user
 * @param subject - Subject containing exams to manage
 * @returns boolean indicating if user can manage exams for this subject
 */
export const canManageSubjectExams = (user: AuthUser | null, subject: Subject | null): boolean => {
  return canTeacherManageSubject(user, subject);
};

/**
 * Check if current user can create exams for a subject
 * @param user - Current authenticated user
 * @param subject - Subject to create exams for
 * @returns boolean indicating if user can create exams for this subject
 */
export const canCreateSubjectExams = (user: AuthUser | null, subject: Subject | null): boolean => {
  return canTeacherManageSubject(user, subject);
};

/**
 * Check if current user can edit/delete exams for a subject
 * @param user - Current authenticated user
 * @param subject - Subject containing the exam
 * @returns boolean indicating if user can edit/delete exams for this subject
 */
export const canEditSubjectExams = (user: AuthUser | null, subject: Subject | null): boolean => {
  return canTeacherManageSubject(user, subject);
};

/**
 * Check if teacher can access exam by subject ID (when full subject object is not available)
 * @param user - Current authenticated user  
 * @param subjectId - ID of the subject
 * @returns boolean indicating if teacher can access this subject's exams
 */
export const canTeacherAccessSubjectById = (user: AuthUser | null, subjectId: number): boolean => {
  if (!user || !subjectId) return false;
  
  const userRole = user.roles?.[0];
  
  // Managers can access all subjects
  if (userRole === 'manager') return true;
  
  // For teachers, we need the full subject data to check ownership
  // This function is used when we only have subjectId but not the full subject
  // In this case, we'll allow access and let the backend enforce ownership
  if (userRole === 'teacher') return true;
  
  return false;
};