import { BadgeCheck, FileText, Lock, MapPin, ShieldCheck } from "lucide-react";

// A slim strip of trust signals, placed right under the hero.
//
// Every label here has to be true of THIS site, not of a hypothetical partner
// network. The earlier set claimed licensed and insured pros, a 50-state
// service area and homeowner acclaim — none of which HousingNeeds can back:
// it publishes guides and is not a contractor (see HN_DISCLAIMER). A trust bar
// that overstates is the fastest way to lose the trust it is asking for.
const BADGES = [
  { icon: ShieldCheck, label: "Independent — not a contractor" },
  { icon: BadgeCheck, label: "Free to read, no account" },
  { icon: Lock, label: "No personal details needed to read" },
  { icon: MapPin, label: "Written for U.S. homes and codes" },
  { icon: FileText, label: "Costs explained, never quoted" },
];

export default function HnTrustBar({ className = "" }) {
  return (
    <ul className={`hn-trustbar ${className}`.trim()} aria-label="What HousingNeeds is">
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Icon size={16} strokeWidth={2.3} aria-hidden="true" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
