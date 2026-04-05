export type UserRole = "ADMIN" | "OPERATIONS" | "FINANCIAL" | "PRODUCTION";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
}
