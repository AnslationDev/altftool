# Tradeon — AI Financial Intelligence Platform

A premium, enterprise-grade financial intelligence experience living at `/tradeon`.
Self-contained under `src/app/tradeon/` — it hides the global site chrome and ships its
own design system, so nothing leaks into the host app.

## Routes
- `/tradeon` — SaaS landing page (Live Command Center hero → features → AI Prediction
  Center → Multi-Screen Workspace → global markets → testimonials → pricing → FAQ →
  newsletter → premium fintech footer).
- `/tradeon/dashboard` — the customizable widget dashboard / command center.

## Architecture
```
tradeon/
  tradeon.css              Design system: tokens (light+dark), glassmorphism, motion
  layout.jsx               Client layout — scopes CSS, hides global chrome
  page.jsx                 Landing route (+ SEO metadata)
  dashboard/page.jsx       Dashboard route (+ SEO metadata)
  lib/
    instruments.js         Instrument universe across 6 asset classes
    marketData.js          Live engine: real Binance crypto + simulated fallback
    ai.js                  Explainable AI prediction engine
    format.js              Price / % / compact formatting
  hooks/
    useMarketData.js       Subscribe to the live tick stream
    useTradeonTheme.js     Light/dark toggle (syncs global data-theme)
  components/
    shared/                Logo, ThemeToggle, Sparkline, AreaChart, CandleChart,
                           LiveValue, DeltaPill, FearGreedGauge, AIPredictionCard,
                           MarketStatusBadge
    landing/               Nav, Hero, LiveTicker, FeatureGrid, PredictionShowcase,
                           WorkspacePreview, GlobalMarkets, Testimonials, Pricing,
                           FAQ, Newsletter, TradeonFooter, LandingClient
    dashboard/             Sidebar, DashboardClient, widgets
```

## Live data
Crypto (BTC, ETH, SOL, …) streams from Binance's free, key-less, CORS-enabled public
REST API (`/api/v3/ticker/24hr`), polled every ~6s and micro-ticked between polls.
Stocks, forex, indices, commodities and ETFs are seeded and simulated with a
mean-reverting bounded random walk. Connection state (live / reconnecting / simulated)
is surfaced in the UI. To go fully live, swap the simulated classes for any licensed
real-time feed in `lib/marketData.js` — the UI already consumes a normalized snapshot.

## AI predictions
`lib/ai.js` fuses trend slope, RSI, momentum, day-change and volatility into
buy/hold/sell probabilities plus confidence, risk, technical/fundamental ratings,
sentiment, price levels (entry/target/stop) and a natural-language rationale. It is
transparent analytical tooling — **not financial advice** (surfaced in the UI).

## Roadmap (next iterations)
- Drag-and-drop + resizable dashboard widgets with saved layouts (dnd-kit is available).
- Full 1→16 chart workspace with independent indicators, drawings, replay & detach.
- Company profile pages (financials, ratios, ownership, peers).
- Advanced screener, alerts builder, portfolio analytics, global search (⌘K).
- i18n / language selector, high-contrast mode, keyboard-shortcut layer.
