import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Bath,
  Bug,
  Droplet,
  Home,
  Layers,
  Paintbrush,
  ShieldCheck,
  Sun,
  Thermometer,
  Truck,
  Waves,
  Wrench,
} from "lucide-react";
import BusinessOpsHeader from "../../components/BusinessOpsHeader";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { HS_CATEGORIES, getHsStats } from "../_data/services";
import "../../bops.css";
import "@/app/_altf/altf-brand.css";

const ICONS = {
  home: Home,
  layers: Layers,
  waves: Waves,
  window: AppWindow,
  sun: Sun,
  droplet: Droplet,
  bath: Bath,
  paintbrush: Paintbrush,
  thermometer: Thermometer,
  bug: Bug,
  shield: ShieldCheck,
  truck: Truck,
};

/**
 * Housing Services hub — every provider-style lander, grouped by category.
 * Each section carries the category slug as its id so /bops/housingneeds
 * redirects (e.g. old bathroom/hvac tabs) can deep-link straight to it.
 */
export default function HousingServicesHub() {
  const stats = getHsStats();

  return (
    <div className="bizops-page">
      <BusinessOpsHeader />

      <section className="biz-lp-hero">
        <div className="biz-lp-hero-inner">
          <p className="biz-lp-eyebrow">
            <Wrench size={13} strokeWidth={2.4} />
            Housing services
          </p>
          <h1 className="biz-lp-title">
            Every home service, <span className="accent">one directory</span>
          </h1>
          <p className="biz-lp-lede">
            {stats.pages} trusted service providers across {stats.categories}{" "}
            categories — roofing to moving day. Pick a provider and get a free
            quote in minutes.
          </p>

          <div className="biz-lp-cta">
            <a href="#roofing" className="biz-btn biz-btn--primary">
              Browse services
              <ArrowRight size={17} strokeWidth={2.3} />
            </a>
          </div>
        </div>
      </section>

      {HS_CATEGORIES.map((category, index) => {
        const Icon = ICONS[category.icon] ?? Wrench;
        return (
          <section
            id={category.slug}
            key={category.slug}
            className={`biz-lp-section${index % 2 === 1 ? " biz-lp-section--tint" : ""}`}
          >
            <div className="biz-lp-inner">
              <div className="biz-lp-head">
                <p className="biz-lp-head-eyebrow">
                  <Icon size={13} strokeWidth={2.4} style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
                  {category.name}
                </p>
                <h2 className="biz-lp-head-title">{category.name} providers</h2>
              </div>

              <div className="biz-lp-showcase">
                {category.pages.map((page) => (
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
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <AltfLauncher />
    </div>
  );
}
