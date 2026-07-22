import { Geist, JetBrains_Mono } from "next/font/google";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "./globals.css";
import { Providers } from "./providers/Providers";

/** Base44's own body copy runs on Geist (their headline font, "Dazzed",
 *  is a proprietary/licensed font with no public access) — using the same
 *  real typeface here, for both text roles, is the closest honest match
 *  to their theme's typography that's actually achievable. */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-imgprompt-geist",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-imgprompt-mono",
  display: "swap",
});

export const metadata = createPageMetadata({
  title: "AltF Prompt Studio - Create Professional AI Prompts",
  description:
    "Generate better AI image, video & story prompts with AI Prompt Intelligence. Score, optimize and copy prompts in seconds.",
  path: "/imgprompt",
});

export default function ImgPromptLayout({ children }) {
  return (
    <div className={`imgprompt-scope app-scroll ${geist.variable} ${jetbrains.variable}`}>
      <Providers>{children}</Providers>
    </div>
  );
}
