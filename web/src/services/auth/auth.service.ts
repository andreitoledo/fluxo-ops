import { api } from "../http/api";
import type { LoginRequestDto, LoginResponseDto } from "../../types/auth";

export const authService = {
  async login(payload: LoginRequestDto) {
    const { data } = await api.post<LoginResponseDto>("/auth/login", payload);
    return data;
  },
};
