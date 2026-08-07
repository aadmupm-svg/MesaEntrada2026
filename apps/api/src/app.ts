import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import notaRoutes from "./routes/notas.js";
import horaRoutes from "./routes/hora.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/fecha", horaRoutes);

app.use(notFound);
app.use(errorHandler);
