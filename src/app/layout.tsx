import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import AppFooter from "./(site)/_components/AppFooter";
import AppHeader from "./(site)/_components/AppHeader";
import AppSidebar from "./(site)/_components/AppSidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = new URL("https://billybobgames.org");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Billy Bob Games | Free Unblocked Browser Games",
    template: "%s | Billy Bob Games",
  },
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
    url: metadataBase,
    type: "website",
    images: [
      {
        url: "/logo_amazon-game-development.svg",
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
    images: ["/logo_amazon-game-development.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <input id="nav-toggle" className="nav-toggle" type="checkbox" aria-hidden="true" />
        <AppHeader />
        <div className="app-shell">
          <label htmlFor="nav-toggle" className="sidebar-overlay" aria-label="关闭菜单" />
          <AppSidebar />
          <main className="page app-content">{children}</main>
        </div>
        <AppFooter />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DJ7PED4TRM"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-inline"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DJ7PED4TRM');
            `,
          }}
        />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="REuFpy6zp+wD6K5vJ1TOSg"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6581885234407347"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
