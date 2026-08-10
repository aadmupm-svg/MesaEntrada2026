import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

const selectSinPass = {
  id: true,
  usuario: true,
  admin: true,
  createdAt: true,
  updatedAt: true,
} as const;

const crearSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50),
  pass: z.string().min(4, "La contraseña debe tener al menos 4 caracteres").max(100),
  admin: z.boolean().optional().default(false),
});

const editarSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50)
    .optional(),
  pass: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres")
    .max(100)
    .optional(),
  admin: z.boolean().optional(),
});

function idSchema(raw: string) {
  return z.coerce.number().int().positive().parse(raw);
}

router.get("/", async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: selectSinPass,
    orderBy: { usuario: "asc" },
  });
  res.json(usuarios);
});

router.post("/", async (req, res) => {
  const data = crearSchema.parse(req.body);

  const existe = await prisma.usuario.findUnique({ where: { usuario: data.usuario } });
  if (existe) {
    res.status(409).json({ message: "El usuario ya existe" });
    return;
  }

  const pass = await bcrypt.hash(data.pass, 10);

  const usuario = await prisma.usuario.create({
    data: { usuario: data.usuario, pass, admin: data.admin },
    select: selectSinPass,
  });

  res.status(201).json(usuario);
});

router.put("/:id", async (req, res) => {
  const id = idSchema(req.params.id);
  const data = editarSchema.parse(req.body);

  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: "No hay campos para actualizar" });
    return;
  }

  const existe = await prisma.usuario.findUnique({ where: { id } });
  if (!existe) {
    res.status(404).json({ message: "El usuario no existe" });
    return;
  }

  if (data.usuario && data.usuario !== existe.usuario) {
    const nombreOcupado = await prisma.usuario.findUnique({ where: { usuario: data.usuario } });
    if (nombreOcupado) {
      res.status(409).json({ message: "El usuario ya existe" });
      return;
    }
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: {
      ...(data.usuario !== undefined && { usuario: data.usuario }),
      ...(data.admin !== undefined && { admin: data.admin }),
      ...(data.pass !== undefined && { pass: await bcrypt.hash(data.pass, 10) }),
    },
    select: selectSinPass,
  });

  res.json(usuario);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = idSchema(String(req.params.id));

  if (id === req.userId) {
    res.status(400).json({ message: "No puede eliminar su propio usuario" });
    return;
  }

  const existe = await prisma.usuario.findUnique({ where: { id } });
  if (!existe) {
    res.status(404).json({ message: "El usuario no existe" });
    return;
  }

  await prisma.usuario.delete({ where: { id } });

  res.status(204).send();
});

export default router;
