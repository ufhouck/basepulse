# ⚡ Base Pulse

Real-time NFT traffic analytics on **Base chain** — built as a **Farcaster Mini App**.

![Base Pulse Dashboard](https://img.shields.io/badge/Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)
![Farcaster](https://img.shields.io/badge/Farcaster-8B5CF6?style=for-the-badge&logo=farcaster&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

## Features

- **📊 Live Dashboard** — Real-time mints, transfers, volume, and floor price changes
- **📈 Volume Trend** — 7-day SVG line chart with gradient fill
- **🏆 Top Collections** — Ranked by 24h volume with floor prices
- **⚡ Activity Feed** — Color-coded live feed of mints, transfers, and sales
- **🐋 Whale Tracker** — Large transactions (≥1 ETH) aggregated by wallet

## Tech Stack

| Layer | Technology |
|:---|:---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Farcaster | `@farcaster/miniapp-sdk` (Mini App / Frames v2) |
| Data | OpenSea API v2 (Base chain) |
| Styling | Vanilla CSS (dark glassmorphism) |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- OpenSea API Key ([get at opensea.io/settings/developer](https://opensea.io/settings/developer))
- Farcaster account (for Mini App publishing)

### Setup

```bash
# Clone the repo
git clone https://github.com/ufhouck/basepulse.git
cd basepulse

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your OpenSea API key to .env.local
# OPENSEA_API_KEY=your_key_here

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Deploy to Vercel

```bash
vercel

# Set environment variable
vercel env add OPENSEA_API_KEY
```

After deployment, update `public/.well-known/farcaster.json` with your Vercel domain and Farcaster account association signature.

## Farcaster Mini App

This app is designed to run inside Farcaster clients (like Warpcast) as a Mini App. To test:

1. Enable **Developer Mode** in Warpcast settings
2. Open the **Frame Playground**
3. Enter your deployed URL
4. The app will load with live Base NFT data

## Architecture

```
src/
├── app/
│   ├── globals.css            # Design system
│   ├── layout.tsx             # Root layout + SEO
│   ├── page.tsx               # Entry → Dashboard
│   └── api/nft/               # Server-side API routes
│       ├── collections/       # Top collections
│       ├── activity/          # Live activity feed
│       └── stats/             # Stats + volumes + whales
├── components/
│   ├── Dashboard.tsx          # Main container
│   ├── StatsOverview.tsx      # KPI cards
│   ├── VolumeChart.tsx        # SVG chart
│   ├── TopCollections.tsx     # Rankings
│   ├── ActivityFeed.tsx       # Live feed
│   └── WhaleTracker.tsx       # Whale activity
├── hooks/                     # React hooks for data fetching
├── lib/                       # API client + utilities
└── types/                     # TypeScript definitions
```

## License

MIT

## Credits

- [OpenSea](https://opensea.io) — NFT API
- [Farcaster](https://farcaster.xyz) — Social protocol
- [Base](https://base.org) — L2 network
