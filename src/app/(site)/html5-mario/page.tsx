import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";

export const metadata: Metadata = {
  title: "HTML5 Mario - Billy Bob Games",
  description:
    "Run, jump, and stomp Goombas in this HTML5 tribute to classic Mario platforming—play directly in your browser at Billy Bob Games.",
  alternates: {
    canonical: "https://billybobgames.org/html5-mario",
  },
};

export default function Html5MarioPage() {
  return (
    <SimpleGamePage
      title="HTML5 Mario"
      subtitle="Dash through colorful worlds, stomp enemies, and collect coins in this browser-friendly Mario adventure."
      recentlyPlayed={{
        href: "/html5-mario",
        title: "HTML5 Mario",
        img: "https://r2bucket.billybobgames.org/6-html5-mario/6.jpg",
      }}
      iframeSrc="/games/html5-mario/index.html"
      iframeTitle="HTML5 Mario Game"
      howToItems={[
        "Use the arrow keys to move and jump; combine them to clear tricky gaps.",
        "Collect coins, hit blocks, and avoid enemies to keep your run alive.",
        "Grab power-ups to grow, throw fireballs, or gain temporary invincibility.",
        "Time your jumps over pits and onto platforms to reach the goal flag.",
      ]}
    />
  );
}
