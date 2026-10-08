export type GameCategorySlug =
  | "arcade-games"
  | "idle-games"
  | "music-games"
  | "card-games"
  | "puzzle-games"
  | "pokemon"
  | "retro-games";

export type CatalogGame = {
  href: string;
  title: string;
  img: string;
  alt: string;
  description: string;
  categories: GameCategorySlug[];
};

export type GameCategory = {
  slug: GameCategorySlug;
  title: string;
  heading: string;
  description: string;
};

export const gameCategories: GameCategory[] = [
  {
    slug: "arcade-games",
    title: "Arcade Games",
    heading: "Arcade Games on Billy Bob Games",
    description:
      "Play quick, lightweight arcade games on Billy Bob Games. These browser games are built for fast sessions, simple controls, and instant fun with no downloads.",
  },
  {
    slug: "idle-games",
    title: "Idle Games",
    heading: "Idle Games on Billy Bob Games",
    description:
      "Explore idle and incremental games on Billy Bob Games. Build, upgrade, automate, and keep progressing directly in your browser.",
  },
  {
    slug: "music-games",
    title: "Music Games",
    heading: "Music Games on Billy Bob Games",
    description:
      "Create beats, remix sounds, and experiment with interactive music games on Billy Bob Games without installing extra software.",
  },
  {
    slug: "card-games",
    title: "Card Games",
    heading: "Card Games on Billy Bob Games",
    description:
      "Play browser-based card games on Billy Bob Games, from relaxing solitaire sessions to strategy-focused classics.",
  },
  {
    slug: "puzzle-games",
    title: "Puzzle Games",
    heading: "Puzzle Games on Billy Bob Games",
    description:
      "Challenge your timing, planning, and pattern-matching skills with puzzle games that load fast and play directly in your browser.",
  },
  {
    slug: "pokemon",
    title: "Pokémon Games",
    heading: "Pokémon Games on Billy Bob Games",
    description:
      "Browse playable Pokémon titles and open the dedicated game pages for controls, save instructions, and browser compatibility notes.",
  },
  {
    slug: "retro-games",
    title: "Retro Games",
    heading: "Retro Games on Billy Bob Games",
    description:
      "Revisit browser-friendly retro games, including classic maze action, platforming, and handheld adventures.",
  },
];

