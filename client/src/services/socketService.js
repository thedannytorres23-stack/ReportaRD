import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000"
).replace(/\/$/, "");

let socket = null;

export const conectarSocket = (token) => {
  if (!token) return null;

  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket conectado:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Error Socket:", err.message);
  });

  return socket;
};

export const obtenerSocket = () => socket;

export const desconectarSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};