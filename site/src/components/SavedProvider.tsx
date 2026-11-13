"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BASE_PATH } from "../lib/format";
import {
  buildSavedParam,
  mergeSaved,
  readSavedList,
  toggleSaved,
  writeSavedList,
  type SavedEntry,
  type StorageLike,
} from "../lib/saved";

interface SavedContextValue {
  /** 이 브라우저에 저장된 목록 (최신순) */
  list: SavedEntry[];
  /** localStorage를 읽었는지 (false면 아직 로딩) */
  ready: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (entry: Omit<SavedEntry, "savedAt">) => void;
  /** 공유 목록을 내 목록으로 옮긴다(중복은 건너뛴다). */
  addMany: (entries: Omit<SavedEntry, "savedAt">[]) => void;
  remove: (slug: string) => void;
  clear: () => void;
  /** 현재 목록을 담은 공유 URL */
  shareUrl: () => string;
}

const SavedContext = createContext<SavedContextValue | null>(null);

/** localStorage 접근은 일부 환경에서 예외를 던진다 — 실패하면 저장 없이 동작한다. */
function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<SavedEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setList(readSavedList(browserStorage()));
    setReady(true);
  }, []);

  const persist = useCallback((next: SavedEntry[]) => {
    setList(next);
    writeSavedList(browserStorage(), next);
  }, []);

  const value = useMemo<SavedContextValue>(() => {
    const slugs = new Set(list.map((e) => e.slug));
    return {
      list,
      ready,
      isSaved: (slug) => slugs.has(slug),
      toggle: (entry) =>
        persist(
          toggleSaved(
            list,
            entry,
          ),
        ),
      addMany: (entries) =>
        persist(
          mergeSaved(
            list,
            entries.map((e) => ({ ...e, savedAt: Date.now() })),
          ),
        ),
      remove: (slug) => persist(list.filter((e) => e.slug !== slug)),
      clear: () => persist([]),
      shareUrl: () => {
        const base = typeof window === "undefined" ? "" : window.location.origin;
        return `${base}${BASE_PATH}/?saved=${buildSavedParam(list.map((e) => e.slug))}`;
      },
    };
  }, [list, ready, persist]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

/** 저장 목록 컨텍스트 — provider 밖에서 쓰면 오류가 아니라 빈 목록으로 동작한다. */
export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    return {
      list: [],
      ready: false,
      isSaved: () => false,
      toggle: () => {},
      addMany: () => {},
      remove: () => {},
      clear: () => {},
      shareUrl: () => "",
    };
  }
  return ctx;
}
