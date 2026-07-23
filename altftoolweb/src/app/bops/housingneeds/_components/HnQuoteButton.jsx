import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { QUOTE_LINK_REL } from "../_data/site";

/**
 * The single conversion element for the whole module.
 *
 * Renders one of two modes, driven by the CMS Business Ops config:
 *   "cta"   outbound link, new tab, rel carries `sponsored` (see
 *           QUOTE_LINK_REL) on the assumption these are affiliate or
 *           paid-partner destinations
 *   "phone" tel: link, same tab, no target and no sponsored rel — a phone
 *           call is not a paid referral and must not open a blank tab
 *
 * Declared at module scope rather than inside a page component — defining it
 * during render trips react-hooks/static-components and remounts the node on
 * every render.
 *
 * The `!href` guard is load-bearing: the HousingNeeds hub renders HnHeader
 * without a quoteUrl and relies on this returning null so no button appears
 * there. Do not loosen it.
 */
export default function HnQuoteButton({
  href,
  label,
  mode = "cta",
  size = "",
  className = "hn-btn hn-btn--primary",
}) {
  if (!href) return null;

  if (mode === "phone") {
    return (
      <a className={`${className} ${size}`.trim()} href={href}>
        <Phone size={15} strokeWidth={2.4} aria-hidden="true" />
        {label}
      </a>
    );
  }

  const isInternal = href.startsWith("/") || href.startsWith("#");
  const ActionIcon = isInternal ? ArrowRight : ArrowUpRight;

  return (
    <a
      className={`${className} ${size}`.trim()}
      href={href}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : QUOTE_LINK_REL}
    >
      {label}
      <ActionIcon size={16} strokeWidth={2.3} className="hn-ext-icon" aria-hidden="true" />
      {!isInternal && <span className="hn-sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
