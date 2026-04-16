import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "About Billy Bob Games",
  },
  description:
    "Learn about Billy Bob Games, our browser-first gaming focus, and how we curate free unblocked games for quick, accessible play.",
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
            Billy Bob Games is a browser-first game website focused on fast-loading, free-to-play experiences that work
            across modern devices with no installs and no paywalls.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What we publish</h2>
          <p>
            We curate lightweight arcade games, idle games, music experiments, card games, and puzzle games so players
            can jump in quickly and enjoy a stable experience directly in the browser.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What matters to us</h2>
          <ul className={styles.list}>
            <li>Fast access with no download barrier.</li>
            <li>Clear page structure so players can find the right game type quickly.</li>
            <li>Practical game pages with instructions, previews, and responsive play areas.</li>
            <li>Consistent updates that keep Billy Bob Games easy to browse and trust.</li>
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
