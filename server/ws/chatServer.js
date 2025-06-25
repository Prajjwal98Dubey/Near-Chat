import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("message-from-client", ({ message, roomId }) => {
    socket.to(roomId).emit("message-from-server", { message });
  });
});

const startChatServer = () => {
  server.listen(5003, () => console.log("Chat Server Listening at 5003"));
};

export default startChatServer;
