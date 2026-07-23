import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Accessibility,
  ArrowRight,
  Bath,
  Bell,
  Bike,
  Bone,
  Brain,
  Building2,
  Footprints,
  Gavel,
  Globe,
  Scale,
  ScrollText,
  Car,
  Clock,
  Gauge,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Home,
  KeyRound,
  Landmark,
  Layers,
  PawPrint,
  PiggyBank,
  Plane,
  RefreshCw,
  Scissors,
  Repeat,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import BusinessOpsHeader from "./BusinessOpsHeader";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { getBopsCollection } from "../_data/collections";
import "../bops.css";
import "@/app/_altf/altf-brand.css";

const ICONS = {
  shield: ShieldCheck,
  loan: Landmark,
  car: Car,
  // Loan-type icons (see _data/collections.js loans.pages)
  wallet: Wallet,
  layers: Layers,
  home: Home,
  refresh: RefreshCw,
  piggy: PiggyBank,
  repeat: Repeat,
  building: Building2,
  landmark: Landmark,
  trending: TrendingUp,
  graduation: GraduationCap,
  gauge: Gauge,
  // Insurance-type icons (see _data/collections.js insurance.pages)
  heart: Heart,
  pulse: HeartPulse,
  stethoscope: Stethoscope,
  handheart: HandHeart,
  key: KeyRound,
  paw: PawPrint,
  bike: Bike,
  store: Store,
  plane: Plane,
  // Pet-services icons (see _data/collections.js "pet-services".pages)
  scissors: Scissors,
  footprints: Footprints,
  bone: Bone,
  // Legal + senior-care icons
  gavel: Gavel,
  scale: Scale,
  globe: Globe,
  scroll: ScrollText,
  bell: Bell,
  accessibility: Accessibility,
  bath: Bath,
  brain: Brain,
};

/**
 * Landing page for a Business Ops collection (Insurance, Loans, …) — a category
 * that holds pages directly. Renders a marketing hero and a grid of its pages,
 * or a "coming soon" state while it's still being filled out. One component,
 * driven by _data/collections.js, so a new collection or page is data-only.
 */
export default function BizCollection({ slug }) {
  const collection = getBopsCollection(slug);
  if (!collection) notFound();

  const HeroIcon = ICONS[collection.icon] ?? Sparkles;
  const hasPages = collection.pages.length > 0;

  return (
    <div className="bizops-page">
      <BusinessOpsHeader />

      <section className="biz-lp-hero">
        <div className="biz-lp-hero-inner">
          <p className="biz-lp-eyebrow">
            <HeroIcon size={13} strokeWidth={2.4} />
            {collection.eyebrow}
          </p>
          <h1 className="biz-lp-title">
            {collection.title[0]}
            <span className="accent">{collection.title[1]}</span>
          </h1>
          <p className="biz-lp-lede">{collection.lede}</p>

          <div className="biz-lp-cta">
            {hasPages ? (
              <a href="#products" className="biz-btn biz-btn--primary">
                View options
                <ArrowRight size={17} strokeWidth={2.3} />
              </a>
            ) : (
              <Link href="/bops" className="biz-btn biz-btn--ghost">
                Explore other services
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="products" className="biz-lp-section">
        <div className="biz-lp-inner">
          <div className="biz-lp-head">
            <p className="biz-lp-head-eyebrow">{collection.headEyebrow}</p>
            <h2 className="biz-lp-head-title">{collection.headTitle}</h2>
            {collection.headSub && (
              <p className="biz-lp-head-sub">{collection.headSub}</p>
            )}
          </div>

          {hasPages ? (
            <>
              <div className="biz-lp-showcase">
                {collection.pages.map((page) => {
                  const Icon = ICONS[page.icon] ?? HeroIcon;
                  return (
                    <Link
                      key={page.slug}
                      href={page.href}
                      className="biz-lp-product"
                      aria-label={`${page.name} — ${page.tagline}`}
                    >
                      <span className="biz-lp-product-ico" aria-hidden="true">
                        <Icon size={26} strokeWidth={1.9} />
                      </span>
                      <h3>{page.name}</h3>
                      <p className="biz-lp-product-tag">{page.tagline}</p>
                      <p>{page.description}</p>
                      <span className="biz-lp-product-go">
                        Explore
                        <ArrowRight size={15} strokeWidth={2.3} />
                      </span>
                    </Link>
                  );
                })}
              </div>
              {collection.comingSoon && (
                <p className="biz-lp-note">{collection.comingSoon}</p>
              )}
            </>
          ) : (
            <div className="biz-lp-empty">
              <span className="biz-lp-empty-ico" aria-hidden="true">
                <Clock size={26} strokeWidth={1.9} />
              </span>
              <p className="biz-lp-empty-title">Coming soon</p>
              <p className="biz-lp-empty-text">{collection.comingSoon}</p>
            </div>
          )}
        </div>
      </section>

      <AltfLauncher />
    </div>
  );
}
