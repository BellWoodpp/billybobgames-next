import type { Metadata } from "next";
import GbaClient from "../gba/GbaClient";

export const metadata: Metadata = {
  title: "Pokémon FireRed",
  description:
    "Billy Bob Games loads Pokémon FireRed instantly in the browser and still lets you switch to your own local .gba files.",
  alternates: {
    canonical: "https://billybobgames.org/fire-red",
  },
  openGraph: {
    title: "Pokémon FireRed | Billy Bob Games",
    description:
      "Play Pokémon FireRed instantly in your browser, or switch to your own local .gba file.",
    url: "https://billybobgames.org/fire-red",
    type: "website",
  },
};

export default function FireRedPage() {
  return <GbaClient />;
}
