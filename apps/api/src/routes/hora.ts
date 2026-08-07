import { Router } from "express";
import { getFechaAutoritativa } from "../lib/hora.js";

const router = Router();

router.get("/", async (_req, res) => {
  const fecha = await getFechaAutoritativa();
  res.json(fecha);
});

export default router;
