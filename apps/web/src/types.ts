export interface Nota {
  id: number;
  tipo: string;
  numero: string;
  anio: number;
  fojas: string;
  letra: string;
  fecha: string;
  hora: string;
  firmante: string;
  extracto: string;
  para: string;
  usuario: string;
  usuarioId: number | null;
  createdAt: string;
  updatedAt: string;
}

export type NotaPayload = Omit<
  Nota,
  "id" | "anio" | "usuario" | "usuarioId" | "createdAt" | "updatedAt"
>;
