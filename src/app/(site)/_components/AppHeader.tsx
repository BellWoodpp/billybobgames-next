import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

const socialLinks = [
  {
    href: "https://www.facebook.com/",
    label: "Billy Bob Games on Facebook",
    icon: "https://r2bucket.billybobgames.org/share/facebook-4.svg",
    alt: "Facebook",
  },
  {
    href: "https://x.com/home",
    label: "Billy Bob Games on X",
    icon: "https://r2bucket.billybobgames.org/share/x-2.svg",
    alt: "X",
  },
  {
    href: "https://www.reddit.com/",
    label: "Billy Bob Games on Reddit",
    icon: "https://r2bucket.billybobgames.org/share/reddit-4.svg",
    alt: "Reddit",
  },
];

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="container bar">
        <div className="brand-wrap">
          <label
            className="nav-toggle-btn"
            htmlFor="nav-toggle"
            aria-label="打开菜单"
          >
            <Menu aria-hidden="true" />
          </label>

          <Link className="brand" href="/" aria-label="Billy Bob Games home">
            <Image
              className="logo"
              src="https://r2bucket.billybobgames.org/logo/amazon-game-development.ico"
              alt="Billy Bob Games logo"
              width={48}
              height={48}
              sizes="48px"
              priority
            />
            <span>Billy Bob Games</span>
          </Link>
        </div>

        <nav className="nav-social" aria-label="Social links">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              className="nav__icon"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
            >
              <Image src={link.icon} alt={link.alt} width={28} height={28} sizes="28px" loading="lazy" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
