import type { Metadata } from "next";
import SpiderClient from "./SpiderClient";

export const metadata: Metadata = {
  title: "Spider Solitaire - Billy Bob Games",
  description:
    "Play Spider Solitaire online for free with multiple difficulty levels, undo support, and redeal mechanics—perfect for sharpening strategy on any device.",
  alternates: {
    canonical: "https://billybobgames.org/Spider-Solitaire",
  },
};

export default function SpiderSolitairePage() {
  return <SpiderClient />;
}
