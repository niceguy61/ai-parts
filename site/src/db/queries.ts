import { sql, type SQL } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export type Ranking = "stars" | "trending" | "new" | "installs" | "recent";

export interface Entry {
  id: string;
  kind: string;
  slug: string;
  canonical_name: string;
  summary_short_ko: string | null;
  summary_ko: string | null;
  usage_ko: string | null;
  install_commands: { target: string; cmd: string }[] | null;
  tags: string[];
  category: string | null;
  repo_url: string | null;
  homepage_url: string | null;
  license: string | null;
  stars: number;
  stars_delta_24h: number | null;
  stars_delta_7d: number | null;
  installs: number | null;
  npm_downloads_monthly: number | null;
  github_created_at: Date | null;
  github_pushed_at: Date | null;
  entry_status: string;
}

export interface Appearance {
  source: string;
  external_id: string;
  url: string | null;
  metrics: Record<string, unknown> | null;
  first_seen_at: Date;
  last_seen_at: Date;
}

export interface EntryDetail extends Entry {
  appearances: Appearance[];
  star_history: { captured_at: Date; stars: number }[];
}

export interface CrawlRun {
  id: string;
  source: string;
  kind: string | null;
  status: string;
  started_at: Date;
  finished_at: Date | null;
  stats: Record<string, unknown> | null;
  error: string | null;
}

export type Db = NodePgDatabase;

const DEFAULT_DSN = "postgresql://insight:insight@localhost:5434/insight";

let cachedDb: Db | null = null;

export function getDb(): Db {
  if (!cachedDb) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? DEFAULT_DSN,
      max: 5,
    });
    cachedDb = drizzle(pool);
  }
  return cachedDb;
}

const ENTRY_COLS = sql`
  id, kind, slug, canonical_name, summary_short_ko, summary_ko, usage_ko, install_commands, tags,
  category, repo_url, homepage_url, license, stars, stars_delta_24h, stars_delta_7d,
  installs, npm_downloads_monthly, github_created_at, github_pushed_at, entry_status
`;

function orderByFor(kind: Ranking): SQL {
  switch (kind) {
    case "trending":
      return sql`stars_delta_7d DESC NULLS LAST, stars DESC`;
    case "installs":
      return sql`installs DESC NULLS LAST, stars DESC`;
    case "new":
      return sql`stars_delta_7d DESC NULLS LAST, stars DESC`;
    case "recent":
      return sql`github_created_at DESC NULLS LAST, stars DESC`;
    case "stars":
    default:
      return sql`stars DESC`;
  }
}

function whereFor(kind: Ranking): SQL {
  switch (kind) {
    case "new":
      return sql`github_created_at > now() - interval '90 days'`;
    case "recent":
      return sql`stars > 0`;
    case "stars":
      return sql`github_pushed_at > now() - interval '180 days'`;
    default:
      return sql`entry_status = 'active'`;
  }
}

export async function rankingEntries(
  kind: Ranking,
  limit = 50,
  db: Db = getDb(),
  entryKind?: string,
  category?: string,
  offset = 0,
): Promise<Entry[]> {
  const extra: SQL[] = [];
  if (entryKind) extra.push(sql`kind = ${entryKind}`);
  if (category) extra.push(sql`category = ${category}`);
  const extraWhere = extra.length ? sql` AND ${sql.join(extra, sql` AND `)}` : sql``;
  const res = await db.execute(
    sql`SELECT ${ENTRY_COLS} FROM entries
        WHERE entry_status = 'active' AND ${whereFor(kind)}${extraWhere}
        ORDER BY ${orderByFor(kind)}
        LIMIT ${limit} OFFSET ${offset}`,
  );
  return res.rows as unknown as Entry[];
}

export interface SearchParams {
  q?: string;
  category?: string;
  kind?: string;
  sort?: "stars" | "trending" | "relevance";
  limit?: number;
  offset?: number;
}
function searchWhere({ q, category, kind }: SearchParams): SQL {
  const parts: SQL[] = [sql`entry_status = 'active'`];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    parts.push(sql`(
      search_tsv @@ websearch_to_tsquery('simple', ${q.trim()})
      OR canonical_name ILIKE ${like}
      OR canonical_name % ${q.trim()}
      OR summary_ko ILIKE ${like}
      OR array_to_string(tags, ' ') ILIKE ${like}
    )`);
  }
  if (category) parts.push(sql`category = ${category}`);
  if (kind) parts.push(sql`kind = ${kind}`);
  return sql.join(parts, sql` AND `);
}

function searchOrder(sort: SearchParams["sort"], q?: string): SQL {
  if (sort === "trending") return sql`stars_delta_7d DESC NULLS LAST, stars DESC`;
  if (sort === "relevance" && q && q.trim()) {
    return sql`ts_rank(search_tsv, websearch_to_tsquery('simple', ${q.trim()})) DESC, stars DESC`;
  }
  return sql`stars DESC`;
}

