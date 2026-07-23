import {
  ArrowRight,
  Home,
  Landmark,
  LayoutGrid,
  Gavel,
  HandHeart,
  PawPrint,
  Wrench,
  Plane,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import BusinessOpsHeader from "./components/BusinessOpsHeader";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { BUSINESS_OPS_PRODUCTS } from "./businessOps";
import "./bops.css";
import "@/app/_altf/altf-brand.css";

export const metadata = {
  title: "Business Ops",
  description:
    "Compare travel deals, connect with home-improvement pros and find better insurance — the everyday services worth getting right, in one place.",
  robots: { index: false, follow: false },
};

// Product icon keys -> lucide components (matches businessOps.js).
const PRODUCT_ICONS = {
  plane: Plane, home: Home, shield: ShieldCheck, loan: Landmark,
  paw: PawPrint, gavel: Gavel, handheart: HandHeart, wrench: Wrench,
};

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: "Free to use",
    text: "Compare deals and request quotes at no cost — you only pay if you decide to buy.",
  },
  {
    icon: ShieldCheck,
    title: "Options you can trust",
    text: "We surface established providers so you can weigh your choices with confidence.",
  },
  {
    icon: Sparkles,
    title: "All in one place",
    text: "Travel, home services and insurance — the essentials, sorted from a single hub.",
  },
];

export default function BusinessOpsLanding() {
  return (
    <div className="bizops-page">
      <BusinessOpsHeader />

      {/* Hero */}
      <section className="biz-lp-hero">
        <div className="biz-lp-hero-inner">
          <p className="biz-lp-eyebrow">
            <LayoutGrid size={13} strokeWidth={2.4} />
            Everyday savings
          </p>
          <h1 className="biz-lp-title">
            Save on the things <span className="accent">that matter</span>
          </h1>
          <p className="biz-lp-lede">
            Compare travel deals, get matched with home-improvement pros, and
            find better insurance — the everyday services worth getting right,
            all in one place.
          </p>

          <div className="biz-lp-cta">
            <a href="#services" className="biz-btn biz-btn--primary">
              Explore services
              <ArrowRight size={17} strokeWidth={2.3} />
            </a>
          </div>
        </div>
      </section>

      {/* Services showcase */}
      <section id="services" className="biz-lp-section">
        <div className="biz-lp-inner">
          <div className="biz-lp-head">
            <p className="biz-lp-head-eyebrow">What we offer</p>
            <h2 className="biz-lp-head-title">Everything, in one place</h2>
            <p className="biz-lp-head-sub">
              Pick a service to compare your options and get started — it's free,
              and there's no obligation.
            </p>
          </div>

          <div className="biz-lp-showcase">
            {BUSINESS_OPS_PRODUCTS.map((product) => {
              const Icon = PRODUCT_ICONS[product.icon] ?? LayoutGrid;
              return (
                <a
                  key={product.slug}
                  href={product.href}
                  className="biz-lp-product"
                  aria-label={`${product.name} — ${product.tagline}`}
                >
                  <span className="biz-lp-product-ico" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.9} />
                  </span>
                  <h3>{product.name}</h3>
                  <p className="biz-lp-product-tag">{product.tagline}</p>
                  <p>{product.description}</p>
                  <span className="biz-lp-product-go">
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
      <section className="biz-lp-section biz-lp-section--tint">
        <div className="biz-lp-inner">
          <div className="biz-lp-head">
            <p className="biz-lp-head-eyebrow">Why AltFTool</p>
            <h2 className="biz-lp-head-title">Made to save you time and money</h2>
          </div>
          <div className="biz-lp-features">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon;
              return (
                <div key={prop.title} className="biz-lp-feature">
                  <span className="biz-lp-feature-ico" aria-hidden="true">
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
      <div className="biz-lp-band-wrap">
        <section className="biz-lp-band">
          <h2>Start saving today</h2>
          <p>
            Compare your options across travel, home services and insurance —
            free, fast and in one place.
          </p>
          <a href="#services" className="biz-btn biz-btn--primary">
            Get started
            <ArrowRight size={17} strokeWidth={2.3} />
          </a>
        </section>
      </div>

      <AltfLauncher />
    </div>
  );
}
