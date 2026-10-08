import type { Metadata } from "next";
import GameStructuredData from "../_components/GameStructuredData";
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
  return (
    <>
      <GameStructuredData
        title="Pokémon FireRed"
        description="Play Pokémon FireRed in your browser, review the controls, and use browser save, export, and import tools to protect your progress."
        path="/fire-red"
        image="https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/GBA-Red/red-image.jpeg"
        operatingSystem="Desktop operating system with a modern web browser"
        gamePlatform={["Desktop Web Browser", "Game Boy Advance emulator"]}
      />
      <GbaClient />
    </>
  );
}
