// game-page-scaffold:v1
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameEditorialContent from "../_components/GameEditorialContent";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

const GAME_PAGE_STATUS = "published" as string;
const GAME_TITLE = "C4 – Connect Four";
const GAME_PATH = "/c4";
const GAME_IMAGE = "/images/games/c4-gameplay.png";

export const metadata: Metadata = {
  title: "C4 – Play Connect Four Against AI Online",
  description:
    "Play the English C4 Connect Four browser game against AI or another local player. Includes controls, mobile support, troubleshooting, source, and license details.",
  alternates: {
    canonical: "https://billybobgames.org/c4",
  },
};

export default function C4Page() {
  if (GAME_PAGE_STATUS !== "published") notFound();

  return (
    <SimpleGamePage
      title={GAME_TITLE}
      subtitle="Drop red and blue discs, plan ahead, and connect four before your opponent in this English browser strategy game."
      recentlyPlayed={{ href: GAME_PATH, title: GAME_TITLE, img: GAME_IMAGE }}
      iframeSrc="/games/c4/index.html"
      iframeTitle="C4 Connect Four browser game"
      allow="fullscreen"
      allowFullScreen
      showFullscreenButton
      frameClassName={styles.gameFrameWide}
      creatorName="Kenrick"
      creatorUrl="https://kenrick95.org"
      operatingSystem="Any modern desktop or mobile operating system"
      gamePlatform={["Web browser", "Desktop", "Mobile"]}
      howToItems={[
        "Choose Offline: Human player vs AI player for a solo game, or select the local two-player mode.",
        "Enter player names if you want them shown, then press Start game.",
        "Click or tap one of the seven board columns to drop a disc. Keyboard players can use number keys 1 through 7 after the turn message appears.",
        "Build a horizontal, vertical, or diagonal line of four discs before the other player does.",
      ]}
      showRelatedGames={false}
      extraContent={
        <GameEditorialContent
          title={GAME_TITLE}
          introduction={[
            "C4 is Kenrick's open-source Connect Four implementation, built with TypeScript and an HTML canvas. This hosted build keeps the verified offline modes: play against the computer, share the same device with another player, or watch two AI players compete.",
            "The board is intentionally simple and readable. Each turn consists of choosing one column; the disc falls to the lowest empty space, so winning depends on creating threats while blocking the opponent's next connection.",
          ]}
          controls={[
            "Mouse or touch: click or tap a board column to drop a disc.",
            "Keyboard: press 1 through 7 for the matching column after the turn message appears.",
            "End game: return to the mode and player-name setup dialog.",
            "Play again: restart after a completed game.",
          ]}
          goal="Be the first player to connect four discs horizontally, vertically, or diagonally. A completely filled board without a four-disc line is a draw."
          desktopCompatibility="Tested in Google Chrome 155 at a 1280-pixel desktop viewport. The English setup dialog, local two-player mode, board clicks, turn announcements, and responsive canvas all worked."
          mobileCompatibility="Tested at a 390 x 844 mobile viewport. The board stayed inside the screen and accepted tap-style input. Portrait mode works; a wider landscape view gives the status text more room."
          troubleshooting={[
            "If the game area is blank, reload once and confirm that JavaScript is allowed for billybobgames.org.",
            "Wait until the turn announcement appears before using number keys. If keyboard input is missed, click the desired column instead.",
            "The game has no music or sound effects, so silent play is expected.",
            "Online multiplayer is not offered in this hosted build because it requires the upstream WebSocket server. Use the verified AI or same-device modes.",
          ]}
          screenshots={[
            {
              src: GAME_IMAGE,
              alt: "C4 Connect Four board after a red disc was dropped into the fourth column",
              width: 1280,
              height: 773,
              caption: "A real desktop test showing the first red disc in column four and the English turn announcement.",
            },
          ]}
          attribution={{
            developer: "Kenrick",
            developerUrl: "https://kenrick95.org",
            source: "kenrick95/c4 at commit d90d199 (MIT License)",
            sourceUrl: "https://github.com/kenrick95/c4",
            note: "Billy Bob Games hosts a locally tested browser build, preserves the MIT notice, and does not claim to be the game's developer.",
          }}
          lastTested="2026-10-14"
          relatedGames={[
            { href: "/html5-xxl", title: "HTML5 City Match" },
            { href: "/Spider-Solitaire", title: "Spider Solitaire" },
            { href: "/slot-machine-main", title: "HTML5 Slot Machine" },
            { href: "/evolve", title: "Evolve Idle" },
          ]}
        />
      }
    />
  );
}
