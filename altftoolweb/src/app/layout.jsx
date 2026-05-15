import "./theme.css";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/platform/navigation/Header";
import Footer from "@/platform/navigation/Footer";
import Script from "next/script";
import { CookieConsentProvider } from "@/platform/consentalerts/CookieConsentContext";
import { CookieBanner } from "@/platform/consentalerts/CookieBanner";
import { NewsletterSubscribeDialog } from "@/platform/consentalerts/NewsletterSubscribeDialog";
import GlobalAnimationProvider from "@/contexts/GlobalAnimationProvider";
import { AdsProvider } from "@/ads/AdsProvider";
import { Suspense } from "react";
import LazyChatBot from "@/platform/chatbot/LazyChatBot";
import { AlertProvider } from "@/shared/ui/AlertProvider";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
} from "@/platform/seo/generateMetadata";

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
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://altftool.com"),
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
        url: "/assets/logo3.png",
        width: 512,
        height: 512,
        alt: "AltFTool",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "AltFTool – Your Daily Digital Toolkit",
    description:
      "Free online tools, software picks, games, Chrome extensions, deals, ranked guides, and productivity utilities.",
    images: ["/assets/logo3.png"],
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
    icon: "/favicon1.png",
    shortcut: "/favicon.ico",
    apple: "/favicon1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <JsonLd
          id="altftool-site-schema"
          data={[createOrganizationJsonLd(), createWebsiteJsonLd()]}
        />

        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var manual = localStorage.getItem("themeManual") === "true";
              var stored = localStorage.getItem("appTheme");
              var valid = stored === "dark" || stored === "light";
              var theme = manual && valid ? stored : "dark";
              document.documentElement.setAttribute("data-theme", theme);
              document.documentElement.style.colorScheme = theme;
            } catch (_) {}
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
  <ThemeProvider>
    <CookieConsentProvider>
      <AlertProvider>

        <Suspense fallback={null}>
          <Header />
        </Suspense>

        <GlobalAnimationProvider>
          <AdsProvider>
            {children}
          </AdsProvider>
        </GlobalAnimationProvider>

        <CookieBanner />
        <NewsletterSubscribeDialog />
        <Suspense fallback={null}>
          <LazyChatBot />
        </Suspense>
        <Footer />

      </AlertProvider>
    </CookieConsentProvider>
  </ThemeProvider>
</body>
    </html>
  );
}
