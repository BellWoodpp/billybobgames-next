import type { Metadata } from "next";
import BloodmoneyContent from "./BloodmoneyContent";

export const metadata: Metadata = {
  title: "BLOODMONEY - Billy Bob Games",
  description:
    "Play BLOODMONEY!, a unique clicker horror game that combines dark humor with elements of horror. Collect $25,000 for surgery across three possible endings.",
  openGraph: {
    title: "BLOODMONEY - Billy Bob Games",
    description:
      "Play BLOODMONEY!, a unique clicker horror game that combines dark humor with elements of horror. Collect $25,000 for surgery across three possible endings.",
    url: "https://billybobgames.org/bloodmoney",
    type: "website",
    images: [
      "https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLOODMONEY - Billy Bob Games",
    description:
      "Play BLOODMONEY!, a unique clicker horror game that combines dark humor with elements of horror. Collect $25,000 for surgery across three possible endings.",
    images: ["https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"],
  },
  alternates: {
    canonical: "https://billybobgames.org/bloodmoney",
  },
};

export default function BloodmoneyPage() {
  return <BloodmoneyContent />;
}
