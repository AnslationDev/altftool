import "./theme.css";
import { Geist } from "next/font/google";
import "./globals.css";

import NotFound from "./not-found";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata = {
  title: "Page Not Found | AltFTool",
  description: "The requested page does not exist.",
};

const themeInitializer = `(function(){var d=document.documentElement;try{var s=localStorage.getItem("appThemeMode"),lm=localStorage.getItem("themeManual")==="true",lt=localStorage.getItem("appTheme"),vm=s==="system"||s==="light"||s==="dark",vl=lt==="light"||lt==="dark",m=vm?s:(lm&&vl?lt:"system"),pd=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches,t=m==="system"?(pd?"dark":"light"):m;d.setAttribute("data-theme",t);d.setAttribute("data-theme-mode",m);d.style.colorScheme=t;}catch(e){var f=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",f);d.setAttribute("data-theme-mode","system");d.style.colorScheme=f;}})();`;

/**
 * Routing-level fallback for URLs that match no application route.
 *
 * Unlike a streamed root not-found boundary, global-not-found lets Next.js
 * return the branded screen with a real HTTP 404 status.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={geistSans.variable}
      data-theme-mode="system"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="anslation-ds-public antialiased">
        <main id="main-content">
          <NotFound />
        </main>
      </body>
    </html>
  );
}