export async function searchEntries(
  params: SearchParams,
  db: Db = getDb(),
): Promise<{ items: Entry[]; total: number }> {
  const { limit = 20, offset = 0 } = params;
  const where = searchWhere(params);

  const itemsRes = await db.execute(
    sql`SELECT ${ENTRY_COLS} FROM entries
        WHERE ${where}
        ORDER BY ${searchOrder(params.sort, params.q)}
        LIMIT ${limit} OFFSET ${offset}`,
  );
  const totalRes = await db.execute(sql`SELECT count(*)::int AS total FROM entries WHERE ${where}`);
  return {
    items: itemsRes.rows as unknown as Entry[],
    total: (totalRes.rows[0] as { total: number }).total,
  };
}

export async function getEntryBySlug(
  slug: string,
  db: Db = getDb(),
): Promise<EntryDetail | null> {
  const res = await db.execute(sql`SELECT ${ENTRY_COLS} FROM entries WHERE slug = ${slug}`);
  const entry = res.rows[0] as unknown as Entry | undefined;
  if (!entry) return null;

  const appRes = await db.execute(
    sql`SELECT source, external_id, url, metrics, first_seen_at, last_seen_at
        FROM appearances WHERE entry_id = ${entry.id}
        ORDER BY last_seen_at DESC`,
  );
  const histRes = await db.execute(
    sql`SELECT captured_at, (metrics->>'stars')::int AS stars
        FROM metric_snapshots
        WHERE entry_id = ${entry.id} AND metrics ? 'stars'
          AND captured_at >= now() - interval '90 days'
        ORDER BY captured_at ASC`,
  );
  return {
    ...entry,
    appearances: appRes.rows as unknown as Appearance[],
    star_history: histRes.rows as unknown as { captured_at: Date; stars: number }[],
  };
}

export async function getCrawlRuns(limit = 20, db: Db = getDb()): Promise<CrawlRun[]> {
  const res = await db.execute(
    sql`SELECT id, source, kind, status, started_at, finished_at, stats, error
        FROM crawl_runs ORDER BY started_at DESC LIMIT ${limit}`,
  );
  return res.rows as unknown as CrawlRun[];
}

export interface StarPoint {
  time: string; // YYYY-MM-DD
  value: number;
}

/** 여러 엔트리의 일별 스타 히스토리를 한 번에 (리스트 스파크라인용). */
export async function starHistoryBatch(
  entryIds: string[],
  days = 14,
  db: Db = getDb(),
): Promise<Map<string, StarPoint[]>> {
  const out = new Map<string, StarPoint[]>();
  if (entryIds.length === 0) return out;
  const res = await db.execute(
    sql`SELECT DISTINCT ON (entry_id, captured_at::date)
               entry_id, captured_at::date AS day, (metrics->>'stars')::int AS stars
        FROM metric_snapshots
        WHERE entry_id IN (${sql.join(entryIds.map((id) => sql`${id}::uuid`), sql`, `)})
          AND metrics ? 'stars' AND captured_at >= now() - ${sql.raw(`interval '${days} days'`)}
        ORDER BY entry_id, captured_at::date, captured_at DESC`,
  );
  for (const row of res.rows as unknown as { entry_id: string; day: string; stars: number }[]) {
    const list = out.get(row.entry_id) ?? [];
    list.push({ time: String(row.day).slice(0, 10), value: row.stars });
    out.set(row.entry_id, list);
  }
  return out;
}

/** 모멘텀: 시계열 끝에서 연속 상승 일수 (2일 이상일 때만 의미). */
export function momentumDays(series: StarPoint[]): number {
  if (series.length < 2) return 0;
  let n = 0;
  for (let i = series.length - 1; i > 0; i--) {
    if (series[i].value > series[i - 1].value) n += 1;
    else break;
  }
  return n;
}

/** 아카이브: 스냅샷이 존재하는 날짜 목록 (최근 60일). */
export async function archiveDates(db: Db = getDb()): Promise<string[]> {
  const res = await db.execute(
    sql`SELECT DISTINCT captured_at::date AS day
        FROM metric_snapshots WHERE metrics ? 'stars'
        ORDER BY day DESC LIMIT 60`,
  );
  return (res.rows as unknown as { day: string }[]).map((r) => String(r.day).slice(0, 10));
}

/** 특정 날짜 기준 랭킹 (그날 마지막 스냅샷 값). */
export async function archiveRanking(
  date: string,
  limit = 50,
  db: Db = getDb(),
): Promise<Entry[]> {
  const res = await db.execute(
    sql`SELECT ${ENTRY_COLS} FROM entries e
        JOIN LATERAL (
          SELECT (s.metrics->>'stars')::bigint AS day_stars
          FROM metric_snapshots s
          WHERE s.entry_id = e.id AND s.metrics ? 'stars'
            AND s.captured_at::date = ${date}::date
          ORDER BY s.captured_at DESC LIMIT 1
        ) snap ON true
        WHERE e.entry_status = 'active'
        ORDER BY snap.day_stars DESC
        LIMIT ${limit}`,
  );
  return res.rows as unknown as Entry[];
}

export async function getConfig(key: string, db: Db = getDb()): Promise<unknown> {
  const res = await db.execute(sql`SELECT value FROM config WHERE key = ${key}`);
  const row = res.rows[0] as { value: unknown } | undefined;
  return row ? row.value : null;
}

export async function setConfig(key: string, value: unknown, db: Db = getDb()): Promise<void> {
  await db.execute(
    sql`INSERT INTO config (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
  );
}
