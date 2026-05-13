import redisClient, { ensureRedisConnection } from "./config/redisClient.js";

await ensureRedisConnection();
await redisClient.set("test-key", "Hello Redis!");
const value = await redisClient.get("test-key");
console.log("Value from Redis:", value);
await redisClient.disconnect();
