import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";

export const metadata: Metadata = {
  title: "HTML5 City Match - Billy Bob Games",
  description:
    "Match vibrant city tiles in HTML5 City Match—trigger cascading combos, unlock boosters, and chase high scores directly in your browser.",
  alternates: {
    canonical: "https://billybobgames.org/html5-xxl",
  },
};

export default function Html5XxlPage() {
  return (
    <SimpleGamePage
      title="HTML5 City Match"
      subtitle="Swap the tiles of a bustling skyline and watch cascading combos light up the board."
      iframeSrc="/games/html5-xxl/index.html"
      iframeTitle="HTML5 City Match Game"
      howToItems={[
        "Tap or click two adjacent tiles to swap them and form a line of three or more.",
        "Trigger chain reactions to earn bonus points and charge up the special meter.",
        "Watch the timer—clear objectives quickly to unlock new city districts.",
        "Use boosters wisely when you get stuck to keep your combo streak alive.",
      ]}
    />
  );
}
