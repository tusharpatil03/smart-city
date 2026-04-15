export interface RegisterAuthorityInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginAuthorityInput {
  email: string;
  password: string;
}

export interface AuthenticatedAuthority {
  id: string;
  name: string;
  email: string;
  role: "authority";
}

export interface AuthResponse {
  token: string;
  user: AuthenticatedAuthority;
}
