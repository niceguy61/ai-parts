/** 내 목록(좋아요) 저장 계약 — 브라우저 localStorage + 공유 URL 파라미터.
 *
 * 서버로 보내지 않는다. 목록은 이 브라우저에만 남고, 공유할 때만 URL 쿼리로 옮긴다.
 */

/** localStorage 키 — 버전을 붙여 스키마가 바뀌면 다른 키로 분리한다. */
export const SAVED_STORAGE_KEY = "ai_insight.saved.v1";

/** 공유 URL 쿼리 파라미터 이름. */
export const SAVED_PARAM = "saved";

/** 한 목록에 담을 수 있는 최대 항목 수. */
export const SAVED_LIMIT = 200;

/** 목록 한 줄 — 랭킹 행에서 필요한 값만 저장한다(상세는 상세 페이지에서 다시 본다). */
export interface SavedEntry {
  slug: string;
  n: string;         // 이름
  k: string;         // 종류 (mcp/skill/plugin/library)
  st: number;        // 저장 시점 별수
  sh: string | null; // 한줄 요약
  savedAt: number;   // 저장 시각 (epoch ms)
}

/** localStorage 계약 일부만 요구하는 저장소 어댑터. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 공유 URL의 `saved` 값을 슬러그 목록으로 되돌린다. 깨진 값은 조용히 버린다. */
export function parseSavedSlugs(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    let slug = trimmed;
    try {
      slug = decodeURIComponent(trimmed);
    } catch {
      // 깨진 퍼센트 인코딩은 원본 문자열을 그대로 쓴다
    }
    slug = slug.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
    if (out.length >= SAVED_LIMIT) break;
  }
  return out;
}

/** 슬러그 목록을 공유 URL 파라미터 값으로 만든다(슬러그마다 따로 인코딩). */
export function buildSavedParam(slugs: string[]): string {
  return slugs.slice(0, SAVED_LIMIT).map((s) => encodeURIComponent(s)).join(",");
}

/** 저장소에서 목록을 읽는다. 없거나 깨졌으면 빈 목록. */
export function readSavedList(storage: StorageLike | null): SavedEntry[] {
  if (!storage) return [];
  let raw: string | null = null;
  try {
    raw = storage.getItem(SAVED_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const out: SavedEntry[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<SavedEntry>;
    if (typeof row.slug !== "string" || !row.slug) continue;
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    out.push({
      slug: row.slug,
      n: typeof row.n === "string" && row.n ? row.n : row.slug,
      k: typeof row.k === "string" ? row.k : "",
      st: typeof row.st === "number" && Number.isFinite(row.st) ? row.st : 0,
      sh: typeof row.sh === "string" ? row.sh : null,
      savedAt: typeof row.savedAt === "number" && Number.isFinite(row.savedAt) ? row.savedAt : 0,
    });
    if (out.length >= SAVED_LIMIT) break;
  }
  return out;
}

/** 목록을 저장소에 쓴다. 용량 초과 같은 오류는 조용히 넘긴다. */
export function writeSavedList(storage: StorageLike | null, list: SavedEntry[]): void {
  if (!storage) return;
  try {
    storage.setItem(SAVED_STORAGE_KEY, JSON.stringify(list.slice(0, SAVED_LIMIT)));
  } catch {
    // 저장 공간이 없거나 차단된 브라우저 — 목록은 화면에만 남는다
  }
}

/** 목록에 있는지 확인. */
export function isSaved(list: SavedEntry[], slug: string): boolean {
  return list.some((e) => e.slug === slug);
}

/** 저장/해제 토글 — 저장되면 맨 앞으로, 해제되면 빠진다. */
export function toggleSaved(list: SavedEntry[], entry: Omit<SavedEntry, "savedAt">): SavedEntry[] {
  if (isSaved(list, entry.slug)) return list.filter((e) => e.slug !== entry.slug);
  return [{ ...entry, savedAt: Date.now() }, ...list].slice(0, SAVED_LIMIT);
}

/** 여러 목록을 합친다 — 이미 있는 슬러그는 그대로 두고 새 항목만 뒤에 붙인다. */
export function mergeSaved(list: SavedEntry[], incoming: SavedEntry[]): SavedEntry[] {
  const seen = new Set(list.map((e) => e.slug));
  const out = [...list];
  for (const item of incoming) {
    if (!item?.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
    if (out.length >= SAVED_LIMIT) break;
  }
  return out;
}

/** 랭킹 행을 저장 항목으로 바꾼다. */
export function toSavedEntry(row: { slug: string; n: string; k: string; st: number; sh: string | null }): Omit<SavedEntry, "savedAt"> {
  return { slug: row.slug, n: row.n, k: row.k, st: row.st, sh: row.sh };
}
