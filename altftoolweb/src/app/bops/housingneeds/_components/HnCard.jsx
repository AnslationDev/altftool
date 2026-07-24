import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Bath,
  Bug,
  Droplets,
  Home,
  Layers,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  Truck,
  Waves,
  Zap,
  Grid2x2,
  DoorOpen,
  Wrench,
} from "lucide-react";

// Icon keys mirror _data/categories.js. Kept local so a card renders without
// pulling the whole lucide set into the shell bundle. Exported so the category
// tabs resolve the same icons.
export const ICONS = {
  home: Home,
  layers: Layers,
  window: AppWindow,
  sun: Sun,
  droplet: Droplets,
  bath: Bath,
  thermometer: Thermometer,
  bug: Bug,
  wrench: Wrench,
  waves: Waves,
  paintbrush: Paintbrush,
  shield: ShieldCheck,
  truck: Truck,
  sprout: Sprout,
  sparkles: Sparkles,
  zap: Zap,
  grid: Grid2x2,
  door: DoorOpen,
  droplets: Droplets,
};

/**
 * One entry in a Housing Needs grid — used for both category cards (on the
 * dashboard) and page cards (inside a category). Reuses the shared bizops-card
 * design so Housing Needs reads as part of the Business Ops surface.
 *
 * `meta` is the small footer label (e.g. "3 pages" for a category, or a tag
 * for a page); `cta` is the action verb ("View" / "Open").
 */
export default function HnCard({
  href,
  icon,
  accent,
  name,
  tagline,
  description,
  tags = [],
  meta,
  cta = "Open",
}) {
  const Icon = ICONS[icon] ?? Layers;

  return (
    <Link href={href} className="bizops-card" aria-label={`${name} — ${tagline}`}>
      <div className="bizops-card-top">
        <span className="bizops-card-icon" data-accent={accent} aria-hidden="true">
          <Icon size={22} strokeWidth={2} />
        </span>
        <span className="bizops-card-heading">
          <span className="bizops-card-title">{name}</span>
          <span className="bizops-card-tagline">{tagline}</span>
        </span>
      </div>

      <p className="bizops-card-desc">{description}</p>

      {tags.length > 0 && (
        <div className="bizops-tags">
          {tags.map((tag) => (
            <span key={tag} className="bizops-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="bizops-card-foot">
        <span className="bizops-card-meta">{meta}</span>
        <span className="bizops-card-cta">
          {cta}
          <ArrowRight className="bizops-card-arrow" size={15} strokeWidth={2.2} />
        </span>
      </div>
    </Link>
  );
}
