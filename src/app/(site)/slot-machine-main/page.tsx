import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";
import GameEditorialContent from "../_components/GameEditorialContent";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "HTML5 Slot Machine – Five-Reel Browser Demo",
  description:
    "Try a free five-reel HTML5 slot-machine demo with Spin and Autoplay controls. No account, deposits, real-money betting, prizes, or cash-out.",
  alternates: {
    canonical: "https://billybobgames.org/slot-machine-main",
  },
};

export default function SlotMachinePage() {
  return (
    <SimpleGamePage
      title="HTML5 Slot Machine"
      subtitle="Test a five-reel Web Animations demo with manual Spin and optional Autoplay—using no real money."
      recentlyPlayed={{
        href: "/slot-machine-main",
        title: "HTML5 Slot Machine",
        img: "https://r2bucket.billybobgames.org/10-slot-machine-main/10.png",
      }}
      iframeSrc="/games/slot-machine-main/index.html"
      iframeTitle="HTML5 Slot Machine Game"
      allowFullScreen
      showFullscreenButton
      showRelatedGames={false}
      creatorName="Johannes Kronmüller"
      creatorUrl="https://github.com/johakr/html5-slot-machine"
      howToItems={[
        <>
          Press <kbd className={styles.kbd}>Spin</kbd> to set all five reels in motion.
        </>,
        <>
          Enable <kbd className={styles.kbd}>Autoplay</kbd> to keep the reels spinning automatically.
        </>,
        "Uncheck Autoplay to stop the automatic sequence after the current spin finishes.",
        "The symbols are randomized for demonstration only; there are no bets, balances, prizes, or cash-out.",
      ]}
      extraContent={
        <GameEditorialContent
          title="HTML5 Slot Machine"
          introduction={[
            "This page runs Johannes Kronmüller's open-source HTML5 Slot Machine, a lightweight proof of concept built with plain JavaScript, CSS, and the Web Animations API.",
            "It demonstrates staggered reel movement and randomized symbols. The jackpot label is visual decoration: this build has no wagering system, player balance, payout calculation, account, or real-money feature.",
          ]}
          controls={[
            "Spin button: animate all five reels once.",
            "Autoplay checkbox: start another spin shortly after the reels stop.",
            "Uncheck Autoplay to end the repeating sequence after the active spin.",
          ]}
          goal="Explore the reel animation and generate new five-reel symbol arrangements. This is an interactive technical demo, not a gambling service or a scored casino game."
          desktopCompatibility="Works in current desktop browsers that support the Web Animations API. A wider window makes all five reels easier to see."
          mobileCompatibility="The upstream layout is responsive and the buttons accept touch input. Landscape orientation is best on narrow screens."
          troubleshooting={[
            "If the reels are blank, reload and wait for the bundled SVG symbols and JavaScript to load.",
            "If Spin does nothing, disable a script blocker for this page and try a current browser.",
            "If Autoplay will not stop immediately, uncheck it and allow the current reel animation to finish.",
            "This demo has no sound. A silent spin is expected and is not an audio failure.",
          ]}
          screenshots={[
            {
              src: "https://r2bucket.billybobgames.org/10-slot-machine-main/10.png",
              alt: "HTML5 Slot Machine five reels with Spin and Autoplay controls",
              width: 1141,
              height: 689,
              caption: "The running five-reel demo with its two available controls.",
            },
          ]}
          attribution={{
            developer: "Johannes Kronmüller",
            developerUrl: "https://github.com/johakr",
            source: "johakr/html5-slot-machine (MIT License)",
            sourceUrl: "https://github.com/johakr/html5-slot-machine",
            note: "Billy Bob Games hosts a browser build of the open-source project and does not claim to be its developer.",
          }}
          lastTested="October 9, 2026"
          relatedGames={[
            { href: "/html5demo7", title: "Fish Joy Reloaded" },
            { href: "/html5-xxl", title: "HTML5 City Match" },
            { href: "/fruit-ninja", title: "Fruit Ninja" },
            { href: "/pac-man", title: "Pac-Man" },
          ]}
        />
      }
    />
  );
}
