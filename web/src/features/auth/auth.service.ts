import { http, TOKEN_STORAGE_KEY } from "../../services/http";
import type { LoginResponse } from "../../types/auth";

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput) {
  const { data } = await http.post<LoginResponse>("/auth/login", input);

  localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);

  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
