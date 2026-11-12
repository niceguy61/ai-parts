"use client";

import { useEffect, useMemo, useState } from "react";
import EntryCard from "../components/EntryCard";
import { fetchManifest, fetchRank, filterRows } from "../lib/catalog";
import { BASE_PATH, type Manifest, type SlimEntry } from "../lib/format";
import { CATEGORIES, KINDS, RANK_TABS } from "../lib/taxonomy";

const PAGE_SIZE = 50;

export default function Home() {
  const [tab, setTab] = useState("stars");
  const [kind, setKind] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [rows, setRows] = useState<SlimEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest().then(setManifest).catch(() => setError("데이터를 불러올 수 없습니다 — 배치가 아직 실행되지 않았을 수 있습니다."));
  }, []);

  useEffect(() => {
    setRows(null);
    fetchRank(tab).then(setRows).catch(() => setError("랭킹 데이터 로드 실패"));
  }, [tab]);

  const filtered = useMemo(() => {
    let r = rows ?? [];
    if (kind) r = r.filter((e) => e.k === kind);
    if (category) r = r.filter((e) => e.cat === category);
    return r;
  }, [rows, kind, category]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activeTab = RANK_TABS.find((t) => t.key === tab)!;

  return (
    <div>
      <form className="searchline" action={`${BASE_PATH}/search`}>
        <input type="search" name="q" placeholder="이름·요약·태그로 검색 — 예: notion, 데이터베이스, 브라우저" aria-label="검색어" />
        <button type="submit">검색</button>
      </form>

      <nav className="ranktabs" aria-label="랭킹 기준">
        {RANK_TABS.map((t) => (
          <button key={t.key} type="button" className={t.key === tab ? "on" : ""}
                  onClick={() => { setTab(t.key); setPage(1); }}>
            {t.label}
          </button>
        ))}
      </nav>

      <nav className="kinds" aria-label="종류">
        <button type="button" className={!kind ? "on" : ""} onClick={() => { setKind(undefined); setPage(1); }}>전체</button>
        {KINDS.map((k) => (
          <button key={k.value} type="button" className={kind === k.value ? "on" : ""}
                  onClick={() => { setKind(k.value); setPage(1); }}>
            {k.label}
          </button>
        ))}
      </nav>

      <nav className="cats" aria-label="카테고리">
        <button type="button" className={!category ? "on" : ""} onClick={() => { setCategory(undefined); setPage(1); }}>모든 테마</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={category === c ? "on" : ""}
                  onClick={() => { setCategory(c); setPage(1); }}>
            {c}
          </button>
        ))}
      </nav>

      <p className="count-note">
        {activeTab.desc}
        {kind ? ` · ${KINDS.find((k) => k.value === kind)?.label}` : ""}
        {category ? ` · ${category}` : ""}
        {filtered.length > 0 ? ` · ${filtered.length.toLocaleString()}개` : ""}
        {manifest ? ` · 최종 업데이트 ${new Date(manifest.generatedAt).toLocaleString("ko-KR")}` : ""}
      </p>

      {error ? (
        <p className="empty">{error}</p>
      ) : !rows ? (
        <p className="empty">불러오는 중…</p>
      ) : pageRows.length === 0 ? (
        <p className="empty">이 조합의 데이터가 아직 없습니다.</p>
      ) : (
        <>
          <div className="ledger">
            {pageRows.map((e, i) => (
              <EntryCard key={e.slug} entry={e} rank={(page - 1) * PAGE_SIZE + i + 1}
                         showVelocity={tab === "velocity"} />
            ))}
          </div>
          <nav className="pager" aria-label="페이지">
            {page > 1 ? (
              <button type="button" className="pgbtn" onClick={() => setPage(page - 1)}>← 이전</button>
            ) : (
              <span className="pgbtn off">← 이전</span>
            )}
            <span className="pgnum">{page} / {totalPages}페이지</span>
            {page < totalPages ? (
              <button type="button" className="pgbtn" onClick={() => setPage(page + 1)}>다음 →</button>
            ) : (
              <span className="pgbtn off">다음 →</span>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
