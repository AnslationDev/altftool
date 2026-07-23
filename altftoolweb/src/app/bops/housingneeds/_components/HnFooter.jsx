import Link from "next/link";
import { Home } from "lucide-react";
import { VERTICALS } from "../_data/verticals";
import { HN_BASE, HN_BRAND, HN_DISCLAIMER, HN_TAGLINE, hnVerticalUrl } from "../_data/site";

export default function HnFooter({ activeSlug = null }) {
  return (
    <footer className="hn-footer">
      <div className="hn-wrap">
        <div className="hn-footer-inner">
          <div>
            <Link href={HN_BASE} className="hn-brand">
              <span className="hn-brand-mark" aria-hidden="true">
                <Home size={16} strokeWidth={2.3} />
              </span>
              {HN_BRAND}
            </Link>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.865rem",
                lineHeight: 1.65,
                color: "var(--hn-muted)",
                maxWidth: "24rem",
              }}
            >
              {HN_TAGLINE}
            </p>
          </div>

          <nav aria-label="All services">
            <p
              style={{
                fontSize: "0.775rem",
                fontWeight: 650,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--hn-muted)",
                marginBottom: "0.75rem",
              }}
            >
              Services
            </p>
            <div className="hn-footer-links">
              {VERTICALS.map((vertical) => (
                <Link
                  key={vertical.slug}
                  href={hnVerticalUrl(vertical.slug)}
                  aria-current={vertical.slug === activeSlug ? "page" : undefined}
                >
                  {vertical.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <p className="hn-footer-note">{HN_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
