import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Card Games",
  description:
    "Play card games on Billy Bob Games, including browser-friendly solitaire and strategy-focused card classics.",
  alternates: {
    canonical: "https://billybobgames.org/card-games",
  },
};

export default function CardGamesPage() {
  return <CategoryLandingPage slug="card-games" />;
}
