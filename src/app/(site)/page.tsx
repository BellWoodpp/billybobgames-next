/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import PageShell from "./_components/PageShell";
import HomeGameCard from "./_components/HomeGameCard";
import styles from "./styles/home.module.css";

export const metadata: Metadata = {
  title: "Billy Bob Games | Free Unblocked Browser Games",
  description:
    "Play free unblocked browser games at Billy Bob Games—no downloads, no paywalls. Enjoy retro favorites, indie gems, and new arcade challenges updated weekly.",
  keywords: [
    "Billy Bob Games",
    "unblocked browser games",
    "free web games",
    "casual games",
    "Fruit Ninja",
    "Flappy Text",
  ],
  openGraph: {
    title: "Billy Bob Great Online Games | Free Unblocked Browser Games",
    description:
      "Play free unblocked browser games at Billy Bob Games—no downloads, no paywalls. Enjoy retro favorites, indie gems, and new arcade challenges updated weekly.",
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
    title: "Billy Bob Great Online Games | Free Unblocked Browser Games",
    description:
      "Play free unblocked browser games at Billy Bob Games—no downloads, no paywalls. Enjoy retro favorites, indie gems, and new arcade challenges updated weekly.",
    images: ["https://r2bucket.billybobgames.org/logo/amazon-game-development.svg"],
  },
  alternates: {
    canonical: "https://billybobgames.org/",
  },
};

