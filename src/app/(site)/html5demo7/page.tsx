import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Fish Joy Reloaded - BillyBob Games",
  description:
    "In Fish Joy Reloaded, command an undersea cannon to capture dazzling fish and enjoy arcade-style combos and upgrades.",
  alternates: {
    canonical: "https://billybobgames.org/html5demo7",
  },
};

export default function Html5Demo7Page() {
  return (
    <SimpleGamePage
      title="Fish Joy Reloaded"
      subtitle="Command the deep-sea cannon, fire electric nets to catch vibrant fish shoals, and enjoy classic arcade fishing thrills."
      iframeSrc="/games/fishjoy/index.html"
      iframeTitle="Fish Joy Reloaded Game"
      frameWrapperClassName={styles.gameShell}
      frameClassName={styles.gameFrameWide}
      wrapperClassName={styles.wrapperWide}
      titleClassName={styles.titleLarge}
      subtitleClassName={styles.subtitleLarge}
      howToTitle="Gameplay Tips"
      howToClassName={styles.howToPlaySpacious}
      howToTitleClassName={styles.howToPlayTitleLarge}
      howToListClassName={classNames(styles.howToPlayListSpacious)}
      howToItems={[
        "Tap or click the water to launch the net, and drag to line up your shot in advance.",
        "Landing hits on larger fish pays more—upgrade the cannon to boost firepower.",
        "Keep combos going to earn bonus multipliers and double your coin haul.",
        "Monitor ammo and coins; smart spending keeps the high scores coming.",
      ]}
    />
  );
}
