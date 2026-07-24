import { BadgeCheck, Lock, MapPin, ShieldCheck, Star } from "lucide-react";

// A slim strip of honest trust signals. Placed high on the page (right under
// the hero) so visitors feel safe before they reach any form.
const BADGES = [
  { icon: ShieldCheck, label: "Licensed & insured pros" },
  { icon: BadgeCheck, label: "100% free to use" },
  { icon: Lock, label: "Private & secure" },
  { icon: Star, label: "Loved by U.S. homeowners" },
  { icon: MapPin, label: "Serving all 50 states" },
];

export default function HnTrustBar({ className = "" }) {
  return (
    <ul className={`hn-trustbar ${className}`.trim()} aria-label="Why homeowners trust us">
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Icon size={16} strokeWidth={2.3} aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
