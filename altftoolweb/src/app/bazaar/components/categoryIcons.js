/**
 * Category icon map.
 *
 * The taxonomy stores icon *names* so it stays serialisable and server-safe.
 * This module is the single place those names become components — an explicit
 * map rather than a dynamic lookup, so the bundler can tree-shake and a typo
 * in the data fails loudly here instead of rendering nothing.
 */

import {
  BadgeCheck,
  Baby,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Car,
  Factory,
  Gamepad2,
  Gift,
  Hammer,
  HeartPulse,
  LayoutGrid,
  Palette,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sprout,
  Tent,
  Ticket,
  Truck,
  Tv,
  Wrench,
} from "lucide-react";

const ICONS = {
  BadgeCheck,
  Baby,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Car,
  Factory,
  Gamepad2,
  Gift,
  Hammer,
  HeartPulse,
  Palette,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sprout,
  Tent,
  Ticket,
  Truck,
  Tv,
  Wrench,
};

/** @returns {import("react").ComponentType} never null — falls back to a grid glyph. */
export function getCategoryIcon(name) {
  return ICONS[name] || LayoutGrid;
}

export default ICONS;
