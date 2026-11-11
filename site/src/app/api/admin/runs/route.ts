import { NextRequest, NextResponse } from "next/server";
import { adminToken } from "../../../../lib/env";
import { getCrawlRuns } from "../../../../db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!adminToken() || token !== adminToken()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "20");
  try {
    const runs = await getCrawlRuns(Number.isFinite(limit) ? limit : 20);
    return NextResponse.json({ ok: true, runs });
  } catch {
    return NextResponse.json({ ok: false, error: "database unavailable" }, { status: 503 });
  }
}
