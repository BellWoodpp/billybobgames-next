import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "./_components/PageShell";
import AdSenseBlock from "./_components/AdSenseBlock";
import HomeGamesSection, { type HomeGame } from "./_components/HomeGamesSection";
import { gameCategories } from "./_data/game-catalog";
import styles from "./styles/home.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Billy Bob Games | Free Unblocked Browser Games",
  },
  description:
    "Play free browser games at Billy Bob Games, an independently maintained collection of arcade, idle, music, card, puzzle, and retro titles.",
  keywords: [
    "Billy Bob Games",
    "unblocked browser games",
    "free web games",
    "casual games",
    "Fruit Ninja",
    "Flappy Text",
  ],
  openGraph: {
    title: "Billy Bob Games | Free Unblocked Browser Games",
    description:
      "Play free browser games at Billy Bob Games, an independently maintained collection of arcade, idle, music, card, puzzle, and retro titles.",
    url: "https://billybobgames.org/",
    type: "website",
    images: [
      {
        url: "https://r2bucket.billybobgames.org/logo/amazon-game-development.svg",
        width: 512,
        height: 512,
        alt: "Billy Bob Games",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Billy Bob Games | Free Unblocked Browser Games",
    description:
      "Play free browser games at Billy Bob Games, an independently maintained collection of arcade, idle, music, card, puzzle, and retro titles.",
    images: ["https://r2bucket.billybobgames.org/logo/amazon-game-development.svg"],
  },
  alternates: {
    canonical: "https://billybobgames.org/",
  },
};

type HomePageProps = {
  searchParams?: Promise<{
    sort?: string | string[];
  }>;
};

const r2AssetDomain = (process.env.R2_ASSET_DOMAIN || "https://r2bucket.billybobgames.org").replace(
  /\/$/,
  "",
);
const useLocalPreviewVideos = process.env.NODE_ENV === "development";

function previewVideoUrl(localPath: string, r2Path = localPath) {
  if (useLocalPreviewVideos) return localPath;
  return `${r2AssetDomain}/${r2Path.replace(/^\/+/, "")}`;
}

function previewSources(localBasePath: string, r2BasePath = localBasePath) {
  return [
    {
      src: previewVideoUrl(`${localBasePath}.webm`, `${r2BasePath}.webm`),
      type: "video/webm" as const,
    },
    {
      src: previewVideoUrl(`${localBasePath}.mp4`, `${r2BasePath}.mp4`),
      type: "video/mp4" as const,
    },
  ];
}

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://billybobgames.org/#organization",
      name: "Billy Bob Games",
      url: "https://billybobgames.org/",
      logo: "https://r2bucket.billybobgames.org/logo/amazon-game-development.svg",
      description:
        "Billy Bob Games is a free unblocked browser games website focused on fast-loading browser play.",
    },
    {
      "@type": "WebSite",
      "@id": "https://billybobgames.org/#website",
      name: "Billy Bob Games",
      url: "https://billybobgames.org/",
      publisher: {
        "@id": "https://billybobgames.org/#organization",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://billybobgames.org/#webpage",
      url: "https://billybobgames.org/",
      name: "Billy Bob Games | Free Unblocked Browser Games",
      isPartOf: {
        "@id": "https://billybobgames.org/#website",
      },
      about: {
        "@id": "https://billybobgames.org/#organization",
      },
    },
  ],
};

