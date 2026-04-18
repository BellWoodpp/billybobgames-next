export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

export type GameTrackingContext = {
  gameId: string;
  gameName: string;
  gamePath?: string;
};

type GtagEventParams = Record<string, string | number | boolean | null>;
type Gtag = (command: "event", eventName: string, params?: GtagEventParams) => void;
type UmamiAnalytics = {
  track?: (eventName: string, eventData?: GtagEventParams) => void | Promise<void>;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    umami?: UmamiAnalytics;
  }
}

function cleanAnalyticsParams(params: AnalyticsEventParams) {
  return Object.entries(params).reduce<GtagEventParams>((cleaned, [key, value]) => {
    if (value === undefined || value === "") return cleaned;
    cleaned[key] = value;
    return cleaned;
  }, {});
}

function currentPagePath() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.pathname}${window.location.search}`;
}

function hrefPath(href: string) {
  return href.split(/[?#]/)[0] || href;
}

export function gameIdFromHref(href: string) {
  const segments = hrefPath(href)
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  return (segments[0] || "unknown-game").toLowerCase();
}

export function createGameTrackingContext(href: string, title: string): GameTrackingContext {
  return {
    gameId: gameIdFromHref(href),
    gameName: title,
    gamePath: hrefPath(href),
  };
}

export function trackAnalyticsEvent(
  eventName: string,
  params: AnalyticsEventParams = {},
  options: { beacon?: boolean } = {},
) {
  if (typeof window === "undefined") return;

  const payload = cleanAnalyticsParams({
    ...params,
    transport_type: options.beacon ? "beacon" : undefined,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  }

  try {
    void window.umami?.track?.(eventName, payload);
  } catch {}
}

export function trackGameClick({
  href,
  title,
  placement,
  position,
}: {
  href: string;
  title: string;
  placement: string;
  position?: number;
}) {
  trackAnalyticsEvent("game_click", {
    game_id: gameIdFromHref(href),
    game_name: title,
    game_path: hrefPath(href),
    placement,
    position,
    page_path: currentPagePath(),
  });
}
