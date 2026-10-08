import type { MetadataRoute } from "next";
import { catalogGames, gameCategories } from "./(site)/_data/game-catalog";

const SITE_URL = "https://billybobgames.org";
const CONTENT_LAST_MODIFIED = "2026-10-09";

const staticRoutes = [
  { path: "/", lastModified: CONTENT_LAST_MODIFIED, changeFrequency: "daily", priority: 1.0 },
  { path: "/about", lastModified: "2026-10-08", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", lastModified: "2026-10-08", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", lastModified: "2026-04-16", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", lastModified: "2026-10-08", changeFrequency: "yearly", priority: 0.4 },
  { path: "/dmca", lastModified: "2026-10-08", changeFrequency: "yearly", priority: 0.4 },
  { path: "/disclaimer", lastModified: "2026-10-08", changeFrequency: "yearly", priority: 0.4 },
  { path: "/credits", lastModified: "2026-10-08", changeFrequency: "monthly", priority: 0.5 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryRoutes = gameCategories.map((category) => ({
    path: `/${category.slug}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const gameRoutes = catalogGames.map((game) => ({
    path: game.href,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const canonicalRoutes = [...staticRoutes, ...categoryRoutes, ...gameRoutes];
  const uniqueRoutes = new Map(canonicalRoutes.map((route) => [route.path, route]));

  return [...uniqueRoutes.values()].map(({ path, ...route }) => ({
    url: new URL(path, SITE_URL).toString(),
    ...route,
  }));
}
