// Toast Utility Functions - Wrapper around Sonner for consistent usage
import { toast } from 'sonner';

// Toast types for better organization
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'promise';

// Base toast options interface
interface BaseToastOptions {
  description?: string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Promise toast options
interface PromiseToastOptions {
  loading: string;
  success: string | ((data: unknown) => string);
  error: string | ((error: Error) => string);
  description?: string;
}

// Success toast
export const showSuccessToast = (
  message: string,
  options: BaseToastOptions = {}
): string | number => {
  return toast.success(message, {
    description: options.description,
    duration: options.duration || 5000,
    position: options.position,
    action: options.action,
  });
};

// Error toast
export const showErrorToast = (
  message: string,
  options: BaseToastOptions = {}
): string | number => {
  return toast.error(message, {
    description: options.description,
    duration: options.duration || 7000, // Longer duration for errors
    position: options.position,
    action: options.action,
  });
};

// Warning toast
export const showWarningToast = (
  message: string,
  options: BaseToastOptions = {}
): string | number => {
  return toast.warning(message, {
    description: options.description,
    duration: options.duration || 6000,
    position: options.position,
    action: options.action,
  });
};

// Info toast
export const showInfoToast = (
  message: string,
  options: BaseToastOptions = {}
): string | number => {
  return toast.info(message, {
    description: options.description,
    duration: options.duration || 5000,
    position: options.position,
    action: options.action,
  });
};

// Loading toast
export const showLoadingToast = (
  message: string,
  options: Omit<BaseToastOptions, 'duration'> = {}
): string | number => {
  return toast.loading(message, {
    description: options.description,
    position: options.position,
  });
};

// Promise toast for async operations
export const showPromiseToast = <T>(
  promise: Promise<T>,
  options: PromiseToastOptions
): Promise<T> => {
  const toastResult = toast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
    description: options.description,
  });
  
  // Extract the original promise from the toast result
  return toastResult.unwrap();
};

// Dismiss specific toast
export const dismissToast = (toastId: string | number): void => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = (): void => {
  toast.dismiss();
};

// CBT-specific toast helpers
export const CBTToast = {
  // Authentication toasts
  loginSuccess: (userName: string) =>
    showSuccessToast(`Welcome back, ${userName}!`, {
      description: 'You have successfully logged in.',
    }),

  loginError: (error?: string) =>
    showErrorToast('Login failed', {
      description: error || 'Please check your credentials and try again.',
    }),

  logoutSuccess: () =>
    showInfoToast('Logged out successfully', {
      description: 'You have been safely logged out.',
    }),

  // Exam management toasts
  examCreated: (examTitle: string) =>
    showSuccessToast('Exam created successfully!', {
      description: `"${examTitle}" has been created and is ready for students.`,
    }),

  examUpdated: (examTitle: string) =>
    showSuccessToast('Exam updated successfully!', {
      description: `Changes to "${examTitle}" have been saved.`,
    }),

  examDeleted: (examTitle: string) =>
    showSuccessToast('Exam deleted', {
      description: `"${examTitle}" has been permanently removed.`,
    }),

  examStarted: (examTitle: string) =>
    showInfoToast('Exam started!', {
      description: `Good luck with "${examTitle}". Remember to save your answers regularly.`,
      duration: 8000,
    }),

  examSubmitted: () =>
    showSuccessToast('Exam submitted successfully!', {
      description: 'Your answers have been saved. Results will be available soon.',
      duration: 7000,
    }),

  examAutoSaved: () =>
    showInfoToast('Progress saved', {
      description: 'Your answers have been automatically saved.',
      duration: 3000,
    }),

  // Question management toasts
  questionAdded: () =>
    showSuccessToast('Question added successfully!'),

  questionUpdated: () =>
    showSuccessToast('Question updated successfully!'),

  questionDeleted: () =>
    showSuccessToast('Question deleted'),

  // Student/Teacher management toasts
  studentEnrolled: (studentName: string, className: string) =>
    showSuccessToast('Student enrolled successfully!', {
      description: `${studentName} has been enrolled in ${className}.`,
    }),

  gradeSubmitted: (studentName: string) =>
    showSuccessToast('Grade submitted!', {
      description: `Grade for ${studentName} has been saved successfully.`,
    }),

  // Error toasts for CBT-specific scenarios
  examNotFound: () =>
    showErrorToast('Exam not found', {
      description: 'The requested exam could not be found or may have been removed.',
    }),

  examExpired: () =>
    showWarningToast('Exam time expired', {
      description: 'The exam time limit has been reached. Your current progress has been saved.',
      duration: 10000,
    }),

  connectionLost: () =>
    showWarningToast('Connection lost', {
      description: 'Your internet connection was interrupted. Reconnecting...',
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    }),

  // File upload toasts
  fileUploading: (fileName: string) =>
    showLoadingToast(`Uploading ${fileName}...`),

  fileUploadSuccess: (fileName: string) =>
    showSuccessToast('File uploaded successfully!', {
      description: `${fileName} has been uploaded and processed.`,
    }),

  fileUploadError: (fileName: string, error?: string) =>
    showErrorToast('File upload failed', {
      description: `Failed to upload ${fileName}. ${error || 'Please try again.'}`,
    }),

  // Permission toasts
  accessDenied: () =>
    showErrorToast('Access denied', {
      description: 'You do not have permission to perform this action.',
    }),

  sessionExpired: () =>
    showWarningToast('Session expired', {
      description: 'Your session has expired. Please log in again.',
      duration: 8000,
    }),
};

// Export the base toast for advanced usage
export { toast };

// Export all toast utilities
export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  promise: showPromiseToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  CBT: CBTToast,
};