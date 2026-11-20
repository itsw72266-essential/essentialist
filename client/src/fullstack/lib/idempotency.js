/**
 * Idempotency key enforcement for the Next.js API layer.
 *
 * Uses Upstash Redis (SET NX EX — atomic across serverless instances) when
 * configured, matching server/middleware/idempotency.js. Falls back to an
 * in-memory Map only when Redis is unavailable — that fallback does NOT
 * dedupe across concurrent serverless instances, so it's a best-effort
 * degrade, not the primary guarantee.
 */
import { redisClient, isRedisAvailable } from "./redisClient.js";

const memory = new Map();

function sweepExpired(now = Date.now()) {
  for (const [k, exp] of memory) {
    if (exp <= now) memory.delete(k);
  }
}

export function getIdempotencyHeaderValue(headers = {}) {
  const raw =
    headers["x-idempotency-key"] ||
    headers["idempotency-key"] ||
    headers["X-Idempotency-Key"];
  if (raw == null) return "";
  const s = String(raw).trim();
  return s;
}

/**
 * @returns {Promise<{ release: () => Promise<void> } | null>} null if key is already held (duplicate in-flight).
 */
export async function tryAcquireIdempotencyKey(storageKey, ttlSeconds = 300) {
  if (isRedisAvailable && typeof redisClient.set === "function") {
    const acquired = await redisClient.set(storageKey, Date.now(), {
      nx: true,
      ex: ttlSeconds,
    });
    if (!acquired) return null;
    return {
      release: async () => {
        await redisClient.del(storageKey);
      },
    };
  }

  sweepExpired();
  if (memory.has(storageKey)) return null;
  const exp = Date.now() + ttlSeconds * 1000;
  memory.set(storageKey, exp);
  const timer = setTimeout(() => {
    memory.delete(storageKey);
  }, ttlSeconds * 1000);
  return {
    release: async () => {
      clearTimeout(timer);
      memory.delete(storageKey);
    },
  };
}
