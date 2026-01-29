import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Cerveau Externe",
  description: "Je décide. Tu agis.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Mobile / iOS / PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Icons */}
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>

      <body className="bg-black text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
