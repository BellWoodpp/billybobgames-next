import type { Metadata } from "next";
import GameStructuredData from "../_components/GameStructuredData";
import SprunkiClient from "./SprunkiClient";

export const metadata: Metadata = {
  title: "Sprunki Incredibox Remix",
  description:
    "Play the Sprunki Incredibox remix online. Drag-and-drop singers, layer eerie beats, and craft a horror-themed soundtrack right inside Billy Bob Games.",
  alternates: {
    canonical: "https://billybobgames.org/sprunki",
  },
};

export default function SprunkiPage() {
  return (
    <>
      <GameStructuredData
        title="Sprunki Incredibox Remix"
        description="Play the Sprunki Incredibox remix online. Drag-and-drop singers, layer eerie beats, and craft a horror-themed soundtrack right inside Billy Bob Games."
        path="/sprunki"
        image="https://r2bucket.billybobgames.org/sprunki/sprunki.webp"
      />
      <SprunkiClient />
    </>
  );
}
