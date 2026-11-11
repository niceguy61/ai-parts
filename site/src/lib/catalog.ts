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

export function fetchArchive(date: string): Promise<SlimEntry[]> {
  return fetchJSON<SlimEntry[]>(`${DATA}/archive/${date}.json`);
}

export interface SearchFilter {
  q?: string;
  category?: string;
  kind?: string;
}

/** 클라이언트 검색·필터 — 인덱스 행에 적용. 검색은 이름(name)만 매칭한다. */
export function filterRows<T extends { n: string; st: number; cat: string | null; k: string }>(
  rows: T[],
  f: SearchFilter,
): T[] {
  const q = f.q?.trim().toLowerCase();
  const matched = rows.filter((r) => {
    if (f.category && r.cat !== f.category) return false;
    if (f.kind && r.k !== f.kind) return false;
    if (q && !r.n.toLowerCase().includes(q)) return false;
    return true;
  });
  if (!q) return matched;
  // 관련도 정렬 — 정확히 일치 > 접두 > 포함, 동점은 별점 내림차순
  const score = (n: string): number => {
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    return 2;
  };
  return matched.sort((a, b) => {
    const sa = score(a.n.toLowerCase());
    const sb = score(b.n.toLowerCase());
    if (sa !== sb) return sa - sb;
    return b.st - a.st;
  });
}
