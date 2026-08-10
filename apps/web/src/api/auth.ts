import { api } from "./client";

export interface LoginResponse {
  token: string;
  usuario: string;
  admin: boolean;
}

export async function login(usuario: string, pass: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { usuario, pass });
  return data;
}
