import type { Metadata } from "next";
import GamePlayPage from "../../_components/GamePlayPage";

export const metadata: Metadata = {
  title: "Play Pac-Man",
  description: "Play Pac-Man in a dedicated game view.",
  alternates: {
    canonical: "https://billybobgames.org/pac-man",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PacManPlayPage() {
  return (
    <GamePlayPage
      title="Pac-Man"
      subtitle="Dedicated play view."
      landingHref="/pac-man"
      recentlyPlayed={{
        href: "/pac-man/play",
        title: "Pac-Man",
        img: "https://r2bucket.billybobgames.org/4-pac-man/4.jpg",
      }}
      analyticsHref="/pac-man"
      iframeSrc="/games/pac-man/index.html"
      iframeTitle="Pac-Man Game"
      allowFullScreen
      showFullscreenButton
    />
  );
}
