import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Billy Bob Games",
  },
  description:
    "Contact Billy Bob Games for site feedback, business inquiries, and suggestions for browser games or category improvements.",
  alternates: {
    canonical: "https://billybobgames.org/contact",
  },
};

export default function ContactPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>Contact Billy Bob Games</h1>
          <p>
            If you want to report a site issue, suggest a browser game, or discuss a partnership related to Billy Bob
            Games, use the channels below.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Best contact paths</h2>
          <ul className={styles.list}>
            <li>Use our public social profiles linked in the site header for the fastest general outreach.</li>
            <li>Include the exact page URL if you are reporting a broken game or layout issue.</li>
            <li>For business requests, mention your company name and what kind of collaboration you have in mind.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Helpful links</h2>
          <div className={styles.actions}>
            <Link className={styles.actionLink} href="/about">About Billy Bob Games</Link>
            <Link className={styles.actionLink} href="/">Homepage</Link>
            <Link className={styles.actionLink} href="/arcade-games">Arcade Games</Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
