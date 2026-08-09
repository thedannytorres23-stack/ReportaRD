import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const conectarSocket = (token) => {
  if (!token) return null;

  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socket;
};

export const obtenerSocket = () => socket;

export const desconectarSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};