import { Link } from "react-router-dom";
import Icon from "./Icons.jsx";
import { Container } from "./ui.jsx";
import { company, navLinks, services } from "../data/site.js";

export default function Footer() {
  return (
    <footer className="bg-ink text-stone-400">
      {/* CTA strip */}
      <Container>
        <div className="relative -translate-y-1/2 overflow-hidden rounded-3xl bg-gradient-to-br from-bronze-600 to-bronze-800 p-8 shadow-2xl shadow-bronze-900/30 sm:p-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Let's design the perfect windows for your space.
              </h3>
              <p className="mt-3 text-bronze-100">
                Book a free site visit and consultation with our design studio today.
              </p>
            </div>

          </div>
        </div>
      </Container>

      <Container className="pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex flex-col leading-none">
              <span className="font-display text-2xl font-semibold text-white">
                {company.name}<span className="text-bronze-400">.</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-stone-500">
                Windows &amp; Facades
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
              {company.full} is a design-led studio crafting, manufacturing and
              installing premium windows and facade systems that bring light,
              comfort and elegance to every space.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {["facebook", "instagram", "linkedin", "twitter"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 text-stone-300 transition-all hover:border-bronze-500 hover:bg-bronze-600 hover:text-white"
                >
                  <Icon name={s} className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-bronze-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {services.slice(0, 5).map((s) => (
                <li key={s.title}>
                  <Link to="/services" className="transition-colors hover:text-bronze-300">
                    {s.title.replace(" & ", " &\u00A0")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Get in touch
            </h4>
            <ul className="mt-5 space-y-4 text-sm">

              <li>
                <a href={`tel:${company.phoneHref}`} className="flex gap-3 transition-colors hover:text-bronze-300">
                  <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-bronze-400" />
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="flex gap-3 break-all transition-colors hover:text-bronze-300">
                  <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-bronze-400" />
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-7 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {company.full}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-bronze-300">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-bronze-300">Terms of Service</a>
            <a href="#" className="transition-colors hover:text-bronze-300">Warranty</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
