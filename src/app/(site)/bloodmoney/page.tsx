import type { Metadata } from "next";
import GameStructuredData from "../_components/GameStructuredData";
import BloodmoneyContent from "./BloodmoneyContent";

export const metadata: Metadata = {
  title: "BLOODMONEY – Play the Horror Clicker Online",
  description:
    "Play BLOODMONEY online in your browser. Learn the controls, reach the $25,000 goal, explore three endings, and find loading or sound fixes.",
  openGraph: {
    title: "BLOODMONEY – Play the Horror Clicker Online | Billy Bob Games",
    description:
      "Play BLOODMONEY online in your browser, learn the controls, and explore a choice-driven horror clicker with three endings.",
    url: "https://billybobgames.org/bloodmoney",
    type: "website",
    images: [
      "https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLOODMONEY – Play the Horror Clicker Online | Billy Bob Games",
    description:
      "Play BLOODMONEY online in your browser, learn the controls, and explore a choice-driven horror clicker with three endings.",
    images: ["https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"],
  },
  alternates: {
    canonical: "https://billybobgames.org/bloodmoney",
  },
};

export default function BloodmoneyPage() {
  return (
    <>
      <GameStructuredData
        title="BLOODMONEY"
        description="Play BLOODMONEY!, a unique clicker horror game that combines dark humor with elements of horror. Collect $25,000 for surgery across three possible endings."
        path="/bloodmoney"
        image="https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"
        creatorName="SHROOMYCHRIST"
        creatorUrl="https://shroomychrist-studios.itch.io/bloodmoney"
      />
      <BloodmoneyContent />
    </>
  );
}
