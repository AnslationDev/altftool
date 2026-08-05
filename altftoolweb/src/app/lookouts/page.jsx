import {
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  LayoutGrid,
  Music4,
  Tags,
  Package,
  Bot,
} from "lucide-react";
import LookupsHeader from "./components/LookupsHeader";
import { LOOKOUTS_PRODUCTS } from "./lookouts";
import "./lookouts.css";
import "@/app/_altf/altf-brand.css";

export const metadata = {
  title: "Lookouts",
  description:
    "Discover festivals, top discount products, AI tools and bundles in one place. All your favorite tools and deals, organized for easy access.",
  robots: { index: false, follow: false },
};

// Product icon keys -> lucide components
const PRODUCT_ICONS = {
  music: Music4,
  tags: Tags,
  sparkles: Sparkles,
  package: Package,
  bot: Bot,
};

// Product accent colors
const PRODUCT_ACCENTS = {
  sky: "lookouts-product-ico--sky",
  amber: "lookouts-product-ico--amber",
  violet: "lookouts-product-ico--violet",
  emerald: "lookouts-product-ico--emerald",
  rose: "lookouts-product-ico--rose",
};

const VALUE_PROPS = [
  {
    icon: Eye,
    title: "Curated Collections",
    text: "Handpicked selections organized to help you discover exactly what you're looking for.",
  },
  {
    icon: Zap,
    title: "Quick Access",
    text: "Fast, easy navigation to all your favorite tools, deals, and discoveries in one place.",
  },
  {
    icon: Sparkles,
    title: "Always Updated",
    text: "Fresh content and new additions regularly — so you never miss out on what's trending.",
  },
];

export default function LookupsLanding() {
  return (
    <div className="lookouts-page">
      <LookupsHeader />

      {/* Hero */}
      <section className="lookouts-hero">
        <div className="lookouts-hero-inner">
          <p className="lookouts-eyebrow">
            <LayoutGrid size={13} strokeWidth={2.4} />
            Discover & Explore
          </p>
          <h1 className="lookouts-title">
            Your <span className="accent">favorite discoveries</span> in one place
          </h1>
          <p className="lookouts-lede">
            Explore festivals, find amazing deals, create with AI, and access all
            your favorite tools — everything curated and organized for easy access.
          </p>

          <div className="lookouts-cta">
            <a href="#services" className="lookouts-btn lookouts-btn--primary">
              Explore now
              <ArrowRight size={17} strokeWidth={2.3} />
            </a>
          </div>
        </div>
      </section>

      {/* Services showcase */}
      <section id="services" className="lookouts-section">
        <div className="lookouts-inner">
          <div className="lookouts-head">
            <p className="lookouts-head-eyebrow">What we offer</p>
            <h2 className="lookouts-head-title">Everything, right here</h2>
            <p className="lookouts-head-sub">
              Pick a category to explore and discover amazing content — it's all free
              and ready for you.
            </p>
          </div>

          <div className="lookouts-showcase">
            {LOOKOUTS_PRODUCTS.map((product) => {
              const Icon = PRODUCT_ICONS[product.icon] ?? LayoutGrid;
              const accentClass =
                PRODUCT_ACCENTS[product.accent] || "lookouts-product-ico--sky";
              return (
                <a
                  key={product.slug}
                  href={product.href}
                  className="lookouts-product"
                  aria-label={`${product.name} — ${product.tagline}`}
                >
                  <span
                    className={`lookouts-product-ico ${accentClass}`}
                    aria-hidden="true"
                  >
                    <Icon size={26} strokeWidth={1.9} />
                  </span>
                  <h3>{product.name}</h3>
                  <p className="lookouts-product-tag">{product.tagline}</p>
                  <p>{product.description}</p>
                  <span className="lookouts-product-go">
                    Explore
                    <ArrowRight size={15} strokeWidth={2.3} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="lookouts-section lookouts-section--tint">
        <div className="lookouts-inner">
          <div className="lookouts-head">
            <p className="lookouts-head-eyebrow">Why Lookouts</p>
            <h2 className="lookouts-head-title">
              Discover smarter, shop better, create freely
            </h2>
          </div>
          <div className="lookouts-features">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon;
              return (
                <div key={prop.title} className="lookouts-feature">
                  <span className="lookouts-feature-ico" aria-hidden="true">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <h3>{prop.title}</h3>
                  <p>{prop.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <div className="lookouts-band-wrap">
        <section className="lookouts-band">
          <h2>Start exploring today</h2>
          <p>
            Discover festivals, grab deals, create with AI, and find all your
            favorite tools — right here, organized just for you.
          </p>
          <a href="#services" className="lookouts-btn lookouts-btn--primary">
            Get started
            <ArrowRight size={17} strokeWidth={2.3} />
          </a>
        </section>
      </div>
    </div>
  );
}
