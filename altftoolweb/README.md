## AltFTool.com

AltFTool is a Next.js platform for **micro tools**, **web games**, **Chrome extensions**, **blogs/news**, and product discovery experiences (ex: BuySmart). This repo contains the full frontend (App Router) plus client-side tool/game runtimes, a Firebase-backed ads system, and an AI chatbot proxy implemented with Next.js Server Actions.

### Tech stack

- **Framework**: Next.js (App Router) (`next`)
- **UI**: React 19 (`react`, `react-dom`)
- **Styling**: Tailwind CSS v4 + PostCSS (`tailwindcss`, `@tailwindcss/postcss`, `postcss`)
- **Animation**
  - **Framer Motion** for page/interactive animations (`framer-motion`)
  - **Web Animations API** + IntersectionObserver-based global animation system (`src/contexts/GlobalAnimationProvider.jsx`)
- **Backend services**
  - **Firebase** client SDK (Firestore + Storage) (`firebase`)
  - **Firebase Admin** (used by some server-side modules) (`firebase-admin`)
- **Content & UI utilities**: `react-markdown`, `swiper`, `chart.js`, `react-chartjs-2`, `three`, `leaflet`, `react-leaflet`, etc.
- **Linting**: ESLint (`eslint`, `eslint-config-next`)

### Features (high level)

- **Micro tools platform**: dozens of tools under `/tools/...` loaded on-demand (client-only) for performance.
- **Games hub**: registry-driven game catalog with a bento grid UI and motion effects.
- **Extensions hub**: registry-driven listing + detail pages, category/search, plus ad injection.
- **Custom theme system**: system/light/dark modes via `data-theme` attribute and CSS variables.
- **Scroll-triggered animations**: add a class like `animate-fade-up` and it plays once when visible.
- **Ads system**: Firestore-backed ads with placement/layout/device targeting + helper hooks.
- **AI Chatbot**: client UI + server action proxy that can use multiple providers based on env keys.

---

## Getting started (local development)

### Prerequisites

- **Node.js**: use a modern Node LTS (recommended).  
- **Package manager**: npm (this repo includes `package.json` scripts using npm commands).

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Then open `http://localhost:3000`.

### Build & run production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Environment variables

This project expects a few environment variables depending on which modules you use locally.

### Firebase (required for Firestore/Storage-backed features)

Used by `src/lib/firebase.js`.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Ads (optional)

Ads are provided by `src/ads/AdsProvider.jsx`.

- `NEXT_PUBLIC_USE_MOCK`  
  - If set to `"true"`, the Ads provider uses local mock data instead of Firestore.

### Chatbot AI providers (optional)

Server action: `src/platform/chatbot/actions.js`. It tries providers in order and uses the **first** one with a configured API key.

- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_DEEPSEEK_API_KEY`

Notes:
- These are read on the server in a Server Action. Keep secrets out of the client.
- If no keys are configured, the chatbot will gracefully report providers are unavailable.

---

## Project structure (important folders)

- **App Router**: `src/app/`
  - Routes live here (marketing, tools, blogs, games, extensions, news, policy pages, etc.)
  - Global layout: `src/app/layout.jsx`
  - Global CSS: `src/app/globals.css`
  - Theme tokens for “color-*” variables: `src/app/theme.css`
- **Tool runtimes**: `src/tools/<tool-slug>/`
  - `entry.jsx` is the dynamic import entrypoint used by the tool loader.
  - Many tools also include `pages/index.jsx` and `components/*` (tool UI).
- **Games**: `src/games/<game-slug>/Game.jsx`
- **Platform registries**: `src/platform/registry/`
  - `toolRuntimeMap.js`: maps tool slug → dynamic import
  - `toolMetaMap.js`: maps tool slug → name/description/category/icon
  - `gameMap.js`: maps game slug → metadata + componentPath + cover image path
  - `extensionMap.js`: maps extension slug → metadata + chromeUrl
  - `animationRegistry.js`: the global animation keyframes/options registry
- **Global contexts**: `src/contexts/`
  - `ThemeContext.jsx`: resolves system/light/dark modes for `data-theme`
  - `GlobalAnimationProvider.jsx`: IntersectionObserver + Web Animations API runner
- **Ads**: `src/ads/`
  - Hooks and layout components + injector utilities used by tools/games/extensions/blogs.
- **Chatbot**: `src/platform/chatbot/`
  - UI components + “brain” that uses registries + dynamic JSON data and calls the server action.

### Blog architecture

- Blog routes use a static-first catalog in `src/app/blogs/data/blogs.js`; this normalizes local JSON and gives `/blogs` and known `/blogs/[slug]` pages immediate content before Firebase responds.
- `src/app/blogs/page.jsx` is a server-rendered shell for the hero/editorial sections. `src/app/blogs/components/BlogExplorerClient.jsx` owns only search, filters, sort, chunked auto-loading, and idle Firebase hydration.
- `src/app/blogs/[slug]/page.jsx` passes static article data into `BlogDetailClient.jsx`; the client quietly refreshes from Firestore and only persists likes/comments when a real Firestore document id is available.

---

## Styling guide (CSS + Tailwind + theme)

### Tailwind CSS

- Tailwind is enabled via PostCSS and imported in `src/app/globals.css`:
  - `@import "tailwindcss";`
- Tailwind scans these directories (see `tailwind.config.js`):
  - `./src/**/*.{js,jsx,ts,tsx}`
  - `./app/**/*.{js,jsx,ts,tsx}`
  - `./components/**/*.{js,jsx,ts,tsx}`

### Global styles

- `src/app/globals.css` contains:
  - Base defaults for `html, body`
  - CSS variables for `--background`, `--foreground`, `--primary`, etc.
  - Reusable typography classes like `.heading`, `.subheading`, `.description`
  - Some global keyframes/utilities (ex: `.text-gradient-hero`, `.animate-shine`, etc.)

### Theming (system/light/dark)

- Theme is controlled by setting a `data-theme` attribute on `<html>`:
  - Light: default
  - Dark: `[data-theme="dark"]`
- Provider: `src/contexts/ThemeContext.jsx`
  - Uses OS theme by default through `appThemeMode: "system"`.
  - Manual choices persist in `localStorage` as `appThemeMode` (`system`, `light`, or `dark`).
  - Manual light/dark also writes the legacy `appTheme` and `themeManual` keys for compatibility.
- Color tokens:
  - `src/app/globals.css` defines `--background`, `--foreground`, `--primary`, etc.
  - `src/app/theme.css` defines a parallel set of `--color-*` variables used by some sections/components.

### Adding new CSS

Preferred options (in order):

- **Tailwind utilities** for component styling.
- **Global CSS variables** when you need theme-aware tokens.
- **Route/section CSS** for marketing-specific patterns:
  - Example: `src/app/styles/landing.css` is imported by `src/app/(marketing)/page.jsx`.

---

## Animation guide

This project uses **two** animation approaches:

### 1) Global “scroll into view” animations (Web Animations API)

Provider: `src/contexts/GlobalAnimationProvider.jsx`  
Registry: `src/platform/registry/animationRegistry.js`

How it works:

- Any element with a registered class (ex: `animate-fade-up`) starts hidden (`opacity: 0`) and animates when it enters the viewport.
- Reduced motion is respected: if the user has `prefers-reduced-motion: reduce`, elements are shown immediately (no animation).

Use it in JSX:

```jsx
<h2 className="animate-fade-up">Hello</h2>
<p className="animate-slide-left" data-delay="100">
  Staggered content
