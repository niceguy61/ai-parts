"use client";

import { useCallback, useEffect, useState } from "react";
import AdminTokenGate, { useAdminToken } from "../../components/AdminTokenGate";
import RunButtons from "./RunButtons";

interface CrawlRun {
  id: string;
  source: string;
  kind: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  stats: Record<string, unknown> | null;
  error: string | null;
}

function statusBadge(status: string): string {
  if (status === "ok") return "badge up";
  if (status === "error") return "badge pending";
  return "badge";
}

export default function AdminPage() {
  const { token, loaded } = useAdminToken();
  const [runs, setRuns] = useState<CrawlRun[] | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/runs?limit=20", {
        headers: { "X-Admin-Token": token },
      });
      const body = await res.json();
      if (body.ok) {
        setRuns(body.runs);
        setDbError(null);
      } else {
        setDbError(body.error ?? `HTTP ${res.status}`);
      }
    } catch {
      setDbError("runs 조회 실패");
    }
  }, [token]);

  useEffect(() => {
    if (token) void load();
  }, [token, load]);

  return (
    <AdminTokenGate token={token} loaded={loaded}>
      <div>
        <h1 style={{ fontSize: 20, margin: "18px 0 8px" }}>수집 관리</h1>
        <RunButtons token={token} onDone={load} />

        <section className="section" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 15, color: "#8b949e" }}>최근 수집 실행 (20건)</h2>
          {dbError ? (
            <p className="empty">실행 이력 조회 실패: {dbError}</p>
          ) : !runs ? (
            <p className="empty">불러오는 중…</p>
          ) : runs.length === 0 ? (
            <p className="empty">아직 실행 이력이 없습니다.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#8b949e", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px" }}>소스</th>
                  <th style={{ padding: "6px 8px" }}>상태</th>
                  <th style={{ padding: "6px 8px" }}>시작</th>
                  <th style={{ padding: "6px 8px" }}>종료</th>
                  <th style={{ padding: "6px 8px" }}>결과</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #21262d" }}>
                    <td style={{ padding: "6px 8px" }}>{r.source}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span className={statusBadge(r.status)}>{r.status}</span>
                    </td>
                    <td style={{ padding: "6px 8px" }}>{new Date(r.started_at).toLocaleString("ko-KR")}</td>
                    <td style={{ padding: "6px 8px" }}>
                      {r.finished_at ? new Date(r.finished_at).toLocaleString("ko-KR") : "-"}
                    </td>
                    <td style={{ padding: "6px 8px", color: "#8b949e" }}>
                      {r.error ?? JSON.stringify(r.stats)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminTokenGate>
  );
}
