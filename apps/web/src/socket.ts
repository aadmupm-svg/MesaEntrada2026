import { io } from "socket.io-client";

export const socket = io("/");

export function notificarCambio() {
  socket.emit("notas:changed");
}
