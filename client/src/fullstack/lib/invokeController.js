/**
 * Run Express-shaped (req, res) controllers inside Next Route Handlers.
 */

import { parse as parseCookie } from "cookie";

import { connectMongo } from "../db/mongoose.js";

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
 * @param {{ body?: object, routeParams?: object, userId?: string | null }} [opts]
 */
export async function invokeController(handler, nextRequest, opts = {}) {
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

  const res = createExpressResponse();
  await connectMongo();
  await handler(finalReq, res);
  return res.getResult();
}
