export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  userId: string;
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
  userId: string | null;
  setAuth: (authValue: AuthResponse) => void;
  logout: () => Promise<void>;
  loading: boolean;
}
