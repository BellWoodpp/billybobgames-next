"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { classNames } from "@/lib/classNames";
import { trackAnalyticsEvent, type GameTrackingContext } from "@/lib/analytics";
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
  analyticsGame?: GameTrackingContext;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function assignForwardedIframeRef(ref: Ref<HTMLIFrameElement> | undefined, node: HTMLIFrameElement | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    (ref as MutableRefObject<HTMLIFrameElement | null>).current = node;
  }
}

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
  analyticsGame,
}: GameFrameWithControlsProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const localIframeRef = useRef<HTMLIFrameElement | null>(null);
  const activeDurationMsRef = useRef(0);
  const activeStartedAtRef = useRef<number | null>(null);
  const frameListenerCleanupRef = useRef<(() => void) | null>(null);
  const heartbeatCountRef = useRef(0);
  const interactionCountRef = useRef(0);
  const lastInteractionAtRef = useRef(0);
  const sessionEndedRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const sessionStartedAtRef = useRef(0);
  const sessionPagePathRef = useRef<string | null>(null);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);
  const gameId = analyticsGame?.gameId;
  const gameName = analyticsGame?.gameName;
  const gamePath = analyticsGame?.gamePath;

  const analyticsParams = useMemo(() => {
    if (!gameId || !gameName) return null;

    return {
      game_id: gameId,
      game_name: gameName,
      game_path: gamePath,
    };
  }, [gameId, gameName, gamePath]);

  const buildAnalyticsParams = useCallback(() => {
    if (!analyticsParams) return null;

    return {
      ...analyticsParams,
      iframe_src: iframeSrc,
      page_path: sessionPagePathRef.current || (window.location.pathname + window.location.search),
    };
  }, [analyticsParams, iframeSrc]);

  const collectSessionTiming = useCallback((stopActiveTimer = false) => {
    const now = Date.now();

    if (activeStartedAtRef.current !== null) {
      activeDurationMsRef.current += Math.max(0, now - activeStartedAtRef.current);
      activeStartedAtRef.current = stopActiveTimer ? null : now;
    }

    return {
      active_time_sec: Math.max(0, Math.round(activeDurationMsRef.current / 1000)),
      total_time_sec: Math.max(0, Math.round((now - sessionStartedAtRef.current) / 1000)),
    };
  }, []);

  const startGameSession = useCallback(() => {
    if (sessionStartedRef.current) return;
    sessionPagePathRef.current = window.location.pathname + window.location.search;

    const baseParams = buildAnalyticsParams();
    if (!baseParams) return;

    const now = Date.now();
    activeDurationMsRef.current = 0;
    activeStartedAtRef.current = document.visibilityState === "visible" ? now : null;
    heartbeatCountRef.current = 0;
    interactionCountRef.current = 0;
    lastInteractionAtRef.current = 0;
    sessionEndedRef.current = false;
    sessionStartedAtRef.current = now;
    sessionStartedRef.current = true;

    trackAnalyticsEvent("game_start", baseParams);
  }, [buildAnalyticsParams]);

  const endGameSession = useCallback(
    (beacon = false) => {
      const baseParams = buildAnalyticsParams();
      if (!baseParams || !sessionStartedRef.current || sessionEndedRef.current) return;

      sessionEndedRef.current = true;
      const timing = collectSessionTiming(true);

      trackAnalyticsEvent(
        "game_end",
        {
          ...baseParams,
          ...timing,
          heartbeat_count: heartbeatCountRef.current,
          interaction_count: interactionCountRef.current,
        },
        { beacon },
      );
    },
    [buildAnalyticsParams, collectSessionTiming],
  );

  const noteGameInteraction = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionAtRef.current < 250) return;

    lastInteractionAtRef.current = now;
    interactionCountRef.current += 1;
  }, []);

  const attachGameInteractionListeners = useCallback(() => {
    frameListenerCleanupRef.current?.();

    const targets: EventTarget[] = [];
    if (frameRef.current) targets.push(frameRef.current);

    try {
      const frame = localIframeRef.current;
      if (frame?.contentWindow) targets.push(frame.contentWindow);
      if (frame?.contentDocument) targets.push(frame.contentDocument);
    } catch {}

    const eventNames = ["pointerdown", "keydown", "touchstart", "wheel"];
    const listener: EventListener = () => noteGameInteraction();
    const options: AddEventListenerOptions = { capture: true, passive: true };

    targets.forEach((target) => {
      eventNames.forEach((eventName) => {
        target.addEventListener(eventName, listener, options);
      });
    });

    frameListenerCleanupRef.current = () => {
      targets.forEach((target) => {
        eventNames.forEach((eventName) => {
          target.removeEventListener(eventName, listener, options);
        });
      });
    };
  }, [noteGameInteraction]);

  const setIframeElement = useCallback(
    (node: HTMLIFrameElement | null) => {
      localIframeRef.current = node;

      assignForwardedIframeRef(iframeRef, node);
    },
    [iframeRef],
  );

  const handleFrameLoad: ReactEventHandler<HTMLIFrameElement> = useCallback(
    (event) => {
      startGameSession();
      attachGameInteractionListeners();
      onLoad?.(event);
    },
    [attachGameInteractionListeners, onLoad, startGameSession],
  );

  const getFullscreenElement = useCallback(() => {
    const fullscreenDocument = document as FullscreenDocument;

    return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;
  }, []);

  const syncFullscreenState = useCallback(() => {
    const fullscreenElement = getFullscreenElement();

    setIsGameFullscreen(fullscreenElement === frameRef.current);
  }, [getFullscreenElement]);

  useEffect(() => {
    if (!analyticsParams) return;

    const pauseActiveTimer = () => {
      collectSessionTiming(true);
    };

    const resumeActiveTimer = () => {
      if (!sessionStartedRef.current || activeStartedAtRef.current !== null) return;
      activeStartedAtRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resumeActiveTimer();
        return;
      }

      pauseActiveTimer();
    };

    const sendHeartbeat = () => {
      const baseParams = buildAnalyticsParams();
      if (!baseParams || !sessionStartedRef.current || document.visibilityState !== "visible") return;

      const timing = collectSessionTiming();
      if (timing.active_time_sec < 15) return;

      heartbeatCountRef.current += 1;
      trackAnalyticsEvent("game_heartbeat", {
        ...baseParams,
        ...timing,
        heartbeat_count: heartbeatCountRef.current,
        interaction_count: interactionCountRef.current,
      });
    };

    const handlePageHide = () => {
      endGameSession(true);
    };

    const heartbeatInterval = window.setInterval(sendHeartbeat, 30_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      frameListenerCleanupRef.current?.();
      frameListenerCleanupRef.current = null;
      endGameSession(true);
    };
  }, [analyticsParams, buildAnalyticsParams, collectSessionTiming, endGameSession]);

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
        ref={setIframeElement}
        className={classNames(styles.gameFrame, frameClassName)}
        src={iframeSrc}
        title={iframeTitle}
        allow={allow}
        allowFullScreen={allowFullScreen}
        loading={loading}
        onLoad={handleFrameLoad}
      />
    </div>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{frameElement}</div>;
  }

  return frameElement;
}
