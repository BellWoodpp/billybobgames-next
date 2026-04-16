import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Music Games",
  description:
    "Discover music games on Billy Bob Games. Create beats, remix sounds, and experiment with browser-based rhythm and audio play.",
  alternates: {
    canonical: "https://billybobgames.org/music-games",
  },
};

export default function MusicGamesPage() {
  return <CategoryLandingPage slug="music-games" />;
}
