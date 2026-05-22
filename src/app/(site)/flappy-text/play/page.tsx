import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import GamePlayPage from "../../_components/GamePlayPage";
import styles from "../../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Play Flappy Text",
  description: "Play Flappy Text in a dedicated game view.",
  alternates: {
    canonical: "https://billybobgames.org/flappy-text",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function FlappyTextPlayPage() {
  return (
    <GamePlayPage
      title="Flappy Text"
      subtitle="Dedicated play view."
      landingHref="/flappy-text"
      recentlyPlayed={{
        href: "/flappy-text/play",
        title: "Flappy Text",
        img: "https://r2bucket.billybobgames.org/flappy-text/3.jpg",
      }}
      analyticsHref="/flappy-text"
      iframeSrc="/games/flappy-text/index.html"
      iframeTitle="Flappy Text Game"
      allowFullScreen
      showFullscreenButton
      frameClassName={classNames(styles.gameFrameShort, styles.gameFrameLight)}
    />
  );
}
