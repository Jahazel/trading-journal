export interface SignupBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginRes {
  token: string;
  username: string;
}

export interface JwtPayload {
  id: string;
}
