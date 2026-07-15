// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

// Laravel-specific Response Types
export interface LaravelResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LaravelErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page?: number;
    to: number;
    total: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
}

// Error Types
export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Utility Types for API Operations
export interface BulkDeleteRequest {
  ids: number[];
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, string | number | boolean>;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  query: string;
}