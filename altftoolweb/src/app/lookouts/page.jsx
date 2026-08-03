import Link from "next/link";
import { ArrowRight, Eye, LayoutGrid, Sparkles, Zap, Bot } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import LookupsHeader from "./components/LookupsHeader";
import { LOOKOUTS_PRODUCTS } from "./lookouts";
import "./lookouts.css";
import "@/app/_altf/altf-brand.css";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export async function generateMetadata() {
  return createPageMetadata({
    // 42 chars authored; the root layout appends " | AltFTool" for a 53-char
    // rendered <title>, inside the ~60 mobile SERP cut.
    //
    // The two nouns here are the two destinations LOOKOUTS_PRODUCTS actually
    // links to. If a card is added or removed, this has to be re-checked —
    // the previous copy advertised festivals and discount products that this
    // tree has never contained.
    title: "Lookouts: AI Prompt Studio & Free AI Tools",
    // 156 chars ending in a period, so trimMetaDescription returns it verbatim
    // instead of clipping it and bolting a period on.
    description:
      "Lookouts is the AltFTool hub for our curated discovery collections. Open the AI Prompt Studio to build image prompts, or browse the free AI tools directory.",
    path: "/lookouts",
    keywords: ["AltFTool lookouts", "AI prompt studio", "free AI tools", "tool collections"],
  });
}

// Product icon keys -> lucide components. Only the keys LOOKOUTS_PRODUCTS
// actually uses are imported; LayoutGrid is the fallback.
const PRODUCT_ICONS = {
  sparkles: Sparkles,
  bot: Bot,
};

// Why these two and not more: every claim on this page has to survive a click.
// "Curated" and "Quick access" describe what the hub structurally is. The
// third prop this replaced promised "Always Updated — fresh content and new
// additions regularly", which nothing on the page or in the build measures or
// guarantees, so it went.
const VALUE_PROPS = [
  {
    icon: Eye,
    title: "Grouped by what you're doing",
    text: "Each collection gathers one kind of work in one place, so you can scan a category instead of hunting through a full tool list.",
  },
  {
    icon: Zap,
    title: "Straight to the collection",
    // Deliberately says nothing about sign-in. An earlier draft of this
    // promised "no sign-up wall", which is false for /free-ai-tool: its
    // useOpenTool hook wraps every outbound tool click in requireAuth. The
    // claim a hub makes has to hold on the page it sends you to.
    text: "Every card links directly into the collection it names, so you land on the collection itself rather than another index in between.",
  },
];

export default function LookupsLanding() {
  return (
    <>
      <JsonLd
        id="altftool-lookouts-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/lookouts",
            name: "Lookouts",
            description:
              "AltFTool discovery collections: the AI Prompt Studio and the free AI tools directory.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lookouts", path: "/lookouts" },
          ]),
        ]}
      />

      <div className="lookouts-page">
        <LookupsHeader />

        {/* Hero. The h1 below is static copy in a server component — it is in
            the server-rendered HTML unconditionally, with no fetch that could
            leave the route without a heading. */}
        <section className="lookouts-hero">
          <div className="lookouts-hero-inner">
            <p className="lookouts-eyebrow">
              <LayoutGrid size={13} strokeWidth={2.4} />
              Discover &amp; Explore
            </p>
            <h1 className="lookouts-title">
              AltFTool <span className="accent">discovery collections</span>
            </h1>
            <p className="lookouts-lede">
              Two collections, each one a curated way into a slice of AltFTool:
              build an image prompt in the studio, or pick a free AI tool from
              the directory.
            </p>

            <div className="lookouts-cta">
              <a href="#services" className="lookouts-btn lookouts-btn--primary">
                Explore now
                <ArrowRight size={17} strokeWidth={2.3} />
              </a>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section id="services" className="lookouts-section">
          <div className="lookouts-inner">
            <div className="lookouts-head">
              <p className="lookouts-head-eyebrow">What we offer</p>
              <h2 className="lookouts-head-title">Everything, right here</h2>
              <p className="lookouts-head-sub">
                Pick a collection to explore. Both are free to browse.
              </p>
            </div>

            <div className="lookouts-showcase">
              {LOOKOUTS_PRODUCTS.map((product) => {
                const Icon = PRODUCT_ICONS[product.icon] ?? LayoutGrid;
                return (
                  <Link
                    key={product.slug}
                    href={product.href}
                    className="lookouts-product"
                    aria-label={`${product.name} — ${product.tagline}`}
                  >
                    <span className="lookouts-product-ico" aria-hidden="true">
                      <Icon size={26} strokeWidth={1.9} />
                    </span>
                    <h3>{product.name}</h3>
                    <p className="lookouts-product-tag">{product.tagline}</p>
                    <p>{product.description}</p>
                    <span className="lookouts-product-go">
                      Explore
                      <ArrowRight size={15} strokeWidth={2.3} />
                    </span>
                  </Link>
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
                One way in, for two kinds of work
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
              Open the AI Prompt Studio to build an image prompt, or browse the
              free AI tools directory — both are a click away.
            </p>
            <a href="#services" className="lookouts-btn lookouts-btn--primary">
              Get started
              <ArrowRight size={17} strokeWidth={2.3} />
            </a>
          </section>
        </div>
      </div>
      {/* Self-chrome route: the global header is gated off, so this is the
          way back into the rest of the site. Same as /bops. */}
      <AltfLauncher />
    </>
  );
}
