"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { WsrvImage } from "@/components/WsrvImage";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trackGameClick } from "@/lib/analytics";
import styles from "../styles/home.module.css";

export type HomeGamePreviewSource = {
  src: string;
  type: "video/webm" | "video/mp4";
};

type HomeGameCardProps = {
  href: string;
  title: string;
  img: string;
  alt: string;
  imageFit?: "cover" | "contain";
  newUntil?: string;
  previewSources?: HomeGamePreviewSource[];
  trackingSource?: string;
  trackingPosition?: number;
};

export default function HomeGameCard({
  href,
  title,
  img,
  alt,
  imageFit = "cover",
  newUntil,
  previewSources,
  trackingSource = "home_game_grid",
  trackingPosition,
}: HomeGameCardProps) {
  const isLocalImage = img.startsWith("/");
  const [isLoaded, setIsLoaded] = useState(() => !isLocalImage);
  const [now, setNow] = useState(() => Date.now());
  const [canPreview, setCanPreview] = useState(false);
  const [isPreviewRequested, setIsPreviewRequested] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewDelayTimeoutRef = useRef<number | null>(null);
  const hasPreviewVideo = canPreview && Boolean(previewSources?.length);
  const shouldShowPreview = hasPreviewVideo && isPreviewReady && isPreviewActive;
  const imageClassName = `${styles.otherGameCardImage} ${imageFit === "contain" ? styles.otherGameCardImageContain : ""} ${shouldShowPreview ? styles.otherGameCardImagePreviewHidden : isLoaded ? styles.otherGameCardImageVisible : styles.otherGameCardImageHidden} absolute inset-0 h-full w-full`;
  const previewClassName = `${styles.otherGameCardPreview} ${imageFit === "contain" ? styles.otherGameCardPreviewContain : ""} ${shouldShowPreview ? styles.otherGameCardPreviewVisible : styles.otherGameCardPreviewHidden}`;
  const newUntilTimestamp = useMemo(() => {
    if (!newUntil) return Number.NaN;
    return new Date(newUntil).getTime();
  }, [newUntil]);
  const showNewBadge = Number.isFinite(newUntilTimestamp) && now < newUntilTimestamp;

  useEffect(() => {
    if (!Number.isFinite(newUntilTimestamp) || now >= newUntilTimestamp) return;

    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, Math.max(newUntilTimestamp - Date.now(), 0));

    return () => window.clearTimeout(timeoutId);
  }, [newUntilTimestamp, now]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncCanPreview = () => {
      setCanPreview(hoverMediaQuery.matches);
    };

    syncCanPreview();

    if (typeof hoverMediaQuery.addEventListener === "function") {
      hoverMediaQuery.addEventListener("change", syncCanPreview);
      return () => {
        hoverMediaQuery.removeEventListener("change", syncCanPreview);
      };
    }

    hoverMediaQuery.addListener(syncCanPreview);
    return () => {
      hoverMediaQuery.removeListener(syncCanPreview);
    };
  }, []);

  useEffect(() => {
    if (!hasPreviewVideo || !isPreviewRequested) return;

    const video = videoRef.current;
    if (!video) return;

    video.load();
  }, [hasPreviewVideo, isPreviewRequested]);

  useEffect(() => {
    if (!hasPreviewVideo || !isPreviewRequested || !isPreviewReady || !isPreviewActive) return;

    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIsPreviewActive(false);
      });
    }
  }, [hasPreviewVideo, isPreviewActive, isPreviewReady, isPreviewRequested]);

  const clearPreviewDelay = useCallback(() => {
    if (previewDelayTimeoutRef.current === null) return;

    window.clearTimeout(previewDelayTimeoutRef.current);
    previewDelayTimeoutRef.current = null;
  }, []);

  const stopPreview = useCallback(() => {
    clearPreviewDelay();
    setIsPreviewActive(false);

    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  }, [clearPreviewDelay]);

  const startPreview = useCallback(() => {
    if (!hasPreviewVideo) return;

    clearPreviewDelay();
    previewDelayTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewRequested(true);
      setIsPreviewActive(true);
      previewDelayTimeoutRef.current = null;
    }, 400);
  }, [clearPreviewDelay, hasPreviewVideo]);

  const trackClick = useCallback(() => {
    trackGameClick({
      href,
      title,
      placement: trackingSource,
      position: trackingPosition,
    });
  }, [href, title, trackingPosition, trackingSource]);

  useEffect(() => {
    if (canPreview) return;

    stopPreview();
  }, [canPreview, stopPreview]);

  useEffect(() => clearPreviewDelay, [clearPreviewDelay]);

  return (
    <div className={styles.otherGameCardWrap}>
      {showNewBadge ? (
        <span className={styles.otherGameCardBadge}>
          <Sparkles aria-hidden="true" className={styles.otherGameCardBadgeIcon} />
          <span className={styles.otherGameCardBadgeLabel}>New</span>
        </span>
      ) : null}
      <Link
        className={styles.otherGameCard}
        href={href}
        prefetch={false}
        onClick={trackClick}
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
        onFocus={startPreview}
        onBlur={stopPreview}
      >
        <div className={styles.otherGameCardMedia}>
          <Skeleton
            aria-hidden="true"
            className={`${styles.otherGameCardSkeleton} ${isLoaded ? styles.otherGameCardSkeletonHidden : ""}`}
          />
          {hasPreviewVideo ? (
            <video
              ref={videoRef}
              aria-hidden="true"
              className={previewClassName}
              disablePictureInPicture
              loop
              muted
              playsInline
              preload="metadata"
              tabIndex={-1}
              onLoadedData={() => setIsPreviewReady(true)}
              onError={() => {
                setIsPreviewReady(false);
                setIsPreviewActive(false);
              }}
            >
              {isPreviewRequested
                ? previewSources?.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))
                : null}
            </video>
          ) : null}
          {isLocalImage ? (
            <Image
              className={imageClassName}
              src={img}
              alt={alt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)}
            />
          ) : (
            <WsrvImage
              className={imageClassName}
              src={img}
              alt={alt}
              layout="fullWidth"
              aspectRatio={16 / 9}
              unstyled
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)}
            />
          )}
        </div>
        <div className={styles.otherGameCardBody}>
          <h3 className={styles.otherGameCardTitle}>{title}</h3>
        </div>
      </Link>
    </div>
  );
}
