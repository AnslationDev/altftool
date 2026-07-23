// Single icon resolver for the Loans module.
//
// Icons are named as strings in _data/loans/*.js so the content files stay
// plain serialisable data. Only the icons listed here are bundled — importing
// all of lucide-react would pull in thousands of components.
//
// Adding an icon: import it below and add it to ICONS. Anything not listed
// falls back to Landmark (and warns in development) rather than crashing render.

import {
  Award,
  BadgeCheck,
  Banknote,
  Building2,
  Calculator,
  CalendarClock,
  Car,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Gauge,
  GraduationCap,
  HandCoins,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  Layers,
  LineChart,
  Lock,
  Percent,
  PiggyBank,
  Receipt,
  RefreshCw,
  Repeat,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export const ICONS = {
  Award,
  BadgeCheck,
  Banknote,
  Building2,
  Calculator,
  CalendarClock,
  Car,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Gauge,
  GraduationCap,
  HandCoins,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  Layers,
  LineChart,
  Lock,
  Percent,
  PiggyBank,
  Receipt,
  RefreshCw,
  Repeat,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
};

const FALLBACK = Landmark;

export function getLoanIcon(name) {
  const Icon = ICONS[name];

  if (!Icon) {
    if (process.env.NODE_ENV !== "production" && name) {
      console.warn(
        `[loans] Unknown icon "${name}". Add it to _lib/icons.js or use one of: ${Object.keys(ICONS).join(", ")}`,
      );
    }
    return FALLBACK;
  }

  return Icon;
}
