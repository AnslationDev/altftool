import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, Leaf, Shield } from 'lucide-react';
import CTASection from '../components/CTASection';

const About = () => {
  const team = [
    { name: "Marcus Rivera", role: "Founder & Lead Technician", exp: "32 years", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
    { name: "Elena Santos", role: "Termite & Structural Specialist", exp: "19 years", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
    { name: "Luis Mendez", role: "Entomologist & IPM Director", exp: "24 years", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" },
    { name: "Sofia Patel", role: "Residential Services Manager", exp: "14 years", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
  ];

  const certifications = [
    "Florida Dept. of Agriculture Licensed",
    "Certified Pest Control Operator (CPO)",
    "Termite Treatment Certified",
    "Wildlife Trapper Certified",
    "GreenPro Certified",
    "National Pest Management Association"
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#14532D] text-white py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-2xl">
            <div className="uppercase tracking-[3px] text-[#4ADE80] text-sm font-semibold mb-3">ESTABLISHED 1994</div>
            <h1 className="text-white text-6xl font-bold tracking-[-2.6px] leading-none mb-5">Protecting South Florida Homes &amp; Families for Over 30 Years</h1>
            <p className="text-xl text-white/80">Locally owned. Family operated. Committed to doing pest control the right way.</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-[1280px] mx-auto px-6 py-20 grid md:grid-cols-12 gap-x-14">
        <div className="md:col-span-5">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Our Story</h2>
          <div className="space-y-4 text-[#374151] text-[15px] leading-relaxed">
            <p>PestX Miami was founded in 1994 by Marcus Rivera, a second-generation exterminator who saw a need for honest, professional pest control that actually delivered long-term results.</p>
            <p>Over three decades later, we remain a family-run business serving Miami-Dade and South Florida with the same values that built our reputation: integrity, expertise, and a commitment to safe practices.</p>
          </div>
        </div>
        <div className="md:col-span-7 mt-9 md:mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-7"><div className="text-5xl font-bold tracking-tighter text-[#1D7A43]">30+</div><div className="mt-1">Years in Business</div></div>
            <div className="card p-7"><div className="text-5xl font-bold tracking-tighter text-[#1D7A43]">14,800</div><div className="mt-1">Happy Customers</div></div>
            <div className="card p-7"><div className="text-5xl font-bold tracking-tighter text-[#1D7A43]">52k</div><div className="mt-1">Successful Treatments</div></div>
            <div className="card p-7"><div className="text-5xl font-bold tracking-tighter text-[#1D7A43]">100%</div><div className="mt-1">Local &amp; Family Owned</div></div>
          </div>
        </div>
      </div>

      {/* Mission + Vision */}
      <div className="bg-[#F8FAFC] py-16">
        <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="card p-9">
            <div className="font-bold text-xl mb-3">Our Mission</div>
            <p className="text-[#374151]">To deliver safe, highly effective pest control that protects South Florida families, homes, and businesses — using responsible methods that minimize environmental impact while delivering lasting results.</p>
          </div>
          <div className="card p-9">
            <div className="font-bold text-xl mb-3">Our Vision</div>
            <p className="text-[#374151]">To be the most trusted name in South Florida pest management through technical excellence, customer care, and a deep commitment to our community and the environment.</p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="font-semibold text-[#1D7A43] tracking-widest text-xs">MEET THE TEAM</div>
          <h2 className="section-title tracking-tight mt-2">Experienced Professionals You Can Trust</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((member, idx) => (
            <div key={idx} className="card overflow-hidden">
              <img src={member.img} alt={member.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-6">
                <div className="font-semibold text-lg tracking-tight">{member.name}</div>
                <div className="text-sm text-[#1D7A43]">{member.role}</div>
                <div className="text-xs mt-2 text-[#64748b]">{member.exp} experience</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="max-w-[1280px] mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-[#111827] text-white px-9 py-12 grid md:grid-cols-12 gap-y-8 items-center">
          <div className="md:col-span-5">
            <h3 className="font-bold text-3xl tracking-tight">Fully Certified &amp; Insured</h3>
            <p className="mt-3 text-white/70">Every technician is trained, background checked, and certified to the highest industry standards.</p>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {certifications.map((c, i) => <div key={i} className="flex items-center gap-2 text-white/90">✓ {c}</div>)}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="text-center mb-8"><h2 className="section-title">Why Families Choose PestX Miami</h2></div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {icon: <Leaf className="text-[#1D7A43]" />, title: "Eco-Conscious", text: "We prioritize low-impact and targeted solutions whenever possible."},
            {icon: <Shield className="text-[#1D7A43]" />, title: "Strong Warranties", text: "Up to 5 years on termite services. 90 days on most residential jobs."},
            {icon: <Users className="text-[#1D7A43]" />, title: "Real People", text: "You will always speak to a local technician — never a call center."},
            {icon: <Award className="text-[#1D7A43]" />, title: "Proven Results", text: "Over 98% customer satisfaction. Thousands of repeat customers."},
          ].map((f, i) => (
            <div className="card p-7" key={i}>
              <div className="mb-4">{f.icon}</div>
              <div className="font-semibold text-xl tracking-tight">{f.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#374151]">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </div>
  );
};

export default About;
