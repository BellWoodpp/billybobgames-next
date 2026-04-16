import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Billy Bob Games privacy policy to understand how we use analytics, ads, local storage, and third-party services across the site.",
  alternates: {
    canonical: "https://billybobgames.org/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>Privacy Policy</h1>
          <p>
            This Privacy Policy explains how Billy Bob Games handles information when you visit{" "}
            <Link href="/">billybobgames.org</Link>.
          </p>
          <p>Effective date: April 16, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>Information we collect</h2>
          <ul className={styles.list}>
            <li>Basic usage data such as page visits, referrers, device/browser information, and aggregated traffic trends.</li>
            <li>Recently played game data stored in your browser so we can remember games you opened on this device.</li>
            <li>Information you choose to share with us if you contact Billy Bob Games through public channels or our contact page.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Analytics and advertising</h2>
          <p>
            Billy Bob Games uses third-party services to understand site usage and support the site with advertising.
          </p>
          <ul className={styles.list}>
            <li>Google Analytics uses the measurement ID <code>G-DJ7PED4TRM</code> to help us understand visits and engagement.</li>
            <li>Ahrefs Analytics helps us measure traffic and performance trends.</li>
            <li>Google AdSense may use cookies or similar technologies to serve and measure ads.</li>
          </ul>
          <p>
            These third-party services may collect data under their own privacy policies. We recommend reviewing the privacy
            terms of Google and any other third-party provider you interact with while using the site.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Local storage and gameplay data</h2>
          <p>
            We use browser storage features such as <code>localStorage</code> for lightweight site functionality, including
            the Recently Played feature. This information stays on your device unless a game or embedded experience states
            otherwise.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Third-party content and external links</h2>
          <p>
            Some games, media assets, or supporting files may be delivered through third-party infrastructure such as CDN or
            object storage providers, including Cloudflare R2-backed asset URLs. Billy Bob Games may also link to third-party
            websites, social profiles, and creators. We are not responsible for the privacy practices of external websites.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your choices</h2>
          <ul className={styles.list}>
            <li>You can clear your browser cookies and local storage at any time through your browser settings.</li>
            <li>You can use browser privacy controls, ad controls, or extensions to limit analytics and advertising technologies.</li>
            <li>If you do not want local Recently Played data saved, clear site storage after using the site.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            If you have privacy-related questions about Billy Bob Games, visit our <Link href="/contact">Contact page</Link>.
          </p>
          <div className={styles.actions}>
            <Link className={styles.actionLink} href="/contact">Contact Billy Bob Games</Link>
            <Link className={styles.actionLink} href="/about">About Billy Bob Games</Link>
            <Link className={styles.actionLink} href="/">Homepage</Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
