import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      data-siding-navbar
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(13,59,102,0.08)] py-3 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="leading-tight">
            <div className="font-display font-extrabold text-lg text-[#0D3B66]">
              EliteShield
            </div>
            <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#1E5AA8]">
              Siding Solutions
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base font-semibold link-underline text-[#0D3B66] hover:text-[#00AEEF] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#demo-only"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0D3B66] to-[#1E5AA8] border border-[#1E5AA8]/30 shadow-[0_8px_22px_rgba(13,59,102,0.18)] hover:from-[#1E5AA8] hover:to-[#00AEEF] transition-all"
          >
            <Phone className="w-4 h-4 text-white" />
            <span className="text-base font-bold text-white">
              Demo only
            </span>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="xl:hidden p-2 rounded-lg text-[#0D3B66]"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-slate-100"
          >
            <div className="px-5 py-5 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-[#0D3B66] font-semibold hover:bg-[#F8FAFC]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
