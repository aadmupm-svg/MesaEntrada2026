import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { getFechaAutoritativa } from "../lib/hora.js";

const router = Router();

const notaSchema = z.object({
  tipo: z.string().trim().min(1, "El tipo es obligatorio").max(100),
  numero: z
    .string()
    .trim()
    .regex(/^\d+$/, "El número debe ser numérico")
    .max(10),
  fojas: z.string().trim().max(20).default(""),
  letra: z.string().trim().max(10).default(""),
  fecha: z.string().trim().min(1, "La fecha es obligatoria").max(20),
  hora: z.string().trim().min(1, "La hora es obligatoria").max(10),
  firmante: z.string().trim().min(1, "El firmante es obligatorio").max(200),
  extracto: z.string().trim().min(1, "El extracto es obligatorio").max(2000),
  para: z.string().trim().min(1, "El destino es obligatorio").max(200),
});

const notaUpdateSchema = notaSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "Debe enviar al menos un campo para actualizar" }
);

function normalizarNumero(numero: string): string {
  return String(Number(numero)).padStart(3, "0");
}

router.use(requireAuth);

router.get("/", async (_req, res) => {
  const notas = await prisma.nota.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(notas);
});

router.get("/next-number", async (_req, res) => {
  const { anio } = await getFechaAutoritativa();

  const ultima = await prisma.nota.findFirst({
    where: { anio },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const numero = ultima ? Number(ultima.numero) + 1 : 1;
  res.json({ numero: normalizarNumero(String(numero)) });
});

router.get("/:id", async (req, res) => {
  const nota = await prisma.nota.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!nota) {
    res.status(404).json({ message: "Nota no encontrada" });
    return;
  }

  res.json(nota);
});

router.post("/", async (req: AuthRequest, res) => {
  const data = notaSchema.parse(req.body);

  const { anio } = await getFechaAutoritativa();
  const numero = normalizarNumero(data.numero);

  const existente = await prisma.nota.findUnique({
    where: { numero_anio: { numero, anio } },
    select: { id: true },
  });

  if (existente) {
    res.status(409).json({ message: `El número ${numero} ya existe en el año ${anio}` });
    return;
  }

  const nota = await prisma.nota.create({
    data: {
      ...data,
      numero,
      anio,
      usuario: req.usuario ?? "desconocido",
      usuarioId: req.userId,
    },
  });

  res.status(201).json(nota);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const data = notaUpdateSchema.parse(req.body);

  const { anio } = await getFechaAutoritativa();
  const numero = data.numero ? normalizarNumero(data.numero) : undefined;

  if (numero) {
    const existente = await prisma.nota.findFirst({
      where: {
        numero,
        anio,
        NOT: { id: Number(req.params.id) },
      },
      select: { id: true },
    });

    if (existente) {
      res.status(409).json({ message: `El número ${numero} ya existe en el año ${anio}` });
      return;
    }
  }

  const nota = await prisma.nota.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      ...(numero ? { numero, anio } : {}),
      usuario: req.usuario ?? "desconocido",
      usuarioId: req.userId,
    },
  });

  res.json(nota);
});

router.delete("/:id", async (req, res) => {
  await prisma.nota.delete({
    where: { id: Number(req.params.id) },
  });

  res.status(204).end();
});

export default router;
