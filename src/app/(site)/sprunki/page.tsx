import type { Metadata } from "next";
import SprunkiClient from "./SprunkiClient";

export const metadata: Metadata = {
  title: "Sprunki Incredibox Remix - Billy Bob Games",
  description:
    "Play the Sprunki Incredibox remix online. Drag-and-drop singers, layer eerie beats, and craft a horror-themed soundtrack right inside Billy Bob Games.",
  alternates: {
    canonical: "https://billybobgames.org/sprunki",
  },
};

export default function SprunkiPage() {
  return <SprunkiClient />;
}
