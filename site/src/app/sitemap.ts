import type { MetadataRoute } from "next";
import { rankingEntries } from "../db/queries";

const BASE = process.env.SITE_URL ?? "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/search`, changeFrequency: "daily", priority: 0.5 },
  ];
  try {
    const entries = await rankingEntries("stars", 500);
    return [
      ...staticRoutes,
      ...entries.map((e) => ({
        url: `${BASE}/entry/${e.slug}`,
        lastModified: e.github_pushed_at ?? undefined,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
