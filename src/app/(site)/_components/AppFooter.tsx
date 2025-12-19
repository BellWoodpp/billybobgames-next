export default function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="container bar">
        © {year} BillyBob Games. All rights reserved.
      </div>
    </footer>
  );
}
