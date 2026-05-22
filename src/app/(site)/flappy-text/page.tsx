import type { Metadata } from "next";
import GameLandingPage from "../_components/GameLandingPage";

export const metadata: Metadata = {
  title: "Flappy Text",
  description:
    "Customize the word you fly with, tap to stay aloft, and weave through obstacles in this playful Flappy Bird-style typing challenge.",
  alternates: {
    canonical: "https://billybobgames.org/flappy-text",
  },
};

export default function FlappyTextPage() {
  return (
    <GameLandingPage
      title="Flappy Text"
      subtitle="Type your own short word, then fly it through the pipes in a dedicated play screen."
      description="Flappy Text mixes a simple text input gimmick with a tight one-click arcade loop. The landing page handles the setup and supporting content, while the play page keeps the run itself uncluttered."
      path="/flappy-text"
      image="https://r2bucket.billybobgames.org/flappy-text/3.jpg"
      imageAlt="Flappy Text gameplay"
      playHref="/flappy-text/play"
      facts={[
        "Custom text gives each run a small personal twist.",
        "Very short play sessions make it good for repeat visits.",
        "The split page flow keeps the game view cleaner once the run starts.",
      ]}
      howToItems={[
        "Enter up to ten characters before pressing GO! to load your custom text.",
        "Tap or click to flap and keep your text airborne between the obstacles.",
        "Touching a pipe or falling too low resets the run, so short rhythm matters more than speed.",
        "Try different words and letter shapes to see which ones feel easiest to read while flying.",
      ]}
      detailParagraphs={[
        "Flappy Text is a good example of a page that benefits from separating content from play. Users usually need a second to understand the custom-text mechanic before they start, so the landing page gives them that orientation without crowding the game frame.",
        "From an ad and UX standpoint, this also creates a better content surface than dropping everything onto one iframe-heavy page. The player still reaches the game in one click, but the primary landing page has room for context, recommendations, and cleaner ad placement.",
      ]}
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FLAPPY_TEXT_LANDING}
      adPlacement="flappy_text_landing"
    />
  );
}
