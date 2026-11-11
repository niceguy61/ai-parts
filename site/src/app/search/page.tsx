"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EntryCard from "../../components/EntryCard";
import { fetchSearchIndex, filterRows, type SearchRow } from "../../lib/catalog";
import { BASE_PATH, avatarFromSlug, formatNumber, KIND_LABEL, type SlimEntry } from "../../lib/format";
import { CATEGORIES, KINDS } from "../../lib/taxonomy";

const PAGE_SIZE = 50;

function SearchPageInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [category, setCategory] = useState(() => params.get("cat") ?? "");
  const [kind, setKind] = useState(() => params.get("kind") ?? "");
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState<SearchRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSearchIndex().then(setIndex).catch(() => setError("검색 인덱스 로드 실패"));
  }, []);

  // 타이핑/필터 변경 시 URL 동기화 — 공유·북마크 가능 + 새로고침에도 유지
  useEffect(() => {
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    if (category) usp.set("cat", category);
    if (kind) usp.set("kind", kind);
    const qs = usp.toString();
    const url = `${BASE_PATH}/search${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [q, category, kind]);

  const filtered = useMemo(() => {
    if (!index) return [];
    return filterRows(index, { q, category: category || undefined, kind: kind || undefined });
  }, [index, q, category, kind]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div>
      <form className="searchline" onSubmit={(e) => { e.preventDefault(); setPage(1); }}>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="이름으로 검색 — 예: notion, rea, browser"
          aria-label="검색어"
        />
        <button type="submit">검색</button>
      </form>

      <div style={{ display: "flex", gap: 8, margin: "10px 0 4px", flexWrap: "wrap", alignItems: "center" }}>
        <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="테마">
          <option value="">모든 테마</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="select" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="종류">
          <option value="">모든 종류</option>
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <span className="count-note">{index ? `총 ${filtered.length.toLocaleString()}개` : ""}</span>
      </div>

      {error ? (
        <p className="empty">{error}</p>
      ) : !index ? (
        <p className="empty">불러오는 중…</p>
      ) : pageRows.length === 0 ? (
        <p className="empty">검색 결과가 없습니다.</p>
      ) : (
        <>
          <div className="ledger">
            {pageRows.map((r, i) => {
              const slim: SlimEntry = {
                slug: r.slug, n: r.n, k: r.k, sh: r.sh, st: r.st,
                d7: null, d24: null, in: null, cat: r.cat, tg: r.tg,
                sp: [], mo: null, cr: null,
              };
              return (
                <a key={r.slug} className="slip" href={`${BASE_PATH}/entry?slug=${r.slug}`}>
                  <span className="rank">{String((page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}</span>
                  <span className="who">
                    <span className="titlerow">
                      {avatarFromSlug(r.slug) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="avatar" src={avatarFromSlug(r.slug)!} alt="" width={22} height={22} loading="lazy" />
                      ) : null}
                      <span className={`ktag ${r.k}`}>{KIND_LABEL[r.k] ?? r.k}</span>
                      <span className="name">{r.n}</span>
                    </span>
                    {r.sh ? <span className="brief">{r.sh}</span> : null}
                  </span>
                  <span className="nums">
                    <span className="stars"><span className="icon">⭐</span>{formatNumber(r.st)}</span>
                  </span>
                </a>
              );
            })}
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

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="empty">불러오는 중…</p>}>
      <SearchPageInner />
    </Suspense>
  );
}
