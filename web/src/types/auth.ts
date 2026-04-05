export type UserRole = "ADMIN" | "OPERATIONS" | "FINANCIAL" | "PRODUCTION";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponseDto {
  accessToken: string;
  user: AuthUser;
}
