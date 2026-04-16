import type { Metadata } from "next";
import GameStructuredData from "../_components/GameStructuredData";
import SpiderClient from "./SpiderClient";

export const metadata: Metadata = {
  title: "Spider Solitaire",
  description:
    "Play Spider Solitaire online for free with multiple difficulty levels, undo support, and redeal mechanics—perfect for sharpening strategy on any device.",
  alternates: {
    canonical: "https://billybobgames.org/Spider-Solitaire",
  },
};

export default function SpiderSolitairePage() {
  return (
    <>
      <GameStructuredData
        title="Spider Solitaire"
        description="Play Spider Solitaire online for free with multiple difficulty levels, undo support, and redeal mechanics—perfect for sharpening strategy on any device."
        path="/Spider-Solitaire"
        image="https://r2bucket.billybobgames.org/Spider-Solitaire/ogOjlb.webp"
      />
      <SpiderClient />
    </>
  );
}
