import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { connectRedis } from "./connectRedis.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

let userList = {};
let connected = new Set();
let rooms = {};

// register user
app.get("/api/v1/register", (req, res) => {
  const { userId, lat, long } = req.query;
  try {
    if (userId) userList[userId] = { lat, long, client: res };
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
  } catch (error) {
    console.log(error);
  }
});

// remove user from memory
app.delete("/api/v1/remove-user", (req, res) => {
  const { userId } = req.query;
  try {
    // find out the room
    let roomId;
    for (let key of Object.keys(rooms)) {
      if (rooms[key][0].userId == userId || rooms[key][1].userId == userId) {
        roomId = key;
        break;
      }
    }
    rooms[roomId].forEach((user) => {
      userList[user.userId].client.write(`data:user-disconnect\n\n`);
      connected.delete(user.userId);
    });
    delete userList[userId];
    delete rooms[roomId];
    return res.status(200).json({ message: "user removed !!!" });
  } catch (error) {
    console.log(error);
  }
});

// find nearest user using short polling
app.get("/api/v1/short/find-user", (req, res) => {
  const userId = req.query.userId;
  try {
    for (let user of Object.keys(userList)) {
      if (user !== userId && !connected.has(user)) {
        connected.add(userId);
        connected.add(user);
        let roomId = nanoid();
        userList[userId].client.write(`data:user-found,${roomId}\n\n`);
        userList[user].client.write(`data:user-found,${roomId}\n\n`);
        rooms[roomId] = [
          { userId: userId, res: userList[userId].client },
          { userId: user, res: userList[user].client },
        ];
        return res
          .status(200)
          .json({ message: "found a user", isUserFound: true });
      }
    }
    return res
      .status(200)
      .json({ message: "no user currently online", isUserFound: false });
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || 5001, async () => {
  await connectRedis();
  console.log(`server connected at ${process.env.PORT}`);
});
