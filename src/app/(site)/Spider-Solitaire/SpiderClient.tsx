/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { classNames } from "@/lib/classNames";
import PageShell from "../_components/PageShell";
import styles from "./spider.module.css";

type GameInstance = {
  createCard?: (...args: unknown[]) => unknown;
  cardList?: Record<string, unknown>;
};

const dealSoundUrl =
  "https://r2bucket.billybobgames.org/Spider-Solitaire/sound/%E6%89%91%E5%85%8B%E5%8F%91%E7%89%8C%E9%9F%B3%E6%95%88.mp3";
const backgroundMusicUrl = "https://r2bucket.billybobgames.org/Spider-Solitaire/sound/BGM.mp3";

export default function SpiderClient() {
  const gameFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const dealAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const deckCardObserverRef = useRef<MutationObserver | null>(null);
  const deckCardsWithListener = useRef(new Set<HTMLDivElement>());
  const hookCleanupFnsRef = useRef<Array<() => void>>([]);
  const hookRetryTimerRef = useRef<number | null>(null);
  const patchedInstancesRef = useRef(new WeakSet<object>());
  const bgmUnlockHandlerRef = useRef<(() => void) | null>(null);
  const lastDealSoundAtRef = useRef(0);

  const getNow = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const handleFullscreenChange = () => {
    setIsFullscreen(document.fullscreenElement === gameFrameRef.current);
  };

  const playDealSound = () => {
    if (isMuted) return;
    lastDealSoundAtRef.current = getNow();
    const audio = dealAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

  const registerDeckCards = (doc: Document) => {
    const cards = Array.from(doc.querySelectorAll<HTMLDivElement>(".card"));
    cards.forEach((card) => {
      if (typeof (card as unknown as { onclick?: unknown }).onclick === "function" && !deckCardsWithListener.current.has(card)) {
        card.addEventListener("click", playDealSound, { passive: true });
        deckCardsWithListener.current.add(card);
      }
    });
  };

  const observeDeckCards = (doc: Document) => {
    registerDeckCards(doc);
    deckCardObserverRef.current?.disconnect();
    deckCardObserverRef.current = new MutationObserver((mutations) => {
      let hasNewCard = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (hasNewCard) return;
          if (node instanceof HTMLElement) {
            if (node.classList.contains("card")) {
              hasNewCard = true;
            } else if (node.querySelector(".card")) {
              hasNewCard = true;
            }
          }
        });
      });
      if (hasNewCard && getNow() - lastDealSoundAtRef.current > 600) {
        playDealSound();
      }
      registerDeckCards(doc);
    });
    deckCardObserverRef.current.observe(doc.body, { childList: true, subtree: true });
  };

  const setupDealAudio = () => {
    if (!dealAudioRef.current) {
      const audio = new Audio(dealSoundUrl);
      audio.volume = isMuted ? 0 : 1;
      audio.preload = "auto";
      audio.load();
      dealAudioRef.current = audio;
    } else {
      dealAudioRef.current.volume = isMuted ? 0 : 1;
    }
  };

  const setupBackgroundMusic = () => {
    if (!bgmAudioRef.current) {
      const audio = new Audio(backgroundMusicUrl);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = isMuted ? 0 : 0.4;
      audio.load();
      bgmAudioRef.current = audio;
    } else {
      bgmAudioRef.current.volume = isMuted ? 0 : 0.4;
    }
  };

  const removeBgmUnlockListeners = () => {
    const handler = bgmUnlockHandlerRef.current;
    if (!handler) return;
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
    bgmUnlockHandlerRef.current = null;
  };

  const requestBackgroundMusicPlayback = () => {
    const audio = bgmAudioRef.current;
    if (!audio || isMuted) return;
    audio.play()
      .then(() => {
        removeBgmUnlockListeners();
      })
      .catch(() => {
        if (!bgmUnlockHandlerRef.current) {
          const handler = () => requestBackgroundMusicPlayback();
          bgmUnlockHandlerRef.current = handler;
          window.addEventListener("pointerdown", handler);
          window.addEventListener("keydown", handler);
        }
      });
  };

  const getGameInstance = (): GameInstance | null => {
    const frame = gameFrameRef.current;
    if (!frame) return null;
    try {
      const rootEl = frame.contentDocument?.getElementById("app") as (HTMLElement & { __vue__?: GameInstance }) | null;
      return rootEl?.__vue__ ?? null;
    } catch (error) {
      return null;
    }
  };

  const patchGameInstance = (instance: GameInstance) => {
    if (!instance || patchedInstancesRef.current.has(instance)) return;
    const { createCard } = instance;
    if (typeof createCard === "function") {
      const originalCreateCard = createCard.bind(instance);
      instance.createCard = (...args: unknown[]) => {
        playDealSound();
        return originalCreateCard(...args);
      };
      hookCleanupFnsRef.current.push(() => {
        instance.createCard = originalCreateCard;
      });
    }
    const dealtCardCount = typeof instance.cardList === "object" ? Object.keys(instance.cardList ?? {}).length : 0;
    if (dealtCardCount > 0) {
      playDealSound();
    }
    patchedInstancesRef.current.add(instance);
  };

  const attemptHookGameInstance = () => {
    const instance = getGameInstance();
    if (instance) {
      hookRetryTimerRef.current = null;
      patchGameInstance(instance);
      return;
    }
    hookRetryTimerRef.current = window.setTimeout(attemptHookGameInstance, 250);
  };

  const initializeGameAudioBridge = () => {
    const frame = gameFrameRef.current;
    if (!frame) return;
    let doc: Document | null = null;
    try {
      doc = frame.contentDocument || frame.contentWindow?.document || null;
    } catch (error) {
      doc = null;
    }
    if (!doc || !doc.body) return;
    setupDealAudio();
    setupBackgroundMusic();
    observeDeckCards(doc);
    attemptHookGameInstance();
    requestBackgroundMusicPlayback();
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

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    setupBackgroundMusic();
    requestBackgroundMusicPlayback();
    if (gameFrameRef.current?.contentDocument?.readyState === "complete") {
      initializeGameAudioBridge();
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      deckCardObserverRef.current?.disconnect();
      deckCardsWithListener.current.forEach((card) => {
        card.removeEventListener("click", playDealSound);
      });
      deckCardsWithListener.current.clear();
      if (dealAudioRef.current) {
        dealAudioRef.current.pause();
        dealAudioRef.current = null;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
      removeBgmUnlockListeners();
      if (hookRetryTimerRef.current) {
        window.clearTimeout(hookRetryTimerRef.current);
        hookRetryTimerRef.current = null;
      }
      hookCleanupFnsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error("Failed to clean up hook:", error);
        }
      });
      hookCleanupFnsRef.current = [];
    };
  }, []);

  const onGameLoaded = () => {
    initializeGameAudioBridge();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (dealAudioRef.current) {
        dealAudioRef.current.volume = next ? 0 : 1;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.volume = next ? 0 : 0.4;
        if (!next) {
          requestBackgroundMusicPlayback();
        }
      }
      return next;
    });
  };

  return (
    <PageShell containerClassName={styles.containerWide}>
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Spider Solitaire</h1>
          <p className={styles.subtitle}>
            Test your patience and strategy in this classic take on Spider Solitaire—play instantly in your browser.
          </p>
        </header>
        <section className={styles.gameShell} aria-label="Spider Solitaire game container">
          <div className={styles.gameFrameWrapper}>
            <button
              type="button"
              className={styles.audioToggle}
              aria-pressed={isMuted}
              aria-label={isMuted ? "取消静音" : "静音页面音效"}
              onClick={toggleMute}
            >
              <span aria-hidden="true">{isMuted ? "🔇" : "🔊"}</span>
            </button>
            <iframe
              ref={gameFrameRef}
              className={styles.gameFrame}
              src="/games/spider-solitaire/index.html"
              title="Spider Solitaire Game"
              allowFullScreen
              onLoad={onGameLoaded}
            />
            <button
              type="button"
              className={classNames(styles.fullscreenBtn, isFullscreen && styles.fullscreenBtnActive)}
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
                className={styles.fullscreenExitBtn}
                aria-label="Return to page"
                onClick={exitFullscreen}
              >
                Return
              </button>
            ) : null}
          </div>
          <p className={styles.gameHint}>
            If the game does not appear right away, refresh the page or wait for the assets to finish loading.
          </p>
        </section>
        <section className={styles.howToPlay} aria-label="How to play Spider Solitaire">
          <h2>How to Play Tips</h2>
          <ul>
            <li>Choose one-, two-, or four-suit difficulty from the menu to set your challenge level.</li>
            <li>Arrange thirteen cards of the same suit from King down to Ace to clear an entire column.</li>
            <li>Stuck? Deal a new row from the upper-right deck—just make sure every column holds at least one card.</li>
            <li>Use Undo to rewind a move, fix mistakes, or explore a better strategy.</li>
          </ul>
        </section>
      </main>
    </PageShell>
  );
}
