"use client";

import Link from "next/link";
import { Fragment } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  MapPin,
  MousePointerClick,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Footer from "@/platform/navigation/Footer";
import { SiteHeader } from "./components/SiteHeader";
import { services } from "./services-data";

const steps = [
  {
    number: "01",
    label: "Choose Service",
    title: "Pick a Service",
    text: "Choose the home project you want priced, then open its service page.",
    stat: "25+ Home Services",
    visual: "service-selection",
  },
  {
    number: "02",
    label: "Review Options",
    title: "Review the Details",
    text: "Review project details, service coverage, and how local pros can help.",
    stat: "Compare Multiple Contractors",
    visual: "comparison",
  },
  {
    number: "03",
    label: "Get Local Quotes",
    title: "Get Local Quotes",
    text: "Enter your ZIP code to compare nearby pros, pricing, and quote options.",
    stat: "Thousands of Local Professionals",
    visual: "quote-matching",
  },
];

const testimonials = [
  {
    name: "Maya Bennett",
    role: "Kitchen Remodel",
    quote:
      "QuoteNest gave us three clear estimates by lunch. The contractor we chose finished ahead of schedule and the kitchen feels completely new.",
  },
  {
    name: "Andre Wilson",
    role: "HVAC Repair",
    quote:
      "Our AC quit during a heat wave. I had a licensed tech booked within the hour, with the price range shown before anyone arrived.",
  },
  {
    name: "Nora Patel",
    role: "Bathroom Upgrade",
    quote:
      "The quote comparison made it easy to spot the best fit. Clean work, fair pricing, and no awkward phone tag.",
  },
];

const heroStats = [
  { label: "50K+ Homeowners", icon: Users },
  { label: "4.9/5 Rating", icon: Star },
  { label: "Trusted Pros", icon: ShieldCheck },
];

const homeServiceTitles = {
  "kitchen-refresh": "Renovate Kitchen",
  "bath-remodel": "Remodel Bathroom",
  "hvac-tune-up": "Fix/Replace HVAC",
  "whole-home-repairs": "Whole-Home Repairs",
};

const homeServiceIcons = {
  "kitchen-refresh": "https://cdn-icons-png.flaticon.com/128/4282/4282551.png",
  "bath-remodel": "https://cdn-icons-png.flaticon.com/128/745/745476.png",
  "hvac-tune-up": "https://cdn-icons-png.flaticon.com/128/1850/1850682.png",
  "whole-home-repairs": "https://cdn-icons-png.flaticon.com/128/4429/4429367.png",
};

const homeServiceBadges = {
  "kitchen-refresh": "Most Popular",
  "bath-remodel": "Top Rated",
  "hvac-tune-up": "Fast Response",
  "whole-home-repairs": "Multi-Service",
};

const homeServiceDescriptions = {
  "kitchen-refresh": "Cabinets, counters, layouts, and backsplashes.",
  "bath-remodel": "Showers, tile, vanities, and waterproofing.",
  "hvac-tune-up": "Repairs, installs, tune-ups, and diagnostics.",
  "whole-home-repairs": "Roofing, drywall, plumbing, and electrical.",
};

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="hs-hero">
        <div className="hs-hero-bg" />
        <div className="hs-hero-grid" />
        <div className="hs-hero-content">
          <span className="hs-eyebrow">
            <ShieldCheck size={16} />
            Trusted home-service quotes
          </span>
          <h1>
            Compare Local Pros,{" "}
            <span>Not Just Prices.</span>
          </h1>
          <p>
            Select your project, check local availability, and compare quotes
            from trusted professionals — all in one place.
          </p>
          <div className="hs-hero-actions">
            <Link href="#services" className="hs-btn-primary">
              Browse Services
              <ArrowRight size={18} />
            </Link>
            <Link href="#process" className="hs-btn-secondary">
              How It Works
            </Link>
          </div>
          <div className="hs-hero-stats">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <span key={stat.label} className="hs-hero-stat">
                  <Icon size={18} />
                  {stat.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="hs-section" id="services">
        <div className="hs-heading hs-heading-center">
          <span className="hs-eyebrow">Start with the project</span>
          <h2>Popular home services</h2>
          <p>Select a service below to see available pros & pricing immediately.</p>
        </div>
        <div className="hs-service-grid">
          {services.map((service) => (
            <Link
              className="hs-service-card"
              key={service.slug}
              href={`/homeserv/services/${service.slug}`}
            >
              <span className="hs-service-badge">{homeServiceBadges[service.slug]}</span>
              <span className="hs-service-icon-wrap">
                <img src={homeServiceIcons[service.slug]} alt="" aria-hidden="true" />
              </span>
              <span className="hs-service-title">
                {homeServiceTitles[service.slug] ?? service.title}
              </span>
              <span className="hs-service-desc">
                {homeServiceDescriptions[service.slug] ?? service.text}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="hs-process-section" id="process">
        <span className="hs-process-divider" aria-hidden="true" />
        <div className="hs-heading hs-heading-center" style={{ marginBottom: 24 }}>
          <span className="hs-eyebrow">How it works</span>
          <h2 style={{ fontSize: "clamp(30px, 3.25vw, 38px)" }}>A cleaner path to quotes</h2>
          <p>Get matched with trusted local professionals in minutes, not days.</p>
        </div>
        <div className="hs-process-grid">
          {steps.map((step, index) => {
            const StepIcon = index === 0 ? MousePointerClick : index === 1 ? ClipboardCheck : MapPin;
            return (
              <Fragment key={step.title}>
                <article className="hs-process-card">
                  <span className="hs-process-icon" aria-hidden="true">
                    <StepIcon size={42} />
                  </span>
                  <span className="hs-process-step">
                    {index === 0 ? "Choose project" : index === 1 ? "Compare options" : "Match locally"}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
                {index < steps.length - 1 ? (
                  <span className="hs-process-arrow" aria-hidden="true">
                    <ArrowRight size={24} />
                  </span>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section className="hs-section" id="reviews">
        <div className="hs-heading hs-heading-center">
          <span className="hs-eyebrow">Homeowner notes</span>
          <h2 style={{ fontSize: "clamp(26px, 2.8vw, 38px)" }}>Trusted by Homeowners</h2>
          <p style={{ fontSize: 16 }}>Real feedback from people who compared local quotes.</p>
        </div>
        <div className="hs-testimonial-grid">
          {testimonials.map((item) => (
            <article className="hs-testimonial-card" key={item.name}>
              <span className="hs-testimonial-avatar">
                <img
                  src={`https://i.pravatar.cc/160?u=${item.name}`}
                  alt={`${item.name}, ${item.role}`}
                />
              </span>
              <span className="hs-stars" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={17} fill="currentColor" />
                ))}
              </span>
              <span className="hs-testimonial-quote">{item.quote}</span>
              <span className="hs-testimonial-person">
                <strong>{item.name}</strong>
                <small>{item.role}</small>
              </span>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
