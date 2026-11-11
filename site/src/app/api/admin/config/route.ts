import { NextRequest, NextResponse } from "next/server";
import { adminToken } from "../../../../lib/env";
import { getConfig, setConfig } from "../../../../db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!adminToken() || token !== adminToken()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!key) return NextResponse.json({ ok: false, error: "key required" }, { status: 400 });
  const value = await getConfig(key);
  return NextResponse.json({ ok: true, value });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token") ?? "";
  if (!adminToken() || token !== adminToken()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { key?: string; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!body.key || body.value === undefined) {
    return NextResponse.json({ ok: false, error: "key and value required" }, { status: 400 });
  }
  await setConfig(body.key, body.value);
  return NextResponse.json({ ok: true });
}
