export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    isActive: boolean;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
}