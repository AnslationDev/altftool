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
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import BusinessOpsHeader from "./components/BusinessOpsHeader";
import AltfLauncher from "@/app/_altf/AltfLauncher";
import { BUSINESS_OPS_PRODUCTS } from "./businessOps";
import "./bops.css";
import "@/app/_altf/altf-brand.css";

// Was a plain `export const metadata` object with no `alternates`, so Next fell
// back to metadataBase and this page shipped
// <link rel="canonical" href="https://www.altftool.com"> — /bops declared the
// site homepage as its canonical URL. Verified live before the fix. Going
// through createPageMetadata gives it a self-canonical alongside the OG,
// Twitter and robots blocks every other hub in the family already emits.
//
// noindex is unchanged and deliberate. follow:true is too: this hub is the
// entry point to the family's ~130 indexable pages, and nofollow told crawlers
// to discard every link out of it. Every other noindex surface in /bops
// already uses follow:true (buildHousingServiceMetadata, the six
// legal-services layouts).
export async function generateMetadata() {
  return createPageMetadata({
    title: "Business Interface Demos — ALTFTool",
    description:
      "Explore non-transactional interface demonstrations for travel, home services, insurance, loans, and other service categories.",
    path: "/bops",
    noindex: true,
  });
}

// Product icon keys -> lucide components (matches businessOps.js).
const PRODUCT_ICONS = {
  plane: Plane, home: Home, shield: ShieldCheck, loan: Landmark,
  paw: PawPrint, gavel: Gavel, handheart: HandHeart, wrench: Wrench,
};

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: "Design examples",
    text: "Review interface patterns and sample content without submitting a quote request or starting a transaction.",
  },
  {
    icon: ShieldCheck,
    title: "No provider claims",
    text: "Names, offers, ratings, phone numbers, and forms shown in these demonstrations are placeholders, not verified providers.",
  },
  {
    icon: Sparkles,
    title: "One prototype hub",
    text: "Explore several service-interface concepts while all quote, call, and purchase actions remain disabled.",
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
            Interface demonstrations
          </p>
          <h1 className="biz-lp-title">
            Explore service <span className="accent">interface concepts</span>
          </h1>
          <p className="biz-lp-lede">
            Browse sample layouts for travel, home services, insurance, and other
            categories. These are design demonstrations, not live marketplaces,
            providers, offers, or quote services.
          </p>

          <div className="biz-lp-cta">
            <a href="#services" className="biz-btn biz-btn--primary">
              Explore demos
              <ArrowRight size={17} strokeWidth={2.3} />
            </a>
          </div>
        </div>
      </section>

      {/* Services showcase */}
      <section id="services" className="biz-lp-section">
        <div className="biz-lp-inner">
          <div className="biz-lp-head">
            <p className="biz-lp-head-eyebrow">Prototype catalogue</p>
            <h2 className="biz-lp-head-title">Sample service experiences</h2>
            <p className="biz-lp-head-sub">
              Pick a category to inspect its interface. Quote, call, and purchase
              controls are placeholders and do not submit information.
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
                    View demo
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
            <p className="biz-lp-head-eyebrow">How this area works</p>
            <h2 className="biz-lp-head-title">Clearly separated from live tools</h2>
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
          <h2>Review the demonstrations</h2>
          <p>
            Browse interface ideas without entering personal details or relying
            on placeholder business claims.
          </p>
          <a href="#services" className="biz-btn biz-btn--primary">
            Explore demos
            <ArrowRight size={17} strokeWidth={2.3} />
          </a>
        </section>
      </div>

      <AltfLauncher />
    </div>
  );
}
