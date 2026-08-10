import { api } from "./client";
import type { Usuario, UsuarioEdit, UsuarioPayload } from "../types";

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>("/usuarios");
  return data;
}

export async function crearUsuario(payload: UsuarioPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/usuarios", payload);
  return data;
}

export async function actualizarUsuario(id: number, payload: UsuarioEdit): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

export async function eliminarUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
