// Single icon resolver for the Insurance module.
//
// Icons are named as strings in _data/insurance/*.js so the content files stay
// plain serialisable data. Only the icons listed here are bundled — importing
// all of lucide-react would pull in thousands of components.
//
// Adding an icon: import it below and add it to ICONS. Anything not listed
// falls back to ShieldCheck (and warns in development) rather than crashing.

import {
  Activity,
  Ambulance,
  Award,
  Baby,
  BadgeCheck,
  Bike,
  Briefcase,
  Building2,
  CalendarClock,
  Car,
  Cat,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Cross,
  Dog,
  DollarSign,
  FileCheck,
  FileText,
  Flower2,
  Gauge,
  Globe,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  House,
  KeyRound,
  Landmark,
  LifeBuoy,
  Lock,
  Luggage,
  MapPin,
  PawPrint,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Scale,
  ShieldCheck,
  Sofa,
  Sparkles,
  Stethoscope,
  Store,
  ThumbsUp,
  Timer,
  TrendingUp,
  Truck,
  Umbrella,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

export const ICONS = {
  Activity,
  Ambulance,
  Award,
  Baby,
  BadgeCheck,
  Bike,
  Briefcase,
  Building2,
  CalendarClock,
  Car,
  Cat,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Cross,
  Dog,
  DollarSign,
  FileCheck,
  FileText,
  Flower2,
  Gauge,
  Globe,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  House,
  KeyRound,
  Landmark,
  LifeBuoy,
  Lock,
  Luggage,
  MapPin,
  PawPrint,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Scale,
  ShieldCheck,
  Sofa,
  Sparkles,
  Stethoscope,
  Store,
  ThumbsUp,
  Timer,
  TrendingUp,
  Truck,
  Umbrella,
  Users,
  Wallet,
  Wrench,
  Zap,
};

const FALLBACK = ShieldCheck;

export function getInsuranceIcon(name) {
  const Icon = ICONS[name];

  if (!Icon) {
    if (process.env.NODE_ENV !== "production" && name) {
      console.warn(
        `[insurance] Unknown icon "${name}". Add it to _lib/icons.js or use one of: ${Object.keys(ICONS).join(", ")}`,
      );
    }
    return FALLBACK;
  }

  return Icon;
}
