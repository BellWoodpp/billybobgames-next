import Link from "next/link";

export default function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="container bar">
        <nav className="footer-links" aria-label="Footer links">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/arcade-games">Arcade Games</Link>
          <Link href="/idle-games">Idle Games</Link>
        </nav>
        <div>© {year} Billy Bob Games. All rights reserved.</div>
      </div>
    </footer>
  );
}
