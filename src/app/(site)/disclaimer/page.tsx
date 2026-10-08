import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Independence, third-party ownership, availability, advertising, and external-link disclosures for Billy Bob Games.",
  alternates: { canonical: "https://billybobgames.org/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>Disclaimer</h1>
          <p>This disclosure explains the limits and independent status of Billy Bob Games.</p>
          <p className={styles.note}>Last updated: October 8, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>Independent website</h2>
          <p>
            This version of Billy Bob Games is independently maintained by one person. It is not presented as the original
            or official site of a separate Billy Bob Games project. Unless a page explicitly says otherwise, it is also not
            the official website of a listed game, developer, publisher, console maker, or storefront. A game listing does
            not imply sponsorship or endorsement.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Third-party names and content</h2>
          <p>
            Game titles, characters, artwork, audio, trademarks, and other third-party materials remain the property of
            their respective creators and rights holders. Billy Bob Games does not claim authorship of a game merely by
            making a browser page available. Verified source information is published on the <Link href="/credits">Credits page</Link>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Technical availability</h2>
          <p>
            Browser games can break or behave differently because of browser versions, device limits, blocked storage,
            network filtering, missing assets, or third-party service changes. The site does not guarantee uninterrupted
            access, compatibility with every device, preservation of local saves, or freedom from every software error.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Advertising, analytics, and external links</h2>
          <p>
            The site may display third-party advertising, use analytics, and link to external websites. An ad or link is
            not automatically a recommendation. External sites control their own content, security, purchases, and privacy
            practices. See the <Link href="/privacy-policy">Privacy Policy</Link> for the services currently disclosed.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Corrections</h2>
          <p>
            If a page attributes a game incorrectly, contains an inaccurate claim, or should be removed, please use the{" "}
            <Link href="/contact">Contact page</Link> or the <Link href="/dmca">DMCA page</Link>. Corrections are preferred
            over invented certainty when source information is incomplete.
          </p>
        </section>
      </main>
    </PageShell>
  );
}
