import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "About Billy Bob Games",
  },
  description:
    "Learn who runs Billy Bob Games, what the site publishes, and how this personal browser game site is updated over time.",
  alternates: {
    canonical: "https://billybobgames.org/about",
  },
};

export default function AboutPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>About Billy Bob Games</h1>
          <p>
            Billy Bob Games is an independent personal website run by one person. I focus on free, fast-loading games
            that work in modern browsers with no installs and no paywalls.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Who we are</h2>
          <p>
            Billy Bob Games is a personal project. I run the site myself, choose which games to add, write and update
            the game pages, organize category pages, and keep the site simple for people who want quick browser play.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What the site does</h2>
          <p>
            Billy Bob Games publishes free browser game pages and category pages for arcade games, idle games, music
            games, card games, and puzzle games. The main goal is to collect and keep older games online, especially
            games that are still fun to revisit in the browser, rather than chasing brand-new releases.
          </p>
        </section>

        <section className={styles.section}>
          <h2>How often we update</h2>
          <ul className={styles.list}>
            <li>Because I run the site alone and have limited time, Billy Bob Games is updated irregularly rather than on a fixed schedule.</li>
            <li>Most updates are new page cleanups, broken link fixes, and old game additions when I find something worth keeping online.</li>
            <li>The goal is to keep the site readable, playable, and useful for people looking for older browser games.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Explore the site</h2>
          <div className={styles.actions}>
            <Link className={styles.actionLink} href="/arcade-games">Arcade Games</Link>
            <Link className={styles.actionLink} href="/idle-games">Idle Games</Link>
            <Link className={styles.actionLink} href="/music-games">Music Games</Link>
            <Link className={styles.actionLink} href="/contact">Contact Billy Bob Games</Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
