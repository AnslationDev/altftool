import "./theme.css";
import { Manrope } from "next/font/google";
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
import ChatBot from "@/platform/chatbot";
import { AlertProvider } from "@/shared/ui/AlertProvider";

// const bricolage = Bricolage_Grotesque({
//   subsets: ["latin"],
//   weight: ["200", "300", "400", "500", "600", "700", "800"],
// });
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});
export const metadata = {
  title: {
    default: "AltFTool – Your Daily Digital Toolkit",
    template: "%s | AltFTool",
  },
  description:
    "AltFTool is your online tools website with free tools, software, games, must-have Chrome extensions, and best web tools to boost productivity and fun.",
  icons: {
    icon: "/favicon1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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

      <body className={manrope.className}>
  <ThemeProvider>
    <CookieConsentProvider>
      <AlertProvider> {/* 👈 MOVE HERE */}

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
        <ChatBot />
        <Footer />

      </AlertProvider>
    </CookieConsentProvider>
  </ThemeProvider>
</body>
    </html>
  );
}
