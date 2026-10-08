import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the independently maintained Billy Bob Games website and its browser game pages.",
  alternates: { canonical: "https://billybobgames.org/terms" },
};

export default function TermsPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>Terms of Use</h1>
          <p>These terms apply when you visit or use Billy Bob Games at <Link href="/">billybobgames.org</Link>.</p>
          <p className={styles.note}>Effective and last updated: October 8, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>About the service</h2>
          <p>
            Billy Bob Games is an independently maintained, one-person browser game collection. The site provides game
            pages, category pages, instructions, and basic site features. Availability may change when games, browsers,
            hosting services, or rights information change.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Acceptable use</h2>
          <ul className={styles.list}>
            <li>Use the site lawfully and do not try to disrupt, overload, bypass, or damage it.</li>
            <li>Do not use automated access in a way that interferes with normal visitors or ignores technical restrictions.</li>
            <li>Do not misrepresent Billy Bob Games, its maintainer, or third-party developers and rights holders.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Games, trademarks, and third-party material</h2>
          <p>
            Game names, artwork, code, music, trademarks, and other third-party material belong to their respective
            creators or rights holders. Listing a game does not transfer ownership to Billy Bob Games and does not imply
            endorsement or affiliation. See <Link href="/credits">Credits</Link> for source information currently verified.
          </p>
        </section>

        <section className={styles.section}>
          <h2>No account or purchase promise</h2>
          <p>
            The current site does not require a paid Billy Bob Games account to open its listed games. Ads or external
            links may lead to third-party services with their own terms, purchases, or account requirements.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Availability and changes</h2>
          <p>
            The site is provided on an as-available basis. A game may stop working because of browser updates, missing
            assets, third-party hosting, or maintenance. Pages, games, and these terms may be corrected, replaced, or
            removed when necessary. Material changes will be reflected by the date on this page.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Questions and rights concerns</h2>
          <p>
            Use the <Link href="/contact">Contact page</Link> for general questions and the <Link href="/dmca">DMCA page</Link>{" "}
            for copyright removal requests. Also review the <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
            <Link href="/disclaimer">Disclaimer</Link>.
          </p>
        </section>
      </main>
    </PageShell>
  );
}
