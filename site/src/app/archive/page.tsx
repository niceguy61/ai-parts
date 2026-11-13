"use client";

import { useEffect, useState } from "react";
import EntryCard from "../../components/EntryCard";
import { fetchArchive, fetchManifest } from "../../lib/catalog";
import type { Manifest, SlimEntry } from "../../lib/format";

export default function ArchivePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [rows, setRows] = useState<SlimEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest()
      .then((m) => {
        setManifest(m);
        if (m.archiveDates.length > 0) setDate(m.archiveDates[0]);
      })
      .catch(() => setError("데이터를 불러올 수 없습니다."));
  }, []);

  useEffect(() => {
    if (!date) return;
    setRows(null);
    fetchArchive(date).then(setRows).catch(() => setError("아카이브 로드 실패"));
  }, [date]);

  return (
    <div className="container page">
      <h1 style={{ fontSize: 20, margin: "20px 0 6px" }}>아카이브</h1>
      <p className="summary" style={{ color: "#5c6066", fontSize: 13 }}>
        날짜별 스냅샷으로 그날의 랭킹을 그대로 봅니다.
      </p>

      {error ? (
        <p className="empty">{error}</p>
      ) : (
        <>
          <nav className="cats" aria-label="스냅샷 날짜">
            {(manifest?.archiveDates ?? []).map((d) => (
              <button
                key={d}
                type="button"
                className={d === date ? "on" : ""}
                onClick={() => setDate(d)}
                style={{ cursor: "pointer" }}
              >
                {d}
              </button>
            ))}
          </nav>

          {rows && rows.length > 0 ? (
            <>
              <p className="count-note">{date} 기준 · 그날 마지막 스냅샷 값</p>
              <div className="ledger">
                {rows.map((e, i) => (
                  <EntryCard key={e.slug} entry={e} rank={i + 1} />
                ))}
              </div>
            </>
          ) : (
            <p className="empty">{date ? "그 날짜의 스냅샷이 아직 없습니다." : "불러오는 중…"}</p>
          )}
        </>
      )}
    </div>
  );
}
