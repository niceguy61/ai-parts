import { NextRequest, NextResponse } from "next/server";
import { COLLECTOR_URL, adminToken } from "../../../../lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!adminToken() || token !== adminToken()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let source: string;
  try {
    ({ source } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  try {
    // 수집 job은 길게 걸릴 수 있으므로 타임아웃 10분
    const res = await fetch(`${COLLECTOR_URL}/run/${encodeURIComponent(source)}`, {
      method: "POST",
      headers: { "X-Admin-Token": token },
      signal: AbortSignal.timeout(600_000),
    });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: `수집기에 연결할 수 없습니다 (${COLLECTOR_URL}). 수집기가 실행 중인지 확인하세요: cd collector && .venv\\Scripts\\python -m aic.main`,
      },
      { status: 502 },
    );
  }
}