const otherGames: HomeGame[] = [
  {
    href: "/brush-jjaemu",
    title: "Brush Jjaemu",
    img: "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/brush-jjaemu/brush-jjaemu.png",
    alt: "Brush Jjaemu angry cat artwork",
    imageFit: "contain",
    newUntil: "2026-06-20T23:59:59+08:00",
  },
  {
    href: "/fire-red",
    title: "Pokémon FireRed",
    img: "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/GBA-Red/red-image.jpeg",
    alt: "Pokémon FireRed artwork",
    imageFit: "contain",
    newUntil: "2026-05-07T23:59:59+08:00",
  },
  {
    href: "/evolve",
    title: "Evolve Idle",
    img: "/games/evolve/evolve.webp",
    alt: "Evolve Idle cover art",
    imageFit: "contain",
    newUntil: "2026-04-22T23:59:59+08:00",
    previewSources: previewSources("/games/evolve/evolve-preview"),
  },
  {
    href: "/bloodmoney",
    title: "BLOODMONEY",
    img: "https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp",
    alt: "BLOODMONEY gameplay",
    previewSources: previewSources(
      "/games/bloodmoney/bloodmoney-preview",
      "/videos/bloodmoney-preview",
    ),
  },
  {
    href: "/sprunki",
    title: "Sprunki Remix",
    img: "https://r2bucket.billybobgames.org/sprunki/sprunki.webp",
    alt: "Sprunki Incredibox Remix gameplay",
    previewSources: previewSources(
      "/games/incredibox-sprunki/sprunki-preview",
      "/sprunki/sprunki-preview",
    ),
  },
  {
    href: "/Spider-Solitaire",
    title: "Spider Solitaire",
    img: "https://r2bucket.billybobgames.org/Spider-Solitaire/ogOjlb.webp",
    alt: "Spider Solitaire gameplay",
    previewSources: previewSources("/games/spider-solitaire/spider-solitaire-preview"),
  },
  {
    href: "/flappy-text",
    title: "Flappy Text",
    img: "https://r2bucket.billybobgames.org/flappy-text/3.jpg",
    alt: "Flappy Text gameplay",
    previewSources: previewSources("/games/flappy-text/flappy-text-preview"),
  },
  {
    href: "/pac-man",
    title: "Pac-Man",
    img: "https://r2bucket.billybobgames.org/4-pac-man/4.jpg",
    alt: "Pac-Man gameplay",
  },
  {
    href: "/fruit-ninja",
    title: "Fruit Ninja",
    img: "https://r2bucket.billybobgames.org/1-FruitNinja/1.jpg",
    alt: "Fruit Ninja gameplay",
  },
  {
    href: "/html5-mario",
    title: "HTML5 Mario",
    img: "https://r2bucket.billybobgames.org/6-html5-mario/6.jpg",
    alt: "HTML5 Mario gameplay",
  },
  {
    href: "/html5demo7",
    title: "Fish Joy Reloaded",
    img: "https://r2bucket.billybobgames.org/9-html5demo7/9.jpg",
    alt: "Fish Joy Reloaded gameplay",
  },
  {
    href: "/html5-xxl",
    title: "HTML5 City Match",
    img: "https://r2bucket.billybobgames.org/7-Html5-xxl/7.png",
    alt: "HTML5 City Match gameplay",
  },
  {
    href: "/mouseHit",
    title: "Mouse Hit Mania",
    img: "https://r2bucket.billybobgames.org/8-mouseHit/8.jpg",
    alt: "Mouse Hit Mania gameplay",
  },
  {
    href: "/html5-fly",
    title: "HTML5 Fly",
    img: "https://r2bucket.billybobgames.org/5-html5-fly/5.jpg",
    alt: "HTML5 Fly gameplay",
  },
  {
    href: "/slot-machine-main",
    title: "HTML5 Slot Machine",
    img: "https://r2bucket.billybobgames.org/10-slot-machine-main/10.png",
    alt: "HTML5 Slot Machine gameplay",
  },
];

const homepageTopAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP;
const homepageMidAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID;

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeSort = getSingleQueryValue(resolvedSearchParams?.sort);
  const isNewView = activeSort === "new";

  return (
    <PageShell containerClassName={styles.homeContainer}>
      <section className={styles.homeGray}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeStructuredData),
          }}
        />
        <section className={styles.featuredGame} aria-label="Featured game">
          <div className={styles.featuredGameSummary}>
            <h1>Billy Bob Games – Play Free Unblocked Browser Games Online</h1>
            <p>
              Discover Billy Bob Games—your global hub for free, unblocked HTML5 fun. Explore classic retro games,
              quick browser puzzles, and sleek arcade adventures that load instantly in any modern web browser.
            </p>
            <p>
              No installs, no limits—just pure gaming enjoyment anywhere you have a connection. Pick up a
              controller-free experience, chase nostalgic highscores, or sample new arcade challenges between breaks.
            </p>
          </div>
        </section>

        <HomeGamesSection games={otherGames} isNewView={isNewView} />

        <AdSenseBlock
          slot={homepageTopAdSlot}
          placement="homepage_after_featured_games"
          className={styles.homeAd}
          minHeight={320}
        />

        <section className={styles.categorySection} aria-labelledby="browse-by-category-heading">
          <h2 id="browse-by-category-heading">Browse by Category</h2>
          <nav className={styles.categoryLinks} aria-label="Homepage category links">
            {gameCategories.map((category) => (
              <Link key={category.slug} className={styles.categoryLink} href={`/${category.slug}`}>
                {category.title}
              </Link>
            ))}
          </nav>
        </section>

        <AdSenseBlock
          slot={homepageMidAdSlot}
          placement="homepage_before_brand_story"
          className={styles.homeAd}
          minHeight={320}
        />

        <hr className={styles.sectionDivider} />
        <section className={styles.brandStory} aria-labelledby="brand-story-heading">
          <h2 id="brand-story-heading">About Billy Bob Games</h2>
          <p>
            Billy Bob Games is an independently maintained collection of free games that run in a modern web browser. The
            library currently includes arcade, idle, music, card, puzzle, HTML5, and selected retro or emulated titles. You
            do not need to create an account to browse or start a game.
          </p>
          <p>
            This is a one-person project. I choose and organize the games, maintain the site pages, and work on loading or
            compatibility problems when they are reported. Updates are made when time allows rather than on a fixed weekly
            schedule. You can read more on the <Link href="/about">About page</Link>.
          </p>

          <div className={styles.infoGrid}>
            <section className={styles.infoCard} aria-labelledby="recent-site-work-heading">
              <h3 id="recent-site-work-heading">Recently added or maintained</h3>
              <ul>
                <li><Link href="/brush-jjaemu">Brush Jjaemu</Link> was added with browser-ready game files.</li>
                <li><Link href="/fire-red">Pokémon FireRed</Link> received a dedicated browser play page.</li>
                <li><Link href="/evolve">Evolve Idle</Link> received updated frame controls and preview support.</li>
                <li><Link href="/bloodmoney">BLOODMONEY</Link> received loading fixes and a separate play page.</li>
              </ul>
            </section>

            <section className={styles.infoCard} aria-labelledby="start-playing-heading">
              <h3 id="start-playing-heading">How to start playing</h3>
              <ol>
                <li>Choose a game card or browse one of the categories above.</li>
                <li>Some games open immediately; others have a landing page with a clear Play button.</li>
                <li>Allow a moment for larger games to download their browser assets before play begins.</li>
              </ol>
            </section>

            <section className={styles.infoCard} aria-labelledby="loading-help-heading">
              <h3 id="loading-help-heading">If a game does not load</h3>
              <ol>
                <li>Reload the page and wait for the loading screen to finish.</li>
                <li>Try a current version of Chrome, Edge, Firefox, or Safari.</li>
                <li>For emulator games, make sure browser hardware acceleration is enabled.</li>
                <li>If the problem continues, send the exact page URL through the <Link href="/contact">contact page</Link>.</li>
              </ol>
            </section>

            <section className={styles.infoCard} aria-labelledby="developers-sources-heading">
              <h3 id="developers-sources-heading">Developers and sources</h3>
              <p>
                Billy Bob Games maintains the website and browser integrations but does not claim to have created every
                game in the library. Individual titles remain the work of their respective developers and rights holders.
                Developer or source information is included on game pages when it is available. For an attribution,
                correction, or removal request, please <Link href="/contact">contact the site</Link>.
              </p>
            </section>
          </div>

          <section className={styles.faqSection} aria-labelledby="quick-faq-heading">
            <h3 id="quick-faq-heading">Quick FAQ</h3>
            <dl>
              <div>
                <dt>Are the games free to play?</dt>
                <dd>Yes. The games currently listed on Billy Bob Games can be opened without a paid account.</dd>
              </div>
              <div>
                <dt>Do I need to install anything?</dt>
                <dd>No site installer is required. The listed games are intended to run inside a supported web browser.</dd>
              </div>
              <div>
                <dt>Does every game work on mobile?</dt>
                <dd>No. Compatibility varies by game, and titles designed around a keyboard or emulator may work best on desktop.</dd>
              </div>
              <div>
                <dt>How do I report a broken game?</dt>
                <dd>Use the <Link href="/contact">contact page</Link> and include the game URL, browser, and what happened.</dd>
              </div>
            </dl>
          </section>
        </section>
      </section>
    </PageShell>
  );
}
