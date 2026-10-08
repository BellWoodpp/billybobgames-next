import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: "Game Credits and Sources",
  description: "Verified developer, source, license, and ownership notes for games and technology used by Billy Bob Games.",
  alternates: { canonical: "https://billybobgames.org/credits" },
};

export default function CreditsPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>Game Credits and Sources</h1>
          <p>
            Billy Bob Games maintains the website and browser integrations; it did not create every game in the catalog.
            This page records source information that can currently be verified from the project files or original pages.
          </p>
          <p className={styles.note}>Last reviewed: October 8, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>Verified game credits</h2>
          <dl className={styles.creditsList}>
            <div>
              <dt><Link href="/brush-jjaemu">Brush Jjaemu</Link></dt>
              <dd>
                Created by artbyeori. The archived source metadata identifies the original page as{" "}
                <a href="https://byeorisim.itch.io/brush-jjaemu" rel="noreferrer" target="_blank">byeorisim.itch.io/brush-jjaemu</a>.
              </dd>
            </div>
            <div>
              <dt><Link href="/evolve">Evolve</Link></dt>
              <dd>
                Open-source incremental game from the pmotschmann/Evolve project. The included source names{" "}
                <a href="https://pmotschmann.github.io/Evolve/" rel="noreferrer" target="_blank">pmotschmann.github.io/Evolve</a>{" "}
                as its play page and includes the Mozilla Public License 2.0.
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section}>
          <h2>Titles and rights holders</h2>
          <p>
            Names such as Pokémon, Mario, Pac-Man, Fruit Ninja, Incredibox, and other recognizable titles or characters
            belong to their respective rights holders. Billy Bob Games uses those names to identify the relevant game or
            browser experience and does not claim ownership, partnership, or endorsement.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Incomplete source records</h2>
          <p>
            Some older HTML5 bundles in the current catalog do not contain enough reliable top-level author or source
            information to publish a confident attribution. They are not assigned a guessed developer. Their provenance
            will be audited page by page, and this list will be updated when a primary source or license can be verified.
          </p>
          <p>
            If you created one of these games or can provide a primary source, contact the site with the game URL and
            supporting link. Credits can be corrected, expanded, or paired with a removal request.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Website technology</h2>
          <p>
            The website is built with Next.js and React, uses Lucide icons, and runs with Cloudflare-compatible deployment
            tooling. Individual games may include their own open-source libraries and license files inside their bundles;
            those notices remain with the relevant files.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Report a missing credit</h2>
          <div className={styles.actions}>
            <Link className={styles.actionLink} href="/contact">Contact the maintainer</Link>
            <Link className={styles.actionLink} href="/dmca">Copyright removal requests</Link>
            <Link className={styles.actionLink} href="/disclaimer">Read the disclaimer</Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
