// middleware/idempotency.js
import redisClient, { isRedisAvailable } from "../config/redisClient.js";

const memoryStore = new Map();

function getHeaderKey(req) {
  return (
    req.headers["x-idempotency-key"] ||
    req.headers["idempotency-key"] ||
    null
  );
}

export function requireIdempotencyKey({
  prefix,
  ttlSeconds = 300,
} = {}) {
  if (!prefix) {
    throw new Error("requireIdempotencyKey needs a prefix");
  }

  return async function idempotencyMiddleware(req, res, next) {
    try {
      const headerKey = getHeaderKey(req);
      if (!headerKey) {
        return res.status(400).json({
          message: "X-Idempotency-Key header is required.",
          error: true,
          success: false,
        });
      }

      const storageKey = `${prefix}:${headerKey}`;

      let acquired = false;
      if (isRedisAvailable && typeof redisClient.set === "function") {
        acquired = await redisClient.set(
          storageKey,
          JSON.stringify({
            method: req.method,
            path: req.originalUrl,
            ts: Date.now(),
          }),
          { nx: true, ex: ttlSeconds }
        );
      } else if (!memoryStore.has(storageKey)) {
        memoryStore.set(storageKey, Date.now());
        acquired = "OK";
        setTimeout(() => memoryStore.delete(storageKey), ttlSeconds * 1000);
      }

      if (!acquired) {
        return res.status(409).json({
          message:
            "Duplicate request detected. Last attempt is still being processed.",
          error: true,
          success: false,
        });
      }

      res.locals.idempotencyStorageKey = storageKey;

      res.once("finish", async () => {
        if (res.statusCode >= 500) {
          if (isRedisAvailable && typeof redisClient.del === "function") {
            await redisClient.del(storageKey);
          } else {
            memoryStore.delete(storageKey);
          }
        }
      });

      return next();
    } catch (error) {
      console.error("[idempotency] error:", error);
      return res.status(500).json({
        message: "Unable to enforce idempotency right now.",
        error: true,
        success: false,
      });
    }
  };
}