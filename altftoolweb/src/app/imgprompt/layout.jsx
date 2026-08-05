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
  title: "AltF Prompt Studio - Professional AI Prompts",
  description:
    "Draft, review and adapt AI image, video and story prompts with a local structure checklist, then copy them into your preferred workflow.",
  path: "/imgprompt",
});

export default function ImgPromptLayout({ children }) {
  return (
    <div className={`imgprompt-scope app-scroll ${geist.variable} ${jetbrains.variable}`}>
      <Providers>{children}</Providers>
    </div>
  );
}
