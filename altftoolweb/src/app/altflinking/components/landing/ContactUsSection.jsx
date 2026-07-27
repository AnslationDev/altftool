/**
 * Enterprise Contact Us & Lead Generation Component
 * Location: src/app/altflinking/components/landing/ContactUsSection.jsx
 */

"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function ContactUsSection({ showToast = () => { } }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Agency Buyer",
    budget: "$2,000 - $10,000 / mo",
    website: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    // Save lead data locally for future Admin backend sync
    const existingLeads = JSON.parse(localStorage.getItem("altf_leads") || "[]");
    const newLead = {
      id: `LEAD-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("altf_leads", JSON.stringify([newLead, ...existingLeads]));

    setSubmitted(true);
    showToast("Lead submitted! An Enterprise Backlink Strategist will contact you within 2 hours.");
  };

  return (
    <div className="altf-card p-6 sm:p-10 border-indigo-500/30 bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        {/* Left 5 Columns: Direct Support & SLA Proof */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>24/7 Enterprise Assistance</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Get In Touch With Backlink Experts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Have custom agency requirements, bulk placement orders, or publisher verification questions? Send us an inquiry and generate an instant support lead.
            </p>
          </div>

          {/* Contact Details List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Email Sales & Support</p>
                <p className="text-xs font-bold text-white font-mono">support@altftool.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Agency Hotline</p>
                <p className="text-xs font-bold text-emerald-400 font-mono">+1 (800) 555-ALTF</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Guaranteed SLA Response</p>
                <p className="text-xs font-bold text-cyan-400 font-mono">Under 2 Hours (24/7)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Lead Generation Form */}
        <div className="lg:col-span-7">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Submit Lead / Sales Inquiry</span>
                <span className="altf-badge altf-badge-verified">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Instant Lead Sync
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="altf-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@agency.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="altf-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">User Profile / Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="altf-input text-xs"
                  >
                    <option value="Agency Buyer">Agency SEO Buyer</option>
                    <option value="In-house Brand">In-House Brand Marketer</option>
                    <option value="Publisher Website Owner">Publisher Website Owner</option>
                    <option value="Reseller / Affiliate">Reseller / Enterprise Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Budget / Inventory</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="altf-input text-xs"
                  >
                    <option value="$500 - $2,000 / mo">$500 - $2,000 / mo</option>
                    <option value="$2,000 - $10,000 / mo">$2,000 - $10,000 / mo</option>
                    <option value="$10,000+ / mo">$10,000+ / mo (Custom Bulk)</option>
                    <option value="Publisher Listing">Publisher (Listing Domains)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Website / Publisher Domain</label>
                <input
                  type="text"
                  placeholder="e.g. mycompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inquiry Details / Custom Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your backlink requirements, target niches, or publisher domain details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="altf-input text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="altf-btn-primary w-full py-3 text-xs font-bold rounded-xl"
              >
                <span>Send Inquiry & Submit Lead</span>
                <Send className="h-4 w-4 ml-1" />
              </button>
            </form>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/40 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Lead Successfully Captured!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been logged in our lead queue. An Enterprise Backlink Strategist will follow up via <strong>{formData.email}</strong> shortly.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="altf-btn-secondary py-2 px-5 text-xs font-bold"
              >
                Submit Another Inquiry
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
