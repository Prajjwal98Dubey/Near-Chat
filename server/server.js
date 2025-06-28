import { connectRedis } from "./connectRedis.js";
import startGlobalConnection from "./ws/globalConnection.js";

const startServer = async () => {
  await connectRedis();
  startGlobalConnection();
};

startServer();
