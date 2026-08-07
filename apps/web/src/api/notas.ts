import { api } from "./client";
import type { Nota, NotaPayload } from "../types";

export async function getNotas(): Promise<Nota[]> {
  const { data } = await api.get<Nota[]>("/notas");
  return data;
}

export async function getProximoNumero(): Promise<string> {
  const { data } = await api.get<{ numero: string }>("/notas/next-number");
  return data.numero;
}

export async function createNota(payload: NotaPayload): Promise<Nota> {
  const { data } = await api.post<Nota>("/notas", payload);
  return data;
}

export async function updateNota(
  id: number,
  payload: Partial<NotaPayload>
): Promise<Nota> {
  const { data } = await api.put<Nota>(`/notas/${id}`, payload);
  return data;
}

export async function deleteNota(id: number): Promise<void> {
  await api.delete(`/notas/${id}`);
}

export interface FechaAutoritativa {
  fecha: string;
  hora: string;
  anio: number;
}

export async function getFechaAutoritativa(): Promise<FechaAutoritativa> {
  const { data } = await api.get<FechaAutoritativa>("/fecha");
  return data;
}