export const catalogGames: CatalogGame[] = [
  {
    href: "/brush-jjaemu",
    title: "Brush Jjaemu",
    img: "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/brush-jjaemu/brush-jjaemu.png",
    alt: "Brush Jjaemu angry cat artwork",
    description:
      "Read Jjaemu's mood, brush with steady mouse control, and survive a deceptively tense browser pet-care challenge.",
    categories: ["arcade-games"],
  },
  {
    href: "/evolve",
    title: "Evolve Idle",
    img: "/games/evolve/evolve.webp",
    alt: "Evolve Idle cover art",
    description: "Guide a civilization from primordial ooze to a spacefaring empire in a deep incremental strategy game.",
    categories: ["idle-games"],
  },
  {
    href: "/fire-red",
    title: "Pokémon FireRed",
    img: "https://pub-7a7bcc9e985340b68807f06d96ba2d0a.r2.dev/GBA-Red/red-image.jpeg",
    alt: "Pokémon FireRed artwork",
    description:
      "Explore Kanto, train a Pokémon team, and preserve your progress with browser save and export tools.",
    categories: ["pokemon", "retro-games"],
  },
  {
    href: "/bloodmoney",
    title: "BLOODMONEY",
    img: "https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp",
    alt: "BLOODMONEY gameplay",
    description: "Play a dark clicker horror game built around choices, upgrades, and multiple endings.",
    categories: ["arcade-games"],
  },
  {
    href: "/sprunki",
    title: "Sprunki Remix",
    img: "https://r2bucket.billybobgames.org/sprunki/sprunki.webp",
    alt: "Sprunki Incredibox Remix gameplay",
    description: "Layer eerie beats and drag-and-drop performers in a browser music remix experience.",
    categories: ["music-games"],
  },
  {
    href: "/Spider-Solitaire",
    title: "Spider Solitaire",
    img: "https://r2bucket.billybobgames.org/Spider-Solitaire/ogOjlb.webp",
    alt: "Spider Solitaire gameplay",
    description: "Stack cards by suit, plan each move, and clear the tableau in a classic solitaire challenge.",
    categories: ["card-games", "puzzle-games"],
  },
  {
    href: "/flappy-text",
    title: "Flappy Text",
    img: "https://r2bucket.billybobgames.org/flappy-text/3.jpg",
    alt: "Flappy Text gameplay",
    description: "Type your own word and guide it through obstacles in a playful Flappy-style challenge.",
    categories: ["arcade-games"],
  },
  {
    href: "/pac-man",
    title: "Pac-Man",
    img: "https://r2bucket.billybobgames.org/4-pac-man/4.jpg",
    alt: "Pac-Man gameplay",
    description: "Clear each maze of pellets, dodge the ghosts, and chase classic arcade high scores.",
    categories: ["arcade-games", "retro-games"],
  },
  {
    href: "/fruit-ninja",
    title: "Fruit Ninja",
    img: "https://r2bucket.billybobgames.org/1-FruitNinja/1.jpg",
    alt: "Fruit Ninja gameplay",
    description: "Slice flying fruit, avoid bombs, and build combos in a fast browser arcade game.",
    categories: ["arcade-games"],
  },
  {
    href: "/html5-mario",
    title: "HTML5 Mario",
    img: "https://r2bucket.billybobgames.org/6-html5-mario/6.jpg",
    alt: "HTML5 Mario gameplay",
    description: "Run, jump, collect coins, and enjoy a browser-friendly platforming adventure.",
    categories: ["arcade-games", "retro-games"],
  },
  {
    href: "/html5demo7",
    title: "Fish Joy Reloaded",
    img: "https://r2bucket.billybobgames.org/9-html5demo7/9.jpg",
    alt: "Fish Joy Reloaded gameplay",
    description: "Aim the cannon, catch colorful fish, and chase arcade fishing combos under the sea.",
    categories: ["arcade-games"],
  },
  {
    href: "/html5-xxl",
    title: "HTML5 City Match",
    img: "https://r2bucket.billybobgames.org/7-Html5-xxl/7.png",
    alt: "HTML5 City Match gameplay",
    description: "Swap city tiles, trigger cascading matches, and unlock boosters in a browser puzzle game.",
    categories: ["puzzle-games"],
  },
  {
    href: "/mouseHit",
    title: "Mouse Hit Mania",
    img: "https://r2bucket.billybobgames.org/8-mouseHit/8.jpg",
    alt: "Mouse Hit Mania gameplay",
    description: "Aim quickly, hit every mole, and build fast combos in a whac-a-mole arcade game.",
    categories: ["arcade-games"],
  },
  {
    href: "/html5-fly",
    title: "HTML5 Fly",
    img: "https://r2bucket.billybobgames.org/5-html5-fly/5.jpg",
    alt: "HTML5 Fly gameplay",
    description: "Pilot a starfighter, dodge enemy fire, collect upgrades, and survive wave after wave.",
    categories: ["arcade-games"],
  },
  {
    href: "/slot-machine-main",
    title: "HTML5 Slot Machine",
    img: "https://r2bucket.billybobgames.org/10-slot-machine-main/10.png",
    alt: "HTML5 Slot Machine gameplay",
    description: "Spin five reels, test autoplay, and enjoy a lightweight browser slot-machine game.",
    categories: ["arcade-games"],
  },
];

export function getCategory(slug: GameCategorySlug) {
  return gameCategories.find((category) => category.slug === slug);
}

export function getGamesByCategory(slug: GameCategorySlug) {
  return catalogGames.filter((game) => game.categories.includes(slug));
}

export function getPrimaryCategoryForGame(href: string) {
  const game = catalogGames.find((entry) => entry.href === href);
  if (!game) return undefined;

  return gameCategories.find((category) => category.slug === game.categories[0]);
}

export function getRelatedGames(href: string, limit = 4) {
  const currentGame = catalogGames.find((entry) => entry.href === href);
  if (!currentGame) return [];

  return catalogGames
    .filter((game) => game.href !== href)
    .map((game, index) => ({
      game,
      index,
      sharedCategories: game.categories.filter((category) => currentGame.categories.includes(category)).length,
    }))
    .sort((left, right) => right.sharedCategories - left.sharedCategories || left.index - right.index)
    .slice(0, limit)
    .map(({ game }) => game);
}
