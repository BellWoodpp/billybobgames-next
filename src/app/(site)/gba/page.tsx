import type { Metadata } from "next";
import GbaClient from "./GbaClient";

export const metadata: Metadata = {
  title: "Pokémon FireRed",
  description:
    "Billy Bob Games loads Pokémon FireRed instantly in the browser and still lets you switch to your own local .gba files.",
  alternates: {
    canonical: "https://billybobgames.org/gba",
  },
  openGraph: {
    title: "Pokémon FireRed | Billy Bob Games",
    description:
      "Play Pokémon FireRed instantly in your browser, or switch to your own local .gba file.",
    url: "https://billybobgames.org/gba",
    type: "website",
  },
};

export default function GbaPage() {
  return <GbaClient />;
}
