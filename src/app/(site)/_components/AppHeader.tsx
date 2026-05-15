import { WsrvImage } from "@/components/WsrvImage";
import Link from "next/link";
import { Mail, Menu } from "lucide-react";

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
            <WsrvImage
              className="logo"
              src="https://r2bucket.billybobgames.org/logo/amazon-game-development.ico"
              alt="Billy Bob Games logo"
              width={48}
              height={48}
              sizes="48px"
              layout="fixed"
              priority
            />
            <span>Billy Bob Games</span>
          </Link>
        </div>
        <div className="header-actions">
          <a
            className="header-contact"
            href="mailto:stormrobin50@gmail.com"
            aria-label="Email Billy Bob Games at stormrobin50@gmail.com"
            data-tooltip="Email me"
          >
            <Mail className="header-contact-icon" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
