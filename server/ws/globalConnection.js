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

// used for calculating minimum distance
function haversineDistance(coord1, coord2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const R = 6371; // Radius of Earth in kilometers
  const lat1 = toRadians(coord1.lat);
  const lon1 = toRadians(coord1.lon);
  const lat2 = toRadians(coord2.lat);
  const lon2 = toRadians(coord2.lon);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}
const findNearestUser = async (userId) => {
  const givenUserCoordinates = await redisClient.get(`user:${userId}`);
  const { lat, lon } = JSON.parse(givenUserCoordinates);

  const allUsers = await redisClient.keys("user:*");
  const allUsersDetails = [];
  for (let u of allUsers) {
    if (u.split(":").at(-1) != userId) {
      allUsersDetails.push(redisClient.get(u));
    }
  }
  let usersCoordinates = await Promise.allSettled(allUsersDetails);
  if (usersCoordinates.length === 0) return [];
  let minDistance = Infinity;
  let nearestNeighbour = "";
  for (let user of usersCoordinates) {
    let distance = haversineDistance(
      { lat, lon },
      { lat: JSON.parse(user.value).lat, lon: JSON.parse(user.value).lon }
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestNeighbour = JSON.parse(user.value).userId;
    }
  }
  return [nearestNeighbour, minDistance];
};
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
  let isFound = false;
  let nearestUser = await findNearestUser(userId);
  if (nearestUser.length) isFound = true;
  if (!isFound) {
    const user = await redisClient.get(`user:${userId}`);
    const { socketId } = JSON.parse(user);
    io.to(socketId).emit("user-found", { isFound: false, roomId: "" });
    return;
  }
  const roomId = nanoid();
  await handleSendJoinEvent(nearestUser[0], roomId);
  await handleSendJoinEvent(userId, roomId);
  await redisClient.set(
    `roomId:${roomId}`,
    JSON.stringify([userId, nearestUser[0]])
  );
};

io.on("connection", (socket) => {
  socket.on("register_user", async ({ userId, lat, lon }) => {
    socket.searching = true; // searching for user or waiting for being searched
    socket.user = userId;
    await redisClient.set(
      `user:${userId}`,
      JSON.stringify({ lat, lon, socketId: socket.id, userId })
    );
    await handleFindUser(userId);
  });
  socket.on("find-user", async ({ userId }) => {
    await handleFindUser(userId);
  });
  socket.on("user-left", async ({ roomId, userId }) => {
    const room = await redisClient.get(`roomId:${roomId}`);
    if (room) {
      let otherUser = JSON.parse(room).filter((user) => user != userId)[0];
      let otherUserDetail = await redisClient.get(`user:${otherUser}`);
      let otherUserSocket = io.sockets.sockets.get(
        JSON.parse(otherUserDetail)["socketId"]
      );
      otherUserSocket.emit("user-disconnect");
      await redisClient.del(`roomId:${roomId}`);
    }
  });
  
  // CHAT
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("message-from-client", ({ message, roomId }) => {
    socket.to(roomId).emit("message-from-server", { message });
  });
 // 

  socket.on("disconnecting", async () => {
    let room = socket.room;
    let roomDetail = await redisClient.get(`roomId:${room}`);
    await redisClient.del(`user:${socket.user}`);
    if (roomDetail) {
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
    }

    socket.disconnect();
  });
});
const startGlobalConnection = () => {
  server.listen(5001, () => console.log("global connection listening at 5001"));
};

export default startGlobalConnection;
