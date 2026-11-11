import { NextRequest, NextResponse } from "next/server";
import { adminToken } from "../../../../lib/env";
import { getConfig } from "../../../../db/queries";

export const dynamic = "force-dynamic";

/**
 * LLM 엔드포인트의 /models 목록을 가져온다.
 * - query로 base_url/api_key가 오면 그 값을 사용 (저장 전 설정 테스트용)
 * - 없으면 config 테이블('llm')의 저장값 사용
 * 실패해도 { models: [] }로 정상 응답 — UI가 직접 입력으로 폴백한다.
 */
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!adminToken() || token !== adminToken()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  let base = (url.searchParams.get("base_url") ?? "").trim().replace(/\/+$/, "");
  let key = (url.searchParams.get("api_key") ?? "").trim();

  if (!base) {
    try {
      const cfg = (await getConfig("llm")) as
        | { base_url?: string; api_key?: string }
        | null;
      base = cfg?.base_url ?? "";
      key = key || (cfg?.api_key ?? "");
    } catch {
      // DB 불가 — 빈 목록으로 진행
    }
  }
  if (!base) return NextResponse.json({ ok: true, models: [] });

  try {
    const res = await fetch(`${base}/models`, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return NextResponse.json({ ok: true, models: [] });
    const data = await res.json();
    const models: string[] = (data?.data ?? [])
      .map((m: { id?: string }) => m?.id)
      .filter((id: unknown): id is string => typeof id === "string");
    return NextResponse.json({ ok: true, models });
  } catch {
    return NextResponse.json({ ok: true, models: [] });
  }
}
