"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  MapPin,
  MousePointerClick,
  Star,
} from "lucide-react";
import { SiteFooter } from "./components/SiteFooter";
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
    image: "/images/testimonials/maya-bennett.png",
  },
  {
    name: "Andre Wilson",
    role: "HVAC Repair",
    quote:
      "Our AC quit during a heat wave. I had a licensed tech booked within the hour, with the price range shown before anyone arrived.",
    image: "/images/testimonials/andre-wilson.png",
  },
  {
    name: "Nora Patel",
    role: "Bathroom Upgrade",
    quote:
      "The quote comparison made it easy to spot the best fit. Clean work, fair pricing, and no awkward phone tag.",
    image: "/images/testimonials/nora-patel.png",
  },
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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <main>
      <SiteHeader />

      <section className="section service-section" id="services">
        <div className="section-heading">
          <p className="eyebrow">Start with the project</p>
          <h2>Popular home services</h2>
          <p>Select a service below to see available pros & pricing immediately.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => {
            return (
              <Link className={`service-card ${service.tone}`} key={service.slug} href={`/homeserv/services/${service.slug}`}>
                <span className="service-badge">{homeServiceBadges[service.slug]}</span>
                <span className="service-art service-icon-art">
                  <img src={homeServiceIcons[service.slug]} alt="" aria-hidden="true" />
                </span>
                <span className="service-title">{homeServiceTitles[service.slug] ?? service.title}</span>
                <span className="service-text">{homeServiceDescriptions[service.slug] ?? service.text}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section process-section" id="process">
        <span className="process-divider" aria-hidden="true" />
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>A cleaner path to quotes</h2>
          <p>Get matched with trusted local professionals in minutes, not days.</p>
        </div>
        <div className="process-grid">
          {steps.map((step, index) => {
            const StepIcon = index === 0 ? MousePointerClick : index === 1 ? ClipboardCheck : MapPin;

            return (
              <Fragment key={step.title}>
                <article className="process-card">
                  <div className="process-card-head">
                    <span className="process-icon" aria-hidden="true">
                      <StepIcon size={42} />
                    </span>
                    <span className="process-step-label">
                      {index === 0 ? "Choose project" : index === 1 ? "Compare options" : "Match locally"}
                    </span>
                  </div>
                  <div className="process-card-copy">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
                {index < steps.length - 1 ? (
                  <span className="process-arrow" aria-hidden="true">
                    <ArrowRight size={28} />
                  </span>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </section>

      <section className="section reviews-section" id="reviews">
        <div className="section-heading reviews-heading">
          <p className="eyebrow">Homeowner notes</p>
          <h2>Trusted by Homeowners</h2>
          <p>Real feedback from people who compared local quotes.</p>
        </div>
        <div className="testimonial-card-grid">
          {testimonials.map((item, index) => (
            <button
              className={`testimonial-card ${index === activeTestimonial ? "is-active" : ""}`}
              key={item.name}
              onClick={() => setActiveTestimonial(index)}
              type="button"
            >
              <span className="testimonial-avatar">
                <img src={item.image} alt={`${item.name}, ${item.role}`} />
              </span>
              <span className="stars" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={17} fill="currentColor" />
                ))}
              </span>
              <span className="testimonial-quote">{item.quote}</span>
              <span className="testimonial-person">
                <strong>{item.name}</strong>
                <small>{item.role}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
