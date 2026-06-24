"use client";

import FloatingCallIcon from "./FloatingCallIcon";
import { useTripFindBoxContactInfo } from "@/app/tripfindbox/hooks/useTripFindBoxContactInfo";

export default function MobileResultsCallBar({
  className = "mobile-results-callbar",
  ariaLabel = "Call TripFindBox support",
  initialContact,
}) {
  const contact = useTripFindBoxContactInfo(initialContact);

  return (
    <aside className={className} aria-label={ariaLabel}>
      <a href={contact.href}>
        <span><FloatingCallIcon /></span>
        <strong>{contact.mobileCallText}</strong>
        <b>{contact.phone}</b>
      </a>
    </aside>
  );
}
