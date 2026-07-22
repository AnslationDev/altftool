"use client";
import { useReveal } from "../hooks/useReveal";
import { hvacMedia } from "../data/media";

const services = [
  {
    num: "01",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M6 9l6-6 6 6M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
      </svg>
    ),
    image: hvacMedia.repair,
    title: "AC Repair",
    desc: "Fast, reliable AC diagnostics and repairs. We restore your cooling system to peak performance, every single time.",
  },
  {
    num: "02",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    image: hvacMedia.heating,
    title: "Heating Installation",
    desc: "Professional furnace and heat pump installation with energy-efficient systems built to last for decades.",
  },
  {
    num: "03",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    ),
    image: hvacMedia.ducts,
    title: "Air Duct Cleaning",
    desc: "Remove allergens and improve air quality with our thorough duct cleaning services for healthier homes.",
  },
  {
    num: "04",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    image: hvacMedia.maintenance,
    title: "HVAC Maintenance",
    desc: "Preventative maintenance plans that extend system life, reduce energy costs, and prevent costly breakdowns.",
  },
  {
    num: "05",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeLinecap="round" />
      </svg>
    ),
    image: hvacMedia.installation,
    title: "Smart Thermostat Setup",
    desc: "Modern smart home integration with intelligent climate control, scheduling, and energy monitoring.",
  },
  {
    num: "06",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    image: hvacMedia.emergency,
    title: "Emergency HVAC Service",
    desc: "Round-the-clock emergency repairs. We're here when you need us most — day or night, weekends included.",
  },
];

export default function Services() {
  const headerRef = useReveal();
  const rowRef = useReveal();

  return (
    <section id="services" className="relative py-16 lg:py-20 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            What We Offer
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            Our Premium Services
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            From emergency repairs to complete system installations, we deliver
            excellence in every service.
          </p>
        </div>

        {/* Concertina row */}
        <div ref={rowRef} className="reveal">
          <div className="concertina-row">
            {services.map((service) => (
              <div
                key={service.num}
                className="concertina-card"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <span className="concertina-num">{service.num}</span>
                <div className="concertina-inner">
                  <div className="concertina-icon">{service.icon}</div>
                  <h3 className="concertina-title">{service.title}</h3>
                  <p className="concertina-desc">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
