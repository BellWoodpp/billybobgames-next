import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";
import GameEditorialContent from "../_components/GameEditorialContent";
import styles from "../styles/game-page.module.css";

export const metadata: Metadata = {
  title: "HTML5 Mario – Infinite Mario Browser Port",
  description:
    "Play Robert Kleffner's Infinite Mario HTML5 port in your browser. Use Arrow keys to move, S to jump or dash, and A to run or fire.",
  alternates: {
    canonical: "https://billybobgames.org/html5-mario",
  },
};

export default function Html5MarioPage() {
  return (
    <SimpleGamePage
      title="HTML5 Mario"
      subtitle="Play the HTML5 port of Infinite Mario with keyboard controls, generated levels, coins, enemies, and power-ups."
      recentlyPlayed={{
        href: "/html5-mario",
        title: "HTML5 Mario",
        img: "https://r2bucket.billybobgames.org/6-html5-mario/6.jpg",
      }}
      iframeSrc="/games/html5-mario/index.html"
      iframeTitle="HTML5 Mario Game"
      allowFullScreen
      showFullscreenButton
      compatibilityNotice="Desktop keyboard required: this build has no on-screen touch controls, so phones and tablets can view it but cannot play reliably."
      showRelatedGames={false}
      creatorName="Robert Kleffner"
      creatorUrl="https://github.com/robertkleffner/mariohtml5"
      operatingSystem="Desktop operating system with a physical keyboard and modern web browser"
      gamePlatform={["Desktop Web Browser"]}
      howToItems={[
        "Use the arrow keys to move left or right and to enter doors or pipes when the level allows it.",
        <>
          Press <kbd className={styles.kbd}>S</kbd> to jump; hold it longer for a higher jump. The game also uses S for
          the dash action.
        </>,
        <>
          Hold <kbd className={styles.kbd}>A</kbd> to run. When Mario has fire power, A also launches a fireball.
        </>,
        "Stomp enemies, collect coins and power-ups, avoid pits, and keep moving toward the level exit.",
      ]}
      extraContent={
        <GameEditorialContent
          title="HTML5 Mario"
          introduction={[
            "HTML5 Mario is Robert Kleffner's JavaScript and Canvas port of Infinite Mario. It adapts the Java version by Markus Persson into a browser demo with generated platforming stages.",
            "The locally hosted build uses the original keyboard scheme shown above the canvas. It is an unofficial open-source tribute and is not a Nintendo release.",
          ]}
          controls={[
            "Left / Right Arrow: move.",
            "Up / Down Arrow: interact with supported level entrances.",
            "S: jump or dash; hold for a higher jump.",
            "A: run, carry shells, or fire when the fire-flower power-up is active.",
          ]}
          goal="Cross each generated platforming stage without losing all lives. Collect coins and power-ups, avoid pits and enemies, and reach the exit so the next level can load."
          desktopCompatibility="Playable in a desktop browser with a physical keyboard. Click inside the game once if the page does not immediately capture key presses."
          mobileCompatibility="Not supported by this build because it has no on-screen touch controls and depends on Arrow, A, and S keys."
          troubleshooting={[
            "If the canvas stays black, reload and wait for the image and audio assets to initialize.",
            "If Mario does not move, click inside the game and then use the Arrow keys; make sure focus is not in the browser address bar.",
            "If sound is silent, interact with the game first. Some music formats in this older port may not work in every modern browser.",
            "If the canvas is cropped, use fullscreen or reset browser zoom to 100 percent.",
          ]}
          screenshots={[
            {
              src: "https://r2bucket.billybobgames.org/6-html5-mario/6.jpg",
              alt: "HTML5 Mario title screen inside the browser canvas",
              width: 534,
              height: 449,
              caption: "The actual title screen rendered by the locally hosted HTML5 port.",
            },
          ]}
          attribution={{
            developer: "Robert Kleffner (HTML5 port)",
            developerUrl: "https://github.com/robertkleffner",
            source: "robertkleffner/mariohtml5 (Unlicense)",
            sourceUrl: "https://github.com/robertkleffner/mariohtml5",
            note: "The upstream README states that this JavaScript version was ported from Markus Persson's Java Infinite Mario project. Mario remains a Nintendo property; Billy Bob Games is not affiliated with Nintendo.",
          }}
          lastTested="October 9, 2026"
          relatedGames={[
            { href: "/pac-man", title: "Pac-Man" },
            { href: "/html5-fly", title: "HTML5 Fly" },
            { href: "/fruit-ninja", title: "Fruit Ninja" },
            { href: "/flappy-text", title: "Flappy Text" },
          ]}
        />
      }
    />
  );
}
