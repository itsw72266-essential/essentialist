/**
 * In-memory sliding-window rate limits (matches Express `rateLimiter.js` when Redis is off).
 */

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
  const bucket = memoryBuckets.get(key) || {};
  bucket.blockedUntil = Date.now() + blockSeconds * 1000;
  memoryBuckets.set(key, bucket);
}

async function isBlocked(key) {
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
    const identifier = keyGenerator ? keyGenerator(request) : realIpFromNextRequest(request);
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

const BY_KIND = {
  orders: ordersLimiter,
  payments: paymentsLimiter,
  webhooks: webhookLimiter,
};

/**
 * @param {"orders" | "payments" | "webhooks"} kind
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
