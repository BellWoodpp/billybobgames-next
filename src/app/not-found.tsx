import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-wrap">
      <div className="error-card">
        <h1 className="error-code">404</h1>
        <p className="error-msg">Page not found.</p>
        <Link className="btn" href="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
