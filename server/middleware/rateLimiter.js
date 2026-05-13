// middleware/rateLimiter.js
import redisClient, { isRedisAvailable } from "../config/redisClient.js";

const memoryBuckets = new Map();

function realIp(req) {
  return (
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    "anonymous"
  );
}

async function incrementHits(key, windowSeconds) {
  if (isRedisAvailable && typeof redisClient.incr === "function") {
    const hits = await redisClient.incr(key);
    if (hits === 1 && typeof redisClient.expire === "function") {
      await redisClient.expire(key, windowSeconds);
    }
    return hits;
  }

  const bucket =
    memoryBuckets.get(key) || {
      hits: 0,
      expiresAt: Date.now() + windowSeconds * 1000,
      blockedUntil: 0,
    };

  const now = Date.now();
  if (now > bucket.expiresAt) {
    bucket.hits = 0;
    bucket.expiresAt = now + windowSeconds * 1000;
    bucket.blockedUntil = 0;
  }

  bucket.hits += 1;
  memoryBuckets.set(key, bucket);
  return bucket.hits;
}

async function setBlocked(key, blockSeconds) {
  if (isRedisAvailable && typeof redisClient.set === "function") {
    await redisClient.set(`${key}:blocked`, "1", { ex: blockSeconds });
    return;
  }
  const bucket = memoryBuckets.get(key) || {};
  bucket.blockedUntil = Date.now() + blockSeconds * 1000;
  memoryBuckets.set(key, bucket);
}

async function isBlocked(key) {
  if (isRedisAvailable && typeof redisClient.get === "function") {
    const blocked = await redisClient.get(`${key}:blocked`);
    return Boolean(blocked);
  }
  const bucket = memoryBuckets.get(key);
  if (!bucket?.blockedUntil) return false;
  return bucket.blockedUntil > Date.now();
}

export function createRateLimiter({
  prefix,
  windowSeconds = 60,
  maxRequests = 10,
  blockSeconds = 300,
  keyGenerator,
} = {}) {
  if (!prefix) {
    throw new Error("createRateLimiter requires a prefix");
  }

  return async function rateLimiter(req, res, next) {
    try {
      const identifier = keyGenerator ? keyGenerator(req) : realIp(req);
      const key = `${prefix}:${identifier}`;

      if (await isBlocked(key)) {
        return res.status(429).json({
          message: "Too many attempts. Please wait and try again.",
          error: true,
          success: false,
        });
      }

      const hits = await incrementHits(key, windowSeconds);

      if (hits > maxRequests) {
        await setBlocked(key, blockSeconds);
        return res.status(429).json({
          message: "Too many attempts. Please wait and try again.",
          error: true,
          success: false,
        });
      }

      return next();
    } catch (error) {
      console.error("[rateLimiter] error:", error);
      return res.status(500).json({
        message: "Unable to enforce rate limiting right now.",
        error: true,
        success: false,
      });
    }
  };
}

export const ordersLimiter = createRateLimiter({
  prefix: "orders",
  windowSeconds: 60,
  maxRequests: 5,
  blockSeconds: 15 * 60,
});

export const paymentsLimiter = createRateLimiter({
  prefix: "payments",
  windowSeconds: 60,
  maxRequests: 4,
  blockSeconds: 10 * 60,
});

export const webhookLimiter = createRateLimiter({
  prefix: "webhooks",
  windowSeconds: 5,
  maxRequests: 15,
  blockSeconds: 60,
  keyGenerator: (req) =>
    req.headers["stripe-signature"] ? "stripe" : realIp(req),
});