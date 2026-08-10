import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { firmarToken } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Ingrese un usuario"),
  pass: z.string().min(1, "Ingrese una contraseña"),
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

  const token = firmarToken({ userId: usuario.id, usuario: usuario.usuario, admin: usuario.admin });

  res.json({ token, usuario: usuario.usuario, admin: usuario.admin });
});

export default router;
