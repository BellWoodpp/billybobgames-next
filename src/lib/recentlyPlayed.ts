export type RecentlyPlayedEntry = {
  href: string;
  title: string;
  img?: string;
  playedAt: number;
};

const STORAGE_KEY = "bbg_recently_played_v1";
const MAX_ENTRIES = 24;

function safeParse(value: string | null): RecentlyPlayedEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const obj = item as Record<string, unknown>;
        const href = typeof obj.href === "string" ? obj.href : "";
        const title = typeof obj.title === "string" ? obj.title : "";
        const playedAt = typeof obj.playedAt === "number" ? obj.playedAt : 0;
        const img = typeof obj.img === "string" ? obj.img : undefined;
        if (!href || !title || !playedAt) return null;
        return { href, title, playedAt, img } satisfies RecentlyPlayedEntry;
      })
      .filter(Boolean) as RecentlyPlayedEntry[];
  } catch {
    return [];
  }
}

export function readRecentlyPlayed(): RecentlyPlayedEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function writeRecentlyPlayed(entries: RecentlyPlayedEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addRecentlyPlayed(entry: Omit<RecentlyPlayedEntry, "playedAt">) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const current = readRecentlyPlayed();
  const next: RecentlyPlayedEntry[] = [
    { ...entry, playedAt: now },
    ...current.filter((existing) => existing.href !== entry.href),
  ].slice(0, MAX_ENTRIES);

  writeRecentlyPlayed(next);
}

export function clearRecentlyPlayed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

