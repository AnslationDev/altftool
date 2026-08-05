import { GraduationCap, Infinity as InfinityIcon, Timer } from "lucide-react";

/**
 * Tab metadata for the "Free Subscriptions & Coupons" section. Actual tool
 * lists are resolved at render time from ./tools.js (getToolsByDealType /
 * getStudentFriendlyTools) so this stays presentation-only.
 */
export const DEAL_TABS = [
  {
    id: "Free Forever",
    label: "Free Forever",
    icon: InfinityIcon,
    description: "No credit card, no trial clock — genuinely free to use for as long as you want.",
  },
  {
    id: "Free Trial",
    label: "Free Trial",
    icon: Timer,
    description: "Try the full paid experience free before you decide to subscribe.",
  },
  {
    id: "Student Friendly",
    label: "Student Friendly",
    icon: GraduationCap,
    description: "Free or discounted plans through verified student and education programs.",
  },
];
