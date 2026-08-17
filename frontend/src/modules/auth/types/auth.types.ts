export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      avatarUrl?: string | null;
      permissions: string[];
      customerProfile?: {
        firstName: string;
        lastName: string;
      };
      staffProfile?: {
        firstName: string;
        lastName: string;
        phone?: string | null;
      };
    };
  };
}
