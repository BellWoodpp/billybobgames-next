import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";

export const metadata: Metadata = {
  title: "Mouse Hit Mania - Billy Bob Games",
  description:
    "Play Mouse Hit Mania online: crush every sneaky mole, build high-score combos, and clear wave after wave of fast-paced whac-a-mole action.",
  alternates: {
    canonical: "https://billybobgames.org/mouseHit",
  },
};

export default function MouseHitPage() {
  return (
    <SimpleGamePage
      title="Mouse Hit Mania"
      subtitle="Swing the mallet, smack every rogue mole, and race the clock to keep your streak alive."
      recentlyPlayed={{
        href: "/mouseHit",
        title: "Mouse Hit Mania",
        img: "https://r2bucket.billybobgames.org/8-mouseHit/8.jpg",
      }}
      iframeSrc="/games/mouseHit/index.html"
      iframeTitle="Mouse Hit Mania Game"
      howToItems={[
        "Click the sound icon to mute or unmute, then press Play to drop into the arcade.",
        "Move the cursor to aim the hammer and click to smash moles before they burrow back down.",
        "Fill the combo bar with rapid hits to earn bonus points and unlock the next wave.",
        "Pause at any time with the top-right button, or revisit the help panel for a quick refresher.",
      ]}
    />
  );
}
