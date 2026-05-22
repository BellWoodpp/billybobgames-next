import type { ReactNode } from "react";
import Image from "next/image";
import { classNames } from "@/lib/classNames";
import { WsrvImage } from "@/components/WsrvImage";
import PageShell from "./PageShell";
import GameBreadcrumb from "./GameBreadcrumb";
import GameStructuredData from "./GameStructuredData";
import TrackedGameLink from "./TrackedGameLink";
import AdSenseBlock from "./AdSenseBlock";
import { catalogGames } from "../_data/game-catalog";
import gamePageStyles from "../styles/game-page.module.css";
import styles from "../styles/game-landing.module.css";

type GameLandingPageProps = {
  title: string;
  subtitle: string;
  description: string;
  path: string;
  image: string;
  imageAlt: string;
  playHref: string;
  playLabel?: string;
  playDescription?: string;
  facts?: ReactNode[];
  howToTitle?: string;
  howToItems: ReactNode[];
  detailTitle?: string;
  detailParagraphs: ReactNode[];
  adSlot?: string;
  adPlacement?: string;
};

function renderGameImage(src: string, alt: string, priority = false) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized
        sizes="(min-width: 1024px) 44rem, 100vw"
      />
    );
  }

  return (
    <WsrvImage
      src={src}
      alt={alt}
      width={1200}
      height={675}
      priority={priority}
      sizes="(min-width: 1024px) 44rem, 100vw"
      layout="constrained"
    />
  );
}

export default function GameLandingPage({
  title,
  subtitle,
  description,
  path,
  image,
  imageAlt,
  playHref,
  playLabel = "Play now",
  playDescription = "Open a dedicated play view with fewer distractions and a stronger chance of keeping the game front and center.",
  facts = [],
  howToTitle = "How to Play",
  howToItems,
  detailTitle = `Why play ${title}?`,
  detailParagraphs,
  adSlot,
  adPlacement = "game_landing_primary",
}: GameLandingPageProps) {
  const currentGame = catalogGames.find((entry) => entry.href === path);
  const relatedGames =
    currentGame == null
      ? []
      : catalogGames
          .filter(
            (entry) =>
              entry.href !== currentGame.href &&
              entry.categories.some((category) => currentGame.categories.includes(category)),
          )
          .slice(0, 3);

  return (
    <PageShell>
      <GameStructuredData title={title} description={description} path={path} image={image} />
      <main className={classNames(gamePageStyles.wrapper, gamePageStyles.wrapperWide)}>
        <header className={gamePageStyles.header}>
          <GameBreadcrumb current={title} />
          <h1 className={gamePageStyles.titleLarge}>{title}</h1>
          <p className={gamePageStyles.subtitleLarge}>{subtitle}</p>
        </header>

        <section className={styles.heroCard}>
          <TrackedGameLink
            href={playHref}
            gameHref={playHref}
            gameTitle={title}
            trackingSource={`${adPlacement}_poster`}
            trackingPosition={1}
            className={styles.heroMedia}
            aria-label={`Open ${title} play view`}
          >
            {renderGameImage(image, imageAlt, true)}
          </TrackedGameLink>

          <aside className={styles.heroPanel}>
            <p className={styles.heroEyebrow}>Dedicated Play View</p>
            <p className={styles.heroDescription}>{description}</p>
            {facts.length > 0 ? (
              <ul className={styles.facts}>
                {facts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            ) : null}
            <TrackedGameLink
              href={playHref}
              gameHref={playHref}
              gameTitle={title}
              trackingSource={`${adPlacement}_cta`}
              trackingPosition={2}
              className={styles.playButton}
            >
              {playLabel}
            </TrackedGameLink>
            <p className={styles.playDescription}>{playDescription}</p>
          </aside>
        </section>

        <AdSenseBlock slot={adSlot} placement={adPlacement} minHeight={300} />

        <section className={classNames(gamePageStyles.howToPlay, gamePageStyles.howToPlaySpacious)}>
          <h2 className={classNames(gamePageStyles.howToPlayTitle, gamePageStyles.howToPlayTitleLarge)}>
            {howToTitle}
          </h2>
          <ul className={classNames(gamePageStyles.howToPlayList, gamePageStyles.howToPlayListSpacious)}>
            {howToItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={gamePageStyles.detailSection}>
          <h2 className={gamePageStyles.detailHeading}>{detailTitle}</h2>
          {detailParagraphs.map((paragraph, index) => (
            <p key={index} className={gamePageStyles.detailParagraph}>
              {paragraph}
            </p>
          ))}
        </section>

        {relatedGames.length > 0 ? (
          <section className={styles.relatedSection} aria-labelledby={`${title}-related-games`}>
            <div className={styles.relatedHeader}>
              <h2 id={`${title}-related-games`}>More Games You Might Like</h2>
              <p>Keep the landing page content rich while giving people another route into similar browser games.</p>
            </div>
            <div className={styles.relatedGrid}>
              {relatedGames.map((game, index) => (
                <TrackedGameLink
                  key={game.href}
                  href={game.href}
                  gameHref={game.href}
                  gameTitle={game.title}
                  trackingSource={`${adPlacement}_related`}
                  trackingPosition={index + 1}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedMedia}>{renderGameImage(game.img, game.alt)}</div>
                  <div className={styles.relatedBody}>
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>
                  </div>
                </TrackedGameLink>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </PageShell>
  );
}
