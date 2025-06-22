import { createClient } from "redis";

let redisClient;

async function connectRedis() {
  redisClient = createClient();
  try {
    await redisClient.connect();
    console.log("redis connected !!!");
    return redisClient;
  } catch (error) {
    console.log(error);
  }
}

function getRedisClient() {
  return redisClient;
}

export { connectRedis, getRedisClient };
