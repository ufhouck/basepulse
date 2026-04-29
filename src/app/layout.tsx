import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Pulse — NFT Activity Tracker on Base",
  description:
    "Real-time NFT traffic analytics on Base chain. Track mints, transfers, top collections, volume trends, and whale activity — built as a Farcaster Mini App.",
  openGraph: {
    title: "Base Pulse",
    description: "Real-time NFT traffic analytics on Base chain",
    type: "website",
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "",
    "fc:frame:button:1": "Open Base Pulse",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
