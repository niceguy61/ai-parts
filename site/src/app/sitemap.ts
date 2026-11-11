import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://niceguy61.github.io/ai-parts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/search`, changeFrequency: "daily", priority: 0.5 },
  ];
}
