/**
 * Run Express-shaped (req, res) controllers inside Next Route Handlers.
 */

import { parse as parseCookie } from "cookie";

import { connectMongo } from "../db/mongoose.js";
import { findBlockingDuplicateOrder } from "./duplicateOrderCheck.js";
import { getIdempotencyHeaderValue, tryAcquireIdempotencyKey } from "./idempotency.js";
import { enforceRateLimit } from "./rateLimiterMemory.js";

export function createExpressLikeRequest(nextRequest, parsedBody = {}, routeParams = {}) {
  const url = new URL(nextRequest.url);
  const headers = {};
  nextRequest.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  const cookieHeader = nextRequest.headers.get("cookie") || "";
  const cookies = parseCookie(cookieHeader);
  return {
    method: nextRequest.method,
    url: nextRequest.url,
    body: parsedBody,
    query: Object.fromEntries(url.searchParams.entries()),
    headers,
    params: routeParams,
    cookies,
  };
}

export function createExpressResponse() {
  let statusCode = 200;
  let bodyPayload = null;
  const res = {
    status(code) {
      statusCode = Number(code) || 200;
      return res;
    },
    json(obj) {
      bodyPayload = obj;
      return res;
    },
    set() {
      return res;
    },
    getResult() {
      return { status: statusCode, body: bodyPayload };
    },
  };
  return res;
}

/**
 * @param {(req: object, res: object) => Promise<void>} handler
 * @param {Request} nextRequest
 * @param {{
 *   body?: object,
 *   routeParams?: object,
 *   userId?: string | null,
 *   idempotencyPrefix?: string,
 *   duplicateOrderGuard?: boolean,
 *   idempotencyTtlSeconds?: number,
 *   rateLimitKind?: "orders" | "payments" | "webhooks",
 * }} [opts]
 */
export async function invokeController(handler, nextRequest, opts = {}) {
  if (opts.rateLimitKind) {
    const limited = await enforceRateLimit(opts.rateLimitKind, nextRequest);
    if (limited) {
      const res = createExpressResponse();
      res.status(limited.status).json(limited.body);
      return res.getResult();
    }
  }

  let body = opts.body;
  if (body === undefined) {
    const method = nextRequest.method;
    if (method === "GET" || method === "HEAD") {
      body = {};
    } else {
      try {
        const text = await nextRequest.text();
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
    }
  }

  const req = createExpressLikeRequest(nextRequest, body, opts.routeParams ?? {});
  const finalReq = "userId" in opts ? { ...req, userId: opts.userId } : req;

  const {
    idempotencyPrefix,
    duplicateOrderGuard,
    idempotencyTtlSeconds = 300,
  } = opts;

  let idemRelease = null;
  if (idempotencyPrefix) {
    const headerKey = getIdempotencyHeaderValue(finalReq.headers);
    if (!headerKey) {
      const res = createExpressResponse();
      res.status(400).json({
        message: "X-Idempotency-Key header is required.",
        error: true,
        success: false,
      });
      return res.getResult();
    }
    const storageKey = `${idempotencyPrefix}:${headerKey}`;
    const slot = tryAcquireIdempotencyKey(storageKey, idempotencyTtlSeconds);
    if (!slot) {
      const res = createExpressResponse();
      res.status(409).json({
        message:
          "Duplicate request detected. Last attempt is still being processed.",
        error: true,
        success: false,
      });
      return res.getResult();
    }
    idemRelease = slot.release;
  }

  await connectMongo();

  if (duplicateOrderGuard) {
    const dup = await findBlockingDuplicateOrder(body, finalReq.userId ?? null);
    if (dup) {
      if (idemRelease) idemRelease();
      const res = createExpressResponse();
      res.status(dup.status).json(dup.body);
      return res.getResult();
    }
  }

  const res = createExpressResponse();
  try {
    await handler(finalReq, res);
  } catch (err) {
    if (idemRelease) idemRelease();
    throw err;
  }
  const result = res.getResult();
  if (idemRelease && result.status >= 500) {
    idemRelease();
  }
  return result;
}
