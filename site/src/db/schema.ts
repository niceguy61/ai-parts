import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * collector의 001_init.sql과 동일한 구조 (읽기 전용 + config 소량 쓰기).
 * 스키마 변경은 collector/db/migrations가 단일 진실 원천.
 */
export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    slug: text("slug").notNull().unique(),
    canonicalName: text("canonical_name").notNull(),
    summaryKo: text("summary_ko"),
    usageKo: text("usage_ko"),
    installCommands: jsonb("install_commands"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    category: text("category"),
    repoUrl: text("repo_url"),
    homepageUrl: text("homepage_url"),
    license: text("license"),
    stars: integer("stars").notNull().default(0),
    starsDelta24h: integer("stars_delta_24h"),
    starsDelta7d: integer("stars_delta_7d"),
    installs: integer("installs"),
    npmDownloadsMonthly: integer("npm_downloads_monthly"),
    githubCreatedAt: timestamp("github_created_at", { withTimezone: true }),
    githubPushedAt: timestamp("github_pushed_at", { withTimezone: true }),
    readmeHash: text("readme_hash"),
    entryStatus: text("entry_status").notNull().default("active"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_entries_stars").on(t.stars),
    index("idx_entries_category").on(t.category),
  ],
);

export const appearances = pgTable(
  "appearances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    externalId: text("external_id").notNull(),
    url: text("url"),
    metrics: jsonb("metrics").notNull().default(sql`'{}'::jsonb`),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_appearances_entry").on(t.entryId)],
);

export const metricSnapshots = pgTable("metric_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  metrics: jsonb("metrics").notNull().default(sql`'{}'::jsonb`),
});

export const crawlRuns = pgTable("crawl_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  kind: text("kind"),
  status: text("status").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  stats: jsonb("stats").notNull().default(sql`'{}'::jsonb`),
  error: text("error"),
});

export const config = pgTable("config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
