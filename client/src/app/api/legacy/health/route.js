import { NextResponse } from "next/server";

import { getLegacyExpressOrigin } from "@/backend/config/upstreamOrigin";

/**
 * Proxies Express `GET /health` through Next for ops / future dashboards.
 * Read-only; does not change Express behavior.
 */
export async function GET() {
  const origin = getLegacyExpressOrigin();
  if (!origin) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing API_URL or NEXT_PUBLIC_API_URL for upstream health check",
      },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${origin}/health`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const body = await upstream.text();
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      json = { raw: body };
    }
    return NextResponse.json(
      { ok: upstream.ok, upstreamStatus: upstream.status, upstream: json },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Upstream fetch failed" },
      { status: 502 },
    );
  }
}
