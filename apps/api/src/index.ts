import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT ?? 8000);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("socket conectado:", socket.id);

  socket.on("notas:changed", () => {
    socket.broadcast.emit("notas:changed");
  });

  socket.on("disconnect", () => {
    console.log("socket desconectado:", socket.id);
  });
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos:", error);
  }

  server.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

main();
