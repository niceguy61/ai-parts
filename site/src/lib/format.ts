/** 클라이언트 세이프 공용 타입·포맷 (DB 코드 비의존). */

export type Ranking = "stars" | "trending" | "new" | "recent" | "installs";

export interface SlimEntry {
  slug: string;
  n: string;            // canonical name
  k: string;            // kind
  sh: string | null;    // 한줄 요약
  st: number;           // stars
  d7: number | null;    // 7일 델타
  d24: number | null;
  in: number | null;    // installs
  cat: string | null;   // category
  tg: string[];         // tags
  sp: number[];         // 스파크 시리즈 (최근 14일)
  mo: number | null;    // 모멘텀 (연속 상승 일수)
  cr: string | null;    // github 생성일
}

export interface EntryDetail {
  slug: string;
  kind: string;
  name: string;
  short: string | null;
  summary: string | null;
  usage: string | null;
  install: { target: string; cmd: string }[] | null;
  tags: string[];
  category: string | null;
  repo: string | null;
  homepage: string | null;
  license: string | null;
  stars: number;
  d24: number | null;
  d7: number | null;
  installs: number | null;
  npmMonthly: number | null;
  createdAt: string | null;
  pushedAt: string | null;
  appearances: { source: string; external_id: string; url: string | null;
                 metrics: Record<string, unknown> | null }[];
  history: { d: string; v: number }[];
}

export interface Manifest {
  generatedAt: string;
  tabs: Record<string, number>;
  archiveDates: string[];
  entries: number;
}

export const KIND_LABEL: Record<string, string> = {
  mcp: "MCP",
  skill: "SKILL",
  plugin: "PLUGIN",
  library: "LIB",
};

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function avatarFromSlug(slug: string): string | null {
  const owner = slug.split("/")[0];
  return owner ? `https://github.com/${owner}.png?size=48` : null;
}

export function avatarUrl(entry: { repo: string | null } | { repo_url: string | null }): string | null {
  const repo = "repo" in entry ? entry.repo : entry.repo_url;
  if (!repo?.includes("github.com/")) return null;
  const owner = repo.replace("https://github.com/", "").split("/")[0];
  return owner ? `https://github.com/${owner}.png?size=48` : null;
}

export function momentumDays(values: number[]): number {
  if (values.length < 2) return 0;
  let n = 0;
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i] > values[i - 1]) n += 1;
    else break;
  }
  return n;
}
