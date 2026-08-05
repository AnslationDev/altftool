import { Fraunces } from "next/font/google";

// Top5 now uses the common AltFTool header/footer (same as /top9 and
// /top11) — it is no longer registered as a self-chrome route in
// GlobalChromeGate, so the platform-wide Header/Footer render around it
// automatically from the root layout. This file only exists to scope the
// display font and the route's metadata to /top5.
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
    <div className={`top5-root bg-white ${fraunces.variable}`}>
      <main>{children}</main>
    </div>
  );
}
