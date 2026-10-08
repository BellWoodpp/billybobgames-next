import { WsrvImage } from "@/components/WsrvImage";
import { siteIdentity } from "@/lib/site";
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
              src={siteIdentity.logoUrl}
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
            href={`mailto:${siteIdentity.contactEmail}`}
            aria-label={`Email ${siteIdentity.name} at ${siteIdentity.contactEmail}`}
            data-tooltip="Email me"
          >
            <Mail className="header-contact-icon" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
