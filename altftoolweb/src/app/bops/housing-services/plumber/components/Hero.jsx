import { motion } from 'framer-motion';
import { ChevronDown, Star } from 'lucide-react';
import problem1 from '../assets/images/problem-1.webp';
import '../styles/Hero.css';

function scrollToForm(mode) {
  const el = document.getElementById('book-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  if (mode && mode !== 'booking') {
    setTimeout(() => { if (window.switchBookingTab) window.switchBookingTab(mode); }, 650);
  }
}

export default function Hero() {
  return (
    <section className="fp-hero">
      <div className="fp-hero__bg">
        <img src={problem1.src} alt="Professional plumber at work" />
        <div className="fp-hero__overlay" />
        <div className="fp-hero__tint" />
      </div>

      <div className="fp-hero__content">
        <div className="fp-hero__inner">
          <motion.p className="fp-hero__label"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16,1,0.3,1] }}>
            Licensed · Insured · Available 24 / 7
          </motion.p>

          <motion.h1 className="fp-hero__h1"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16,1,0.3,1] }}>
            Fast &amp; Reliable<br />
            <span className="fp-hero__h1-italic">Plumbing</span>
          </motion.h1>

          <motion.p className="fp-hero__sub"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16,1,0.3,1] }}>
            Licensed plumbers at your door in under 60 minutes.
          </motion.p>

          <motion.div className="fp-hero__stars"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}>
            <div className="fp-hero__stars-row">
              {[...Array(5)].map((_,i) => (
                <Star key={i} size={14} style={{ color: 'var(--fp-yellow-400)', fill: 'var(--fp-yellow-400)' }} />
              ))}
            </div>
            <span className="fp-hero__stars-label">4.9 · 10,000+ customers</span>
          </motion.div>

          <motion.div className="fp-hero__buttons"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.52, ease: [0.16,1,0.3,1] }}>
            <button className="fp-hero__btn-primary" onClick={() => scrollToForm('booking')}>
              Book a Plumber Now
            </button>
            <button className="fp-hero__btn-secondary" onClick={() => scrollToForm('estimate')}>
              Get Free Estimate
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div className="fp-hero__scroll"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
