import { NextResponse } from "next/server";

import { fetchLegacyExpress } from "@/backend/services/legacyExpressGateway";

/**
 * Proxies Express `GET /health` through Next for ops / future dashboards.
 * Read-only; does not change Express behavior.
 */
export async function GET() {
  try {
    const upstream = await fetchLegacyExpress("/health", {
      headers: { Accept: "application/json" },
    });
    if (!upstream) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing API_URL or NEXT_PUBLIC_API_URL for upstream health check",
        },
        { status: 503 },
      );
    }
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
