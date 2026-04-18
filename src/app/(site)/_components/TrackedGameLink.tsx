"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackGameClick } from "@/lib/analytics";

type LinkHref = ComponentProps<typeof Link>["href"];

type TrackedGameLinkProps = ComponentProps<typeof Link> & {
  gameTitle: string;
  gameHref?: string;
  trackingSource: string;
  trackingPosition?: number;
};

function hrefToString(href: LinkHref) {
  if (typeof href === "string") return href;
  return href.pathname || "";
}

export default function TrackedGameLink({
  gameTitle,
  gameHref,
  trackingSource,
  trackingPosition,
  onClick,
  href,
  ...props
}: TrackedGameLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const trackedHref = gameHref || hrefToString(href);
    if (!trackedHref) return;

    trackGameClick({
      href: trackedHref,
      title: gameTitle,
      placement: trackingSource,
      position: trackingPosition,
    });
  };

  return <Link {...props} href={href} onClick={handleClick} />;
}
