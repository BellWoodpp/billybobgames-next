import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "HTML5 Slot Machine - Billy Bob Games",
  description:
    "Spin through a galaxy of symbols with the HTML5 Slot Machine. Trigger autoplay, chase jackpots, and enjoy silky smooth animations.",
  alternates: {
    canonical: "https://billybobgames.org/slot-machine-main",
  },
};

export default function SlotMachinePage() {
  return (
    <SimpleGamePage
      title="HTML5 Slot Machine"
      subtitle="Spin five Star Wars inspired reels, trigger autoplay, and chase your next big jackpot."
      recentlyPlayed={{
        href: "/slot-machine-main",
        title: "HTML5 Slot Machine",
        img: "https://r2bucket.billybobgames.org/10-slot-machine-main/10.png",
      }}
      iframeSrc="/games/slot-machine-main/index.html"
      iframeTitle="HTML5 Slot Machine Game"
      howToItems={[
        <>
          Press <kbd className={styles.kbd}>Spin</kbd> to set all five reels in motion.
        </>,
        <>
          Enable <kbd className={styles.kbd}>Autoplay</kbd> to keep the reels spinning automatically.
        </>,
        "Watch for matching icons across the center line to hit a winning combination.",
        "Enjoy the smooth animations powered by the modern Web Animations API.",
      ]}
    />
  );
}
