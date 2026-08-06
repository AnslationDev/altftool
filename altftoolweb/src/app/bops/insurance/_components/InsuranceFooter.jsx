import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const INSURANCE_BASE = "/bops/insurance";

const DISCLAIMER =
  "ALTFTool is not an insurer, insurance agency, or broker. These pages are general educational demonstrations: we do not sell policies, provide rates, collect quote requests, or connect visitors with providers. Verify current rules and licensing with your state insurance regulator. Nothing here is insurance advice.";

/**
 * Slim footer for an Insurance vertical page. `links` is `[{ slug, name }]` for
 * the other insurance types, passed from the server so this stays a plain
 * component and never pulls the content files into a client bundle.
 */
export default function InsuranceFooter({ links = [], activeSlug = null }) {
  return (
    <footer className="hn-footer">
      <div className="hn-wrap">
        <div className="hn-footer-inner">
          <div>
            <Link href={INSURANCE_BASE} className="hn-brand">
              <span className="hn-brand-mark" aria-hidden="true">
                <ShieldCheck size={16} strokeWidth={2.3} />
              </span>
              Insurance
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
              Read general insurance guides and learn what to verify before contacting
              a licensed provider or your state insurance regulator.
            </p>
          </div>

          {links.length > 0 && (
            <nav aria-label="All insurance types">
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
                Insurance types
              </p>
              <div className="hn-footer-links">
                {links.map((link) => (
                  <Link
                    key={link.slug}
                    href={`${INSURANCE_BASE}/${link.slug}`}
                    aria-current={link.slug === activeSlug ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>

        <p className="hn-footer-note">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
