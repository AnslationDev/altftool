/**
 * Customer Testimonials Component (Reference Match)
 * Location: src/app/altflinking/components/landing/CustomerTestimonials.jsx
 */

"use client";

import React from "react";
import { Star } from "lucide-react";

export default function CustomerTestimonials() {
  const testimonials = [
    {
      name: "Arun Kumar",
      role: "SEO Manager at Digify",
      quote: "ALTFTool helped us scale our link building campaigns with top quality websites.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Priya Sharma",
      role: "Founder at GrowthHackers",
      quote: "The best backlink marketplace we've used. Great support and real results.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Rohit Verma",
      role: "Head of SEO at Rankers",
      quote: "High quality links, transparent metrics, and super easy to use.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="space-y-6 my-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Trusted by Agencies &amp; Marketers Worldwide
        </h2>
        <p className="text-xs text-slate-500 ">
          See what top SEO professionals say about our backlink marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="altf-card p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition"
          >
            {/* User Info Header */}
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 "
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 ">{t.name}</h3>
                <p className="text-xs text-slate-500 ">{t.role}</p>
              </div>
            </div>

            {/* Quote */}
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{t.quote}"
            </p>

            {/* 5 Golden Stars */}
            <div className="flex items-center gap-1 text-amber-500 pt-1 border-t border-slate-100 ">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-1.5 pt-2">
        <span className="h-2 w-2 rounded-full bg-indigo-600" />
        <span className="h-2 w-2 rounded-full bg-slate-300 " />
        <span className="h-2 w-2 rounded-full bg-slate-300 " />
      </div>
    </div>
  );
}
