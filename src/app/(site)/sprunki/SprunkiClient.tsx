/* eslint-disable react/no-unescaped-entities, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { classNames } from "@/lib/classNames";
import PageShell from "../_components/PageShell";
import styles from "./sprunki.module.css";

export default function SprunkiClient() {
  const gameFrameRef = useRef<HTMLIFrameElement | null>(null);
  const frameObserverRef = useRef<MutationObserver | null>(null);
  // Use the browser timer type to avoid NodeJS.Timeout mismatch.
  const retryTimerRef = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resetGameFrame = () => {
    const frame = gameFrameRef.current;
    if (!frame) return;
    try {
      frame.contentWindow?.location.reload();
    } catch (error) {
      const src = frame.getAttribute("src");
      if (src) {
        frame.setAttribute("src", src);
      }
    }
  };

  const removeResetButton = (doc: Document) => {
    const existing = doc.getElementById("sprunki-reset-container");
    if (existing) {
      existing.remove();
    }
  };

  const ensureResetButton = (doc: Document) => {
    if (!doc.body) {
      if (retryTimerRef.current === null) {
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          ensureResetButton(doc);
        }, 250);
      }
      return;
    }

    let container = doc.getElementById("sprunki-reset-container") as HTMLDivElement | null;
    if (!container) {
      container = doc.createElement("div");
      container.id = "sprunki-reset-container";
      container.style.cssText = `
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        background: rgba(17, 24, 39, 0.75);
        box-shadow: 0 12px 30px -12px rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(6px);
        pointer-events: auto;
      `;
      doc.body.appendChild(container);
    }

    let button = container.querySelector("button[data-reset-style]") as HTMLButtonElement | null;
    if (!button) {
      button = doc.createElement("button");
      button.dataset.resetStyle = "true";
      button.type = "button";
      button.textContent = "Initialization";
      button.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1.5rem;
        border-radius: 9999px;
        border: 1px solid #7c3aed;
        background: linear-gradient(120deg, #7c3aed, #5b21b6);
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.95rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      `;
      button.addEventListener("mouseenter", () => {
        button?.style.setProperty("transform", "translateY(-1px)");
        button?.style.setProperty("box-shadow", "0 12px 28px -14px rgba(124, 58, 237, 0.85)");
      });
      button.addEventListener("mouseleave", () => {
        button?.style.removeProperty("transform");
        button?.style.setProperty("box-shadow", "0 10px 25px -10px rgba(76, 29, 149, 0.8)");
      });
      button.addEventListener("mousedown", () => {
        button?.style.setProperty("transform", "translateY(0)");
        button?.style.setProperty("opacity", "0.85");
      });
      button.addEventListener("mouseup", () => {
        button?.style.removeProperty("opacity");
      });
      button.addEventListener("focus", () => {
        button?.style.setProperty("box-shadow", "0 10px 25px -10px rgba(76, 29, 149, 0.8)");
      });
      button.addEventListener("blur", () => {
        button?.style.removeProperty("box-shadow");
      });
      button.addEventListener("click", resetGameFrame);
      container.appendChild(button);
    }
  };

  const attachObserver = (doc: Document) => {
    if (!doc.body) return;
    frameObserverRef.current?.disconnect();
    frameObserverRef.current = new MutationObserver(() => {
      ensureResetButton(doc);
    });
    frameObserverRef.current.observe(doc.body, { childList: true, subtree: true });
  };

  const injectResetButton = () => {
    const frame = gameFrameRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    if (!doc.body) {
      if (retryTimerRef.current === null) {
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          injectResetButton();
        }, 250);
      }
      return;
    }
    ensureResetButton(doc);
    attachObserver(doc);
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(document.fullscreenElement === gameFrameRef.current);
  };

  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    const frame = gameFrameRef.current;
    if (!frame) return;
    try {
      if (document.fullscreenElement === frame) {
        await exitFullscreen();
      } else if (frame.requestFullscreen) {
        await frame.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    if (gameFrameRef.current?.contentDocument) {
      ensureResetButton(gameFrameRef.current.contentDocument);
      attachObserver(gameFrameRef.current.contentDocument);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      frameObserverRef.current?.disconnect();
      frameObserverRef.current = null;
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (gameFrameRef.current?.contentDocument) {
        removeResetButton(gameFrameRef.current.contentDocument);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell>
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sprunki Incredibox Remix</h1>
          <p className={styles.subtitle}>
            Mix beats, layer vocals, and experiment with haunting Sprunki sounds directly in your browser.
          </p>
        </header>
        <div className={styles.gameFrameWrapper}>
          <iframe
            ref={gameFrameRef}
            className={styles.gameFrame}
            src="/games/incredibox-sprunki/index.html"
            title="Sprunki Incredibox Remix"
            allow="autoplay"
            onLoad={injectResetButton}
          />
          <button
            type="button"
            className={classNames(
              styles.fullscreenToggle,
              isFullscreen && styles.fullscreenToggleActive
            )}
            aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            onClick={toggleFullscreen}
          >
            <span aria-hidden="true">{isFullscreen ? "⤢" : "⛶"}</span>
            <span className={styles.fullscreenToggleText}>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </button>
        </div>
        <section className={styles.howToPlay} aria-label="How to play Sprunki Incredibox Remix">
          <h2>Play Tips</h2>
          <ul>
            <li>Drag a character onto the stage to activate its unique Sprunki vocal or beat.</li>
            <li>Layer different performers to build your custom horror-inspired groove.</li>
            <li>Tap each icon again to mute or remove it and reshape the vibe.</li>
            <li>Ready to share? Use the in-game controls to export or record your mix.</li>
          </ul>
        </section>
        <section className={styles.sprunkiOverview} aria-label="About Sprunki Incredibox">
          <h2>Sprunki Incredibox – A Fan-Made Mod Inspired by Incredibox</h2>
          <p>
            If you're a fan of Incredibox, you're in for a treat with Sprunki Incredibox, a fan-made mod that takes the
            creativity and music-mixing fun of the original game to new heights. At sprunki.org we're excited to introduce
            this fresh, vibrant experience that builds upon the foundation of Incredibox while adding unique flair and
            elements that make it a must-try for music lovers and gamers alike.
          </p>
          <h3>What Is Incredibox?</h3>
          <p>
            For those unfamiliar, Incredibox is a music-mixing game by So Far So Good where you combine different sound
            loops, vocals, beats, and melodies to create your own musical compositions. The game's intuitive drag-and-drop
            interface and catchy characters have made it a hit across the world, allowing users to craft tunes with ease.
          </p>
          <h3>What Makes Sprunki Incredibox Special?</h3>
          <p>
            Sprunki Incredibox takes the core elements of the original game and enhances them with new soundscapes, visuals,
            and interactive elements, first public on Srcatch. Created by dedicated fans of Incredibox, Sprunki adds new
            characters, unique beats, rhythms, and melodies, giving players even more freedom to explore their musical
            creativity.
          </p>
          <h4>Here’s why you’ll love playing Sprunki Incredibox:</h4>
          <ul>
            <li>New Music Styles: Enjoy fresh sound loops and rhythms, offering a wider variety of genres and tones to mix and match.</li>
            <li>Unique Visuals: Sprunki features new characters and animations that make the mod visually distinct and immersive.</li>
            <li>Easy to Play: Like the original, Sprunki remains simple and fun to play, making it accessible to newcomers and seasoned players alike.</li>
            <li>Creative Expression: The mod encourages endless experimentation, so you can create personalized, dynamic soundtracks every time you play.</li>
          </ul>
          <h3>How to Play Sprunki Incredibox</h3>
          <p>Playing Sprunki Incredibox is easy and fun! Here’s a quick guide:</p>
          <ul>
            <li>Choose Your Sounds: Pick from a selection of new beats, effects, melodies, and voices.</li>
            <li>Mix &amp; Match: Drag and drop your chosen sounds onto characters to start building your track.</li>
            <li>Experiment: Test different combinations to see how your sounds blend together and create your own unique music.</li>
            <li>Share Your Mix: Once you’re happy with your composition, share it with friends or save it to listen again later.</li>
          </ul>
          <h3>Why Should Play on Sprunki Incredibox mod?</h3>
          <ul>
            <li>Drag-and-drop gameplay: Simply drag and drop icons onto the beatboxers to create catchy beats and melodies.</li>
            <li>Intuitive interface: The user-friendly interface makes it easy for anyone to jump in and start creating music, regardless of musical background.</li>
            <li>Endless possibilities: Experiment with different combinations of sounds to discover your own signature style.</li>
            <li>Share your creations: Share your musical masterpieces with friends and family, or join the Sprunki community to collaborate and learn from other beatmakers.</li>
          </ul>
        </section>
      </main>
    </PageShell>
  );
}
