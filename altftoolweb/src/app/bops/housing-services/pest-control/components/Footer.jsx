import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const serviceLinks = [
    { name: "Rodent Control", href: "/services/rodent-control" },
    { name: "Termite Control", href: "/services/termite-control" },
    { name: "Bee & Wasp Removal", href: "/services/bee-removal" },
    { name: "Mosquito Control", href: "/services/mosquito-control" },
    { name: "Bed Bug Removal", href: "/services/bed-bug-removal" },
  ];

  const resourceLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Service Areas", href: "/areas" },
    { name: "Book Appointment", href: "/book" },
    { name: "FAQs", href: "/#faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-[#111827] text-white pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12 pb-14 border-b border-white/10">
          {/* Company */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#1D7A43] rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl tracking-[-1px]">PX</span>
              </div>
              <span className="font-bold text-2xl tracking-[-1px]">PestX Miami</span>
            </div>
            <p className="text-white/70 max-w-sm text-[15px] leading-relaxed mb-6">
              South Florida's trusted pest control experts since 1994.
              Licensed, insured, and committed to safe, effective solutions.
            </p>
            <div className="flex gap-3" aria-label="Social links">
              {[
                { label: 'Facebook', text: 'Fb' },
                { label: 'Instagram', text: 'Ig' },
                { label: 'Twitter', text: 'X' },
                { label: 'LinkedIn', text: 'In' },
              ].map((item) => (
                <a key={item.label} href="#" className="w-10 h-10 flex items-center justify-center rounded-2xl border border-white/20 text-xs font-bold hover:bg-white/10 hover:border-white/40 transition" aria-label={item.label}>
                  {item.text}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="font-semibold mb-5 tracking-wide text-sm">SERVICES</div>
            <ul className="space-y-[13px] text-[14.5px] text-white/80">
              {serviceLinks.map((link, idx) => (
                <li key={idx}><Link to={link.href} className="hover:text-white transition">{link.name}</Link></li>
              ))}
              <li><Link to="/services" className="hover:text-white transition font-medium">View All →</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="font-semibold mb-5 tracking-wide text-sm">RESOURCES</div>
            <ul className="space-y-[13px] text-[14.5px] text-white/80">
              {resourceLinks.map((link, idx) => (
                <li key={idx}><Link to={link.href} className="hover:text-white transition">{link.name}</Link></li>
              ))}
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="font-semibold mb-5 tracking-wide text-sm">CONTACT US</div>
            <div className="space-y-4 text-sm">
              <a href="#demo-only" className="flex items-start gap-3 group">
                <Phone size={17} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">(786) 567-9554</div>
                  <div className="text-xs text-white/60">24/7 Emergency Line</div>
                </div>
              </a>
              <a href="#demo-only" className="flex items-center gap-3 hover:text-white text-white/80">
                <Mail size={17} className="text-[#4ADE80]" />
                info@pestxmiami.com
              </a>
              <div className="flex items-start gap-3 pt-1 text-white/80">
                <MapPin size={17} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                <div>
                  1420 SW 8th Street<br />
                  Miami, FL 33135
                </div>
              </div>
            </div>

            <div className="mt-7">
              <Link to="/book" className="inline-block text-sm font-semibold px-6 py-2.5 bg-[#1D7A43] hover:bg-[#14532D] rounded-2xl transition">Book Appointment</Link>
            </div>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-9 text-xs text-white/70 border-b border-white/10">
          {/* "Licensed & Insured" removed: no licence or cover exists behind
              this sample provider. */}
          <div className="flex items-center gap-2"><span className="text-[#4ADE80]">●</span> Sample provider page</div>
          <div className="flex items-center gap-2"><span className="text-[#4ADE80]">●</span> Eco-Friendly</div>
          <div className="flex items-center gap-2"><span className="text-[#4ADE80]">●</span> Satisfaction Guaranteed</div>
          <div className="flex items-center gap-2"><span className="text-[#4ADE80]">●</span> 30+ Years Experience</div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between text-xs text-white/60 gap-y-2 items-center">
          <div>© {new Date().getFullYear()} PestX Miami. All rights reserved. Serving Miami-Dade & South Florida.</div>
          <div className="flex gap-x-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
