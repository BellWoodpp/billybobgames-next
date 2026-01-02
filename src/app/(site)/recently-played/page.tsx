import type { Metadata } from "next";
import PageShell from "../_components/PageShell";
import RecentlyPlayed from "./recently-played";

export const metadata: Metadata = {
  title: "Recently Played - Billy Bob Games",
  description: "Your recently played games on Billy Bob Games.",
  alternates: {
    canonical: "https://billybobgames.org/recently-played",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RecentlyPlayedPage() {
  return (
    <PageShell>
      <RecentlyPlayed />
    </PageShell>
  );
}

