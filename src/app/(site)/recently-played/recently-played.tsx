"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearRecentlyPlayed, readRecentlyPlayed, type RecentlyPlayedEntry } from "@/lib/recentlyPlayed";
import styles from "./recently-played.module.css";

function formatWhen(timestamp: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

export default function RecentlyPlayed() {
  const [entries, setEntries] = useState<RecentlyPlayedEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return readRecentlyPlayed();
  });

  const hasEntries = entries.length > 0;

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      setEntries(readRecentlyPlayed());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const content = useMemo(() => {
    if (!hasEntries) {
      return (
        <p className={styles.empty}>
          No games played yet. Open any game, and it will show up here.
        </p>
      );
    }

    return (
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={`${entry.href}:${entry.playedAt}`} className={styles.item}>
            <Link className={styles.link} href={entry.href}>
              {entry.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.thumb} src={entry.img} alt="" loading="lazy" />
              ) : (
                <span className={styles.thumbFallback} aria-hidden="true" />
              )}
              <div className={styles.meta}>
                <div className={styles.title}>{entry.title}</div>
                <div className={styles.when}>{formatWhen(entry.playedAt)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }, [entries, hasEntries]);

  return (
    <main className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Recently played</h1>
        <p className={styles.subheading}>This list is saved in your browser (localStorage).</p>
      </header>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            clearRecentlyPlayed();
            setEntries([]);
          }}
          disabled={!hasEntries}
        >
          Clear history
        </button>
      </div>

      {content}
    </main>
  );
}
