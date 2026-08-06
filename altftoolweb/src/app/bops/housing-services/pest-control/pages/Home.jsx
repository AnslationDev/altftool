import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Award, Phone, Leaf, BadgeCheck, MapPin, DollarSign, Zap } from 'lucide-react';

import ServiceCard from '../components/ServiceCard';
import ProcessTimeline from '../components/ProcessTimeline';
import TestimonialSlider from '../components/TestimonialSlider';
import FAQAccordion from '../components/FAQAccordion';
import CTASection from '../components/CTASection';

import { services, pricingPreview } from '../data/services';
import { faqs } from '../data/faqs';

const Home = () => {
  const featuredServices = services.slice(0, 8);
  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[760px] overflow-hidden bg-[#0b1510] text-white md:min-h-[820px]">
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1800&q=85"
          alt="PestX Miami technician preparing a safe treatment"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-72"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,12,0.96)_0%,rgba(8,15,12,0.86)_39%,rgba(8,15,12,0.30)_72%,rgba(8,15,12,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto flex min-h-[760px] max-w-[1280px] items-center px-6 py-20 md:min-h-[820px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            className="max-w-3xl pt-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[2px] text-white backdrop-blur"
            >
              <Leaf size={14} className="text-[#4ADE80]" /> PESTX MIAMI • SOUTH FLORIDA
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.65, ease: 'easeOut' }}
              className="mb-6 max-w-[840px] text-[44px] font-bold leading-[0.98] tracking-[-2.6px] text-white sm:text-[58px] md:text-[72px] lg:text-[86px]"
            >
              Prevent, Protect &amp; Eliminate Pests
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="mb-9 max-w-xl text-lg leading-relaxed text-white/82 md:text-xl"
            >
              Premium, eco-conscious pest control for Miami homes and businesses. Fast service, licensed technicians, and guaranteed results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/book" className="btn btn-primary w-full px-9 py-4 text-base sm:w-auto">
                Get Free Quote <ArrowRight size={19} />
              </Link>
              <a href="#demo-only" className="btn w-full border border-white/30 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/15 sm:w-auto">
                <Phone size={18} /> Call Now
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.45 }}
              className="mt-9 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-white shadow-xl backdrop-blur"
            >
              <Award className="text-[#4ADE80]" size={26} />
              <div>
                <div className="text-sm font-bold leading-none">30+ Years Experience</div>
                <div className="mt-1 text-xs text-white/70">Licensed, insured, and locally trusted</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUST CARDS */}
      <section className="max-w-[1280px] mx-auto px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "100% Satisfaction Guarantee", text: "If pests return, so do we — at no extra cost." },
            { icon: Clock, title: "24/7 Emergency Service", text: "Same-day response for urgent pest issues." },
            { icon: Award, title: "Licensed Experts", text: "Certified technicians with 30+ years experience." },
          ].map((item, index) => (
            <div key={index} className="card p-7 flex gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#F8FAFC] group-hover:bg-[#1D7A43] transition text-[#1D7A43] group-hover:text-white">
                <item.icon size={24} />
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight mb-1">{item.title}</div>
                <p className="text-sm text-[#374151]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-14">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-9 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&q=80" alt="Technician" className="rounded-3xl h-80 w-full object-cover" />
              <div className="space-y-4 pt-6">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80" alt="Team at work" className="rounded-3xl h-44 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" alt="Treatment" className="rounded-3xl h-32 w-full object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white shadow-xl px-7 py-4 rounded-3xl hidden md:block">
              <div className="font-semibold text-sm">Trusted by 14,800+ South Florida Homes &amp; Businesses</div>
            </div>
          </div>

          <div>
            <div className="text-[#1D7A43] tracking-[1.5px] text-xs font-bold mb-3">SUSTAINABLE PEST MANAGEMENT</div>
            <h2 className="section-title tracking-[-1.6px] mb-5">Focused on Safe, Effective &amp; Eco-Friendly Solutions</h2>
            <p className="text-[#374151] mb-6 leading-relaxed">Since 1994, PestX Miami has delivered premium pest control services that prioritize the safety of your family, pets, and the environment. We combine advanced science with responsible practices.</p>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-2 mb-8 text-sm">
              {["Safe Treatments", "Fast Response", "Pet Friendly", "Guaranteed Results"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[#1D7A43] font-medium">✓ {item}</li>
              ))}
            </ul>

            <Link to="/about" className="btn btn-outline px-8">Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-9">
            <div>
              <div className="uppercase text-xs tracking-[2.5px] font-semibold text-[#1D7A43]">EXPERT SOLUTIONS</div>
              <h2 className="section-title tracking-[-1.5px] mt-1">Comprehensive Pest Control Services</h2>
            </div>
            <Link to="/services" className="mt-4 md:mt-0 inline-flex items-center text-[#1D7A43] font-semibold hover:underline">Browse all services <ArrowRight size={17} className="ml-1" /></Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-[#1D7A43] font-semibold tracking-widest text-sm">TRANSPARENT PRICING</div>
          <h2 className="section-title tracking-[-1.4px] mt-2">Affordable Protection Starts Here</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {pricingPreview.map((item, i) => (
            <div key={i} className="card p-6 text-center hover:border-[#1D7A43]/40">
              <div className="font-semibold text-lg mb-1">{item.service}</div>
              <div className="text-4xl font-bold tracking-tighter text-[#1D7A43] mt-2 mb-1">${item.price}</div>
              <div className="text-xs text-[#64748b]">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/book" className="btn btn-primary px-9">Get a Custom Quote</Link>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-9">
            <h2 className="section-title tracking-[-1.4px]">Why Miami Trusts PestX</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Leaf, title: "Eco Friendly", desc: "Responsible products that protect your family and the environment." },
              { icon: BadgeCheck, title: "Licensed Team", desc: "Fully certified by the State of Florida. Background-checked professionals." },
              { icon: Zap, title: "Fast Response", desc: "Most jobs scheduled same-day or next-day. Emergency service 24/7." },
              { icon: DollarSign, title: "Affordable Pricing", desc: "Fair, transparent pricing with no surprise fees. Free quotes." },
              { icon: Shield, title: "Guaranteed Results", desc: "If pests return during our warranty, we return for free." },
              { icon: MapPin, title: "Local Experts", desc: "Miami-based since 1994. We understand South Florida pests." },
            ].map((f, index) => (
              <div key={index} className="card p-7 flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF3] text-[#1D7A43]"><f.icon size={23} /></div>
                <div>
                  <div className="font-semibold text-lg mb-1">{f.title}</div>
                  <p className="text-sm text-[#374151]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="text-[#1D7A43] font-semibold text-xs tracking-widest">HOW IT WORKS</div>
          <h2 className="section-title tracking-[-1.2px] mt-2">Our Proven 4-Step Process</h2>
        </div>
        <ProcessTimeline />
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="text-[#1D7A43] uppercase text-xs font-semibold tracking-widest">REAL CUSTOMERS. REAL RESULTS.</div>
              <h2 className="section-title tracking-tight mt-1">Loved by South Florida Families</h2>
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="px-4 py-1 bg-[#F8FAFC] rounded-2xl flex items-center gap-2 text-[#1D7A43]">
                <span className="font-semibold">4.97</span> / 5
              </div>
              <Link to="/book" className="font-medium text-[#1D7A43] flex items-center hover:underline">Write a Review →</Link>
            </div>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end gap-y-2 md:justify-between mb-8">
          <div>
            <div className="text-[#1D7A43] tracking-widest text-xs font-semibold">COVERAGE AREA</div>
            <h2 className="section-title mt-1 tracking-[-1.5px]">Proudly Serving South Florida</h2>
          </div>
          <Link to="/areas" className="text-[#1D7A43] text-sm font-semibold flex items-center">See Full Service Map <ArrowRight size={16} className="ml-1" /></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {["Miami", "Miami Beach", "Coral Gables", "Hialeah", "Doral", "Kendall", "Homestead"].map((area, index) => (
            <div key={index} className="area-card border border-[#E5E7EB] hover:border-[#1D7A43] px-5 py-[17px] rounded-2xl text-sm font-medium flex items-center justify-center">{area}</div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#F8FAFC] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <div className="font-semibold tracking-widest text-[#1D7A43] text-xs">QUESTIONS?</div>
            <h2 className="section-title tracking-[-1.5px] mt-2">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion faqs={faqs.slice(0, 8)} />
          <div className="text-center mt-8">
            <Link to="/contact" className="font-semibold text-[#1D7A43]">Still have questions? Contact us →</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default Home;
