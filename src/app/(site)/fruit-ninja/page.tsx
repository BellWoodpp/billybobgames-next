import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Fruit Ninja - Billy Bob Games",
  description:
    "Slice through waves of flying fruit, dodge the bombs, and chase high scores in this free browser version of Fruit Ninja.",
  alternates: {
    canonical: "https://billybobgames.org/fruit-ninja",
  },
};

export default function FruitNinjaPage() {
  return (
    <SimpleGamePage
      title="Fruit Ninja"
      subtitle="Slice the flying fruit and avoid the bombs."
      iframeSrc="/games/fruit-ninja/index.html"
      iframeTitle="Fruit Ninja Game"
      frameClassName={classNames(styles.gameFrameShort, styles.gameFrameLight)}
      howToItems={[
        "Swipe or drag across the screen to slice the fruit before it falls.",
        "Avoid hitting bombs—one wrong slice ends your run.",
        "Chain multiple cuts in a single swipe to earn combo points.",
        "Keep slicing to build your score and chase new personal bests.",
      ]}
    />
  );
}
