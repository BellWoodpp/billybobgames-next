import type { MetadataRoute } from "next";

const SITE_URL = "https://billybobgames.org";

const routes = [
  { path: "/", lastModified: "2026-04-24", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.6 },
  {
    path: "/privacy-policy",
    lastModified: "2026-04-16",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  { path: "/arcade-games", lastModified: "2026-04-16", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gba", lastModified: "2026-04-24", changeFrequency: "monthly", priority: 0.7 },
  { path: "/idle-games", lastModified: "2026-04-16", changeFrequency: "weekly", priority: 0.8 },
  { path: "/music-games", lastModified: "2026-04-16", changeFrequency: "weekly", priority: 0.8 },
  { path: "/card-games", lastModified: "2026-04-16", changeFrequency: "weekly", priority: 0.8 },
  { path: "/puzzle-games", lastModified: "2026-04-16", changeFrequency: "weekly", priority: 0.8 },
  { path: "/evolve", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/bloodmoney", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/flappy-text", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fruit-ninja", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/html5-fly", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/html5-mario", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/html5-xxl", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/html5demo7", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/mouseHit", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pac-man", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
  {
    path: "/slot-machine-main",
    lastModified: "2026-04-16",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/Spider-Solitaire",
    lastModified: "2026-04-16",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  { path: "/sprunki", lastModified: "2026-04-16", changeFrequency: "monthly", priority: 0.7 },
] satisfies Array<{
  path: string;
  lastModified: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, ...route }) => ({
    url: new URL(path, SITE_URL).toString(),
    ...route,
  }));
}
