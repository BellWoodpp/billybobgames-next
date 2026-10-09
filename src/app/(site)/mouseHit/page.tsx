import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";
import GameEditorialContent from "../_components/GameEditorialContent";

export const metadata: Metadata = {
  title: "Mouse Hit Mania – Browser Whac-a-Mole Game",
  description:
    "Play Mouse Hit Mania online. Move the hammer with your mouse, release to strike a mole, clear each timed level, and retry instantly in your browser.",
  alternates: {
    canonical: "https://billybobgames.org/mouseHit",
  },
};

export default function MouseHitPage() {
  return (
    <SimpleGamePage
      title="Mouse Hit Mania"
      subtitle="Move the hammer across a three-by-three board and release a click over a visible mole before it disappears."
      recentlyPlayed={{
        href: "/mouseHit",
        title: "Mouse Hit Mania",
        img: "https://r2bucket.billybobgames.org/8-mouseHit/8.jpg",
      }}
      iframeSrc="/games/mouseHit/index.html"
      iframeTitle="Mouse Hit Mania Game"
      allowFullScreen
      showFullscreenButton
      compatibilityNotice="Desktop mouse required: the strike action uses mouse-down and mouse-up events and is not reliable on phones or tablets."
      showRelatedGames={false}
      operatingSystem="Desktop operating system with a mouse and modern web browser"
      gamePlatform={["Desktop Web Browser"]}
      howToItems={[
        "Use the sound button if you want audio, then select Play from the title screen.",
        "Move the pointer to position the hammer over one of the nine holes.",
        "Hold the mouse button to raise the hammer, then release over a visible mole to strike.",
        "Use the pause button when you need a break; retry or return to the menu after a failed level.",
      ]}
      extraContent={
        <GameEditorialContent
          title="Mouse Hit Mania"
          introduction={[
            "Mouse Hit Mania is a self-contained HTML5 whac-a-mole game. Its canvas presents nine holes, a movable hammer, timed targets, scoring, and level transitions.",
            "The game rewards accurate releases rather than random clicking. Watch where the next mole appears, move first, and release the hammer while the target is still visible.",
          ]}
          controls={[
            "Move the mouse to position the hammer.",
            "Hold the left mouse button to prepare a strike; release to hit at the pointer position.",
            "On-screen buttons control Play, sound, pause, help, retry, and return to menu.",
          ]}
          goal="Hit enough moles before the level timer expires. Complete the current target to advance; if time runs out, use Retry and improve your reaction speed."
          desktopCompatibility="Desktop is required for reliable play because the game logic is built around mouse movement, mouse-down, and mouse-up events."
          mobileCompatibility="Not reliably supported. The canvas contains partial touch-position code, but the strike handlers are mouse-only, so phones and tablets may not register hits."
          troubleshooting={[
            "If the canvas is blank, reload and wait for the older image and audio files to finish loading.",
            "If clicking does nothing, first press Play on the title screen, then release the mouse button over a mole.",
            "If sound is missing, enable it with the top-right sound button after interacting with the page.",
            "If the board is too small or cropped, use a desktop browser and the fullscreen control.",
          ]}
          screenshots={[
            {
              src: "https://r2bucket.billybobgames.org/8-mouseHit/8.jpg",
              alt: "Mouse Hit Mania title screen with Play button and cartoon mole",
              width: 779,
              height: 543,
              caption: "The actual game title screen shown before a whac-a-mole round begins.",
            },
          ]}
          attribution={{
            developer: "Not identified in the bundled game files",
            source: "Locally hosted archived HTML5 game bundle",
            note: "No reliable original author or upstream project was found in the package. Billy Bob Games does not claim authorship; please send a verifiable attribution correction through the contact page.",
          }}
          lastTested="October 9, 2026"
          relatedGames={[
            { href: "/fruit-ninja", title: "Fruit Ninja" },
            { href: "/html5demo7", title: "Fish Joy Reloaded" },
            { href: "/pac-man", title: "Pac-Man" },
            { href: "/flappy-text", title: "Flappy Text" },
          ]}
        />
      }
    />
  );
}
