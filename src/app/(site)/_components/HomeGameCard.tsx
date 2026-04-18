"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { WsrvImage } from "@/components/WsrvImage";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trackGameClick } from "@/lib/analytics";
import styles from "../styles/home.module.css";

type HomeGameCardProps = {
  href: string;
  title: string;
  img: string;
  alt: string;
  imageFit?: "cover" | "contain";
  newUntil?: string;
  previewVideo?: string;
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
  previewVideo,
  trackingSource = "home_game_grid",
  trackingPosition,
}: HomeGameCardProps) {
  const isLocalImage = img.startsWith("/");
  const [isLoaded, setIsLoaded] = useState(() => !isLocalImage);
  const [now, setNow] = useState(() => Date.now());
  const [isPreviewRequested, setIsPreviewRequested] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasPreviewVideo = Boolean(previewVideo);
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

  const stopPreview = useCallback(() => {
    setIsPreviewActive(false);

    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  }, []);

  const startPreview = useCallback(() => {
    if (!hasPreviewVideo) return;

    setIsPreviewRequested(true);
    setIsPreviewActive(true);
  }, [hasPreviewVideo]);

  const trackClick = useCallback(() => {
    trackGameClick({
      href,
      title,
      placement: trackingSource,
      position: trackingPosition,
    });
  }, [href, title, trackingPosition, trackingSource]);

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
              src={isPreviewRequested ? previewVideo : undefined}
              tabIndex={-1}
              onLoadedData={() => setIsPreviewReady(true)}
              onError={() => {
                setIsPreviewReady(false);
                setIsPreviewActive(false);
              }}
            />
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
