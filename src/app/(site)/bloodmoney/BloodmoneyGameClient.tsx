"use client";

// 游戏壳

import { useEffect, useRef, useState } from "react";
import { classNames } from "@/lib/classNames";
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
  const frameWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === frameWrapperRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    const target = frameWrapperRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement === target) {
        await exitFullscreen();
      } else if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  return (
    <div ref={frameWrapperRef} className={styles.gameFrameWrapper}>
      <iframe
        className={styles.gameFrame}
        src={src}
        title={title}
        allow={allow}
        allowFullScreen
        loading="lazy"
      />
      <button
        type="button"
        className={classNames(
          styles.fullscreenButton,
          isFullscreen && styles.fullscreenButtonActive
        )}
        aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
        onClick={toggleFullscreen}
      >
        <span className={styles.fullscreenIcon} aria-hidden="true">
          {isFullscreen ? "⤢" : "⛶"}
        </span>
        <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
      </button>
      {isFullscreen ? (
        <button
          type="button"
          className={styles.fullscreenExitButton}
          aria-label="Return to page"
          onClick={exitFullscreen}
        >
          Return
        </button>
      ) : null}
    </div>
  );
}

