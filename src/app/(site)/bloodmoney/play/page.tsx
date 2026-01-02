import type { Metadata } from "next";

import PageShell from "../../_components/PageShell";
import GameBreadcrumb from "../../_components/GameBreadcrumb";
import RecentlyPlayedTracker from "../../_components/RecentlyPlayedTracker";
import BloodmoneyGameClient from "../BloodmoneyGameClient";
import BloodmoneyEngagementClient from "../BloodmoneyEngagementClient";
import styles from "../bloodmoney.module.css";

export const metadata: Metadata = {
  title: "Play BLOODMONEY - Billy Bob Games",
  description: "Play BLOODMONEY! in a dedicated game view.",
  alternates: {
    canonical: "https://billybobgames.org/bloodmoney",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BloodmoneyPlayPage() {
  return (
    <PageShell containerClassName={styles.fullWidth}>
      <main className={styles.wrapper}>
        <RecentlyPlayedTracker
          href="/bloodmoney/play"
          title="BLOODMONEY"
          img="https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"
        />
        <header className={styles.header}>
          <GameBreadcrumb current="BLOODMONEY" homeHref="/bloodmoney" homeLabel="Back" />
          <h1 className={styles.title}>BLOODMONEY</h1>
          <p className={styles.subtitle}>Dedicated play view.</p>
        </header>

        <section className={styles.gameShell}>
          <BloodmoneyGameClient />
        </section>

        <BloodmoneyEngagementClient />
      </main>
    </PageShell>
  );
}
