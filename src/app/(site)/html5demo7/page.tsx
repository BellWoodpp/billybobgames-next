import type { Metadata } from "next";
import { classNames } from "@/lib/classNames";
import SimpleGamePage from "../_components/SimpleGamePage";
import GameEditorialContent from "../_components/GameEditorialContent";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "Fish Joy Reloaded – Free HTML5 Fishing Game",
  description:
    "Play Fish Joy Reloaded online. Aim the cannon, choose one of seven power levels, catch fish, and manage your coin balance in this HTML5 arcade game.",
  alternates: {
    canonical: "https://billybobgames.org/html5demo7",
  },
};

export default function Html5Demo7Page() {
  return (
    <SimpleGamePage
      title="Fish Joy Reloaded"
      subtitle="Aim the seabed cannon, spend coins on each shot, and catch moving fish before they leave the screen."
      recentlyPlayed={{
        href: "/html5demo7",
        title: "Fish Joy Reloaded",
        img: "https://r2bucket.billybobgames.org/9-html5demo7/9.jpg",
      }}
      iframeSrc="/games/fishjoy/index.html"
      iframeTitle="Fish Joy Reloaded Game"
      allowFullScreen
      showFullscreenButton
      showRelatedGames={false}
      frameWrapperClassName={styles.gameShell}
      frameClassName={styles.gameFrameWide}
      wrapperClassName={styles.wrapperWide}
      titleClassName={styles.titleLarge}
      subtitleClassName={styles.subtitleLarge}
      howToTitle="Gameplay Tips"
      howToClassName={styles.howToPlaySpacious}
      howToTitleClassName={styles.howToPlayTitleLarge}
      howToListClassName={classNames(styles.howToPlayListSpacious)}
      howToItems={[
        "Click or tap a point in the water to aim and fire one bullet.",
        "Use the minus and plus buttons beside the cannon to switch between seven power levels.",
        "Every shot costs the same number of coins as the selected cannon level.",
        "Larger fish award more coins but have a lower capture chance, so choose targets carefully.",
      ]}
      extraContent={
        <GameEditorialContent
          title="Fish Joy Reloaded"
          introduction={[
            "Fish Joy Reloaded is a compact canvas fishing game built with the Quark.js engine. Fish cross the aquarium in different patterns while your cannon turns toward the point you select.",
            "This version keeps the original risk-and-reward loop: stronger shots cost more coins, while rare large fish are harder to catch and return a larger reward.",
          ]}
          controls={[
            "Mouse: point at the water and click to fire.",
            "Touchscreen: tap the water to aim and fire.",
            "Minus / plus buttons: lower or raise cannon power through seven levels.",
          ]}
          goal="Keep your coin balance alive by choosing a sensible cannon level and catching fish. Small fish are safer targets; sharks carry the largest rewards and the lowest capture rates."
          desktopCompatibility="Playable in current desktop browsers with a mouse. Fullscreen gives the fixed-size aquarium more room."
          mobileCompatibility="Touch input is supported. Landscape orientation is recommended so the entire aquarium and cannon controls remain visible."
          troubleshooting={[
            "If the aquarium stays black, reload once and wait for the image assets to finish loading.",
            "If sound is silent, tap or click inside the game first; browsers block audio until the first interaction.",
            "If the game is cropped on a phone, rotate to landscape or use the fullscreen button above.",
            "If fish or buttons do not appear, disable a strict content blocker for this page and reload.",
          ]}
          screenshots={[
            {
              src: "https://r2bucket.billybobgames.org/9-html5demo7/9.jpg",
              alt: "Fish Joy Reloaded aquarium with fish, cannon, and coin counter",
              width: 532,
              height: 371,
              caption: "The live aquarium view, including the cannon controls and coin counter.",
            },
          ]}
          attribution={{
            developer: "Original developer not identified in the bundled files",
            source: "d4vucat/Fish-Joy source archive",
            sourceUrl: "https://github.com/d4vucat/Fish-Joy",
            note: "The linked archive matches the locally hosted Quark.js game structure. Billy Bob Games does not claim authorship; attribution corrections are welcome.",
          }}
          lastTested="October 9, 2026"
          relatedGames={[
            { href: "/fruit-ninja", title: "Fruit Ninja" },
            { href: "/mouseHit", title: "Mouse Hit Mania" },
            { href: "/html5-fly", title: "HTML5 Fly" },
            { href: "/pac-man", title: "Pac-Man" },
          ]}
        />
      }
    />
  );
}
