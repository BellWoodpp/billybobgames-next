import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Arcade Games",
  description:
    "Explore arcade games on Billy Bob Games. Play fast, free browser games with instant action, simple controls, and no downloads.",
  alternates: {
    canonical: "https://billybobgames.org/arcade-games",
  },
};

export default function ArcadeGamesPage() {
  return <CategoryLandingPage slug="arcade-games" />;
}
