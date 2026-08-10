import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
  usuario?: string;
  admin?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "secret-no-configurado";

export function firmarToken(payload: { userId: number; usuario: string; admin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      userId: number;
      usuario: string;
      admin: boolean;
    };
    req.userId = payload.userId;
    req.usuario = payload.usuario;
    req.admin = payload.admin;
    next();
  } catch {
    res.status(401).json({ message: "Sesión inválida o expirada" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    res.status(403).json({ message: "Requiere permisos de administrador" });
    return;
  }
  next();
}
