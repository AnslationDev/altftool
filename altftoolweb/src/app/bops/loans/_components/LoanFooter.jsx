import Link from "next/link";
import { Landmark } from "lucide-react";

const LOANS_BASE = "/bops/loans";

const DISCLAIMER =
  "AltFTool is not a lender and does not make credit decisions. We help you compare options and connect with lending partners; rates, terms and approval depend on the lender and your circumstances. Nothing here is financial advice.";

/**
 * Slim footer for a Loans vertical page. `links` is `[{ slug, name }]` for the
 * other loan verticals, passed from the server so this stays a plain component
 * and never pulls the loan content files into a client bundle.
 */
export default function LoanFooter({ links = [], activeSlug = null }) {
  return (
    <footer className="hn-footer">
      <div className="hn-wrap">
        <div className="hn-footer-inner">
          <div>
            <Link href={LOANS_BASE} className="hn-brand">
              <span className="hn-brand-mark" aria-hidden="true">
                <Landmark size={16} strokeWidth={2.3} />
              </span>
              Loans
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
              Compare loan options and rates across trusted lending partners, and
              request a personalised quote in minutes — free, with no obligation.
            </p>
          </div>

          {links.length > 0 && (
            <nav aria-label="All loan types">
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
                Loan types
              </p>
              <div className="hn-footer-links">
                {links.map((link) => (
                  <Link
                    key={link.slug}
                    href={`${LOANS_BASE}/${link.slug}`}
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
