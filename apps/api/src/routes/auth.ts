import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { firmarToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  usuario: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50),
  pass: z.string().min(4, "La contraseña debe tener al menos 4 caracteres").max(100),
});

const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Ingrese un usuario"),
  pass: z.string().min(1, "Ingrese una contraseña"),
});

router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existe = await prisma.usuario.findUnique({
    where: { usuario: data.usuario },
  });

  if (existe) {
    res.status(409).json({ message: "El usuario ya existe" });
    return;
  }

  const pass = await bcrypt.hash(data.pass, 10);

  const usuario = await prisma.usuario.create({
    data: { usuario: data.usuario, pass },
    select: { id: true, usuario: true, createdAt: true },
  });

  res.status(201).json(usuario);
});

router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);

  const usuario = await prisma.usuario.findUnique({
    where: { usuario: data.usuario },
  });

  if (!usuario || !(await bcrypt.compare(data.pass, usuario.pass))) {
    res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    return;
  }

  const token = firmarToken({ userId: usuario.id, usuario: usuario.usuario });

  res.json({ token, usuario: usuario.usuario });
});

export default router;
