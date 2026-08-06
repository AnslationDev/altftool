import { ArrowUpRight, Phone } from "lucide-react";

// Outbound quote links are assumed to be affiliate / paid-partner
// destinations, so they carry `sponsored` alongside the usual new-tab safety
// rels. Kept as one constant so every conversion link on the module is
// identical.
export const QUOTE_LINK_REL = "sponsored noopener noreferrer";

const PLACEHOLDER_QUOTE_HOST = "example.com";

function isPlaceholderQuoteUrl(href) {
  try {
    return new URL(href, "https://placeholder.invalid").hostname === PLACEHOLDER_QUOTE_HOST;
  } catch {
    return false;
  }
}

/**
 * The single conversion element for the whole Loans module.
 *
 * Two modes, so a vertical can be wired to either an outbound quote partner or
 * a phone number later without touching the pages:
 *   "cta"   outbound link, new tab, sponsored rel (the default)
 *   "phone" tel: link, same tab, no target and no sponsored rel — a phone call
 *           is not a paid referral and must not open a blank tab
 *
 * The `!href` guard lets a header render this unconditionally and simply get
 * nothing when no quote URL is configured.
 */
export default function LoanQuoteButton({
  href,
  label,
  mode = "cta",
  size = "",
  className = "hn-btn hn-btn--primary",
}) {
  if (!href) return null;

  if (href === "#demo-only") {
    return <button type="button" className={`${className} ${size}`.trim()} disabled title="Demo only">{label}</button>;
  }

  if (mode === "phone") {
    return <button type="button" className={`${className} ${size}`.trim()} disabled title="Demo only"><Phone size={15} strokeWidth={2.4} aria-hidden="true" />{label}</button>;
  }

  if (isPlaceholderQuoteUrl(href)) {
    return (
      <button
        type="button"
        className={`${className} ${size}`.trim()}
        disabled
        title="Coming soon"
      >
        {label}
      </button>
    );
  }

  return (
    <a
      className={`${className} ${size}`.trim()}
      href={href}
      target="_blank"
      rel={QUOTE_LINK_REL}
    >
      {label}
      <ArrowUpRight size={16} strokeWidth={2.3} className="hn-ext-icon" aria-hidden="true" />
      <span className="hn-sr-only"> (opens in a new tab)</span>
    </a>
  );
}