</p>
```

Per-element overrides (data attributes, from `animationRegistry.js`):

- `data-delay="200"`: adds extra delay (ms)
- `data-duration="400"`: override duration (ms)
- `data-easing="linear"`: override easing
- `data-index="3"` + `data-stagger="60"`: stagger helpers (index-based delay)

Replay behavior:

- By default, an element animates once and is unobserved.
- If you need repeated animations for a specific element, add `data-animate-repeat` (the provider checks `dataset.animateRepeat`).

### 2) Framer Motion (component-level)

Used in interactive/complex UI (example: games listing bento grid). Prefer this when you need layout transitions, spring physics, or orchestrated sequences.

---

## Adding / editing micro tools

Tools are **loaded dynamically** on tool detail pages.

### Tool routes

- Tools listing page: `src/app/tools/page.jsx` → renders `src/app/tools/MicrotoolClient`
- Tool detail page route: `src/app/tools/[category]/[slug]/page.jsx`
  - Renders `src/app/tools/[category]/[slug]/ToolClient.jsx`

`ToolClient` loads tools client-side via:

- `src/platform/registry/toolRuntimeMap.js` (slug → `import("@/tools/<slug>/entry")`)

### Tool implementation structure

Typical tool folder:

- `src/tools/<tool-slug>/entry.jsx` (required)
- `src/tools/<tool-slug>/pages/index.jsx` (tool UI “home”)
- `src/tools/<tool-slug>/components/*`
- `src/tools/<tool-slug>/utils/*` (optional)

### Registering a tool

This repo uses auto-generated registries:

- `src/platform/registry/toolRuntimeMap.js` (runtime loader)
- `src/platform/registry/toolMetaMap.js` (listing metadata)

If you add a new tool folder, you’ll need to update/regenerate these maps using the project’s internal workflow.

---

## Adding / editing games

Games are defined in `src/platform/registry/gameMap.js` and implemented in `src/games/<slug>/Game.jsx`.

### Cover images

- Place cover assets in `public/games/` and reference them in `gameMap.js` (ex: `image: "/games/cover_tic_tac_toe.png"`).
- Follow the sizing guide: `docs/game_image_guide.md`.

---

## Adding / editing extensions

Extensions are defined in `src/platform/registry/extensionMap.js`.

Routes:

- Listing: `src/app/extensions/page.jsx` (client: `src/app/extensions/ExtensionClient.jsx`)
- Detail: `src/app/extensions/[slug]/page.jsx`

To add an extension:

- Add an entry to `extensionMap` with:
  - `name`, `description`, `category`, `image`
  - `chromeUrl` (use `"#"` if not published yet)
  - `features[]`, `rating`

---

## Ads system (placements + hooks)

Ads provider: `src/ads/AdsProvider.jsx`

It reads from Firestore collection `ads` where `status == "active"` (unless `NEXT_PUBLIC_USE_MOCK === "true"`).

Common hooks:

- `useAds({ placement, layout, device })`: generic placement filter
- `useBlogAds(...)`: blog-specific targeting (slug/category/global fallback)
- `useToolAds(...)`: tool-specific targeting (tool slug/categories/global fallback)

Ads can be injected into lists using helpers like `injectAds` / `injectRandomAds` (see usages in tools/games/extensions clients).

---

## Images configuration

Remote images are allowlisted in `next.config.mjs` under `images.remotePatterns` (Unsplash, GitHub avatars, Firebase Storage, etc.).  
If you add a new remote image host, update `next.config.mjs` accordingly.

---

## Deployment notes

- This is a standard Next.js app (`npm run build` then `npm run start`).
- For production, set all required environment variables in your hosting provider.
- Analytics scripts are injected in `src/app/layout.jsx`; ensure your production domains match expected behavior.
