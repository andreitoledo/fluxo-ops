import type { AuthUser } from "../types/auth";

const ACCESS_TOKEN_KEY = "fluxoops.access_token";
const AUTH_USER_KEY = "fluxoops.auth_user";

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  setUser(user: AuthUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
