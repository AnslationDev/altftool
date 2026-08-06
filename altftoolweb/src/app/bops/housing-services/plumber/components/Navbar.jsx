import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PhoneCall, X } from 'lucide-react';
import '../styles/Navbar.css';

const links = [
  { label: 'Services',     id: 'services'      },
  { label: 'How It Works', id: 'how-it-works'  },
  { label: 'Blog',         id: 'blog'          },
  { label: 'Reviews',      id: 'reviews'       },
  { label: 'FAQ',          id: 'faq'           },
  { label: 'Contact Us',         id: 'book-form'     },
];

function scrollToForm(mode) {
  const el = document.getElementById('book-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  if (mode && mode !== 'booking') {
    setTimeout(() => { if (window.switchBookingTab) window.switchBookingTab(mode); }, 650);
  }
}

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [clickedLink,   setClickedLink]   = useState('');
  const clickTimer = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const anchorY = window.scrollY + 120;
      let current = '';

      links.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.offsetTop <= anchorY) current = id;
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const handleLinkClick = (id) => {
    setClickedLink(id);
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickedLink(''), 700);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const active = clickedLink || activeSection;

  return (
    <motion.nav
      className={`fp-nav${scrolled ? ' fp-nav--scrolled' : ''}`}
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
    >
      <div className="fp-nav__inner">
        <Link href="/" className="fp-nav__logo">

          <span className="fp-nav__logo-text">FlowPro</span>
        </Link>

        <div className="fp-nav__links">
          {links.map(l => {
            const isActive = active === l.id;
            return (
              <button key={l.id} onClick={() => handleLinkClick(l.id)}
                className={`fp-nav__link${isActive ? ' fp-nav__link--active' : ''}`}>
                {l.label}
              </button>
            );
          })}
        </div>

        <div className="fp-nav__right">
          <a href="#demo-only" className="fp-nav__phone" aria-label="Emergency plumber phone number">
            <span className="fp-nav__phone-icon" aria-hidden="true">
              <PhoneCall size={19} strokeWidth={2.4} />
            </span>
            <span className="fp-nav__phone-copy">
              <span className="fp-nav__phone-number">+1-714-782-7278</span>
              <span className="fp-nav__phone-label">Call 24/7 for emergency help</span>
            </span>
          </a>
        </div>

        <button className="fp-nav__hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fp-nav__mobile"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {links.map(l => {
              const isActive = active === l.id;
              return (
                <button key={l.id}
                  className={`fp-nav__mobile-link${isActive ? ' fp-nav__mobile-link--active' : ''}`}
                  onClick={() => { handleLinkClick(l.id); setMenuOpen(false); }}>
                  {isActive && <span className="fp-nav__mobile-indicator" />}
                  {l.label}
                </button>
              );
            })}
            <button className="fp-nav__mobile-cta" onClick={() => { setMenuOpen(false); scrollToForm('booking'); }}>
              Book Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
