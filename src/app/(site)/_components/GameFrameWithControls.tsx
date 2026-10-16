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

const ENGAGEMENT_MILESTONES = [15, 60, 180] as const;
const GAME_BRIDGE_EVENTS = new Set([
  "game_round_start",
  "game_first_move",
  "game_round_complete",
  "game_round_restart",
  "game_round_abandon",
  "game_error",
]);
const GAME_BRIDGE_PARAM_VALUES = {
  mode: new Set<string>(["offline_ai", "offline_human", "ai_vs_ai"]),
  outcome: new Set<string>(["win", "draw"]),
  reason: new Set<string>(["script_error", "unhandled_rejection"]),
} as const;

function currentDeviceType() {
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  if (window.innerWidth < 768) return "mobile";
  if (coarsePointer && window.innerWidth < 1180) return "tablet";
  return "desktop";
}

function normalizedInteractionType(eventName: string) {
  if (eventName === "keydown") return "keyboard";
  if (eventName === "touchstart") return "touch";
  if (eventName === "wheel") return "wheel";
  return "pointer";
}

function exitBucket(activeTimeSec: number) {
  if (activeTimeSec < 15) return "under_15s";
  if (activeTimeSec < 60) return "15_to_59s";
  if (activeTimeSec < 180) return "60_to_179s";
  return "180s_plus";
}

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
  const engagementMilestonesRef = useRef(new Set<number>());
  const frameLoadStartedAtRef = useRef(0);
  const loadedAttemptRef = useRef(-1);
  const fullscreenAnalyticsStateRef = useRef(false);
  const sessionEndedRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const sessionStartedAtRef = useRef(0);
  const sessionPagePathRef = useRef<string | null>(null);
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const [isWideMode, setIsWideMode] = useState(false);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [isFrameSlow, setIsFrameSlow] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const gameId = analyticsGame?.gameId;
  const gameName = analyticsGame?.gameName;
  const gamePath = analyticsGame?.gamePath;

  useEffect(() => {
    frameLoadStartedAtRef.current = Date.now();
  }, []);

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

  const startGameSession = useCallback((interactionType: string) => {
    if (sessionStartedRef.current) return;
    sessionPagePathRef.current = window.location.pathname + window.location.search;

    const baseParams = buildAnalyticsParams();
    if (!baseParams) return;

    const now = Date.now();
    activeDurationMsRef.current = 0;
    activeStartedAtRef.current = document.visibilityState === "visible" ? now : null;
    heartbeatCountRef.current = 0;
    interactionCountRef.current = 0;
    engagementMilestonesRef.current.clear();
    lastInteractionAtRef.current = 0;
    sessionEndedRef.current = false;
    sessionStartedAtRef.current = now;
    sessionStartedRef.current = true;

    trackAnalyticsEvent("game_start", {
      ...baseParams,
      input_type: interactionType,
      device_type: currentDeviceType(),
      load_attempt: loadAttempt + 1,
    });
  }, [buildAnalyticsParams, loadAttempt]);

  const endGameSession = useCallback(
    (beacon = false) => {
      const baseParams = buildAnalyticsParams();
      if (!baseParams || !sessionStartedRef.current || sessionEndedRef.current) return;

      sessionEndedRef.current = true;
      const timing = collectSessionTiming(true);
      const durationBucket = exitBucket(timing.active_time_sec);

      trackAnalyticsEvent(
        `game_exit_${durationBucket}`,
        {
          ...baseParams,
          ...timing,
          interaction_count: interactionCountRef.current,
        },
        { beacon },
      );

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

  const noteGameInteraction = useCallback((eventName: string) => {
    const interactionType = normalizedInteractionType(eventName);
    startGameSession(interactionType);

    const now = Date.now();
    if (now - lastInteractionAtRef.current < 250) return;

    lastInteractionAtRef.current = now;
    interactionCountRef.current += 1;
  }, [startGameSession]);

  const attachGameInteractionListeners = useCallback(() => {
    frameListenerCleanupRef.current?.();

    const targets: EventTarget[] = [];

    try {
      const frame = localIframeRef.current;
      if (frame?.contentWindow) targets.push(frame.contentWindow);
      if (frame?.contentDocument) targets.push(frame.contentDocument);
    } catch {}

    const eventNames = ["pointerdown", "keydown", "touchstart", "wheel"];
    const listener: EventListener = (event) => noteGameInteraction(event.type);
    const options: AddEventListenerOptions = { capture: true, passive: true };
    const messageListener = (event: MessageEvent) => {
      const frame = localIframeRef.current;
      if (!frame?.contentWindow || event.source !== frame.contentWindow) return;

      const data = event.data as { source?: unknown; name?: unknown; params?: unknown } | null;
      if (!data || data.source !== "billybob-game-analytics" || typeof data.name !== "string") return;
      if (!GAME_BRIDGE_EVENTS.has(data.name)) return;

      const baseParams = buildAnalyticsParams();
      if (!baseParams) return;
      const params: Record<string, string> = {};
      if (data.params && typeof data.params === "object") {
        for (const key of Object.keys(GAME_BRIDGE_PARAM_VALUES) as Array<keyof typeof GAME_BRIDGE_PARAM_VALUES>) {
          const value = (data.params as Record<string, unknown>)[key];
          if (typeof value === "string" && GAME_BRIDGE_PARAM_VALUES[key].has(value)) params[key] = value;
        }
      }

      trackAnalyticsEvent(data.name, { ...baseParams, ...params });
      if (data.name === "game_round_start" && params.mode) {
        trackAnalyticsEvent(`game_mode_${params.mode}`, baseParams);
      }
    };

    targets.forEach((target) => {
      eventNames.forEach((eventName) => {
        target.addEventListener(eventName, listener, options);
      });
    });
    window.addEventListener("message", messageListener);

    frameListenerCleanupRef.current = () => {
      targets.forEach((target) => {
        eventNames.forEach((eventName) => {
          target.removeEventListener(eventName, listener, options);
        });
      });
      window.removeEventListener("message", messageListener);
    };
  }, [buildAnalyticsParams, noteGameInteraction]);

  const setIframeElement = useCallback(
    (node: HTMLIFrameElement | null) => {
      localIframeRef.current = node;

      assignForwardedIframeRef(iframeRef, node);
    },
    [iframeRef],
  );

  const handleFrameLoad: ReactEventHandler<HTMLIFrameElement> = useCallback(
    (event) => {
      setIsFrameLoading(false);
      setIsFrameSlow(false);
      if (loadedAttemptRef.current !== loadAttempt) {
        loadedAttemptRef.current = loadAttempt;
        const baseParams = buildAnalyticsParams();
        if (baseParams) {
          trackAnalyticsEvent("game_loaded", {
            ...baseParams,
            device_type: currentDeviceType(),
            load_attempt: loadAttempt + 1,
            load_time_ms: frameLoadStartedAtRef.current
              ? Math.max(0, Date.now() - frameLoadStartedAtRef.current)
              : 0,
          });
        }
      }
      attachGameInteractionListeners();
      onLoad?.(event);
    },
    [attachGameInteractionListeners, buildAnalyticsParams, loadAttempt, onLoad],
  );

  const handleFrameError = useCallback(() => {
    const baseParams = buildAnalyticsParams();
    if (!baseParams) return;
    trackAnalyticsEvent("game_load_error", {
      ...baseParams,
      load_attempt: loadAttempt + 1,
    });
  }, [buildAnalyticsParams, loadAttempt]);

  useEffect(() => {
    if (!isFrameLoading) return;

    const frame = localIframeRef.current;
    if (!frame) return;

    try {
      // A small same-origin game can finish before React hydrates and attaches
      // its onLoad listener. Re-dispatch load so the loading shield never traps
      // an already playable frame.
      if (frame.contentDocument?.readyState === "complete") {
        frame.dispatchEvent(new Event("load"));
      }
    } catch {
      // Cross-origin frames still rely on their normal load event.
    }
  }, [isFrameLoading, loadAttempt]);

  useEffect(() => {
    if (!isFrameLoading) return;

    const slowTimer = window.setTimeout(() => {
      setIsFrameSlow(true);
      const baseParams = buildAnalyticsParams();
      if (baseParams) {
        trackAnalyticsEvent("game_load_slow", {
          ...baseParams,
          load_attempt: loadAttempt + 1,
          threshold_sec: 12,
        });
      }
    }, 12_000);
    return () => window.clearTimeout(slowTimer);
  }, [buildAnalyticsParams, isFrameLoading, loadAttempt]);

  const retryFrameLoad = useCallback(() => {
    const baseParams = buildAnalyticsParams();
    if (baseParams) {
      trackAnalyticsEvent("game_load_retry", {
        ...baseParams,
        previous_attempt: loadAttempt + 1,
      });
    }
    frameLoadStartedAtRef.current = Date.now();
    setIsFrameLoading(true);
    setIsFrameSlow(false);
    setLoadAttempt((attempt) => attempt + 1);
  }, [buildAnalyticsParams, loadAttempt]);

  const getFullscreenElement = useCallback(() => {
    const fullscreenDocument = document as FullscreenDocument;

    return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;
  }, []);

  const syncFullscreenState = useCallback(() => {
    const fullscreenElement = getFullscreenElement();
    const isFullscreen = fullscreenElement === frameRef.current;

    if (fullscreenAnalyticsStateRef.current !== isFullscreen) {
      fullscreenAnalyticsStateRef.current = isFullscreen;
      const baseParams = buildAnalyticsParams();
      if (baseParams) trackAnalyticsEvent(isFullscreen ? "game_fullscreen_enter" : "game_fullscreen_exit", baseParams);
    }

    setIsGameFullscreen(isFullscreen);
  }, [buildAnalyticsParams, getFullscreenElement]);

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

    const sendEngagementMilestones = () => {
      const baseParams = buildAnalyticsParams();
      if (!baseParams || !sessionStartedRef.current || document.visibilityState !== "visible") return;

      const timing = collectSessionTiming();
      for (const threshold of ENGAGEMENT_MILESTONES) {
        if (timing.active_time_sec < threshold || engagementMilestonesRef.current.has(threshold)) continue;
        engagementMilestonesRef.current.add(threshold);
        trackAnalyticsEvent(`game_engaged_${threshold}s`, {
          ...baseParams,
          ...timing,
          interaction_count: interactionCountRef.current,
        });
      }
    };

    const handlePageHide = () => {
      endGameSession(true);
    };

    const heartbeatInterval = window.setInterval(sendHeartbeat, 30_000);
    const milestoneInterval = window.setInterval(sendEngagementMilestones, 5_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(heartbeatInterval);
      window.clearInterval(milestoneInterval);
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
    setIsWideMode((current) => {
      const next = !current;
      const baseParams = buildAnalyticsParams();
      if (baseParams) trackAnalyticsEvent(next ? "game_wide_mode_enter" : "game_wide_mode_exit", baseParams);
      return next;
    });
  }, [buildAnalyticsParams]);

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
      {isFrameLoading ? (
        <div className={styles.frameLoading} role="status" aria-live="polite">
          <span className={styles.frameLoadingSpinner} aria-hidden="true" />
          <strong>{isFrameSlow ? "This game is taking longer than usual" : `Loading ${iframeTitle}…`}</strong>
          <span>{isFrameSlow ? "Check your connection, or retry the game frame." : "Large games may need a few seconds."}</span>
          {isFrameSlow ? (
            <button type="button" className={styles.frameRetryButton} onClick={retryFrameLoad}>
              Retry loading
            </button>
          ) : null}
        </div>
      ) : null}
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
        key={loadAttempt}
        ref={setIframeElement}
        className={classNames(styles.gameFrame, frameClassName)}
        src={iframeSrc}
        title={iframeTitle}
        allow={allow}
        allowFullScreen={allowFullScreen}
        loading={loading}
        onLoad={handleFrameLoad}
        onError={handleFrameError}
      />
    </div>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{frameElement}</div>;
  }

  return frameElement;
}
