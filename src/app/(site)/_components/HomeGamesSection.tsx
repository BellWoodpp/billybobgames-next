"use client";

import { useEffect, useMemo, useState } from "react";
import HomeGameCard from "./HomeGameCard";
import styles from "../styles/home.module.css";

export type HomeGame = {
  href: string;
  title: string;
  img: string;
  alt: string;
  imageFit?: "cover" | "contain";
  newUntil?: string;
  previewVideo?: string;
};

type HomeGamesSectionProps = {
  games: HomeGame[];
  isNewView: boolean;
};

function isGameCurrentlyNew(game: HomeGame, now: number) {
  if (!game.newUntil) return false;

  const newUntilTimestamp = new Date(game.newUntil).getTime();
  return Number.isFinite(newUntilTimestamp) && now < newUntilTimestamp;
}

export default function HomeGamesSection({ games, isNewView }: HomeGamesSectionProps) {
  const [now, setNow] = useState(() => Date.now());

  const visibleGames = useMemo(
    () => (isNewView ? games.filter((game) => isGameCurrentlyNew(game, now)) : games),
    [games, isNewView, now],
  );
  const hasVisibleGames = visibleGames.length > 0;

  useEffect(() => {
    if (!isNewView) return;

    const nextExpiry = games.reduce<number | null>((earliestExpiry, game) => {
      if (!game.newUntil) return earliestExpiry;

      const expiresAt = new Date(game.newUntil).getTime();
      if (!Number.isFinite(expiresAt) || expiresAt <= now) return earliestExpiry;
      if (earliestExpiry === null || expiresAt < earliestExpiry) return expiresAt;
      return earliestExpiry;
    }, null);

    if (nextExpiry === null) return;

    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, Math.max(nextExpiry - Date.now(), 0));

    return () => window.clearTimeout(timeoutId);
  }, [games, isNewView, now]);

  return (
    <>
      <hr className={styles.sectionDivider} />
      <h2 className={styles.otherGamesHeading}>{isNewView ? "New" : "New Game"}</h2>
      {isNewView ? (
        <p className={styles.otherGamesDescription}>
          {hasVisibleGames ? "Showing games that currently carry the New badge." : "最近没有发布最新游戏。"}
        </p>
      ) : null}
      {hasVisibleGames ? (
        <div className={styles.otherGamesGrid}>
          {visibleGames.map((game) => (
            <HomeGameCard
              key={game.href}
              href={game.href}
              title={game.title}
              img={game.img}
              alt={game.alt}
              imageFit={game.imageFit}
              newUntil={game.newUntil}
              previewVideo={game.previewVideo}
            />
          ))}
        </div>
      ) : (
        <div className={styles.otherGamesEmpty}>最近没有发布最新游戏。</div>
      )}
    </>
  );
}
