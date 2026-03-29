/* eslint-disable @next/next/no-page-custom-font -- app-wide Google Fonts in root layout */
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Clonnect — Your Campus Knowledge Network",
  description:
    "A knowledge-sharing and peer-collaboration platform for university students. Connect, learn, and grow together.",
  keywords: [
    "campus",
    "university",
    "knowledge sharing",
    "peer learning",
    "student network",
    "collaboration",
  ],
  openGraph: {
    title: "Clonnect — Your Campus Knowledge Network",
    description:
      "Connect with peers, share knowledge, and grow together on campus.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
