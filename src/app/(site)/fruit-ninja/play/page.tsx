import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import GamePlayPage from "../../_components/GamePlayPage";
import styles from "../../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Play Fruit Ninja",
  description: "Play Fruit Ninja in a dedicated game view.",
  alternates: {
    canonical: "https://billybobgames.org/fruit-ninja",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function FruitNinjaPlayPage() {
  return (
    <GamePlayPage
      title="Fruit Ninja"
      subtitle="Dedicated play view."
      landingHref="/fruit-ninja"
      recentlyPlayed={{
        href: "/fruit-ninja/play",
        title: "Fruit Ninja",
        img: "https://r2bucket.billybobgames.org/1-FruitNinja/1.jpg",
      }}
      analyticsHref="/fruit-ninja"
      iframeSrc="/games/fruit-ninja/index.html"
      iframeTitle="Fruit Ninja Game"
      allowFullScreen
      showFullscreenButton
      frameClassName={classNames(styles.gameFrameShort, styles.gameFrameLight)}
    />
  );
}
