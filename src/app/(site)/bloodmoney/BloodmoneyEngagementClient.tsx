"use client";

// 互动按钮（点赞/点踩/收藏）

import { useEffect, useState } from "react";
import { classNames } from "@/lib/classNames";
import styles from "./bloodmoney.module.css";

const GAME_SLUG = "bloodmoney";

export default function BloodmoneyEngagementClient() {
  const [reaction, setReaction] = useState({
    counts: { up: 0, down: 0, love: 0 },
    active: { up: false, down: false, love: false },
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/games/${GAME_SLUG}/engagement`, { cache: "no-store" });
        const json = (await res.json()) as {
          ok: boolean;
          counts?: { up: number; down: number; love: number };
          active?: { up: boolean; down: boolean; love: boolean };
        };
        if (cancelled) return;
        if (json?.ok) {
          setReaction({
            counts: json.counts ?? { up: 0, down: 0, love: 0 },
            active: json.active ?? { up: false, down: false, love: false },
          });
        } else {
          setAvailable(false);
        }
      } catch {
        if (!cancelled) setAvailable(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async (action: "toggle_up" | "toggle_down" | "toggle_collect") => {
    if (pending) return;
    if (!available) return;
    setPending(true);

    const previous = reaction;
    setReaction((prev) => {
      const counts = { ...prev.counts };
      const active = { ...prev.active };

      if (action === "toggle_up") {
        if (!active.up) {
          counts.up += 1;
          active.up = true;
          if (active.down) {
            active.down = false;
            counts.down = Math.max(0, counts.down - 1);
          }
        } else {
          active.up = false;
          counts.up = Math.max(0, counts.up - 1);
        }
      } else if (action === "toggle_down") {
        if (!active.down) {
          counts.down += 1;
          active.down = true;
          if (active.up) {
            active.up = false;
            counts.up = Math.max(0, counts.up - 1);
          }
        } else {
          active.down = false;
          counts.down = Math.max(0, counts.down - 1);
        }
      } else {
        if (!active.love) {
          counts.love += 1;
          active.love = true;
        } else {
          active.love = false;
          counts.love = Math.max(0, counts.love - 1);
        }
      }

      return { counts, active };
    });

    try {
      const res = await fetch(`/api/games/${GAME_SLUG}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        counts?: { up: number; down: number; love: number };
        active?: { up: boolean; down: boolean; love: boolean };
      };
      if (json?.ok) {
        setReaction({
          counts: json.counts ?? { up: 0, down: 0, love: 0 },
          active: json.active ?? { up: false, down: false, love: false },
        });
      }
      else {
        setAvailable(false);
        setReaction(previous);
      }
    } catch {
      setReaction(previous);
      setAvailable(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.engagement} aria-label="Engage with BLOODMONEY">
      <button
        type="button"
        className={classNames(
          styles.engagementButton,
          reaction.active.up && styles.engagementButtonActive
        )}
        onClick={() => mutate("toggle_up")}
        aria-label={reaction.active.up ? "Unlike" : "Like"}
        disabled={loading || pending || !available}
        title={!available ? "Engagement is not configured yet" : undefined}
      >
        👍<span>Like</span>
        <strong className={styles.engagementCount}>{reaction.counts.up.toLocaleString()}</strong>
      </button>

      <button
        type="button"
        className={classNames(
          styles.engagementButton,
          reaction.active.down && styles.engagementButtonActive
        )}
        onClick={() => mutate("toggle_down")}
        aria-label={reaction.active.down ? "Undislike" : "Dislike"}
        disabled={loading || pending || !available}
        title={!available ? "Engagement is not configured yet" : undefined}
      >
        👎<span>Dislike</span>
        <strong className={styles.engagementCount}>{reaction.counts.down.toLocaleString()}</strong>
      </button>

      <button
        type="button"
        className={classNames(
          styles.engagementButton,
          reaction.active.love && styles.engagementButtonActive
        )}
        onClick={() => mutate("toggle_collect")}
        aria-label={reaction.active.love ? "Uncollect" : "Collect"}
        disabled={loading || pending || !available}
        title={!available ? "Engagement is not configured yet" : undefined}
      >
        ❤️<span>Collect</span>
        <strong className={styles.engagementCount}>{reaction.counts.love.toLocaleString()}</strong>
      </button>
    </section>
  );
}
