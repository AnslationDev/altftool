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
          <div
            className="site-footer__logo"
            role="button"
            tabIndex={0}
            aria-label="Scroll to top"
            onClick={() => scrollTo()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollTo();
              }
            }}
          >
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
              href="#demo-only"
              className="navbar-cta flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Demo only</span>
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
