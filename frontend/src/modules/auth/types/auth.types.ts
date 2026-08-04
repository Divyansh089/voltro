export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      permissions: string[];
      customerProfile?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}
