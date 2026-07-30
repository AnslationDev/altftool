import { useState } from "react";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const cols = [
  {
    title: "Services",
    links: [
      { label: "Vinyl Siding", href: "#services" },
      { label: "Fiber Cement", href: "#services" },
      { label: "Wood Siding", href: "#services" },
      { label: "Composite Siding", href: "#services" },
      { label: "Insulated Siding", href: "#services" },
      { label: "Commercial Siding", href: "#services" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Services", href: "#services" },
      { label: "About", href: "#about" },
      { label: "Reviews", href: "#testimonials" },
      { label: "FAQ", href: "#faq" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Process", href: "#process" },
      { label: "Service Areas", href: "#service-areas" },
      { label: "Free Estimate", href: "#contact" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    e.target.reset();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <footer className="bg-[#0A2C4D] text-white pt-6 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D3B66] to-[#00AEEF] flex items-center justify-center shadow-glow">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <div className="font-display font-extrabold text-lg">EliteShield</div>
                <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#00AEEF]">Siding Solutions</div>
              </div>
            </div>
            <p className="mt-5 text-white/70 leading-relaxed max-w-sm">
              Premium siding installation and replacement for residential and commercial
              properties. Built to protect, beautify, and last a lifetime.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/80">
              <a href="tel:+18005551234" className="flex items-center gap-3 hover:text-[#00AEEF] transition">
                <Phone className="w-4 h-4 text-[#00AEEF]" /> (800) 555-1234
              </a>
              <a href="mailto:hello@eliteshield.com" className="flex items-center gap-3 hover:text-[#00AEEF] transition">
                <Mail className="w-4 h-4 text-[#00AEEF]" /> hello@eliteshield.com
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00AEEF]" /> 1200 Maple Ridge Blvd, Suite 400, Atlanta, GA 30309
              </div>
            </div>
          </div>

          {/* Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">{c.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-white/70 hover:text-[#00AEEF] transition">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider">Stay Inspired</h4>
            <p className="mt-4 text-sm text-white/70">Design trends & exclusive offers, monthly.</p>
            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="you@home.com"
                className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm placeholder:text-white/50 focus:outline-none focus:border-[#00AEEF]"
              />
              <button type="submit" className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00AEEF] to-[#1E5AA8] text-sm font-semibold hover:scale-[1.02] transition">
                Subscribe
              </button>
              {subscribed && <p className="text-xs font-medium text-[#00AEEF]">You&apos;re subscribed — thanks!</p>}
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} EliteShield Siding Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
