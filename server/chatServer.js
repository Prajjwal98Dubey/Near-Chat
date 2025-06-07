import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: "*",
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("roomInfo", ({ roomId }) => {
    socket.join(roomId);
    console.log("roomId", roomId);
  });
  socket.on("user-message", ({ roomId, message }) => {
    socket.broadcast.to(roomId).emit("server-sent-chat", { message });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

httpServer.listen(5002, () =>
  console.log("chat server running at 5002 🚀🚀🚀")
);
