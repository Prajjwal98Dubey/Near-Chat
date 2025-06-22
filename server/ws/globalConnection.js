import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectRedis, getRedisClient } from "../connectRedis.js";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let redisClient = getRedisClient();

// when redis is not connected !!
if (!redisClient) {
  redisClient = await connectRedis();
}

io.on("connection", (socket) => {
  socket.on("register_user", async ({ userId, lat, lon }) => {
    socket.userId = userId;
    await redisClient.set(`user:${userId}`, JSON.stringify({ lat, lon }));
  });
  socket.on("disconnecting", async (socket) => {
    // not working ???
    await redisClient.del(`user:${socket.userId}`);
    let sockets = await io.fetchSockets();
    console.log("BEFORE DISCONNECIING", sockets.length);
    for (let s of sockets) {
      if (s.userId == socket.userId) {
        socket.disconnect();
        break;
      }
    }
    const sockets1 = await io.fetchSockets();
    console.log("AFTER DISCONNECIING", sockets1.length);
  });
});

const startGlobalConnection = () => {
  server.listen(5001, () => console.log("global connection listening at 5001"));
};

export default startGlobalConnection;
