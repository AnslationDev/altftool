"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Shield, Lock, CreditCard, Sparkles, HelpCircle } from "lucide-react";
import "../style/windowswap.css";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const handleOpenCheckout = (planName) => {
    setSelectedPlan(planName);
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setIsSubmitted(false);
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      alert("Please fill in all credit card details.");
      return;
    }

    setLoading(true);
    // Simulate secure transaction
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);

      // Trigger gorgeous canvas-confetti celebration
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#c56543", "#dfc7a7", "#ffffff", "#0b2c30"]
        });
      });
    }, 1600);
  };

  const features = [
    { name: "Random window views (10-min loops)", free: true, paid: true },
    { name: "Ambient sounds & audio toggle", free: true, paid: true },
    { name: "Upload your own window videos", free: true, paid: true },
    { name: "Back button (revisit previous windows)", free: false, paid: true },
    { name: "Search & Filter (by country, tags, weather)", free: false, paid: true },
    { name: "Unlimited bookmarks & collections", free: false, paid: true },
    { name: "Create & share custom view playlists", free: false, paid: true },
    { name: "Direct financial support for uploaders", free: false, paid: true },
    { name: "100% ad-free, quiet meditation", free: false, paid: true },
  ];

  return (
    <div className="min-h-screen bg-windowswap-teal text-white font-sans antialiased flex flex-col justify-between selection:bg-[#c56543]/40 selection:text-white">

      {/* ──────────────────────────────────────────────────────── */}
      {/* HEADER NAVBAR */}
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
        <div className="w-24" /> {/* Alignment balancer */}
      </header>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-16">

        {/* HERO HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] tracking-[0.3em] font-bold text-windowswap-cream/70 uppercase">WindowSwap All-Access</span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-windowswap-peach leading-tight">
            Support the global window creators
          </h1>
          <p className="text-sm text-windowswap-cream/80 font-light leading-relaxed">
            Choose standard free viewing or unlock All-Access capabilities to search by weather, bookmark your favorite hideaways, and support original uploaders.
          </p>
        </div>

        {/* BILLING TOGGLE SWITCH */}
        <div className="flex justify-center items-center">
          <div className="relative flex items-center p-1 bg-[#092327]/60 border border-teal-950/70 rounded-full select-none">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${billingCycle === "monthly" ? "bg-windowswap-terracotta text-white shadow-md" : "text-windowswap-cream/70 hover:text-white"
                }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition relative cursor-pointer ${billingCycle === "yearly" ? "bg-windowswap-terracotta text-white shadow-md" : "text-windowswap-cream/70 hover:text-white"
                }`}
            >
              Billed Yearly
              <span className="absolute -top-3 -right-2 px-2 py-0.5 bg-emerald-600 text-[8px] uppercase tracking-wider rounded-full font-bold text-white shadow-sm scale-90">Save 17%</span>
            </button>
          </div>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

          {/* FREE PLAN CARD */}
          <div className="bg-[#092327]/40 rounded-3xl border border-teal-950/50 p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase">Standard tier</span>
                <h3 className="font-serif text-2xl font-semibold text-white">Free Viewing</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Basic meditative exploration, random window flips, and beautiful sights from all over the globe.
                </p>
              </div>

              <div className="flex items-baseline">
                <span className="font-serif text-4xl md:text-5xl font-bold text-white">$0</span>
                <span className="text-xs text-zinc-400 font-medium ml-2">/ forever</span>
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Random 10-minute HD loops</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Atmospheric ambient sounds</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Upload views from your room</span>
                </li>
                <li className="flex items-start gap-3 text-zinc-500 line-through">
                  <X className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>Bookmarks & custom playlists</span>
                </li>
                <li className="flex items-start gap-3 text-zinc-500 line-through">
                  <X className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>Back button & location search</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                disabled
                className="w-full bg-[#0b2c30]/40 border border-teal-950/60 text-zinc-400 py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase select-none cursor-not-allowed"
              >
                Current Active Tier
              </button>
            </div>
          </div>

          {/* ALL ACCESS PREMIUM CARD */}
          <div className="bg-[#092327]/75 rounded-3xl border border-windowswap-terracotta/40 p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group shadow-xl">
            {/* Top highlight ribbon */}
            <div className="absolute top-0 right-0 bg-windowswap-terracotta text-white text-[9px] font-bold tracking-widest px-4 py-1.5 uppercase rounded-bl-xl select-none">
              Most Popular
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest text-[#c56543] font-bold uppercase">All-Access member</span>
                <h3 className="font-serif text-2xl font-semibold text-white">WindowSwap Premium</h3>
                <p className="text-xs text-windowswap-cream/70 leading-relaxed font-light">
                  Directly fund the global creator network, bookmark cozy spots, filter categories, and skip backward freely.
                </p>
              </div>

              <div className="flex items-baseline">
                {billingCycle === "monthly" ? (
                  <>
                    <span className="font-serif text-4xl md:text-5xl font-bold text-white">$5</span>
                    <span className="text-xs text-windowswap-cream/70 font-medium ml-2">/ month</span>
                  </>
                ) : (
                  <>
                    <span className="font-serif text-4xl md:text-5xl font-bold text-white">$50</span>
                    <span className="text-xs text-windowswap-cream/70 font-medium ml-2">/ year</span>
                    <span className="text-[9px] text-emerald-500 font-semibold ml-2 select-none">(~$4.16/mo)</span>
                  </>
                )}
              </div>

              <div className="h-[1px] w-full bg-teal-950/30" />

              <ul className="space-y-3.5 text-xs text-windowswap-cream/95">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-white">Back Button enabled</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span className="font-medium text-white">Search by weather / country / tags</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Unlimited custom bookmark lists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Direct support payout for creators</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-windowswap-terracotta shrink-0 mt-0.5" />
                  <span>Zero commercials, 100% ad-free calm</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handleOpenCheckout(billingCycle === "monthly" ? "Premium Monthly ($5)" : "Premium Yearly ($50)")}
                className="w-full bg-windowswap-terracotta hover:bg-[#b05434] text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-101 active:scale-99 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade to All-Access
              </button>
            </div>
          </div>

        </div>

        {/* COMPARISON MATRIX SECTION */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl font-medium text-white">Compare standard and premium features</h3>
            <p className="text-xs text-windowswap-cream/70 font-light">See everything included in the All-Access subscription.</p>
          </div>

          <div className="bg-[#092327]/60 rounded-3xl border border-teal-950/50 overflow-hidden backdrop-blur-sm">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-teal-950/30 text-xs">
                <thead>
                  <tr className="bg-[#0b2c30]/40 text-[10px] tracking-wider uppercase font-bold text-windowswap-cream/80">
                    <th scope="col" className="px-6 py-4 text-left font-bold">Capabilities</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold">Standard Free</th>
                    <th scope="col" className="px-6 py-4 text-center w-32 font-bold text-windowswap-peach">All Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-950/20 text-windowswap-cream/90">
                  {features.map((item, index) => (
                    <tr key={index} className="hover:bg-[#0b2c30]/10 transition duration-150">
                      <td className="px-6 py-4 font-medium text-left">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        {item.free ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-white">
                        {item.paid ? (
                          <Check className="h-4 w-4 text-windowswap-terracotta mx-auto font-bold" />
                        ) : (
                          <X className="h-4 w-4 text-zinc-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECURITY & SSL BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-teal-950/30 pt-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Shield className="h-8 w-8 text-[#c56543] shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Secure SSL Transactions</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">Every purchase is shielded with industry-standard 256-bit SSL encryption.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Lock className="h-8 w-8 text-[#c56543] shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Encrypted Credit Details</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">We do not store or see your private credit numbers. Transacted directly by Stripe.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <HelpCircle className="h-8 w-8 text-[#c56543] shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Flexible Cancellation</h4>
              <p className="text-[10px] text-windowswap-cream/70 leading-normal font-light">Subscription settings are adjustable at any time inside your client profile settings.</p>
            </div>
          </div>
        </div>

      </main>

      {/* ──────────────────────────────────────────────────────── */}
      {/* CHECKOUT MODAL OVERLAY */}
      {/* ──────────────────────────────────────────────────────── */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#092327] rounded-3xl border border-teal-950 shadow-2xl overflow-hidden relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={handleCloseCheckout}
              className="absolute top-4 right-4 text-windowswap-cream hover:text-white transition duration-150 p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleCheckoutSubmit} className="p-8 space-y-6">

                {/* HEAD */}
                <div className="space-y-1">
                  <span className="text-[9px] tracking-widest text-[#c56543] uppercase font-bold">Secure Checkout</span>
                  <h3 className="font-serif text-2xl font-bold text-white">Complete Premium Upgrade</h3>
                  <p className="text-xs text-windowswap-cream/70">
                    Upgrading to: <span className="text-white font-medium">{selectedPlan}</span>
                  </p>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-4">

                  {/* CARDHOLDER NAME */}
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-wider uppercase font-bold text-windowswap-cream/80">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                    />
                  </div>

                  {/* CARD NUMBER */}
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-wider uppercase font-bold text-windowswap-cream/80">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          // Allow digits only and auto space every 4 digits
                          let v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                          let matches = v.match(/\d{4,16}/g);
                          let match = matches && matches[0] || "";
                          let parts = [];
                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }
                          if (parts.length > 0) {
                            setCardNumber(parts.join(" "));
                          } else {
                            setCardNumber(v);
                          }
                        }}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition"
                      />
                      <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                    </div>
                  </div>

                  {/* EXPIRY & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-wider uppercase font-bold text-windowswap-cream/80">Expiration Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                          if (v.length >= 2) {
                            setCardExpiry(v.substring(0, 2) + "/" + v.substring(2, 4));
                          } else {
                            setCardExpiry(v);
                          }
                        }}
                        className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-wider uppercase font-bold text-windowswap-cream/80">CVC Code</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/gi, ""))}
                        className="w-full bg-[#0b2c30]/60 border border-teal-950/70 focus:border-windowswap-terracotta rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition text-center"
                      />
                    </div>
                  </div>

                </div>

                {/* SECURE SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-windowswap-terracotta hover:bg-[#b05434] text-white py-4 rounded-full font-semibold transition hover:scale-101 active:scale-99 shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay & Activate All-Access
                    </>
                  )}
                </button>

                {/* LOGOS POWERED BY STRIPE */}
                <div className="flex justify-between items-center text-[9px] tracking-widest text-windowswap-cream/50 pt-2 font-medium border-t border-teal-950/20">
                  <span>POWERED BY <span className="text-white font-bold">stripe</span></span>
                  <span>SSL SECURE PAYMENT</span>
                </div>

              </form>
            ) : (
              /* SUCCESS SCREEN */
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-teal-950/40 border border-[#c56543]/40 flex items-center justify-center text-windowswap-terracotta animate-pulse">
                  <Sparkles className="w-10 h-10 text-[#c56543]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-bold text-white">All-Access Active!</h3>
                  <p className="text-sm text-windowswap-cream/80 leading-relaxed max-w-xs">
                    Welcome to WindowSwap Premium! Your subscription is now fully active. Enjoy unrestricted ambient viewing.
                  </p>
                </div>

                <div className="bg-[#0b2c30]/40 rounded-2xl p-4 border border-teal-950 text-left w-full text-xs space-y-2">
                  <div><span className="text-windowswap-cream/60">Subscriber:</span> <span className="text-white font-medium">{cardName}</span></div>
                  <div><span className="text-windowswap-cream/60">Subscription Tier:</span> <span className="text-white font-medium">{selectedPlan}</span></div>
                  <div><span className="text-windowswap-cream/60">Payment Status:</span> <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Securely Cleared</span></div>
                </div>

                <button
                  onClick={handleCloseCheckout}
                  className="w-full bg-[#c56543] hover:bg-[#b05434] text-white py-3.5 rounded-full font-semibold transition hover:scale-101 active:scale-99 shadow-lg text-xs tracking-wider uppercase cursor-pointer"
                >
                  Return to pricing
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-widest text-windowswap-cream/55 select-none font-medium">
        <span>POWERED BY <span className="text-white font-semibold">stripe</span></span>
        <span className="uppercase mt-2 sm:mt-0">SECURE 256-BIT SSL ENCRYPTION • TERMS & CONDITIONS APPLY</span>
      </footer>

    </div>
  );
}
