import "./theme.css";
import { Geist, Geist_Mono, IBM_Plex_Sans, Inter, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/platform/navigation/Header";
import Footer from "@/platform/navigation/Footer";
import Script from "next/script";
import { NewsletterSubscribeDialog } from "@/platform/consentalerts/NewsletterSubscribeDialog";
import ScrollToTopButton from "@/platform/navigation/ScrollToTopButton";
import GlobalAnimationProvider from "@/contexts/GlobalAnimationProvider";
import { AdsProvider } from "@/ads/AdsProvider";
import GoogleAdUnit from "@/ads/GoogleAdUnit";
import ProductionAdSenseScript from "@/ads/ProductionAdSenseScript";
import { isAdsenseProductionDeployment } from "@/ads/adsenseConfig";
import { Suspense } from "react";
import { connection } from "next/server";
import { AlertProvider } from "@/shared/ui/AlertProvider";
import JsonLd from "@/platform/seo/JsonLd";
import { primeSeoConfig, loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveInjectedCode } from "@altftool/core/seo";
import InjectedCode from "@/platform/seo/InjectedCode";
import PerPageCode from "@/platform/seo/PerPageCode";
import GlobalNavigationLoader from "@/components/ui/GlobalNavigationLoader";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import GlobalChromeGate from "@/platform/navigation/GlobalChromeGate";
import { HeaderLoadingSkeleton } from "@/components/ui/route-loading";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { CHROME_LIGHT, CHROME_DARK } from "./chromeColors";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Sora and IBM Plex Sans are declared here so their CSS variables and
// @font-face rules stay global, but only a handful of routes actually render
// them. Preloading both from the root layout put 73.9 KB of highest-priority
// woff2 on the critical path of all 390 routes, ahead of a stylesheet that is
// itself only 104 KB. `preload: false` keeps the faces available everywhere
// and lets the routes that use them fetch on demand.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  preload: false,
});

const shouldLoadGoogleAds = isAdsenseProductionDeployment();

const baseMetadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: "AltFTool",
  title: {
    default: "AltFTool – Your Daily Digital Toolkit",
    template: "%s | AltFTool",
  },
  description:
    "AltFTool is your online tools website with free tools, software, games, must-have Chrome extensions, and best web tools to boost productivity and fun.",
  keywords: [
    "online tools",
    "free web tools",
    "micro tools",
    "developer tools",
    "PDF tools",
    "image tools",
    "productivity tools",
    "AltFTool",
  ],
  authors: [{ name: "AltFTool" }],
  creator: "AltFTool",
  publisher: "AltFTool",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "AltFTool",
    title: "AltFTool – Your Daily Digital Toolkit",
    description:
      "Free online tools, software picks, games, Chrome extensions, deals, ranked guides, and productivity utilities in one daily digital toolkit.",
    url: "/",
    images: [
      {
        url: siteConfig.defaultImagePath,
        width: 1200,
        height: 630,
        alt: "AltFTool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AltFTool – Your Daily Digital Toolkit",
    description:
      "Free online tools, software picks, games, Chrome extensions, deals, ranked guides, and productivity utilities.",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.defaultImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    // Square, purpose-built icons generated from the brand mark. The previous
    // set pointed at /favicon1.png — 255x248, so not square — for both the tab
    // icon and the iOS home screen, where iOS would have letterboxed it on a
    // black field.
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/altftool-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "AltFTool",
    // "default" rather than "black-translucent": translucent forces white
    // status-bar glyphs, which vanish against the light theme's near-white
    // page. "default" keeps the bar legible in both themes and lets iOS tint
    // it from theme-color.
    statusBarStyle: "default",
  },
  other: {
    // Chrome deprecated apple-mobile-web-app-capable in favour of this one;
    // Next only emits the Apple-prefixed form from `appleWebApp`.
    "mobile-web-app-capable": "yes",
  },
};

