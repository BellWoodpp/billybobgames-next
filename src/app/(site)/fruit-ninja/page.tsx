import type { Metadata } from "next";
import GameLandingPage from "../_components/GameLandingPage";

export const metadata: Metadata = {
  title: "Fruit Ninja",
  description:
    "Slice through waves of flying fruit, dodge the bombs, and chase high scores in this free browser version of Fruit Ninja.",
  alternates: {
    canonical: "https://billybobgames.org/fruit-ninja",
  },
};

export default function FruitNinjaPage() {
  return (
    <GameLandingPage
      title="Fruit Ninja"
      subtitle="Slice the flying fruit, avoid the bombs, and jump into a dedicated play view when you're ready."
      description="Fruit Ninja is built for short, high-focus arcade sessions. Start from the landing page, scan the tips, then open the cleaner play screen when you want full attention on the action."
      path="/fruit-ninja"
      image="https://r2bucket.billybobgames.org/1-FruitNinja/1.jpg"
      imageAlt="Fruit Ninja gameplay"
      playHref="/fruit-ninja/play"
      facts={[
        "Fast arcade loop with immediate restarts and clean controls.",
        "Dedicated play view keeps the main game frame front and center.",
        "Works well for short sessions on desktop or mobile browsers.",
      ]}
      howToItems={[
        "Swipe or drag across the screen to slice the fruit before it falls.",
        "Avoid hitting bombs because one wrong slice ends the run immediately.",
        "Chain multiple cuts in a single swipe to earn combo points and extend momentum.",
        "Keep your movement smooth instead of frantic so you can react to bombs faster.",
      ]}
      detailParagraphs={[
        "Fruit Ninja works best when the page stays simple. That is why the landing page holds the description, ad placement, and supporting copy, while the play view focuses on the game itself.",
        "This split also gives Billy Bob Games a stronger page structure for both user flow and ad visibility. People who want context can stay here, and people who want instant action can move straight into the dedicated game screen.",
      ]}
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FRUIT_NINJA_LANDING}
      adPlacement="fruit_ninja_landing"
    />
  );
}
