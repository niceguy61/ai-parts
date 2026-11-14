"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchEntry, fetchManifest, fetchRank } from "../../lib/catalog";
import type { Manifest, SlimEntry } from "../../lib/format";
import { RANK_TABS } from "../../lib/taxonomy";
import { parseSavedSlugs } from "../../lib/saved";

const PAGE_SIZE = 50;
export { PAGE_SIZE };

/** 목록 한 줄 — 랭킹 행·저장 목록·공유 목록이 모두 이 모양으로 그려진다. */
export interface ListRow {
  slug: string;
  n: string;
  k: string;
  st: number;
  sh: string | null;
  d7?: number | null;
  d24?: number | null;
  in?: number | null;
  vl?: number | null;
  sp?: number[];
  cat?: string | null;
  tg?: string[];
}

/** 공유 URL로 받은 항목 — 상세 JSON에서 이름을 채운다. */
export interface SharedEntry extends ListRow {
  cat: string | null;
}

export type RankView = "rank" | "saved" | "shared";

interface RankDataValue {
  tab: string;
  setTab: (tab: string) => void;
  view: RankView;
  setView: (view: RankView) => void;
  rows: SlimEntry[] | null;
  filtered: SlimEntry[];
  pageRows: ListRow[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  kind: string | undefined;
  setKind: (kind: string | undefined) => void;
  category: string | undefined;
  setCategory: (category: string | undefined) => void;
  manifest: Manifest | null;
  error: string | null;
  sharedSlugs: string[];
  sharedEntries: SharedEntry[];
  sharedStatus: "none" | "loading" | "ready" | "error";
}

const RankDataContext = createContext<RankDataValue | null>(null);

export function RankDataProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTabState] = useState("stars");
  const [view, setView] = useState<RankView>("rank");
  const [kind, setKind] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [rows, setRows] = useState<SlimEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharedSlugs, setSharedSlugs] = useState<string[]>([]);
  const [sharedEntries, setSharedEntries] = useState<SharedEntry[]>([]);
  const [sharedStatus, setSharedStatus] = useState<RankDataValue["sharedStatus"]>("none");
  /** URL을 읽은 뒤에만 데이터를 가져온다 — 첫 렌더는 서버와 같게 유지된다. */
  const [urlReady, setUrlReady] = useState(false);

  // 주소(query)에서 기준과 공유 목록을 읽는다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") ?? "";
    if (RANK_TABS.some((x) => x.key === t)) setTabState(t);
    setSharedSlugs(parseSavedSlugs(params.get("saved")));
    setUrlReady(true);
  }, []);

  // #saved 해시면 내 목록 뷰를 연다 — 헤더·푸터의 "내 목록" 링크.
  // 브라우저 기본 앵커 스크롤(SavedSplit 섹션) 대신 랭킹 앱 목록으로 옮겨준다.
  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash !== "#saved") return;
      setView("saved");
      requestAnimationFrame(() => {
        document.getElementById("ranklist")?.scrollIntoView({ block: "start" });
      });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    fetchManifest()
      .then(setManifest)
      .catch(() => setError("데이터를 불러오지 못했습니다 — 배치를 한 번 실행해 주세요."));
  }, []);

  // 랭킹 기준이 바뀌면 그 기준의 JSON만 다시 읽는다.
  useEffect(() => {
    if (!urlReady) return;
    setRows(null);
    fetchRank(tab)
      .then(setRows)
      .catch(() => setError("랭킹 데이터를 불러오지 못했습니다."));
  }, [tab, urlReady]);

  // 공유 링크(?saved=)로 들어오면 그 항목들의 이름을 상세 JSON에서 채운다.
  useEffect(() => {
    if (sharedSlugs.length === 0) {
      setSharedEntries([]);
      setSharedStatus("none");
      return;
    }
    let cancelled = false;
    setSharedStatus("loading");
    Promise.all(
      sharedSlugs.map(async (slug): Promise<SharedEntry | null> => {
        try {
          const detail = await fetchEntry(slug);
          return {
            slug,
            n: detail.name || slug,
            k: detail.kind,
            st: 0,
            sh: detail.short || detail.summary,
            cat: detail.category ?? null,
          };
        } catch {
          return null;
        }
      }),
    ).then((list) => {
      if (cancelled) return;
      const found = list.filter((x): x is SharedEntry => x !== null);
      setSharedEntries(found);
      setSharedStatus(found.length > 0 ? "ready" : "error");
    });
    return () => {
      cancelled = true;
    };
  }, [sharedSlugs]);

  // 탭을 URL에 반영 — 다른 사람에게 같은 순위를 그대로 보여준다.
  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [tab, urlReady]);

  const filtered = useMemo(() => {
    let r = rows ?? [];
    if (kind) r = r.filter((e) => e.k === kind);
    if (category) r = r.filter((e) => e.cat === category);
    return r;
  }, [rows, kind, category]);

  const pageRows = useMemo<ListRow[]>(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const value = useMemo<RankDataValue>(
    () => ({
      tab,
      setTab: (next) => {
        setTabState(next);
        setPage(1);
        setView("rank");
      },
      view,
      setView,
      rows,
      filtered,
      pageRows,
      page,
      setPage,
      totalPages,
      kind,
      setKind: (next) => {
        setKind(next);
        setPage(1);
      },
      category,
      setCategory: (next) => {
        setCategory(next);
        setPage(1);
      },
      manifest,
      error,
      sharedSlugs,
      sharedEntries,
      sharedStatus,
    }),
    [
      tab, view, rows, filtered, pageRows, page, totalPages, kind, category,
      manifest, error, sharedSlugs, sharedEntries, sharedStatus,
    ],
  );

  return <RankDataContext.Provider value={value}>{children}</RankDataContext.Provider>;
}

export function useRankData(): RankDataValue {
  const ctx = useContext(RankDataContext);
  if (!ctx) throw new Error("RankDataProvider 없이 useRankData를 쓸 수 없습니다.");
  return ctx;
}
