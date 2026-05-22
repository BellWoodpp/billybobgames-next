import type { Metadata } from "next";
import GameLandingPage from "../_components/GameLandingPage";

export const metadata: Metadata = {
  title: "Pac-Man",
  description:
    "Play the browser version of Pac-Man, clear each maze of pellets, dodge the ghosts, and chase high scores right inside Billy Bob Games.",
  alternates: {
    canonical: "https://billybobgames.org/pac-man",
  },
};

export default function PacManPage() {
  return (
    <GameLandingPage
      title="Pac-Man"
      subtitle="Clear the maze, dodge the ghosts, and open the cleaner play view when you want full-screen focus."
      description="Pac-Man remains one of the strongest landing-page candidates because many visitors recognize it instantly but still benefit from a clear call to action and a separate dedicated play view."
      path="/pac-man"
      image="https://r2bucket.billybobgames.org/4-pac-man/4.jpg"
      imageAlt="Pac-Man gameplay"
      playHref="/pac-man/play"
      facts={[
        "Classic maze-chase pacing with instantly understandable goals.",
        "Works well as a recognizable top-funnel landing page.",
        "Dedicated play view keeps the core session away from extra content blocks.",
      ]}
      howToItems={[
        "Use the arrow keys to guide Pac-Man through the maze and clear every pellet.",
        "Avoid the ghosts until you grab a power pellet, then turn the chase around for bonus points.",
        "Collect bonus fruit whenever it appears to push your score higher between ghost cycles.",
        "Use corners and long lanes to plan routes instead of reacting at the last possible second.",
      ]}
      detailParagraphs={[
        "Pac-Man benefits from a recognizable landing page because users often arrive with strong intent. The landing page makes the offer clear, keeps search-friendly content visible, and still moves the visitor into gameplay with one obvious action.",
        "On the business side, this is the sort of page that can carry a high-visibility manual ad slot without interrupting the actual game session. The dedicated play view then stays narrower and more focused on retention and session depth.",
      ]}
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PAC_MAN_LANDING}
      adPlacement="pac_man_landing"
    />
  );
}
