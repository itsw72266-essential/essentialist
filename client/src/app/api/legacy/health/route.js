import { NextResponse } from "next/server";

import { fetchLegacyExpress } from "@/backend/services/legacyExpressGateway";

/**
 * Next runtime health. Optional Express probe: set `LEGACY_EXPRESS_HEALTH_PROBE=true`
 * and `API_URL` / `NEXT_PUBLIC_API_URL` to the Express origin to include upstream `/health`.
 */
export async function GET() {
  const probeLegacy = process.env.LEGACY_EXPRESS_HEALTH_PROBE === "true";

  if (!probeLegacy) {
    return NextResponse.json({
      ok: true,
      nextRuntime: true,
      legacyExpress: "probe_disabled",
    });
  }

  try {
    const upstream = await fetchLegacyExpress("/health", {
      headers: { Accept: "application/json" },
    });
    if (!upstream) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Legacy probe enabled but missing API_URL / NEXT_PUBLIC_API_URL for Express origin",
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
