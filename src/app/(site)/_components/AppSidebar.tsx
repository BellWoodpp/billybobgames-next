import { WsrvImage } from "@/components/WsrvImage";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Clock3,
  CreditCard,
  Flame,
  Gamepad,
  Gamepad2,
  Home,
  Map,
  RefreshCw,
  Sparkles,
  Swords,
  Users2,
  Zap,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const primaryItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Home className="sidebar-icon text-cyan-300" /> },
  { href: "/recently-played", label: "Recently played", icon: <Clock3 className="sidebar-icon text-sky-300" /> },
  { href: "/?sort=new", label: "New", icon: <Sparkles className="sidebar-icon text-amber-300" /> },
  { href: "/?sort=popular", label: "Popular Games", icon: <Flame className="sidebar-icon text-orange-300" /> },
  { href: "/?sort=updated", label: "Updated", icon: <RefreshCw className="sidebar-icon text-emerald-300" /> },
  { href: "/?filter=originals", label: "Originals", icon: <Gamepad2 className="sidebar-icon text-violet-300" /> },
  { href: "/?filter=multiplayer", label: "Multiplayer", icon: <Users2 className="sidebar-icon text-fuchsia-300" /> },
];

const categoryItems: NavItem[] = [
  { href: "/arcade-games", label: "Arcade Games", icon: <Swords className="sidebar-icon" /> },
  { href: "/idle-games", label: "Idle Games", icon: <Zap className="sidebar-icon" /> },
  { href: "/music-games", label: "Music Games", icon: <Gamepad className="sidebar-icon" /> },
  { href: "/card-games", label: "Card Games", icon: <CreditCard className="sidebar-icon" /> },
  { href: "/puzzle-games", label: "Puzzle Games", icon: <Map className="sidebar-icon" /> },
];

function SidebarSection({ items }: { items: NavItem[] }) {
  return (
    <ul className="sidebar-section">
      {items.map((item) => (
        <li key={item.href}>
          <Link className="sidebar-link" href={item.href}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AppSidebar() {
  return (
    <aside className="app-sidebar" aria-label="功能菜单">
      <div className="sidebar-top">
        <div className="sidebar-brand" aria-hidden="true">
          <WsrvImage
            className="sidebar-brand-icon"
            src="https://r2bucket.billybobgames.org/logo/amazon-game-development.svg"
            alt="Billy Bob Games logo"
            width={34}
            height={34}
            sizes="34px"
            layout="fixed"
          />
          <span className="sidebar-brand-text">Billy Bob Games</span>
        </div>
        <label htmlFor="nav-toggle" className="sidebar-close" aria-label="关闭菜单">
          ✕
        </label>
      </div>

      <nav className="sidebar-nav" aria-label="主菜单">
        <SidebarSection items={primaryItems} />
        <div className="sidebar-divider" />
        <SidebarSection items={categoryItems} />
      </nav>
    </aside>
  );
}
