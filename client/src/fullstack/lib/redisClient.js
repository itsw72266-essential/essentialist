// Shared Upstash Redis client for the Next.js "fullstack" API layer.
// Mirrors server/config/redisClient.js so idempotency/rate-limit state is
// consistent across serverless invocations instead of per-instance memory.
import { Redis } from "@upstash/redis";

const REQUIRED_ENV_VARS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

const createDisabledClient = (reason = "Redis disabled") => ({
  isReady: false,
  reason,
  async get() {
    return null;
  },
  async set() {
    return null;
  },
  async del() {
    return null;
  },
});

const globalStateKey = Symbol.for("esmakeup.nextRedis");
const globalState =
  globalThis[globalStateKey] ||
  {
    client: createDisabledClient(),
    isEnabled: false,
    initialized: false,
  };

if (!globalThis[globalStateKey]) {
  globalThis[globalStateKey] = globalState;
}

if (!globalState.initialized) {
  if (missingEnvVars.length === 0) {
    try {
      const client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      client.isReady = true;
      globalState.client = client;
      globalState.isEnabled = true;
    } catch (error) {
      console.error("[redis] Failed to initialize Upstash Redis client (Next.js):", error);
      globalState.client = createDisabledClient(error?.message ?? "Redis init failed");
      globalState.isEnabled = false;
    }
  } else {
    console.warn(
      "[redis] Upstash Redis disabled for Next.js layer – missing env vars:",
      missingEnvVars.join(", "),
    );
    globalState.client = createDisabledClient(`Missing env vars: ${missingEnvVars.join(", ")}`);
    globalState.isEnabled = false;
  }
  globalState.initialized = true;
}

export const redisClient = globalState.client;
export const isRedisAvailable = globalState.isEnabled;
