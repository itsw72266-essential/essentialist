import { PayunitClient } from "@payunit/nodejs-sdk";

let _cached;

/** Lazy client so Next can build without Payunit env; returns null if not configured. */
export function getPayunitClient() {
  if (_cached !== undefined) return _cached;
  const apiKey = process.env.PAYUNIT_API_KEY?.trim();
  const apiUsername = process.env.PAYUNIT_API_USERNAME?.trim();
  const apiPassword = process.env.PAYUNIT_API_PASSWORD?.trim();
  if (!apiKey || !apiUsername || !apiPassword) {
    _cached = null;
    return null;
  }
  try {
    _cached = new PayunitClient({
      apiKey,
      apiUsername,
      apiPassword,
      mode: process.env.PAYUNIT_MODE || "test",
      baseURL: "https://gateway.payunit.net",
      timeout: 10000,
    });
  } catch (e) {
    console.error("[payunit] init failed", e);
    _cached = null;
  }
  return _cached;
}
