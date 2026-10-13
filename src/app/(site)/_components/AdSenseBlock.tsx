"use client";

import { useEffect, useRef } from "react";
import { classNames } from "@/lib/classNames";
import styles from "../styles/adsense.module.css";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseBlockProps = {
  slot?: string;
  placement: string;
  className?: string;
  minHeight?: number;
};

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-6581885234407347";
const isDevelopment = process.env.NODE_ENV !== "production";
const previewEnabled = isDevelopment || process.env.NEXT_PUBLIC_ADSENSE_PREVIEW === "1";

export default function AdSenseBlock({
  slot,
  placement,
  className,
  minHeight = 280,
}: AdSenseBlockProps) {
  const requestedRef = useRef(false);
  const shouldPreview = !slot && previewEnabled;

  useEffect(() => {
    if (!slot || shouldPreview || requestedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      requestedRef.current = true;
    } catch {
      requestedRef.current = false;
    }
  }, [shouldPreview, slot]);

  if (!slot && !shouldPreview) {
    return null;
  }

  return (
    <section className={classNames(styles.root, className)} aria-label="Advertisement">
      <div className={styles.labelRow}>
        <span className={styles.label}>Advertisement</span>
      </div>
      {shouldPreview ? (
        <div className={styles.preview} style={{ minHeight }}>
          <strong>Responsive Ad Preview</strong>
          <span>{placement}</span>
          <p>
            Add a real slot with <code>NEXT_PUBLIC_ADSENSE_SLOT_*</code> to render live AdSense here.
          </p>
        </div>
      ) : (
        <div className={styles.liveShell} style={{ minHeight }}>
          <ins
            className={classNames("adsbygoogle", styles.slot)}
            style={{ display: "block" }}
            data-ad-client={adsenseClient}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={isDevelopment ? "on" : undefined}
          />
        </div>
      )}
    </section>
  );
}
