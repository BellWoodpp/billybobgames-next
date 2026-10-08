import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Retro Games",
  description:
    "Play retro games on Billy Bob Games, including Pokémon FireRed, Pac-Man, and HTML5 Mario in your browser.",
  alternates: {
    canonical: "https://billybobgames.org/retro-games",
  },
};

export default function RetroGamesPage() {
  return <CategoryLandingPage slug="retro-games" />;
}
