"use client";

/** 공개 카탈로그 데이터 레이어 — Pages(local /data)와 GitHub Pages 양쪽에서 동일 동작. */
import type { EntryDetail, Manifest, SlimEntry } from "./format";

const DATA = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data`;
const mem = new Map<string, Promise<unknown>>();

function fetchJSON<T>(url: string): Promise<T> {
  if (!mem.has(url)) {
    mem.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
        return r.json();
      }),
    );
  }
  return mem.get(url) as Promise<T>;
}

export function fetchManifest(): Promise<Manifest> {
  return fetchJSON<Manifest>(`${DATA}/manifest.json`);
}

export function fetchRank(tab: string): Promise<SlimEntry[]> {
  return fetchJSON<SlimEntry[]>(`${DATA}/rank/${tab}.json`);
}

export interface SearchRow {
  slug: string;
  n: string;
  sh: string | null;
  tg: string[];
  cat: string | null;
  k: string;
  st: number;
}

export function fetchSearchIndex(): Promise<SearchRow[]> {
  return fetchJSON<SearchRow[]>(`${DATA}/search/index.json`);
}

export function fetchEntry(slug: string): Promise<EntryDetail> {
  return fetchJSON<EntryDetail>(`${DATA}/entry/${slug}.json`);
}

/** metrics.json — {slug: [st, d7, d24, in, npm]} (별수 지표 합본) */
export function fetchMetrics(): Promise<Record<string, [number, number | null, number | null, number | null, number | null]>> {
  return fetchJSON(`${DATA}/metrics.json`);
}

/** history.json — {slug: [[YYYYMMDD, stars], ...]} (스타 일별 추이 합본) */
export function fetchHistory(): Promise<Record<string, [number, number][]>> {
  return fetchJSON(`${DATA}/history.json`);
}

export function fetchArchive(date: string): Promise<SlimEntry[]> {
  return fetchJSON<SlimEntry[]>(`${DATA}/archive/${date}.json`);
}

export interface SearchFilter {
  q?: string;
  category?: string;
  kind?: string;
}

/** 클라이언트 검색·필터 — 인덱스 행에 적용.
 *
 * 매칭: 이름 → 요약 → 태그 (전부 substring).
 * 관련도 정렬: 이름 정확 일치 > 이름 접두 > 이름 포함 > 요약 포함 > 태그 포함,
 * 동점은 별점 내림차순.
 */
export function filterRows<T extends { n: string; sh: string | null; tg: string[]; st: number; cat: string | null; k: string }>(
  rows: T[],
  f: SearchFilter,
): T[] {
  const q = f.q?.trim().toLowerCase();
  const matched = rows.filter((r) => {
    if (f.category && r.cat !== f.category) return false;
    if (f.kind && r.k !== f.kind) return false;
    if (!q) return true;
    return (
      r.n.toLowerCase().includes(q) ||
      (r.sh ?? "").toLowerCase().includes(q) ||
      r.tg.some((t) => t.toLowerCase().includes(q))
    );
  });
  if (!q) return matched;

  const score = (r: T): number => {
    const n = r.n.toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    if ((r.sh ?? "").toLowerCase().includes(q)) return 3;
    return 4; // 태그
  };
  return matched
    .map((r) => ({ r, s: score(r) }))
    .sort((a, b) => a.s - b.s || b.r.st - a.r.st)
    .map((x) => x.r);
}
