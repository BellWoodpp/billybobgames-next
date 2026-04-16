import { catalogGames, gameCategories } from "../_data/game-catalog";

const SITE_URL = "https://billybobgames.org";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type GameStructuredDataProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
};

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function getGenres(path: string) {
  const game = catalogGames.find((entry) => entry.href === path);
  if (!game) {
    return undefined;
  }

  const genres = game.categories
    .map((slug) => gameCategories.find((category) => category.slug === slug)?.title)
    .filter((value): value is string => Boolean(value));

  return genres.length > 0 ? genres : undefined;
}

export default function GameStructuredData({
  title,
  description,
  path,
  image,
  breadcrumbs,
}: GameStructuredDataProps) {
  const pageUrl = toAbsoluteUrl(path);
  const imageUrl = image ? toAbsoluteUrl(image) : undefined;
  const genre = getGenres(path);
  const breadcrumbItems = breadcrumbs ?? [
    { name: "Billy Bob Games", path: "/" },
    { name: title, path },
  ];

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: toAbsoluteUrl(item.path),
        })),
      },
      {
        "@type": "VideoGame",
        name: title,
        description,
        url: pageUrl,
        image: imageUrl ? [imageUrl] : undefined,
        thumbnailUrl: imageUrl,
        genre,
        applicationCategory: "Game",
        operatingSystem: "Any",
        gamePlatform: ["Web Browser"],
        playMode: "SinglePlayer",
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: "Billy Bob Games",
          url: SITE_URL,
        },
        isPartOf: {
          "@type": "WebSite",
          name: "Billy Bob Games",
          url: SITE_URL,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
