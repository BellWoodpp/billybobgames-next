import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Puzzle Games",
  description:
    "Explore puzzle games on Billy Bob Games with pattern matching, careful planning, and satisfying browser-based challenges.",
  alternates: {
    canonical: "https://billybobgames.org/puzzle-games",
  },
};

export default function PuzzleGamesPage() {
  return <CategoryLandingPage slug="puzzle-games" />;
}
