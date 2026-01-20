import type { Metadata } from "next";
import { Lemonada, Bangers, Comic_Neue } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const lemonada = Lemonada({
  variable: "--font-lemonada",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const comicNeue = Comic_Neue({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://flick-ball.netlify.app'),
  title: "FlickBall | The Hansi Flick Era: Stats, Tactics & Glory",
  description: "Dive into the stats behind Hansi Flick's Barcelona. Expected Goals (xG), tactical analysis, player rankings, and the visual story of a record-breaking season.",
  openGraph: {
    title: "FlickBall | The Hansi Flick Era: Stats, Tactics & Glory",
    description: "Dive into the stats behind Hansi Flick's Barcelona. Expected Goals (xG), tactical analysis, player rankings, and the visual story of a record-breaking season.",
    url: "https://flick-ball.netlify.app",
    type: "website",
    locale: "en_US",
    siteName: "FlickBall",
    images: ["/opengraph-image.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "FlickBall | The Hansi Flick Era: Stats, Tactics & Glory",
    description: "Dive into the stats behind Hansi Flick's Barcelona. Expected Goals (xG), tactical analysis, player rankings, and the visual story of a record-breaking season.",
    images: ["/opengraph-image.jpg"]
  },
  other: {
    "og:logo": "https://flick-ball.netlify.app/icon.png",
    "itemprop:name": "FlickBall | The Hansi Flick Era: Stats, Tactics & Glory",
    "itemprop:description": "Dive into the stats behind Hansi Flick's Barcelona. Expected Goals (xG), tactical analysis, player rankings, and the visual story of a record-breaking season.",
    "itemprop:image": "https://flick-ball.netlify.app/opengraph-image.jpg"
  }
};

import Clarity from "@/components/analytics/Clarity";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          lemonada.variable,
          bangers.variable,
          comicNeue.variable,
          "antialiased bg-[#db0030] text-white"
        )}
      >
        {children}
        <Clarity />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
