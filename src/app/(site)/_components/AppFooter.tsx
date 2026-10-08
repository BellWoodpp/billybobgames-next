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
          <Link href="/terms">Terms</Link>
          <Link href="/dmca">DMCA</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/credits">Credits</Link>
        </nav>
        <div>© {year} Billy Bob Games. Independently maintained browser game collection.</div>
      </div>
    </footer>
  );
}
