import Link from "next/link";
import type { ReactNode } from "react";
import { WsrvImage } from "@/components/WsrvImage";
import styles from "./game-editorial-content.module.css";

type Screenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

type RelatedGame = {
  href: string;
  title: string;
};

type Attribution = {
  developer: string;
  developerUrl?: string;
  source: string;
  sourceUrl?: string;
  note?: string;
};

type GameEditorialContentProps = {
  title: string;
  introduction: string[];
  controls: string[];
  goal: string;
  desktopCompatibility: string;
  mobileCompatibility: string;
  troubleshooting: string[];
  screenshots: Screenshot[];
  attribution: Attribution;
  lastTested: string;
  relatedGames: RelatedGame[];
  warning?: string;
};

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function GameEditorialContent({
  title,
  introduction,
  controls,
  goal,
  desktopCompatibility,
  mobileCompatibility,
  troubleshooting,
  screenshots,
  attribution,
  lastTested,
  relatedGames,
  warning,
}: GameEditorialContentProps) {
  return (
    <div className={styles.editorial}>
      <section className={styles.section} aria-labelledby="game-overview-heading">
        <h2 id="game-overview-heading">About {title}</h2>
        {introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {warning ? <p className={styles.warning}>{warning}</p> : null}
      </section>

      <div className={styles.twoColumnGrid}>
        <section className={styles.section} aria-labelledby="controls-heading">
          <h2 id="controls-heading">Controls</h2>
          <ul>
            {controls.map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="goal-heading">
          <h2 id="goal-heading">Goal</h2>
          <p>{goal}</p>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="compatibility-heading">
        <h2 id="compatibility-heading">Desktop and mobile compatibility</h2>
        <dl className={styles.compatibilityList}>
          <div>
            <dt>Desktop</dt>
            <dd>{desktopCompatibility}</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd>{mobileCompatibility}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="troubleshooting-heading">
        <h2 id="troubleshooting-heading">Black screen, sound, or loading problems</h2>
        <ol>
          {troubleshooting.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="screenshots-heading">
        <h2 id="screenshots-heading">Gameplay screenshots</h2>
        <div className={styles.gallery}>
          {screenshots.map((screenshot) => (
            <figure key={screenshot.src}>
              <WsrvImage
                src={screenshot.src}
                alt={screenshot.alt}
                width={screenshot.width}
                height={screenshot.height}
                sizes="(min-width: 900px) 420px, 92vw"
                layout="constrained"
              />
              <figcaption>{screenshot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="source-heading">
        <h2 id="source-heading">Developer, source, and test status</h2>
        <dl className={styles.factList}>
          <div>
            <dt>Developer</dt>
            <dd>
              {attribution.developerUrl ? (
                <ExternalLink href={attribution.developerUrl}>{attribution.developer}</ExternalLink>
              ) : (
                attribution.developer
              )}
            </dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              {attribution.sourceUrl ? (
                <ExternalLink href={attribution.sourceUrl}>{attribution.source}</ExternalLink>
              ) : (
                attribution.source
              )}
            </dd>
          </div>
          <div>
            <dt>Last tested</dt>
            <dd>{lastTested}</dd>
          </div>
        </dl>
        {attribution.note ? <p className={styles.note}>{attribution.note}</p> : null}
      </section>

      <section className={styles.section} aria-labelledby="related-games-heading">
        <h2 id="related-games-heading">Related games</h2>
        <nav className={styles.relatedLinks} aria-label={`Games related to ${title}`}>
          {relatedGames.map((game) => (
            <Link key={game.href} href={game.href}>
              {game.title}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
