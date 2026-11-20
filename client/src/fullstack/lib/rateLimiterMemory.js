/**
 * Rate limiting for the Next.js API layer. Uses Upstash Redis (shared
 * across serverless instances) when configured, matching
 * server/middleware/rateLimiter.js. Falls back to in-memory buckets — that
 * fallback does NOT share state across instances, so it's a best-effort
 * degrade, not the primary guarantee.
 */
import { redisClient, isRedisAvailable } from "./redisClient.js";

const memoryBuckets = new Map();

export function realIpFromNextRequest(request) {
  const h = request.headers;
  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
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

  const bucket = memoryBuckets.get(key) || {
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

function createLimiter({
  prefix,
  windowSeconds = 60,
  maxRequests = 10,
  blockSeconds = 300,
  keyGenerator,
}) {
  return async function limit(request) {
    const identifier = keyGenerator
      ? await keyGenerator(request)
      : realIpFromNextRequest(request);
    const key = `${prefix}:${identifier}`;

    if (await isBlocked(key)) {
      return {
        status: 429,
        body: {
          message: "Too many attempts. Please wait and try again.",
          error: true,
          success: false,
        },
      };
    }

    const hits = await incrementHits(key, windowSeconds);

    if (hits > maxRequests) {
      await setBlocked(key, blockSeconds);
      return {
        status: 429,
        body: {
          message: "Too many attempts. Please wait and try again.",
          error: true,
          success: false,
        },
      };
    }

    return null;
  };
}

const ordersLimiter = createLimiter({
  prefix: "orders",
  windowSeconds: 60,
  maxRequests: 5,
  blockSeconds: 15 * 60,
});

const paymentsLimiter = createLimiter({
  prefix: "payments",
  windowSeconds: 60,
  maxRequests: 4,
  blockSeconds: 10 * 60,
});

const webhookLimiter = createLimiter({
  prefix: "webhooks",
  windowSeconds: 5,
  maxRequests: 15,
  blockSeconds: 60,
  keyGenerator: (request) =>
    request.headers.get("stripe-signature") ? "stripe" : realIpFromNextRequest(request),
});

// Auth endpoints (register/login/forgot-password/reset-password): throttle
// by IP, and additionally by the submitted email where present, so a
// distributed credential-stuffing run against one account is also slowed
// even across many source IPs (mirrors server/middleware/rateLimiter.js).
async function emailAwareKey(request) {
  const ip = realIpFromNextRequest(request);
  try {
    const clone = request.clone();
    const body = await clone.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    return email ? `${ip}:${email}` : ip;
  } catch {
    return ip;
  }
}

const authLimiter = createLimiter({
  prefix: "auth",
  windowSeconds: 15 * 60,
  maxRequests: 10,
  blockSeconds: 15 * 60,
  keyGenerator: emailAwareKey,
});

// OTP verification is the most brute-forceable step (6-digit code) — a
// tighter window.
const otpLimiter = createLimiter({
  prefix: "otp",
  windowSeconds: 15 * 60,
  maxRequests: 5,
  blockSeconds: 15 * 60,
  keyGenerator: emailAwareKey,
});

const BY_KIND = {
  orders: ordersLimiter,
  payments: paymentsLimiter,
  webhooks: webhookLimiter,
  auth: authLimiter,
  otp: otpLimiter,
};

/**
 * Backed by Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are configured
 * (shared across all serverless instances/regions). If those env vars are
 * missing, silently falls back to in-memory buckets scoped to a single
 * Node process — fine for local dev, not a real guarantee in a
 * multi-instance deployment.
 *
 * @param {"orders" | "payments" | "webhooks" | "auth" | "otp"} kind
 * @param {Request} request
 * @returns {Promise<{ status: number, body: object } | null>}
 */
export async function enforceRateLimit(kind, request) {
  const limiter = BY_KIND[kind];
  if (!limiter) return null;
  try {
    return await limiter(request);
  } catch (error) {
    console.error("[rateLimiterMemory] error:", error);
    return {
      status: 500,
      body: {
        message: "Unable to enforce rate limiting right now.",
        error: true,
        success: false,
      },
    };
  }
}
