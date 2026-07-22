import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const INSURANCE_BASE = "/business-ops/insurance";

const DISCLAIMER =
  "AltFTool is not an insurance company or agency and does not sell insurance. We help you compare options and connect with licensed insurers and agents; quotes, coverage, eligibility and pricing depend on the provider, your state and your circumstances. Nothing here is insurance advice.";

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
              Compare insurance quotes across trusted, licensed providers and find
              the right coverage in minutes — free, with no obligation.
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
