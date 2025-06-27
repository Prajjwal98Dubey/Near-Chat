import express from "express";
import cors from "cors";
import { connectRedis } from "./connectRedis.js";
import startGlobalConnection from "./ws/globalConnection.js";
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.listen(5000, async () => {
  console.log("server listening at 5000");
  connectRedis();
  startGlobalConnection();
});
