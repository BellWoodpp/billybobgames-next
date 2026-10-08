import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";
import { siteIdentity } from "@/lib/site";

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
            Games, email the independent maintainer directly.
          </p>
          <a className={styles.emailLink} href={`mailto:${siteIdentity.contactEmail}`}>
            {siteIdentity.contactEmail}
          </a>
          <p className={styles.note}>Last reviewed: October 8, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>What to include</h2>
          <ul className={styles.list}>
            <li>Include the exact page URL if you are reporting a broken game or layout issue.</li>
            <li>For a game suggestion, include the original developer or source page and any known hosting permission.</li>
            <li>For copyright or trademark concerns, identify the protected work and the exact URL. See the <Link href="/dmca">DMCA page</Link> for the full checklist.</li>
            <li>For business requests, identify yourself and explain the proposed collaboration. The site does not sell ratings or fabricated endorsements.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>About this contact address</h2>
          <p>
            Messages sent to this Billy Bob Games address are forwarded through the domain&apos;s mail routing service to
            the independent maintainer. The address is for incoming contact; it does not promise replies from the same address.
          </p>
          <p>Please do not send passwords, payment-card details, or other sensitive personal information.</p>
        </section>

        <section className={styles.section}>
          <h2>Helpful links</h2>
          <div className={styles.actions}>
            <Link className={styles.actionLink} href="/about">About Billy Bob Games</Link>
            <Link className={styles.actionLink} href="/privacy-policy">Privacy Policy</Link>
            <Link className={styles.actionLink} href="/">Homepage</Link>
            <Link className={styles.actionLink} href="/arcade-games">Arcade Games</Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
