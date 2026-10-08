import { WsrvImage } from "@/components/WsrvImage";
import PageShell from "../_components/PageShell";
import GameBreadcrumb from "../_components/GameBreadcrumb";
import TrackedGameLink from "../_components/TrackedGameLink";
import AdSenseBlock from "../_components/AdSenseBlock";
import GameEditorialContent from "../_components/GameEditorialContent";
import styles from "./bloodmoney.module.css";

const screenshots = [
  {
    src: "https://r2bucket.billybobgames.org/bloodmoney-webp/1.webp",
    alt: "BLOODMONEY opening scene with Harvey Harvington at his roadside stall",
    caption: "The roadside stall where the clicker story begins.",
  },
  {
    src: "https://r2bucket.billybobgames.org/bloodmoney-webp/2.webp",
    alt: "BLOODMONEY clicker interface showing Harvey and the money total",
    caption: "The central clicker screen and current money total.",
  },
  {
    src: "https://r2bucket.billybobgames.org/bloodmoney-webp/3.webp",
    alt: "BLOODMONEY upgrade choices displayed beside Harvey",
    caption: "Choices change the value of later interactions and the direction of the story.",
  },
  {
    src: "https://r2bucket.billybobgames.org/bloodmoney-webp/4.webp",
    alt: "BLOODMONEY pastel interface during a later stage",
    caption: "The pastel presentation contrasts with the game's psychological-horror theme.",
  },
  {
    src: "https://r2bucket.billybobgames.org/bloodmoney-webp/5.webp",
    alt: "BLOODMONEY story dialogue from the browser version",
    caption: "Dialogue and player choices lead toward one of three endings.",
  },
];

export default function BloodmoneyContent() {
  return (
    <PageShell containerClassName={styles.fullWidth}>
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <GameBreadcrumb current="BLOODMONEY" gamePath="/bloodmoney" />
          <h1 className={styles.title}>BLOODMONEY</h1>
          <p className={styles.subtitle}>
            A dark one-button clicker story about earning $25,000, escalating choices, and the consequences of how you
            treat Harvey Harvington.
          </p>
          <div className={styles.playCtas}>
            <TrackedGameLink
              className={styles.playPoster}
              href="/bloodmoney/play"
              gameHref="/bloodmoney/play"
              gameTitle="BLOODMONEY"
              trackingSource="bloodmoney_landing_play_poster"
              trackingPosition={1}
              aria-label="Open the BLOODMONEY browser play view"
            >
              <WsrvImage
                src="https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"
                alt="Open the BLOODMONEY browser game"
                width={1200}
                height={675}
                priority
                sizes="(min-width: 960px) 560px, 92vw"
                layout="constrained"
              />
            </TrackedGameLink>
          </div>
        </header>

        <div className={styles.contentWidth}>
          <GameEditorialContent
            title="BLOODMONEY"
            introduction={[
              "BLOODMONEY is a short psychological-horror clicker created by SHROOMYCHRIST. Your character needs $25,000 for an operation and meets Harvey, who offers one dollar for every click.",
              "The simple interaction becomes a choice about speed, restraint, and increasingly harmful upgrades. The browser version hosted here is an unofficial web port; Billy Bob Games did not create the original game.",
            ]}
            controls={[
              "Mouse: left-click Harvey, dialogue choices, upgrades, and menu buttons.",
              "Touchscreen: tap the same interactive areas with one finger.",
              "Fullscreen: use the control in the play view for a larger game canvas.",
            ]}
            goal="Reach the $25,000 operation target. The upgrades you buy and how far you escalate the interactions determine which of the game's three endings you see."
            desktopCompatibility="Playable in a current desktop browser with a mouse. The first load is large, so wait for the RPG Maker assets before assuming it has failed."
            mobileCompatibility="Touch interaction and responsive scaling are included in this web port. A recent phone in landscape mode works best, but lower-memory devices may reload during asset loading."
            troubleshooting={[
              "Select the poster above to open the dedicated play view, then wait while the RPG Maker files load.",
              "If the play view stays black, reload once, keep the tab active, and allow additional time on a slow connection.",
              "If sound is missing, tap or click inside the game first; mobile and desktop browsers may block audio before interaction.",
              "If the image is cropped, rotate a phone to landscape or use fullscreen. On desktop, reset browser zoom to 100 percent.",
              "If loading repeatedly fails, close other memory-heavy tabs and try a current version of Chrome, Edge, Firefox, or Safari.",
            ]}
            screenshots={screenshots.map((screenshot) => ({
              ...screenshot,
              width: 800,
              height: 450,
            }))}
            attribution={{
              developer: "SHROOMYCHRIST",
              developerUrl: "https://shroomychrist-studios.itch.io/bloodmoney",
              source: "Official BLOODMONEY page and Nick088's unofficial web-port project",
              sourceUrl: "https://github.com/Nick088Official/BLOODMONEY-Web-Port",
              note: "The original downloadable game is credited to SHROOMYCHRIST. This browser adaptation is an unofficial port; support the creator through the official itch.io page.",
            }}
            lastTested="October 9, 2026"
            warning="Content warning: BLOODMONEY includes flashing lights, psychological horror, blood, and escalating violence. Do not play if you are photosensitive."
            relatedGames={[
              { href: "/evolve", title: "Evolve Idle" },
              { href: "/sprunki", title: "Sprunki Remix" },
              { href: "/html5demo7", title: "Fish Joy Reloaded" },
              { href: "/flappy-text", title: "Flappy Text" },
            ]}
          />
        </div>

        <AdSenseBlock
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOODMONEY_LANDING}
          placement="bloodmoney_landing_after_game_information"
          minHeight={320}
        />
      </main>
    </PageShell>
  );
}
