import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { services } from '../data/services';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/areas', label: 'Service Areas' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const topBarItems = [
    { icon: <MapPin size={14} />, text: "Serving South Florida" },
    { icon: <Phone size={14} />, text: "(786) 567-9554" },
  ];

  return (
    <>
      {/* Top Information Bar */}
      <div className="hidden md:block bg-[#14532D] text-white text-sm py-2">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[#4ADE80]">✓</span>
              <span className="font-medium">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#4ADE80]">✓</span>
              <span className="font-medium">Eco-Friendly Treatments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#4ADE80]">✓</span>
              <span className="font-medium">30+ Years Experience</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-[#4ADE80]" />
              <span>Serving South Florida</span>
            </div>
            <a href="tel:7865679554" className="flex items-center gap-2 font-semibold hover:text-[#4ADE80] transition-colors">
              <Phone size={15} />
              (786) 567-9554
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#E5E7EB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#1D7A43] rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl tracking-tighter">PX</span>
              </div>
              <div>
                <div className="font-bold text-2xl tracking-[-1.5px] text-[#111827]">PestX Miami</div>
                <div className="text-[10px] text-[#1D7A43] -mt-1.5 font-medium tracking-[1px]">EST 1994</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-9 text-[15px] font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`transition-colors hover:text-[#1D7A43] ${isActive(link.href) ? 'text-[#1D7A43] font-semibold' : 'text-[#111827]'}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Services Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setShowMega(true)}
                onMouseLeave={() => setShowMega(false)}
              >
                <button className="flex items-center gap-1 text-[#111827] hover:text-[#1D7A43] transition-colors font-medium">
                  Services <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showMega && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[720px] bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] p-8 z-50"
                    >
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {services.slice(0, 10).map((service) => (
                          <Link
                            key={service.slug}
                            to={`/services/${service.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] group"
                          >
                            <div className="w-9 h-9 bg-[#F8FAFC] group-hover:bg-[#1D7A43] rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                              <span className="text-[#1D7A43] group-hover:text-white text-sm font-semibold">{service.shortTitle.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[#111827] group-hover:text-[#1D7A43]">{service.title}</div>
                              <div className="text-xs text-[#64748b]">From ${service.startingPrice}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t flex items-center justify-between">
                        <Link to="/services" className="text-sm font-semibold text-[#1D7A43] hover:underline">View All Services →</Link>
                        <Link to="/book" className="text-sm px-5 py-2 bg-[#1D7A43] text-white rounded-xl font-semibold hover:bg-[#14532D]">Book Service</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a href="tel:7865679554" className="btn btn-secondary text-sm px-5 py-2.5 hidden xl:flex">
                Call Now
              </a>
              <Link to="/book" className="btn btn-primary text-sm px-6 py-2.5">
                Get Free Quote
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#F8FAFC]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t bg-white overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-y-1 text-[15px]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`py-3 px-4 rounded-2xl font-medium ${isActive(link.href) ? 'bg-[#F8FAFC] text-[#1D7A43]' : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-[#E5E7EB] my-2" />
                <Link to="/services" onClick={() => setIsOpen(false)} className="py-3 px-4 font-medium">All Services</Link>

                <div className="pt-3 flex flex-col gap-3">
                  <a href="tel:7865679554" className="btn btn-secondary w-full justify-center">Call (786) 567-9554</a>
                  <Link to="/book" onClick={() => setIsOpen(false)} className="btn btn-primary w-full justify-center">Get Free Quote</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
