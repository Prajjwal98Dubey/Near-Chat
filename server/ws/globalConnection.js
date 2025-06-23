import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectRedis, getRedisClient } from "../connectRedis.js";
import { nanoid } from "nanoid";
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

const handleSendJoinEvent = async (user, roomId) => {
  const userDetails = await redisClient.get(`user:${user}`);
  const { socketId } = JSON.parse(userDetails);
  io.to(socketId).emit("user-found", { isFound: true, roomId });
  let socket = io.sockets.sockets.get(socketId);
  socket.room = roomId;
  socket.user = user;
};

const handleFindUser = async (userId) => {
  // search for keys with pattern user:userId
  let allUsers = await redisClient.keys(`user:*`);
  const partners = [];
  let isFound = false;
  for (let u of allUsers) {
    if (u.split(":").at(-1) != userId) {
      partners.push(u.split(":").at(-1));
      partners.push(userId);
      isFound = true;
      break;
    }
  }
  if (!isFound) {
    const user = await redisClient.get(`user:${userId}`);
    const { socketId } = JSON.parse(user);
    io.to(socketId).emit("user-found", { isFound: false, roomId: "" });
    return;
  }
  const roomId = nanoid();
  await handleSendJoinEvent(partners[0], roomId);
  await handleSendJoinEvent(partners[1], roomId);
  await redisClient.set(
    `roomId:${roomId}`,
    JSON.stringify([partners[0], partners[1]])
  );
};

io.on("connection", (socket) => {
  socket.on("register_user", async ({ userId, lat, lon }) => {
    socket.searching = true; // searching for user or waiting for being searched
    await redisClient.set(
      `user:${userId}`,
      JSON.stringify({ lat, lon, socketId: socket.id })
    );
    await handleFindUser(userId);
  });
  socket.on("find_user", async ({ userId }) => {
    await handleFindUser(userId);
  });
  socket.on("disconnecting", async () => {
    let room = socket.room;
    let roomDetail = await redisClient.get(`roomId:${room}`);
    await redisClient.del(`user:${socket.user}`);
    let otherUser = "";
    for (let u of JSON.parse(roomDetail)) {
      if (u != socket.user) {
        otherUser = u;
      }
    }
    await redisClient.del(`roomId:${room}`);
    let otherUserDetail = await redisClient.get(`user:${otherUser}`);
    let otherUserSocket = io.sockets.sockets.get(
      JSON.parse(otherUserDetail)["socketId"]
    );
    otherUserSocket.emit("user-disconnect");

    socket.disconnect();
  });
});

const startGlobalConnection = () => {
  server.listen(5001, () => console.log("global connection listening at 5001"));
};

export default startGlobalConnection;
