import Image from "next/image";
import Link from "next/link";
import { WsrvImage } from "@/components/WsrvImage";
import PageShell from "./PageShell";
import TrackedGameLink from "./TrackedGameLink";
import { gameCategories, getCategory, getGamesByCategory, type GameCategorySlug } from "../_data/game-catalog";
import styles from "../styles/category-page.module.css";

type CategoryLandingPageProps = {
  slug: GameCategorySlug;
};

export default function CategoryLandingPage({ slug }: CategoryLandingPageProps) {
  const category = getCategory(slug);
  const games = getGamesByCategory(slug);

  if (!category) return null;

  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>{category.heading}</h1>
          <p>{category.description}</p>
        </section>

        <section className={styles.grid} aria-label={`${category.title} list`}>
          {games.map((game, index) => (
            <TrackedGameLink
              key={game.href}
              className={styles.card}
              href={game.href}
              gameHref={game.href}
              gameTitle={game.title}
              trackingSource={`category_${slug}`}
              trackingPosition={index + 1}
            >
              <div className={styles.media}>
                {game.img.startsWith("/") ? (
                  <Image src={game.img} alt={game.alt} fill unoptimized sizes="(min-width: 1024px) 25vw, 100vw" />
                ) : (
                  <WsrvImage src={game.img} alt={game.alt} layout="fullWidth" aspectRatio={16 / 9} unstyled />
                )}
              </div>
              <div className={styles.body}>
                <h2>{game.title}</h2>
                <p>{game.description}</p>
              </div>
            </TrackedGameLink>
          ))}
        </section>

        <section className={styles.links} aria-labelledby="browse-more-categories">
          <h2 id="browse-more-categories">Browse more on Billy Bob Games</h2>
          <nav className={styles.linksList} aria-label="Game categories">
            {gameCategories.map((item) => (
              <Link key={item.slug} href={`/${item.slug}`}>
                {item.title}
              </Link>
            ))}
          </nav>
        </section>
      </main>
    </PageShell>
  );
}
