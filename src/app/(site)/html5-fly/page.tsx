import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "HTML5 Fly - Billy Bob Games",
  description:
    "Pilot your ship through relentless enemy waves, collect upgrades, and chase high scores in the HTML5 Fly space shooter.",
  alternates: {
    canonical: "https://billybobgames.org/html5-fly",
  },
};

export default function Html5FlyPage() {
  return (
    <SimpleGamePage
      title="HTML5 Fly"
      subtitle="Take command of the starfighter, dodge enemy fire, and clear the skies."
      iframeSrc="/games/html5-fly/play.html"
      iframeTitle="HTML5 Fly Game"
      howToItems={[
        <>
          Press the arrow keys or WASD to steer the ship away from incoming fire.
        </>,
        <>
          Tap <kbd className={styles.kbd}>Z</kbd> to shoot, collect power-ups, and keep your combo rolling.
        </>,
        <>
          Hit <kbd className={styles.kbd}>P</kbd> whenever you need to pause and catch your breath.
        </>,
        "Defeat bosses and survive waves to push your high score higher.",
      ]}
    />
  );
}
