"use client";

import { useEffect } from "react";
import { addRecentlyPlayed } from "@/lib/recentlyPlayed";

type RecentlyPlayedTrackerProps = {
  href: string;
  title: string;
  img?: string;
};

export default function RecentlyPlayedTracker({ href, title, img }: RecentlyPlayedTrackerProps) {
  useEffect(() => {
    addRecentlyPlayed({ href, title, img });
  }, [href, title, img]);

  return null;
}

