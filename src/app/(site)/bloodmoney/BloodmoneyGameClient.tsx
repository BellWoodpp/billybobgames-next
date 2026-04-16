"use client";

// 游戏壳

import GameFrameWithControls from "../_components/GameFrameWithControls";
import styles from "./bloodmoney.module.css";

type BloodmoneyGameClientProps = {
  src?: string;
  title?: string;
  allow?: string;
};

export default function BloodmoneyGameClient({
  src = "/games/bloodmoney/index.html",
  title = "BLOODMONEY Game",
  allow = "autoplay; fullscreen",
}: BloodmoneyGameClientProps) {
  return (
    <GameFrameWithControls
      iframeSrc={src}
      iframeTitle={title}
      allow={allow}
      allowFullScreen
      loading="lazy"
      showFullscreenButton
      frameContainerClassName={styles.gameFrameWrapper}
      frameClassName={styles.gameFrame}
    />
  );
}
