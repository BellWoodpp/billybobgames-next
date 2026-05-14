import type { Metadata } from "next";
import GameBreadcrumb from "../_components/GameBreadcrumb";
import HomeGameCard from "../_components/HomeGameCard";
import PageShell from "../_components/PageShell";
import gameStyles from "../styles/game-page.module.css";
import homeStyles from "../styles/home.module.css";
import styles from "./pokemon.module.css";

export const metadata: Metadata = {
  title: "Pokémon Games",
  description:
    "Browse the Pokémon collection on Billy Bob Games. Start with Pokémon FireRed and follow future releases like Emerald and LeafGreen from one series hub.",
  alternates: {
    canonical: "https://billybobgames.org/pokemon",
  },
  openGraph: {
    title: "Pokémon Games | Billy Bob Games",
    description:
      "Start with Pokémon FireRed and track future Pokémon browser releases from one series page.",
    url: "https://billybobgames.org/pokemon",
    type: "website",
  },
};

const availableGames = [
  {
    href: "/fire-red",
    title: "Pokémon FireRed",
    img: "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/GBA-Red/red-image.jpeg",
    alt: "Pokémon FireRed artwork",
    imageFit: "contain" as const,
    newUntil: "2026-05-07T23:59:59+08:00",
  },
];

const plannedGames = [
  { path: "/emerald", title: "Pokémon Emerald" },
  { path: "/leaf-green", title: "Pokémon LeafGreen" },
];

export default function PokemonPage() {
  return (
    <PageShell>
      <main className={gameStyles.wrapperWide}>
        <header className={gameStyles.header}>
          <GameBreadcrumb current="Pokémon" />
          <h1 className={gameStyles.title}>Pokémon Games</h1>
          <p className={gameStyles.subtitle}>
            This is the Pokémon series hub. FireRed is live now, and future pages like Emerald and LeafGreen can plug
            into the same collection later.
          </p>
        </header>

        <section className={styles.heroCard}>
          <h2 className={styles.sectionTitle}>Available Now</h2>
          <p className={styles.sectionText}>
            Start with Pokémon FireRed. It keeps the full game page, save tools, and browser-play flow you already set up.
          </p>
          <div className={homeStyles.otherGamesGrid}>
            {availableGames.map((game) => (
              <HomeGameCard key={game.href} {...game} trackingSource="pokemon_series_hub" />
            ))}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Planned Next</h2>
          <p className={styles.sectionText}>
            These routes are reserved for the next Pokémon entries when you are ready to publish them.
          </p>
          <ul className={styles.routeList}>
            {plannedGames.map((game) => (
              <li key={game.path} className={styles.routeItem}>
                <span className={styles.routePath}>{game.path}</span>
                <span className={styles.routeLabel}>{game.title}</span>
                <span className={styles.routeStatus}>Planned</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PageShell>
  );
}
