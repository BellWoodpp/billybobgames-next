"use client";

import { useState } from "react";
import { WsrvImage } from "@/components/WsrvImage";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "../styles/home.module.css";

type HomeGameCardProps = {
  href: string;
  title: string;
  img: string;
  alt: string;
};

export default function HomeGameCard({ href, title, img, alt }: HomeGameCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link className={styles.otherGameCard} href={href}>
      <div className={styles.otherGameCardMedia}>
        <Skeleton
          aria-hidden="true"
          className={`${styles.otherGameCardSkeleton} ${isLoaded ? styles.otherGameCardSkeletonHidden : ""}`}
        />
        <WsrvImage
          className={`${styles.otherGameCardImage} ${isLoaded ? styles.otherGameCardImageVisible : styles.otherGameCardImageHidden} absolute inset-0 h-full w-full`}
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
      </div>
      <div className={styles.otherGameCardBody}>
        <h3 className={styles.otherGameCardTitle}>{title}</h3>
      </div>
    </Link>
  );
}
