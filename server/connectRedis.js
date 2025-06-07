import { createClient } from "redis";

let redisClient;
const connectRedis = async () => {
  redisClient = createClient();
  await redisClient.connect();
  console.log("redis connected!!!");
  try {
  } catch (error) {
    console.log("redis error", error);
  }
};

export { connectRedis, redisClient };
