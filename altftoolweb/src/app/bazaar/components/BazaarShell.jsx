import Link from "next/link";
import { Noto_Sans_Devanagari } from "next/font/google";
import { PlusCircle } from "lucide-react";

import BazaarSearchBar from "./BazaarSearchBar";
import CompareBar from "./CompareBar";
import LocaleToggle, { LocaleToggleInline } from "./LocaleToggle";

/**
 * Devanagari for the Hindi interface. Geist (the site face) carries no
 * Devanagari, so without this every हिन्दी string falls back to whatever the
 * OS ships — Kohinoor on macOS, Nirmala UI on Windows — and the typeface
 * visibly changes per platform. Noto Sans Devanagari is loaded once here
 * (module scope, self-hosted by next/font, zero layout shift via size-adjust
 * metrics) and applied through `.bazaar-page :lang(hi)` in bazaar.css — so it
 * activates exactly where the i18n layer already marks Hindi text, and Latin
 * text never pays for it.
 */
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-devanagari",
});

/**
 * The Bazaar sub-header: search, location and the Sell CTA.
 *
 * Sits under the global AltFTool header on every Bazaar route so the primary
 * actions (search, post an ad) are always one tap away — the single most
 * important affordance in a classifieds product.
 *
 * Server component: only the search control itself is interactive, so the
 * shell stays in the prerendered HTML.
 */
export default function BazaarShell({ query = "", children }) {
  return (
    <main className={`bazaar-page ${devanagari.variable}`}>
      <div className="bzr-shell">
        <div className="sticky top-0 z-40 border-b border-(--border) bg-(--background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--background)/80">
          <div className="section-container flex items-center gap-2 py-2.5 sm:gap-3">
            <div className="min-w-0 flex-1">
              <BazaarSearchBar defaultQuery={query} />
            </div>
            <Link href="/bazaar/post" className="bzr-btn bzr-btn-sell shrink-0">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sell</span>
            </Link>
            <LocaleToggleInline />
          </div>
        </div>

        {/* Interface-language strip. Client child, but it renders `en` on the
            server and on the first client render, so the shell stays a server
            component and the prerendered HTML matches hydration. */}
        <LocaleToggle />

        {children}

        {/* Client child; it renders nothing until hydrated and non-empty, so
            the shell itself stays a server component. */}
        <CompareBar />
      </div>
    </main>
  );
}
