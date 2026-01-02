import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bike,
  Car,
  Clock3,
  CreditCard,
  DoorOpen,
  Flame,
  Gamepad,
  Gamepad2,
  Ghost,
  Home,
  Map,
  MousePointer2,
  RefreshCw,
  Sparkles,
  Swords,
  Trophy,
  Users,
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
  { href: "/?category=two-player", label: "2 Player", icon: <Users className="sidebar-icon" /> },
  { href: "/?category=action", label: "Action", icon: <Swords className="sidebar-icon" /> },
  { href: "/?category=adventure", label: "Adventure", icon: <Map className="sidebar-icon" /> },
  { href: "/?category=basketball", label: "Basketball", icon: <Trophy className="sidebar-icon" /> },
  { href: "/?category=bike", label: "Bike", icon: <Bike className="sidebar-icon" /> },
  { href: "/?category=car", label: "Car", icon: <Car className="sidebar-icon" /> },
  { href: "/?category=card", label: "Card", icon: <CreditCard className="sidebar-icon" /> },
  { href: "/?category=casual", label: "Casual", icon: <MousePointer2 className="sidebar-icon" /> },
  { href: "/?category=clicker", label: "Clicker", icon: <Zap className="sidebar-icon" /> },
  { href: "/?category=controller", label: "Controller", icon: <Gamepad className="sidebar-icon" /> },
  { href: "/?category=driving", label: "Driving", icon: <Car className="sidebar-icon" /> },
  { href: "/?category=escape", label: "Escape", icon: <DoorOpen className="sidebar-icon" /> },
  { href: "/?category=fps", label: "FPS", icon: <Zap className="sidebar-icon" /> },
  { href: "/?category=horror", label: "Horror", icon: <Ghost className="sidebar-icon" /> },
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
          <img
            className="sidebar-brand-icon"
            src="https://r2bucket.billybobgames.org/logo/amazon-game-development.svg"
            alt=""
            width={34}
            height={34}
          />
          <span className="sidebar-brand-text">BillyBob</span>
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
