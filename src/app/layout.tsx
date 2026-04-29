import type { Metadata } from "next";
import "./globals.css";

const DOMAIN = "https://basepulse-alpha.vercel.app";

const miniappEmbed = JSON.stringify({
  version: "1",
  imageUrl: `${DOMAIN}/og-image.png`,
  button: {
    title: "📊 Open Base Pulse",
    action: {
      type: "launch_miniapp",
      url: DOMAIN,
      name: "Base Pulse",
      splashImageUrl: `${DOMAIN}/splash.png`,
      splashBackgroundColor: "#06070f",
    },
  },
});

const frameEmbed = JSON.stringify({
  version: "1",
  imageUrl: `${DOMAIN}/og-image.png`,
  button: {
    title: "📊 Open Base Pulse",
    action: {
      type: "launch_frame",
      url: DOMAIN,
      name: "Base Pulse",
      splashImageUrl: `${DOMAIN}/splash.png`,
      splashBackgroundColor: "#06070f",
    },
  },
});

export const metadata: Metadata = {
  title: "Base Pulse — NFT Activity Tracker on Base",
  description:
    "Real-time NFT traffic analytics on Base chain. Track mints, transfers, top collections, volume trends, and whale activity — built as a Farcaster Mini App.",
  metadataBase: new URL(DOMAIN),
  openGraph: {
    title: "Base Pulse",
    description: "Real-time NFT traffic analytics on Base chain",
    type: "website",
    url: DOMAIN,
    images: [
      {
        url: `${DOMAIN}/og-image.png`,
        width: 1200,
        height: 800,
        alt: "Base Pulse — NFT Activity on Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Pulse",
    description: "Real-time NFT traffic analytics on Base chain",
    images: [`${DOMAIN}/og-image.png`],
  },
  other: {
    "fc:miniapp": miniappEmbed,
    "fc:frame": frameEmbed,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#06070f" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
