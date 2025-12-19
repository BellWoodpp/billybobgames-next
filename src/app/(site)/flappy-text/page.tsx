import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Flappy Text - Billy Bob Games",
  description:
    "Customize the word you fly with, tap to stay aloft, and weave through obstacles in this playful Flappy Bird-style typing challenge.",
  alternates: {
    canonical: "https://billybobgames.org/flappy-text",
  },
};

export default function FlappyTextPage() {
  return (
    <SimpleGamePage
      title="Flappy Text"
      subtitle="Type your text and fly it through the obstacles."
      iframeSrc="/games/flappy-text/index.html"
      iframeTitle="Flappy Text Game"
      frameClassName={classNames(styles.gameFrameShort, styles.gameFrameLight)}
      supportingText="Enter up to ten characters, press GO!, then tap or click to keep your text airborne."
      howToItems={[
        "Type up to ten characters and press GO! to load your custom text.",
        "Tap or click anywhere in the game frame to flap and gain altitude.",
        "Glide through the gaps between obstacles—touching walls resets your run.",
        "Experiment with different words and see how far your text can fly.",
      ]}
    />
  );
}
