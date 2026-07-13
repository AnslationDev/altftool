import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "../ui/Container";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import { navLinks } from "../../data/navLinks";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300 dark:bg-slate-950 ${
        scrolled
          ? "shadow-sm border-b border-slate-200 dark:border-white/10"
          : "border-b border-transparent"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" aria-label="Home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-0.5 text-base font-medium transition-colors ${
                    isActive
                      ? "text-brand dark:text-brand"
                      : "text-slate-600 hover:text-brand dark:text-slate-300 dark:hover:text-brand"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-[2px] h-[2px] rounded-full bg-brand"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:grid" />
            <Link
              to="/contact"
              className="hidden items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25 sm:inline-flex"
            >
              Plan My Growth
              <ArrowUpRight size={15} strokeWidth={2.5} />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              className="absolute inset-x-0 top-0 border-b border-slate-200 bg-white px-4 pb-5 pt-3 dark:border-white/10 dark:bg-slate-950"
            >
              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand/10 text-brand"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <ThemeToggle />
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Plan My Growth <ArrowUpRight size={15} />
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
