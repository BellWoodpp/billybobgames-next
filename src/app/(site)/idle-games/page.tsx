import type { Metadata } from "next";
import CategoryLandingPage from "../_components/CategoryLandingPage";

export const metadata: Metadata = {
  title: "Idle Games",
  description:
    "Browse idle games on Billy Bob Games and enjoy incremental progression, automation, and long-term upgrades directly in your browser.",
  alternates: {
    canonical: "https://billybobgames.org/idle-games",
  },
};

export default function IdleGamesPage() {
  return <CategoryLandingPage slug="idle-games" />;
}