const otherGames = [
  {
    href: "/bloodmoney",
    title: "BLOODMONEY",
    img: "https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp",
    alt: "BLOODMONEY gameplay",
  },
  {
    href: "/sprunki",
    title: "Sprunki Remix",
    img: "https://r2bucket.billybobgames.org/sprunki/sprunki.webp",
    alt: "Sprunki Incredibox Remix gameplay",
  },
  {
    href: "/Spider-Solitaire",
    title: "Spider Solitaire",
    img: "https://r2bucket.billybobgames.org/Spider-Solitaire/ogOjlb.webp",
    alt: "Spider Solitaire gameplay",
  },
  {
    href: "/flappy-text",
    title: "Flappy Text",
    img: "https://r2bucket.billybobgames.org/flappy-text/3.jpg",
    alt: "Flappy Text gameplay",
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

const friendLinks = [
  {
    href: "https://itch.io/",
    label: "itch.io",
    img: "https://r2bucket.billybobgames.org/image/itch-io-logo.svg",
    rel: "nofollow noopener noreferrer",
  },
  {
    href: "https://store.steampowered.com/",
    label: "Steam",
    img: "https://r2bucket.billybobgames.org/image/steam-icon-logo.svg",
    rel: "nofollow noopener noreferrer",
  },
  {
    href: "https://www.xbox.com/",
    label: "Xbox",
    img: "https://r2bucket.billybobgames.org/image/xbox-9.svg",
    rel: "nofollow noopener noreferrer",
  },
  {
    href: "https://silksong.uk/",
    label: "silksong",
    img: "https://r2boot.silksong.uk/silksong/silksong3.ico",
    rel: "noopener noreferrer",
  },
];

export default function HomePage() {
  return (
    <PageShell containerClassName={styles.homeContainer}>
      <section className={styles.homeGray}>
        <section className={styles.featuredGame} aria-label="Featured game">
          <div className={styles.featuredGameSummary}>
            <h2>Billy Bob Games – Play Free Unblocked Browser Games Online</h2>
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

        <hr className={styles.sectionDivider} />
        <h2 className={styles.otherGamesHeading}>New Game</h2>
        <div className={styles.otherGamesGrid}>
          {otherGames.map((game) => (
            <HomeGameCard key={game.href} href={game.href} title={game.title} img={game.img} alt={game.alt} />
          ))}
        </div>

        <section className={styles.friendLinksSection} aria-label="Friend Links">
          <h2>Friend Links</h2>
          <nav className={styles.friendLinks}>
            {friendLinks.map((link) => (
              <a
                key={link.href}
                className={styles.friendLink}
                href={link.href}
                target="_blank"
                rel={link.rel}
              >
                <Image src={link.img} alt={link.label} width={42} height={42} sizes="42px" />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </section>

        <hr className={styles.sectionDivider} />
        <section className={styles.brandStory} aria-labelledby="brand-story-heading">
          <h2 id="brand-story-heading">
            Billy Bob Games: The Ultimate Gaming Ark, a Light in the Digital Maze
          </h2>
          <p>
            In this age of information overload, finding a game that truly resonates has become an exhausting modern
            adventure.
          </p>
          <p>
            It's a common frustration today. We jump between many browser tabs, trying to find a working Flash game.
          </p>
          <p>
            We also try to understand a download page filled with fake buttons. Each button seems ready to unleash a
            digital mess. We lose precious time to this cycle of sifting, waiting, and dodging malware.
          </p>
          <p>
            As time passes, the excitement of playing a game gradually fades into disappointment.
          </p>
          <p>What if there was a place that could end all this chaos?</p>
          <p>Welcome to Billy Bob Games! We are more than just a gaming website.</p>
          <p>
            We are a philosophy and a commitment. Our site is a digital ark built for all gamers. We understand your
            worries and value your time. We aim to change the boring task of "finding games" into the fun of
            "discovering joy."
          </p>
          <p>
            Our dual-track game system powers Billy Bob Games. This is not just a simple category. It reflects a deep
            understanding of our users' different life situations and psychological needs.
          </p>
          <p>
            <strong>1. Lightweight Playground: Cloud-Based Ready-to-Play Game Library—Your Zero-Load Source of Fun</strong>
          </p>
          <p>
            Imagine these situations: a ten-minute break at work, waiting for dinner to cook, or a moment before bed to
            relax. In these times, you don't need a long adventure that lasts for hours. Instead, you want quick fun that
            you can enjoy right away.
          </p>
          <p>We designed our "Cloud-Based Ready-to-Play" game library for this purpose.</p>
          <p>
            <strong>Ultimate Convenience, Breaking the Boundaries of Time and Space:</strong> Our core technology is "No
            Installation Required, One-Stop Access." No matter what device you use, a modern browser can help you access
            everything. This includes powerful gaming PCs, regular office laptops, and tablets at home. This compatibility
            across devices lets you play games without limits. You can have fun anytime and anywhere.
          </p>
          <p>
            <strong>Simplified Version:</strong> Our editorial team looks for the latest gaming trends online every day,
            just like digital fashion buyers do. We look for addictive mini-games that go viral on social media, clever
            puzzles that test your logic and observation skills, and innovative HTML5 games that show off developers'
            creativity. We aim to capture, test, and present these trends to you as soon as they arrive. At Billy Bob Games,
            you'll always be at the forefront of the latest trends.
          </p>
          <p>
            <strong>Safe and Secure Sandbox Environment:</strong> All web games run in a secure sandbox environment. This
            means they won't access your computer's private files. They won't leave behind hard-to-clean registry clutter.
            They also won't become a place for malware to grow. You'll enjoy pure, risk-free entertainment, like playing in
            a carefully managed playground.
          </p>
          <p>
            <strong>2. Deep Experience Hall: The Windows Game Library—Guarding an immersive gaming sanctuary for you</strong>
          </p>
          <p>
            However, the appeal of gaming goes far beyond a brief moment of leisure. There are times when you want to dive
            into a big and detailed world. You may wish to be the main character in a great story, or you can immerse
            yourself in our complex gaming system. This need for deep immersion requires client-based games with richer
            content and more extensive architecture.
          </p>
          <p>
            Our "Windows Premium Games Library" is such a sanctuary, safeguarding your immersive experience.
          </p>
          <p>
            <strong>A Strong Security Promise:</strong> At Billy Bob Games, "safe downloading" is not just a slogan; it is a
            core principle for us. We understand your hesitation about downloading and installing. We have set up a strict
            game introduction process. Every Windows game we release must pass scans with top antivirus software. It also
            needs manual installation testing by our specialists. This ensures it is completely free of viruses, Trojans,
            and any bundled malware. Your trust is our most precious asset.
          </p>
          <p>
            <strong>Quality Filter:</strong> We don't pursue a massive inventory of ineffective content; we strive to be
            synonymous with "quality." Two types of light come together here. The first is classic games that have lasted
            through time, shining with memories and nostalgia from many generations. The second type is independent games full
            of creativity and passion. The mainstream often misses these games. We find and showcase these hidden gems. We
            make sure each game has its own unique value and playability.
          </p>
          <p>
            <strong>An All-in-One, Smooth Experience:</strong> We offer a fast and stable download channel. We also provide
            clear installation guides, system requirements, and troubleshooting help. From clicking "Download" to the game
            icon appearing on your desktop, the entire process is seamless. We remove any technical hurdles, allowing you to
            fully focus on the adventure ahead.
          </p>
          <p>
            Billy Bob Games has built its unique platform value on a simple collection of games, which forms the core of our
            deep user engagement.
          </p>
          <p>
            <strong>A Humanistic Design Philosophy:</strong> We firmly believe that the best design is invisible. The
            website's navigation is intuitive, and the categorization system is as clear as a detailed treasure map. Whether
            you are a skilled player or just starting, Billy Bob Games is the perfect place to begin your adventure. You can
            jump right in without any learning curve.
          </p>
          <p>
            <strong>Professional Curation:</strong> In an age of information overload, curation is far more valuable than
            aggregation. Billy Bob Games acts as a professional curator. We not only collect, but rigorously screen and
            recommend. This means our team checks every game you see. We make sure it is fun, safe, and fair. This saves you
            your most precious resources—time and attention.
          </p>
          <p>
            <strong>Guardian of Time and Emotion:</strong> Billy Bob Games is essentially your loyal digital steward. We
            safeguard not only your device but also your precious time and your joyful playtime. We remove the noise and
            risks of the online world. We provide the best and most authentic gaming experience. Choosing us means a more
            efficient, safe, and fun digital life.
          </p>
          <p>Let's take a stroll together and experience the complete journey of being a Billy Bob Games user.</p>
          <p>
            <strong>First Encounter: Explore and Discover.</strong> When you first visit our easy-to-use homepage, you can
            explore in many ways. You can browse the "Editor's Picks" section for our weekly selections. You can use the
            "Filter by Genre" feature to find your favorite games—strategy, role-playing, or casual puzzle. Or, you can use
            the search function to find that specific game you want.
          </p>
          <p>
            <strong>Interaction: Start Your Journey with One Click.</strong> Once you've found your destination, everything
            becomes simple and straightforward. For browser games, a prominent "Play Now" button takes you straight to the
            heart of the action. For Windows games, a clear "Safe Download" button shows the file size, version info, and
            user reviews. This helps you understand what to expect before downloading. Click it, and the fast and stable
            download begins instantly.
          </p>
          <p>
            <strong>Belonging: Join and Share.</strong> Billy Bob Games is more than just a tool; it's a community. We
            encourage you to rate your favorite games, share your experiences, and connect with like-minded people. Our
            library isn't static; it's a dynamic stream, with new and exciting content added every week. Bookmark us and
            check back regularly—we always unveil something unexpected.
          </p>
          <p>
            In the vast universe of digital games, Billy Bob Games stands as the brightest beacon, dispelling the fog and
            guiding the way. We eliminate the fatigue of searching for games. We want you to enjoy experiencing them again.
          </p>
          <p>
            Whether you are a casual gamer or a hardcore gamer, there is a place for you here. Casual gamers can take a
            break. Hardcore gamers can find an epic adventure. Billy Bob Games is your trusted starting point and a haven you
            can always return to.
          </p>
          <p>
            Now, click your mouse and open the door to a new world. Your next unforgettable digital adventure awaits.
          </p>
        </section>
      </section>
    </PageShell>
  );
}
