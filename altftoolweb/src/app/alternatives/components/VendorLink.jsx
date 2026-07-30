// The single outbound-link primitive for /alternatives and /deals.
//
// Both families link out constantly, and they have to: a price is only worth
// citing because the vendor page it was read from is one click away. Before
// this component the rel string was typed out at six separate call sites and
// kept in sync by hand, which is exactly how a link family drifts.
//
// WHY THIS REL, AND WHY NOT THE OTHER ONE
//
//   nofollow   — these links are evidence, not endorsement. We cite the vendor
//                as the source of a figure; several of them are competitors,
//                and we gain nothing by passing ranking equity to them.
//   noopener   — every one of these opens in a new tab, so the opened document
//                must not receive a handle on window.opener.
//
//   NOT sponsored — there is no affiliate, referral, commission or paid
//                placement arrangement behind a single outbound link in either
//                family. Every href is the vendor's own plain URL with no
//                tracking parameter, no redirect hop and no partner ID. A
//                `sponsored` rel on a link that is not sponsored is a false
//                disclosure, so it must not be added here speculatively. If an
//                arrangement is ever signed, mark only the links it covers —
//                the pattern already exists in this repo (src/ads/** and
//                src/app/bops/loans/_components/LoanQuoteButton.jsx).
//
//   noreferrer is deliberately absent: alongside `noopener` it adds nothing for
//                security, and stripping the referrer from a vendor we are
//                citing solves no problem we have.
//
// Internal links never come through here — they stay followable next/link
// <Link>s with no rel, so link equity keeps moving around the site.
//
// This lives under /alternatives rather than /deals because the coupling
// between the two families already runs one way — deals/data/paidProducts.js
// imports alternatives/data/incumbents.js — and a UI import in the opposite
// direction would make it circular.
//
// Server component: no state, nothing reaches the client bundle.

import { ExternalLink } from "lucide-react";

/** Fixed for every vendor link in both families. See the note above. */
export const VENDOR_LINK_REL = "nofollow noopener";

/**
 * @param {object} props
 * @param {string} props.href           Vendor URL. Absolute, https, no tracking params.
 * @param {React.ReactNode} props.children Visible link text.
 * @param {string} [props.className]    Call-site styling.
 * @param {boolean} [props.showIcon]    Render the new-tab glyph after the text.
 * @param {string} [props.iconClassName] Sizing for that glyph.
 * @param {boolean} [props.newTabHint]  Append the screen-reader "opens in a new
 *   tab" cue. Set false only where the surrounding copy already says it once
 *   for a whole list, so the cue is not repeated on every item.
 */
export default function VendorLink({
  href,
  children,
  className = "",
  showIcon = true,
  iconClassName = "mt-1 h-3 w-3 flex-none",
  newTabHint = true,
}) {
  if (!href) return children ?? null;

  return (
    <a href={href} rel={VENDOR_LINK_REL} target="_blank" className={className}>
      {children}
      {showIcon ? <ExternalLink className={iconClassName} aria-hidden="true" /> : null}
      {newTabHint ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
