"use client";

import Navbar           from '../components/Navbar.jsx';
import Hero             from '../components/Hero.jsx';
import StatsSection     from '../components/StatsSection.jsx';
import ServiceFeature   from '../components/ServiceFeature.jsx';
import ServicesGrid     from '../components/ServicesGrid.jsx';
import HowItWorks       from '../components/HowItWorks.jsx';
import Testimonials     from '../components/Testimonials.jsx';
import BlogSection      from '../components/BlogSection.jsx';
import FAQSection       from '../components/FAQSection.jsx';
import BottomForm       from '../components/BottomForm.jsx';
import Footer           from '../components/Footer.jsx';
import PayPerCallOverlay from '../components/PayPerCallOverlay.jsx';

import img2 from '../assets/images/problem-2.webp';
import img3 from '../assets/images/problem-3.webp';
import img4 from '../assets/images/problem-4.webp';

export default function LandingPage() {
  return (
    <div style={{ background: '#fff' }}>
      <Navbar />

      {/* 1 — Hero */}
      <Hero />

      {/* 3 — Stats */}
      <StatsSection />

      {/* 4 — Featured Services — full-screen hero sections */}
      <div id="services">
        <ServiceFeature
          subtitle="Emergency Service"
          title="Burst Pipe? We're There in Under 60 Minutes."
          description="Leaks, floods, and pipe bursts can't wait until morning. Our licensed emergency plumbers are dispatched immediately — 24/7 including weekends and holidays. We isolate the leak, protect nearby flooring and cabinets, and explain the repair before any work begins."
          details={[
            'Rapid shutoff, pipe patching, and full replacement options',
            'Upfront emergency pricing before the technician starts',
            'Clean work area with water-damage prevention steps'
          ]}
          image={img3}
          ctaText="Book Emergency Call"
          ctaHref="#book-form"
          dark
          flip={false}
        />
        <ServiceFeature
          subtitle="Drain & Sewer"
          title="Cleared for Good. Not Just for Now."
          description="Chemical cleaners eat your pipes. Our high-pressure hydro-jetting and camera inspection finds the root cause and clears it permanently — no repeat visits. We show you what is blocking the line, remove buildup safely, and recommend prevention only when it is actually needed."
          details={[
            'Camera inspection to locate clogs, roots, and broken sections',
            'Hydro-jetting that clears grease, sludge, and scale from the pipe wall',
            'Post-cleaning flow check so you know the line is working properly'
          ]}
          image={img2}
          ctaText="Schedule Drain Cleaning"
          ctaHref="#book-form"
          dark={false}
          flip
        />
        <ServiceFeature
          subtitle="Water Heater"
          title="Hot Water Restored Same Day."
          description="Cold showers mean a failing heater. We diagnose, repair, or replace all major brands on the same visit — with transparent pricing before any work starts. Our technicians check capacity, venting, safety valves, and installation code so the fix lasts."
          details={[
            'Same-day repair or replacement for tank and tankless systems',
            'Clear options for parts, warranty, efficiency, and install time',
            'Old unit removal, cleanup, and full hot-water performance test'
          ]}
          image={img4}
          ctaText="Get a Free Heater Quote"
          ctaHref="#book-form"
          dark
          flip={false}
        />
      </div>

      {/* 5 — Full Services Grid */}
      <ServicesGrid />

      {/* 6 — How It Works */}
      <HowItWorks />

      {/* 7 — Blog */}
      <BlogSection />

      {/* 8 — Testimonials */}
      <Testimonials />

      {/* 9 — FAQ */}
      <FAQSection />

      {/* 10 — Booking Form */}
      <BottomForm />

      {/* 11 — Footer */}
      <Footer />

      <PayPerCallOverlay />
    </div>
  );
}
