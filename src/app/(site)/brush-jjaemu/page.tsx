import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

const coverImage = "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/brush-jjaemu/brush-jjaemu.png";

export const metadata: Metadata = {
  title: "Brush Jjaemu",
  description:
    "Play Brush Jjaemu, a viral browser reflex game where you score by brushing an orange cat and lose the instant you react too slowly.",
  alternates: {
    canonical: "https://billybobgames.org/brush-jjaemu",
  },
  openGraph: {
    title: "Brush Jjaemu | Billy Bob Games",
    description:
      "Brush Jjaemu looks calm at first, but it quickly becomes a strict timing game where one late stop can end the round.",
    url: "https://billybobgames.org/brush-jjaemu",
    type: "website",
    images: [
      {
        url: coverImage,
        alt: "Brush Jjaemu angry cat artwork",
      },
    ],
  },
};

export default function BrushJjaemuPage() {
  return (
    <SimpleGamePage
      title="Brush Jjaemu"
      subtitle="A deceptively simple cat-brushing game where fast reactions matter more than long streaks."
      recentlyPlayed={{
        href: "/brush-jjaemu",
        title: "Brush Jjaemu",
        img: coverImage,
      }}
      iframeSrc="/games/brush-jjaemu/brushing-a-jjaemu/index.html"
      iframeTitle="Brush Jjaemu Game"
      allow="autoplay *; fullscreen *; gamepad; cross-origin-isolated"
      allowFullScreen
      showFullscreenButton
      frameClassName={classNames(styles.gameFrameShort, styles.gameFrameLight)}
      supportingText="Hold down and drag the brush to score. A simple tap does not count as brushing, and the warning cue is the cat switching into its turned, angry pose."
      howToItems={[
        "Press and drag the brush across the cat. Small taps or holding still will not build score or trigger the brush sound reliably.",
        "Watch Jjaemu's face, not just the score. The warning is visual: the cat changes from calm to turned and angry.",
        "Stop the instant Jjaemu pivots back toward the brush instead of squeezing in one more stroke.",
        "If you keep moving after the turn, Jjaemu bites and the ending sequence starts.",
      ]}
      extraContent={
        <>
          <section className={styles.detailSection} aria-label="What is Brush Jjaemu">
            <h2 className={styles.detailHeading}>What Is Brush Jjaemu?</h2>
            <p className={styles.detailParagraph}>
              Brush Jjaemu is a fast browser reflex game built around grooming a moody orange cat with a hairbrush.
              Scoring looks straightforward at first: hold down and drag the brush for as long as you can. The catch
              is that the session only survives if you stop the exact moment Jjaemu turns back at you.
            </p>
            <p className={styles.detailParagraph}>
              That tiny rule is what makes every attempt tense. One extra stroke, one delayed reaction, and the cat
              snaps at you. Round over.
            </p>
          </section>
          <section className={styles.detailSection} aria-label="Why Brush Jjaemu is addictive">
            <h2 className={styles.detailHeading}>Why Players Keep Coming Back</h2>
            <p className={styles.detailParagraph}>
              The hook comes from the contrast between minimal input and unforgiving timing. Each run starts off
              feeling manageable, then suddenly punishes overconfidence. Because failure happens so quickly, the game
              naturally creates a strong &quot;run it again&quot; loop.
            </p>
          </section>
          <section className={styles.detailSection} aria-label="Other names for Brush Jjaemu">
            <h2 className={styles.detailHeading}>Other Search Terms</h2>
            <p className={styles.detailParagraph}>
              Some players look for this game as &quot;brush jaime&quot; or &quot;hairbrush cat game,&quot; but they are usually
              talking about the same viral cat-brushing challenge.
            </p>
          </section>
        </>
      }
    />
  );
}
