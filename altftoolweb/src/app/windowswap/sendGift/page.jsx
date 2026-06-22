"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";
import "../style/windowswap.css";

export default function SendGiftPage() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    plan: "1year",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (planId) => {
    setFormData((prev) => ({ ...prev, plan: planId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.senderName || !formData.senderEmail || !formData.recipientName || !formData.recipientEmail) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    // Simulate premium payment processing
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);

      // Import canvas-confetti dynamically for a beautiful victory explosion
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#c56543", "#dfc7a7", "#ffffff", "#0b2c30"]
        });
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-windowswap-teal text-white font-sans antialiased flex flex-col justify-between selection:bg-[#c56543]/40 selection:text-white">

      {/* ──────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ──────────────────────────────────────────────────────── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <Link
          href="/windowswap"
          className="flex items-center gap-2 text-windowswap-cream hover:text-white transition duration-200 text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" /> Back to WindowSwap
        </Link>
        <span className="font-serif text-xl tracking-[0.2em] font-medium text-white select-none">
          WindowSwap
        </span>
        <div className="w-24" /> {/* Spacer to align center */}
      </header>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-4xl bg-[#092327]/60 rounded-3xl border border-teal-950/50 shadow-2xl overflow-hidden backdrop-blur-md grid grid-cols-1 md:grid-cols-12">

          {/* LEFT SIDE PANEL (Visual promo) */}
          <div className="md:col-span-5 bg-[#c56543] p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden select-none">
            {/* Background design elements */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-teal-950/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Cradling Hand Gift Illustration */}
              <div className="mb-6 flex flex-col items-center">
                <svg className="w-36 h-36 text-white" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path id="gift-curve-left" d="M22,82 A48,48 0 0,1 118,82" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <text className="font-serif text-[10px] tracking-[0.08em] fill-current font-bold">
                    <textPath href="#gift-curve-left" startOffset="50%" textAnchor="middle">
                      GIFT CALM TODAY
                    </textPath>
                  </text>
                  <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <rect x="52" y="70" width="36" height="30" rx="3" />
                    <line x1="70" y1="70" x2="70" y2="100" />
                    <line x1="52" y1="85" x2="88" y2="85" />
                    <path d="M70,70 C65,58 55,58 62,70 Z" />
                    <path d="M70,70 C75,58 85,58 78,70 Z" />
                    <path d="M68,70 Q62,76 56,73" />
                    <path d="M72,70 Q78,76 84,73" />
                    <path d="M54,103 Q46,108 53,115" />
                    <path d="M53,115 C64,115 82,112 90,103" />
                    <path d="M57,118 C67,118 81,115 87,107" />
                    <path d="M61,121 C70,121 80,118 84,111" />
                  </g>
                </svg>
              </div>

              <h2 className="font-serif text-3xl font-bold leading-tight mb-4 text-white">
                Gift WindowSwap
              </h2>
              <p className="text-sm text-white/90 font-light leading-relaxed max-w-xs">
                Share infinite travel, slow rain over Tokyo, snowy mountains in Oslo, and beautiful gardens in Edinburgh with someone special.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4 text-xs font-semibold text-white/80">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-windowswap-cream shrink-0" />
                <span>Unlimited bookmarks & playlists</span>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="h-4 w-4 text-windowswap-cream shrink-0" />
                <span>Custom gift email & message</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-windowswap-cream shrink-0" />
                <span>Zero commercials, ever</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM PANEL */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    Send All-Access Gift
                  </h3>
                  <p className="text-xs text-windowswap-cream/70">
                    Provide the sender and recipient details to purchase a gift card.
                  </p>
                </div>

                {/* SENDER FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Your Name</label>
                    <input
                      type="text"
                      name="senderName"
                      required
                      value={formData.senderName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Your Email</label>
                    <input
                      type="email"
                      name="senderEmail"
                      required
                      value={formData.senderEmail}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* RECIPIENT FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Recipient's Name</label>
                    <input
                      type="text"
                      name="recipientName"
                      required
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="John Smith"
                      className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Recipient's Email</label>
                    <input
                      type="email"
                      name="recipientEmail"
                      required
                      value={formData.recipientEmail}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* GIFT PLAN RADIO */}
                <div className="space-y-2">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Choose Subscription Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <button
                      type="button"
                      onClick={() => handlePlanSelect("6months")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer select-none ${formData.plan === "6months"
                          ? "border-windowswap-terracotta bg-windowswap-terracotta/15 text-white"
                          : "border-teal-950/70 bg-[#0b2c30]/40 text-windowswap-cream hover:border-windowswap-cream/35"
                        }`}
                    >
                      <span className="text-xs font-bold">6 Months</span>
                      <span className="text-lg font-serif font-semibold mt-1">$15</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlanSelect("1year")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition relative cursor-pointer select-none ${formData.plan === "1year"
                          ? "border-windowswap-terracotta bg-windowswap-terracotta/15 text-white"
                          : "border-teal-950/70 bg-[#0b2c30]/40 text-windowswap-cream hover:border-windowswap-cream/35"
                        }`}
                    >
                      <div className="absolute -top-2.5 px-2 py-0.5 bg-windowswap-terracotta text-[8px] tracking-wider uppercase rounded-full text-white font-bold">Best Value</div>
                      <span className="text-xs font-bold">1 Year</span>
                      <span className="text-lg font-serif font-semibold mt-1">$25</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlanSelect("lifetime")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer select-none ${formData.plan === "lifetime"
                          ? "border-windowswap-terracotta bg-windowswap-terracotta/15 text-white"
                          : "border-teal-950/70 bg-[#0b2c30]/40 text-windowswap-cream hover:border-windowswap-cream/35"
                        }`}
                    >
                      <span className="text-xs font-bold">Lifetime</span>
                      <span className="text-lg font-serif font-semibold mt-1">$60</span>
                    </button>

                  </div>
                </div>

                {/* PERSONALIZED MESSAGE */}
                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">Gift Message (Optional)</label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Here's a window to the world. Enjoy all the cozy, rainy views!"
                    className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition resize-none"
                  />
                </div>

                {/* SIMULATED PAYMENT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-windowswap-terracotta hover:bg-[#b05434] text-white py-4 rounded-full font-semibold transition hover:scale-101 active:scale-99 shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Purchase & Send Gift Subscription
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SUCCESS STATE */
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
                <div className="w-20 h-20 rounded-full bg-teal-950/40 border border-[#c56543]/40 flex items-center justify-center text-windowswap-terracotta animate-pulse">
                  <Gift className="w-10 h-10 text-[#c56543]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-bold text-white">
                    Gift Sent Successfully!
                  </h3>
                  <p className="text-sm text-windowswap-cream/80 leading-relaxed max-w-sm">
                    Thank you! A gorgeous gift email with activation details and your personal message has been delivered to <span className="text-white font-semibold">{formData.recipientEmail}</span>.
                  </p>
                </div>

                <div className="bg-[#0b2c30]/40 rounded-2xl p-4 border border-teal-950 text-left w-full max-w-md text-xs space-y-2">
                  <div><span className="text-windowswap-cream/60">Sender:</span> <span className="text-white font-medium">{formData.senderName}</span></div>
                  <div><span className="text-windowswap-cream/60">Recipient:</span> <span className="text-white font-medium">{formData.recipientName} ({formData.recipientEmail})</span></div>
                  <div><span className="text-windowswap-cream/60">Selected Plan:</span> <span className="text-white font-medium capitalize">{formData.plan === "1year" ? "1 Year All-Access ($25)" : formData.plan === "6months" ? "6 Months All-Access ($15)" : "Lifetime All-Access ($60)"}</span></div>
                  {formData.message && <div><span className="text-windowswap-cream/60">Personal Message:</span> <span className="text-white italic">"{formData.message}"</span></div>}
                </div>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-transparent border border-white/20 hover:border-white/50 text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer"
                >
                  Send another gift
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ──────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-widest text-windowswap-cream/55 select-none font-medium">
        <span>POWERED BY <span className="text-white font-semibold">stripe</span></span>
        <span className="uppercase mt-2 sm:mt-0">SECURE 256-BIT SSL ENCRYPTION • T&C's APPLY</span>
      </footer>

    </div>
  );
}
