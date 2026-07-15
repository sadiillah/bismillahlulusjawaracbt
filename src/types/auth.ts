// Authentication and User-related Types
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  photo: string;
  gender: string;
  roles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type UserRole = 'manager' | 'teacher' | 'student';