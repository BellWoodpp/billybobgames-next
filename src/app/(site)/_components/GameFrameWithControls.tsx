"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { classNames } from "@/lib/classNames";
import styles from "../styles/game-page.module.css";

type GameFrameWithControlsProps = {
  iframeSrc: string;
  iframeTitle: string;
  allow: string;
  allowFullScreen?: boolean;
  loading?: "lazy" | "eager";
  frameClassName?: string;
  wrapperClassName?: string;
  frameContainerClassName?: string;
  iframeRef?: Ref<HTMLIFrameElement>;
  onLoad?: ReactEventHandler<HTMLIFrameElement>;
  overlayContent?: ReactNode;
  showFullscreenButton?: boolean;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function GameFullscreenGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={styles.fullscreenIcon} aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.05 10.1 4.75 8.65 8.15 3.55l1.9 6.55Zm3.9 0 1.9-6.55 3.4 5.1-5.3 1.45ZM12 13.1l3.95 6.35h-7.9L12 13.1Z"
      />
      <circle cx="12" cy="11.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function WideModeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={styles.fullscreenIcon} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M4.5 7.5V4.5h3M16.5 4.5h3v3M19.5 16.5v3h-3M7.5 19.5h-3v-3"
      />
      <rect
        x="6.75"
        y="7.25"
        width="10.5"
        height="9.5"
        rx="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function GameFrameWithControls({
  iframeSrc,
  iframeTitle,
  allow,
  allowFullScreen,
  loading,
  frameClassName,
  wrapperClassName,
  frameContainerClassName,
  iframeRef,
  onLoad,
  overlayContent,
  showFullscreenButton = false,
}: GameFrameWithControlsProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);

  const getFullscreenElement = useCallback(() => {
    const fullscreenDocument = document as FullscreenDocument;

    return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;
  }, []);

  const syncFullscreenState = useCallback(() => {
    const fullscreenElement = getFullscreenElement();

    setIsGameFullscreen(fullscreenElement === frameRef.current);
  }, [getFullscreenElement]);

  useEffect(() => {
    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);
    };
  }, [syncFullscreenState]);

  useEffect(() => {
    if (!isWideMode) {
      return;
    }

    const { overflow: bodyOverflow } = document.body.style;
    const { overflow: htmlOverflow } = document.documentElement.style;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [isWideMode]);

  const exitFullscreen = useCallback(async () => {
    const fullscreenDocument = document as FullscreenDocument;

    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }

    await fullscreenDocument.webkitExitFullscreen?.();
  }, []);

  const requestFullscreen = useCallback(async (element: FullscreenElement | null) => {
    if (!element) {
      return;
    }

    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return;
    }

    await element.webkitRequestFullscreen?.();
  }, []);

  const toggleGameFullscreen = useCallback(async () => {
    const frameElement = frameRef.current as FullscreenElement | null;
    const fullscreenElement = getFullscreenElement();

    try {
      if (fullscreenElement === frameElement) {
        await exitFullscreen();
        return;
      }

      if (fullscreenElement) {
        await exitFullscreen();
      }

      await requestFullscreen(frameElement);
    } catch {
      syncFullscreenState();
    }
  }, [exitFullscreen, getFullscreenElement, requestFullscreen, syncFullscreenState]);

  const toggleWideMode = useCallback(() => {
    setIsWideMode((current) => !current);
  }, []);

  const fullscreenSupported =
    typeof document === "undefined"
      ? true
      : Boolean(
          document.fullscreenEnabled || (document as FullscreenDocument).webkitFullscreenEnabled,
        );

  const frameElement = (
    <div
      ref={frameRef}
      className={classNames(
        styles.frameContainer,
        !isWideMode && frameContainerClassName,
        isWideMode && styles.frameContainerWideMode,
      )}
    >
      {overlayContent}
      {showFullscreenButton ? (
        <div className={styles.frameControls}>
          <button
            type="button"
            className={classNames(styles.fullscreenButton, isWideMode && styles.fullscreenButtonActive)}
            onClick={toggleWideMode}
            aria-pressed={isWideMode}
            aria-label={isWideMode ? "Exit wide mode" : "Wide mode"}
            title={isWideMode ? "Exit wide mode" : "Wide mode"}
          >
            <WideModeGlyph />
            <span className="sr-only">{isWideMode ? "Exit wide mode" : "Wide mode"}</span>
          </button>
          <button
            type="button"
            className={classNames(styles.fullscreenButton, isGameFullscreen && styles.fullscreenButtonActive)}
            onClick={toggleGameFullscreen}
            disabled={!fullscreenSupported}
            aria-pressed={isGameFullscreen}
            aria-label={isGameFullscreen ? "Exit game fullscreen" : "Game fullscreen"}
            title={isGameFullscreen ? "Exit game fullscreen" : "Game fullscreen"}
          >
            <GameFullscreenGlyph />
            <span className="sr-only">{isGameFullscreen ? "Exit game fullscreen" : "Game fullscreen"}</span>
          </button>
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        className={classNames(styles.gameFrame, frameClassName)}
        src={iframeSrc}
        title={iframeTitle}
        allow={allow}
        allowFullScreen={allowFullScreen}
        loading={loading}
        onLoad={onLoad}
      />
    </div>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{frameElement}</div>;
  }

  return frameElement;
}
