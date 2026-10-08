import Link from "next/link";
import { getRelatedGames } from "../_data/game-catalog";
import styles from "../styles/game-page.module.css";

type RelatedGamesSectionProps = {
  currentPath: string;
  limit?: number;
};

export default function RelatedGamesSection({ currentPath, limit = 4 }: RelatedGamesSectionProps) {
  const relatedGames = getRelatedGames(currentPath, limit);

  if (relatedGames.length === 0) return null;

  return (
    <section className={styles.relatedGamesSection} aria-labelledby="related-games-heading">
      <div className={styles.relatedGamesHeader}>
        <h2 id="related-games-heading">Related Games</h2>
        <p>Continue with another game from the Billy Bob Games library.</p>
      </div>
      <nav className={styles.relatedGamesGrid} aria-label="Related games">
        {relatedGames.map((game) => (
          <Link key={game.href} className={styles.relatedGameCard} href={game.href}>
            <strong>{game.title}</strong>
            <span>{game.description}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
