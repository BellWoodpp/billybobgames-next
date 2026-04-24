"use client";

import { useCallback, useEffect, useRef, useState, type ReactEventHandler } from "react";
import GameBreadcrumb from "../_components/GameBreadcrumb";
import GameFrameWithControls from "../_components/GameFrameWithControls";
import PageShell from "../_components/PageShell";
import gameStyles from "../styles/game-page.module.css";
import styles from "./gba.module.css";

type GbaEmulatorMessage =
  | { source: "gba-emulator"; type: "gba-status"; message?: string }
  | { source: "gba-emulator"; type: "gba-status-clear" };

export default function GbaClient() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFrameLoad: ReactEventHandler<HTMLIFrameElement> = useCallback(() => {
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<GbaEmulatorMessage>) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || data.source !== "gba-emulator") return;

      if (data.type === "gba-status") {
        setErrorMessage(data.message || "The emulator hit an unexpected error.");
        return;
      }

      setErrorMessage(null);
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <PageShell>
      <main className={gameStyles.wrapperWide}>
        <header className={gameStyles.header}>
          <GameBreadcrumb current="Pokémon FireRed" />
          <h1 className={gameStyles.title}>Pokémon FireRed</h1>
          <p className={gameStyles.subtitle}>Pokémon FireRed loads automatically, so you can jump straight into Kanto.</p>
        </header>

        <section className={styles.gameSection} aria-label="Pokémon FireRed game">
          <GameFrameWithControls
            iframeRef={iframeRef}
            iframeSrc="/emulators/gba/index.html"
            iframeTitle="Pokémon FireRed"
            allow="autoplay; gamepad; fullscreen"
            allowFullScreen
            loading="eager"
            showFullscreenButton
            frameClassName={styles.gbaFrame}
            onLoad={handleFrameLoad}
          />

          {errorMessage ? (
            <p className={styles.errorStatus} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className={styles.infoGrid} aria-label="Pokémon FireRed notes">
          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>FireRed Controls</h2>
            <ul className={styles.infoList}>
              <li>
                <kbd className={styles.kbd}>Z</kbd> confirms actions, <kbd className={styles.kbd}>X</kbd> cancels actions
              </li>
              <li>
                <kbd className={styles.kbd}>Enter</kbd> opens the menu, <kbd className={styles.kbd}>Shift</kbd> works as Select
              </li>
              <li>Arrow keys move your character and the menu cursor</li>
            </ul>
          </article>

          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Your FireRed Save</h2>
            <p className={styles.infoText}>
              Pokémon FireRed streams from the configured game URL. If you switch to a local ROM instead, that file stays
              on your device and is not uploaded to the server.
            </p>
          </article>

          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>ROM Notice</h2>
            <p className={styles.infoText}>
              Play Pokémon FireRed only if you have the right to use that ROM, and only replace it with backups you are
              legally allowed to run.
            </p>
          </article>
        </section>
      </main>
    </PageShell>
  );
}
