export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
}

export interface AuthState {
  user: string | null;
  setAuth: (authValue: AuthResponse) => void;
  logout: () => void;
  loading: boolean;
}
