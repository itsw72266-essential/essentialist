/** In-memory idempotency slots (matches Express fallback when Redis is unavailable). */

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
 * @returns {{ release: () => void } | null} null if key is already held (duplicate in-flight).
 */
export function tryAcquireIdempotencyKey(storageKey, ttlSeconds = 300) {
  sweepExpired();
  if (memory.has(storageKey)) return null;
  const exp = Date.now() + ttlSeconds * 1000;
  memory.set(storageKey, exp);
  const timer = setTimeout(() => {
    memory.delete(storageKey);
  }, ttlSeconds * 1000);
  return {
    release: () => {
      clearTimeout(timer);
      memory.delete(storageKey);
    },
  };
}
