import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity, // Keep trying to reconnect
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"], // Fallback to polling if websocket fails
});

// Connect socket when module loads if user is authenticated
if (localStorage.getItem("token")) {
  socket.connect();
}

// Handle reconnection events
socket.on("reconnect", (attemptNumber) => {
  console.log("Socket reconnected after", attemptNumber, "attempts");
  // Trigger a custom event that components can listen to
  window.dispatchEvent(new CustomEvent("socket-reconnected", { detail: { socketId: socket.id } }));
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // Server disconnected the client, reconnect manually
    socket.connect();
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});
