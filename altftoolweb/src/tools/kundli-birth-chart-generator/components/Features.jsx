"use client";

import {
  CalendarDays,
  ClipboardCheck,
  Compass,
  Download,
  Grid3X3,
  MapPin,
  Moon,
  Orbit,
} from "lucide-react";

const features = [
  {
    icon: Orbit,
    title: "Planet Positions",
    description:
      "Uses astronomical geocentric positions for Sun, Moon, and visible planets, then applies sidereal ayanamsa.",
  },
  {
    icon: Compass,
    title: "Lagna and Houses",
    description:
      "Calculates ascendant from birth time, latitude, longitude, and timezone, then maps whole sign houses.",
  },
  {
    icon: Moon,
    title: "Nakshatra Details",
    description:
      "Shows janma nakshatra, pada, sign placement, planetary nakshatras, and moon-based dasha balance.",
  },
  {
    icon: CalendarDays,
    title: "Panchang Summary",
    description:
      "Includes tithi, paksha, yoga, karana, rashi, and birth chart timing in one readable panel.",
  },
  {
    icon: Grid3X3,
    title: "Interactive Chart",
    description:
      "Click any house to inspect its sign, lord, element, modality, and planets placed inside it.",
  },
  {
    icon: MapPin,
    title: "Location Lookup",
    description:
      "Search a birth city or use device location to fill latitude and longitude before generating the chart.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy Summary",
    description:
      "Copy a clean Kundli summary with lagna, moon sign, nakshatra, panchang, and planetary table.",
  },
  {
    icon: Download,
    title: "JSON Export",
    description:
      "Download the full calculation payload for record keeping, comparison, or future analysis.",
  },
];

export default function Features() {
  return (
    <section className="max-w-[1180px] mx-auto px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="subheading">Why Use This Kundli Generator?</h2>
        <p className="description mt-3">
          Build a practical Vedic-style birth chart in the browser with chart,
          panchang, and dasha details together.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-(--card) border border-(--border) rounded-lg p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
