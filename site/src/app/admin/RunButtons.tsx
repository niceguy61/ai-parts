"use client";

import { useState } from "react";

const SOURCES: { key: string; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "skills_sh", label: "skills.sh" },
  { key: "clawhub", label: "ClawHub" },
  { key: "mcp_registry", label: "MCP Registry" },
  { key: "npm", label: "npm" },
  { key: "snapshots", label: "스냅샷" },
  { key: "enrich", label: "LLM 요약" },
  { key: "backfill", label: "스타 백필" },
  { key: "rank_ref", label: "전체 랭킹 참조" },
  { key: "trending", label: "AI 신규 발굴" },
];

export default function RunButtons({ token, onDone }: { token: string; onDone?: () => void }) {
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(source: string) {
    setRunning(source);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ source }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setMessage(`✅ ${source}: ${JSON.stringify(body.stats)}`);
        onDone?.();
      } else {
        setMessage(`❌ ${source}: ${body.error ?? `HTTP ${res.status}`}`);
      }
    } catch {
      setMessage(`❌ ${source}: 요청 실패`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SOURCES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => run(s.key)}
            disabled={running !== null}
            style={running === s.key ? { opacity: 0.5 } : undefined}
          >
            {running === s.key ? `${s.label} 실행 중…` : `${s.label} 지금 수집`}
          </button>
        ))}
      </div>
      {message ? (
        <p style={{ marginTop: 12, fontSize: 13, color: "#8b949e", wordBreak: "break-all" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
