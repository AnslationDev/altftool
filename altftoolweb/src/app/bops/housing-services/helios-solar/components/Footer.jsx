const CONTACT_URL = "/policypages/contact";

export default function Footer() {
  const scrollTo = (id) => {
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Top Row */}
        <div className="site-footer__top">
          {/* Logo */}
          <div className="site-footer__logo" onClick={() => scrollTo()}>
            <svg viewBox="0 0 24 24" className="site-footer__logo-icon">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/><path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/><path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
            </svg>
            <span className="site-footer__logo-text">HELIOS</span>
          </div>

          {/* Navigation Links */}
          <nav className="site-footer__nav" aria-label="Footer navigation">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollTo(); }}>Home</a>
            <a href="#roofing" onClick={(e) => { e.preventDefault(); scrollTo("roofing"); }}>Roofing</a>
            <a href="#panels" onClick={(e) => { e.preventDefault(); scrollTo("panels"); }}>Panels</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}>How It Works</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>Contact</a>
          </nav>

          {/* Contact Phone */}
          <div className="site-footer__phone">
            <a
              href={CONTACT_URL}
              className="navbar-cta flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M8 10h.01M12 10h.01M16 10h.01M21 11.5c0 4.142-4.03 7.5-9 7.5a10.2 10.2 0 0 1-3.4-.57L3 20.5l1.7-3.6A7.2 7.2 0 0 1 3 11.5C3 7.358 7.03 4 12 4s9 3.358 9 7.5z" />
              </svg>
              <span>Contact us</span>
            </a>
          </div>
        </div>

        {/* Separator Line */}
        <div className="site-footer__separator" />

        {/* Bottom Row */}
        <div className="site-footer__bottom">
          <div className="site-footer__copyright">
            © 2026 Helios Solar™. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
