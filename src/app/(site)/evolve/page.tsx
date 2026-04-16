import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Evolve Idle",
  description:
    "Guide a civilization from primordial ooze to a spacefaring empire in Evolve Idle, a deep incremental strategy game packed with research, jobs, and prestige layers.",
  alternates: {
    canonical: "https://billybobgames.org/evolve",
  },
};

export default function EvolvePage() {
  return (
    <SimpleGamePage
      title="Evolve Idle"
      subtitle="Grow a civilization from primordial ooze into a sprawling spacefaring empire in this deep incremental strategy game."
      recentlyPlayed={{
        href: "/evolve",
        title: "Evolve Idle",
        img: "/games/evolve/evolve.webp",
      }}
      iframeSrc="/games/evolve/Evolve/index.html"
      iframeTitle="Evolve Idle Game"
      allowFullScreen
      showFullscreenButton
      frameWrapperClassName={styles.gameShell}
      frameClassName={classNames(styles.gameFrameWide, styles.gameFrameLight)}
      wrapperClassName={styles.wrapperWide}
      titleClassName={styles.titleLarge}
      subtitleClassName={styles.subtitleLarge}
      supportingText="Build carefully, automate smartly, and keep it to one browser tab so your local save stays consistent."
      howToTitle="How to Play"
      howToClassName={styles.howToPlaySpacious}
      howToListClassName={classNames(styles.howToPlayListSpacious)}
      howToTitleClassName={styles.howToPlayTitleLarge}
      howToItems={[
        "Start by gathering food and basic resources, then unlock jobs, research, and buildings to stabilize your population.",
        "Balance growth with supply lines—overexpanding too early can crash your economy or leave key resources capped.",
        "Watch for new tabs and prestige systems as you progress; long-term upgrades are what turn slow starts into huge leaps.",
        "Check back often to remove bottlenecks, redirect workers, and choose the next research path for your civilization.",
      ]}
    />
  );
}