// viewport-fit: "cover" is the switch that makes env(safe-area-inset-*)
// resolve to real values on notched phones. Code across the app already
// assumes it — BlogReaderTools pins to
// bottom-[calc(1rem+env(safe-area-inset-bottom))], the step counter and
// tripfindbox stylesheets do the same in dozens of places — and until now every
// one of those insets evaluated to 0 because no viewport was exported at all,
// so Next fell back to its plain `width=device-width, initial-scale=1`.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Deliberately no maximumScale / user-scalable: capping pinch-zoom fails
  // WCAG 1.4.4, and there is nothing to gain from it.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: CHROME_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: CHROME_DARK },
  ],
};

// Warm the central SEO config snapshot for the whole render tree BEFORE any
// child page's generateMetadata runs, so per-URL overrides actually apply.
// (Next resolves metadata root-first.) Fully inert when the engine is disabled.
export async function generateMetadata() {
  await primeSeoConfig();
  return baseMetadata;
}

export default async function RootLayout({ children }) {
  // Amplify has a strict build-output cap. Keep pages crawlable through SSR
  // while avoiding hundreds of duplicate HTML/RSC artifacts in that build.
  if (shouldDeferBulkPrerendering()) await connection();

  // Admin-authored custom code (raw HTML/scripts). Global is SSR-injected here;
  // per-page code is injected client-side (only when the site has any).
  const seoConfig = await loadSeoConfig().catch(() => null);
  const { global: customCode } = resolveInjectedCode(seoConfig, null);
  const hasPageCode =
    seoConfig?.enabled !== false &&
    !!seoConfig?.pages &&
    // Activate for pages that have custom code OR per-page JSON-LD (schema), so
    // AI-/admin-authored structured data is injected even when a page has no
    // raw code block.
    Object.values(seoConfig.pages).some((p) => p && (p.code || p.schema));
  return (
    <html lang="en" data-theme-mode="system" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${inter.variable} ${ibmPlexSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <ProductionAdSenseScript enabled={shouldLoadGoogleAds} />
        <JsonLd
          id="altftool-site-schema"
          data={[createOrganizationJsonLd(), createWebsiteJsonLd()]}
        />

        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var storedMode = localStorage.getItem("appThemeMode");
              var legacyManual = localStorage.getItem("themeManual") === "true";
              var legacyTheme = localStorage.getItem("appTheme");
              var validMode = storedMode === "system" || storedMode === "light" || storedMode === "dark";
              var validLegacy = legacyTheme === "light" || legacyTheme === "dark";
              var mode = validMode ? storedMode : (legacyManual && validLegacy ? legacyTheme : "system");
              var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
              var theme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
              document.documentElement.setAttribute("data-theme", theme);
              document.documentElement.setAttribute("data-theme-mode", mode);
              document.documentElement.style.colorScheme = theme;
            } catch (_) {
              try {
                var fallbackTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                document.documentElement.setAttribute("data-theme", fallbackTheme);
                document.documentElement.setAttribute("data-theme-mode", "system");
                document.documentElement.style.colorScheme = fallbackTheme;
              } catch (_) {}
            }
          `}
        </Script>

        <Script id="retire-third-party-service-worker" strategy="afterInteractive">
          {`
            (function () {
              if (!("serviceWorker" in navigator)) return;

              navigator.serviceWorker.getRegistrations().then(function (registrations) {
                var legacyRegistrations = registrations.filter(function (registration) {
                  return [registration.installing, registration.waiting, registration.active]
                    .filter(Boolean)
                    .some(function (worker) {
                      try {
                        return new URL(worker.scriptURL).pathname === "/sw.js";
                      } catch (_) {
                        return false;
                      }
                    });
                });

                if (!legacyRegistrations.length) return;

                return Promise.all(legacyRegistrations.map(function (registration) {
                  return registration.unregister();
                })).then(function () {
                  if (!("caches" in window)) return;
                  return caches.keys().then(function (cacheNames) {
                    return Promise.all(cacheNames.map(function (cacheName) {
                      return caches.delete(cacheName);
                    }));
                  });
                });
              }).catch(function () {});
            })();
          `}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G07GM6LKP1"
          strategy="afterInteractive"
        />

        <Script id="ga-init" strategy="afterInteractive">
          {`
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-G07GM6LKP1');
      gtag('config', 'AW-17780489814');
    }
  `}
        </Script>

        <Script id="clarity-init" strategy="afterInteractive">
          {`
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "uqfdjzcebf");
    }
  `}
        </Script>
      </head>

      <body className="anslation-ds-public antialiased">
        {/* Browser extensions (form fillers) stamp fdprocessedid on inputs and
            buttons before React hydrates, which triggers hydration-mismatch
            errors on every page. Strip the attribute the instant it appears,
            then stop watching once hydration is safely done. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var strip=function(n){if(n&&n.removeAttribute)n.removeAttribute("fdprocessedid");};var all=function(){if(!document.querySelectorAll)return;var ns=document.querySelectorAll("[fdprocessedid]");for(var i=0;i<ns.length;i++)strip(ns[i]);};var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==="attributes")strip(m.target);}});mo.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:["fdprocessedid"]});all();setTimeout(function(){mo.disconnect();},15000);}catch(e){}})();`,
          }}
        />
        {/* Keep the browser chrome (Android status/URL bar, iOS standalone
            status bar) locked to the page background.

            The two theme-color metas emitted by the viewport export follow the
            OS preference, but this site's theme is an explicit user choice
            stored in localStorage — a visitor on a light phone who picks dark
            would otherwise get a white status bar over a navy page. The whole
            theme is driven by data-theme on <html>, and ThemeProvider rewrites
            that attribute both when the user switches and when the OS
            preference changes, so watching that one attribute covers every
            case. Runs before first paint; the media-query metas remain the
            no-JS default. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var C={dark:${JSON.stringify(CHROME_DARK)},light:${JSON.stringify(CHROME_LIGHT)}};var sync=function(){var t=document.documentElement.getAttribute("data-theme")==="dark"?C.dark:C.light;var m=document.querySelectorAll('meta[name="theme-color"]');if(!m.length){var e=document.createElement("meta");e.setAttribute("name","theme-color");e.setAttribute("content",t);document.head.appendChild(e);return;}for(var i=0;i<m.length;i++){m[i].removeAttribute("media");m[i].setAttribute("content",t);}};sync();new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});}catch(e){}})();`,
          }}
        />
  <InjectedCode id="head" html={customCode.head} />
  <InjectedCode id="body-start" html={customCode.bodyStart} />
  <PerPageCode active={hasPageCode} />
  <ThemeProvider>
    <AuthProvider>
      <AlertProvider>
        <GlobalNavigationLoader />
        <a className="skip-to-content" href="#main-content">
          Skip to main content
        </a>

        <GlobalChromeGate>
          <Suspense fallback={<HeaderLoadingSkeleton />}>
            <Header />
          </Suspense>
        </GlobalChromeGate>

        <GlobalAnimationProvider>
          <AdsProvider>
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </AdsProvider>
        </GlobalAnimationProvider>
        {/* AltBot (chatbot) removed for now — planned for a future release.
            Its module lived at src/platform/chatbot/. */}
        <GlobalChromeGate>
          <GoogleAdUnit enabled={shouldLoadGoogleAds} />
          <Footer />
        </GlobalChromeGate>

        <GlobalChromeGate>
          <ScrollToTopButton />
          <NewsletterSubscribeDialog />
        </GlobalChromeGate>

        <WebVitalsReporter />
        <InjectedCode id="body-end" html={customCode.bodyEnd} />

      </AlertProvider>
    </AuthProvider>
  </ThemeProvider>
</body>
    </html>
  );
}
