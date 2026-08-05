import { Fraunces } from "next/font/google";
import Top5Bar from "./components/Top5Bar";
import Footer from "./components/Footer";
import Top5MotionProvider from "./components/Top5MotionProvider";
import "./top5.css";

// Top5 is a self-chrome microsite: it is registered in GlobalChromeGate's
// SELF_CHROME_PREFIXES, so the platform-wide AltFTool header/footer stay
// out of the way and this layout renders the section's own chrome — the
// sticky "Top5 by Alt F" navbar (Top5Bar) on top and the Top5 footer
// below. It also scopes the display font and metadata to /top5.
export const metadata = {
  title: {
    default: "Top5 – Discover the World's Top 5 Rankings",
    template: "%s | Top5",
  },
  description:
    "Top5 is the global discovery and ranking platform for the people, products, places, and ideas that define what is exceptional — five at a time.",
robots: {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
},
};

// Scoped to /top5 only: an editorial display serif for the hero and the
// "top 5 reveal" showcase headings, echoing the agency-style reference brief.
// Nothing outside this microsite imports or is affected by this font.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-top5-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function Top5Layout({ children }) {
  return (
    <Top5MotionProvider>
      <div className={`top5-root bg-page text-foreground ${fraunces.variable}`}>
        <Top5Bar />
        <div className="border-y border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning-text" role="note">
          <p className="mx-auto max-w-7xl">
            Preview data: rankings, scores, activity counts, reviewer bylines, update times, and process descriptions in Top5 are illustrative editorial demo content—not live measurements or proof of independent review.
          </p>
        </div>
        <main>{children}</main>
        <Footer />
      </div>
    </Top5MotionProvider>
  );
}
